import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default todos for different event categories
const categoryTemplates: Record<string, string[]> = {
  christmas: [
    'Planera julmenyn',
    'Handla julklappar',
    'Boka julbord om ni äter ute',
    'Dekorera hemmet',
    'Skicka julkort',
    'Handla julmat',
    'Baka pepparkakor',
    'Städa inför jul',
    'Slå in julklappar',
    'Förbered glögg och lussekatter',
  ],
  midsummer: [
    'Boka stuga eller plats',
    'Planera midsommarmeny',
    'Köp blommor till midsommarstång',
    'Handla sill och potatis',
    'Förbered jordgubbar och grädde',
    'Gör blomsterkransar',
    'Planera lekar och aktiviteter',
    'Handla snapsar och öl',
  ],
  easter: [
    'Måla påskägg',
    'Handla påskgodis',
    'Planera påskbuffé',
    'Dekorera med påskris',
    'Köp påskliljor',
    'Förbered påskmust',
    'Planera påskäggsjakt för barnen',
  ],
  birthday: [
    'Boka lokal om det behövs',
    'Skicka inbjudningar',
    'Planera meny/fika',
    'Beställ/baka tårta',
    'Köp presenter',
    'Planera aktiviteter/lekar',
    'Köp dekorationer',
    'Förbered goodiebags',
  ],
  wedding: [
    'Boka lokal',
    'Skicka Save the date',
    'Välj vigselförrättare',
    'Boka fotograf',
    'Välj catering',
    'Skicka inbjudningar',
    'Beställ brudklänning/kostym',
    'Boka DJ/band',
    'Planera bordsplacering',
    'Ordna blommor',
    'Skriv tal',
    'Ordna transport',
  ],
  graduation: [
    'Boka lokal för fest',
    'Planera meny',
    'Beställ studentmössa',
    'Köp blommor',
    'Skicka inbjudningar',
    'Förbered skyltar',
    'Boka fotograf',
  ],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      householdCode,
      eventCategory,
      eventTitle,
      eventDate,
      hasTimeline = false,
      timelinePhases = [],
    } = await req.json();
    
    if (!householdCode || !eventCategory) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
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

    // Fetch previous todos for similar events
    const { data: previousTodos } = await supabase
      .from('todos')
      .select('title, category, priority, completed, events!inner(event_category)')
      .eq('events.event_category', eventCategory)
      .order('created_at', { ascending: false })
      .limit(50);

    // Analyze which todos were completed
    const completedTodos = previousTodos?.filter(t => t.completed) || [];
    const incompleteTodos = previousTodos?.filter(t => !t.completed) || [];

    const previousContext = previousTodos && previousTodos.length > 0
      ? `Tidigare uppgifter för ${eventCategory}:\n${previousTodos.map(t => `- ${t.title} (${t.completed ? 'klar' : 'ej klar'})`).join('\n')}`
      : 'Inga tidigare uppgifter för denna kategori.';

    const templateTodos = categoryTemplates[eventCategory] || categoryTemplates['birthday'];

    const phasesContext = hasTimeline && timelinePhases.length > 0
      ? `\nTidslinjefaser:\n${timelinePhases.map((p: any) => `- ${p.phase_name} (${p.weeks_before} veckor före)`).join('\n')}`
      : '';

    const systemPrompt = `Du är en expert på eventplanering för svenska familjer. Din uppgift är att föreslå uppgifter för att planera en händelse.

Händelsetyp: ${eventCategory}
Händelsetitel: ${eventTitle || eventCategory}
Datum: ${eventDate || 'Ej angivet'}
${phasesContext}

${previousContext}

Exempeluppgifter för ${eventCategory}:
${templateTodos.map(t => `- ${t}`).join('\n')}

Baserat på tidigare mönster och bästa praxis, föreslå uppgifter som:
1. Är relevanta för denna typ av händelse
2. Har rimliga tidsramar
3. Inkluderar både praktiska och kreativa uppgifter
4. Tar hänsyn till vad som fungerat tidigare

Svara med JSON:
{
  "suggestions": [
    {
      "title": "Uppgiftstitel",
      "description": "Kort beskrivning",
      "category": "shopping/cooking/decoration/general",
      "priority": "low/medium/high",
      "daysBeforeEvent": 30,
      "phaseId": null,
      "reason": "Varför denna uppgift är viktig"
    }
  ],
  "insights": {
    "completionRate": "X% av uppgifter slutfördes förra gången",
    "tips": ["Tips baserat på tidigare planering"],
    "warnings": ["Varningar baserat på tidigare misslyckanden"]
  },
  "summary": "Sammanfattning av förslagen"
}`;

    const userPrompt = `Föreslå 8-12 uppgifter för att planera ${eventTitle || eventCategory}. ${hasTimeline ? 'Fördela uppgifterna över tidslinjefaserna.' : ''}`;

    console.log('AI Todo Suggestions request:', { eventCategory, eventTitle });

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
          { role: 'user', content: userPrompt }
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
      // Fallback to template-based suggestions
      parsedResponse = { 
        suggestions: templateTodos.slice(0, 10).map((title, i) => ({
          title,
          description: '',
          category: 'general',
          priority: i < 3 ? 'high' : i < 6 ? 'medium' : 'low',
          daysBeforeEvent: Math.max(1, 30 - i * 3),
          phaseId: null,
          reason: 'Standard uppgift för denna typ av händelse'
        })),
        insights: { completionRate: 'Okänd', tips: [], warnings: [] },
        summary: 'Standardförslag baserat på händelsetyp.'
      };
    }

    // Log the interaction
    await supabase.from('ai_interactions').insert({
      household_code: householdCode,
      interaction_type: 'todo_suggestions',
      query: JSON.stringify({ eventCategory, eventTitle }),
      response: parsedResponse,
    });

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-todo-suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett fel uppstod'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
