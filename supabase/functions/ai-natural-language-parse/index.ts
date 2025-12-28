import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type = 'event' } = await req.json();
    
    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    let systemPrompt = '';

    if (type === 'event') {
      systemPrompt = `Du är en expert på att tolka naturligt språk för att skapa kalenderhändelser.

Dagens datum: ${today.toISOString().split('T')[0]}
Nuvarande år: ${currentYear}

Svenska högtider och datum att känna till:
- Midsommar: Lördag mellan 20-26 juni
- Julafton: 24 december
- Nyårsafton: 31 december
- Påsk: Varierar (mars-april)
- Valborg: 30 april
- Nationaldagen: 6 juni
- Lucia: 13 december
- Alla helgons dag: Lördag mellan 31 okt - 6 nov

Tolka användarens text och extrahera:
- Titel på händelsen
- Datum (om nämnt, annars null)
- Tid (om nämnt, annars null)
- Plats (om nämnt, annars null)
- Kategori (birthday, christmas, easter, midsummer, wedding, graduation, anniversary, custom)
- Beskrivning

Svara med JSON:
{
  "parsed": {
    "title": "Händelsetitel",
    "date": "YYYY-MM-DD" eller null,
    "time": "HH:MM" eller null,
    "endTime": "HH:MM" eller null,
    "location": "Plats" eller null,
    "category": "kategori",
    "description": "Beskrivning" eller null,
    "allDay": true/false,
    "recurring": false,
    "recurringPattern": null
  },
  "confidence": 0.95,
  "clarificationNeeded": false,
  "clarificationQuestion": null
}`;
    } else if (type === 'todo') {
      systemPrompt = `Du är en expert på att tolka naturligt språk för att skapa uppgifter.

Tolka användarens text och extrahera:
- Titel på uppgiften
- Förfallodatum (om nämnt)
- Prioritet (low, medium, high)
- Kategori (shopping, cooking, decoration, general)

Svara med JSON:
{
  "parsed": {
    "title": "Uppgiftstitel",
    "dueDate": "YYYY-MM-DD" eller null,
    "priority": "medium",
    "category": "general",
    "description": null
  },
  "confidence": 0.95
}`;
    } else if (type === 'recipe_search') {
      systemPrompt = `Du är en expert på att tolka receptsökningar på svenska.

Tolka användarens sökning och extrahera:
- Söktermer
- Ingredienser som nämns
- Tidsbegränsning (snabbt = <30 min)
- Antal portioner
- Dietbegränsningar

Svara med JSON:
{
  "parsed": {
    "searchTerms": ["term1", "term2"],
    "ingredients": ["ingrediens1"],
    "maxTime": 30 eller null,
    "servings": 4 eller null,
    "dietary": ["vegetarian"] eller [],
    "season": "vinter/vår/sommar/höst" eller null,
    "holiday": "jul/påsk/midsommar" eller null
  },
  "confidence": 0.95
}`;
    }

    console.log('AI Natural Language Parse request:', { text, type });

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
          { role: 'user', content: text }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'För många förfrågningar.' }), {
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
        parsed: { title: text },
        confidence: 0.5,
        clarificationNeeded: true,
        clarificationQuestion: 'Kunde inte tolka texten. Kan du förtydliga?'
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-natural-language-parse:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett fel uppstod'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
