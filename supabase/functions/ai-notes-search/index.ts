import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, householdCode, eventId } = await req.json();
    
    if (!query || !householdCode) {
      return new Response(JSON.stringify({ error: 'Missing query or householdCode' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch notes - either for specific event or all
    let notesQuery = supabase
      .from('notes')
      .select('id, title, content, note_type, tags, event_id, created_at')
      .eq('household_code', householdCode);
    
    if (eventId) {
      notesQuery = notesQuery.eq('event_id', eventId);
    }

    const { data: notes, error: notesError } = await notesQuery;

    if (notesError) {
      console.error('Error fetching notes:', notesError);
      throw new Error('Failed to fetch notes');
    }

    if (!notes || notes.length === 0) {
      return new Response(JSON.stringify({ 
        results: [],
        answer: 'Inga anteckningar hittades.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get event info for context
    let eventsMap: Record<string, string> = {};
    if (!eventId) {
      const eventIds = [...new Set(notes.filter(n => n.event_id).map(n => n.event_id))];
      if (eventIds.length > 0) {
        const { data: events } = await supabase
          .from('events')
          .select('id, title')
          .in('id', eventIds);
        if (events) {
          eventsMap = Object.fromEntries(events.map(e => [e.id, e.title]));
        }
      }
    }

    const notesContext = notes.map((n, i) => 
      `${i + 1}. ID: ${n.id}
   Titel: ${n.title || 'Utan titel'}
   Innehåll: ${n.content}
   Typ: ${n.note_type || 'general'}
   Event: ${n.event_id ? (eventsMap[n.event_id] || n.event_id) : 'Ingen'}
   Datum: ${new Date(n.created_at).toLocaleDateString('sv-SE')}`
    ).join('\n\n');

    const systemPrompt = `Du är en hjälpsam assistent som söker bland familjens anteckningar.

Här är alla tillgängliga anteckningar:

${notesContext}

Din uppgift är att:
1. Hitta de mest relevanta anteckningarna baserat på användarens fråga
2. Ge ett hjälpsamt svar som sammanfattar vad du hittade
3. Citera relevant information från anteckningarna

Svara ENDAST med giltig JSON:
{
  "matches": [
    {"id": "uuid", "relevance": 0.95, "excerpt": "Relevant utdrag från anteckningen"}
  ],
  "answer": "Ett hjälpsamt svar på svenska som besvarar frågan baserat på anteckningarna"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'För många förfrågningar. Vänta en stund.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI-krediter slut.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    let parsedResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      parsedResponse = { 
        matches: [],
        answer: 'Kunde inte hitta svar. Försök formulera frågan annorlunda.'
      };
    }

    // Get full note data for matches
    const matchedIds = parsedResponse.matches?.map((m: any) => m.id) || [];
    const matchedNotes = notes.filter(n => matchedIds.includes(n.id));

    // Log the interaction
    await supabase.from('ai_interactions').insert({
      household_code: householdCode,
      interaction_type: 'search',
      query,
      response: parsedResponse,
    });

    return new Response(JSON.stringify({
      results: matchedNotes.map(n => ({
        ...n,
        eventTitle: n.event_id ? eventsMap[n.event_id] : undefined,
        excerpt: parsedResponse.matches?.find((m: any) => m.id === n.id)?.excerpt,
      })),
      answer: parsedResponse.answer,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-notes-search:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett fel uppstod'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
