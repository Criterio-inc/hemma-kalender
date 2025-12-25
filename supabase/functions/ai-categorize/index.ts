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
    const { type, data } = await req.json();
    
    if (!type || !data) {
      return new Response(JSON.stringify({ error: 'Missing type or data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'recipe') {
      systemPrompt = `Du är en expert på att kategorisera recept. Analysera receptet och föreslå relevanta taggar.

Möjliga taggar inkluderar (men är inte begränsade till):
- Säsong: jul, påsk, midsommar, sommar, höst, vinter
- Kost: vegetariskt, veganskt, laktosfritt, glutenfritt
- Typ: förrätt, huvudrätt, efterrätt, fika, frukost, mellanmål
- Kök: svenskt, italienskt, asiatiskt, mexikanskt
- Tid: snabbmat, 30-minuter, lättlagat
- Protein: fisk, kyckling, fläsk, nötkött, skaldjur
- Övrigt: barnvänligt, festmat, vardagsmat, billigt, hälsosamt

Svara ENDAST med giltig JSON i detta format:
{
  "suggestedTags": ["tagg1", "tagg2", "tagg3"],
  "suggestedCategory": "main|starter|dessert|snack|breakfast|drink|other",
  "reasoning": "Kort förklaring av varför dessa taggar passar"
}`;

      userPrompt = `Analysera detta recept:
Titel: ${data.title}
Beskrivning: ${data.description || 'Ej angiven'}
Ingredienser: ${JSON.stringify(data.ingredients) || 'Ej angivna'}
Instruktioner: ${data.instructions || 'Ej angivna'}`;

    } else if (type === 'note') {
      systemPrompt = `Du är en expert på att kategorisera anteckningar för familjeplanering.

Möjliga typer: general, idea, checklist, memory, planning
Möjliga taggar: viktigt, påminnelse, tradition, recept-idé, gäster, dekoration, musik, aktivitet

Svara ENDAST med giltig JSON:
{
  "suggestedType": "general|idea|checklist|memory|planning",
  "suggestedTags": ["tagg1", "tagg2"],
  "reasoning": "Kort förklaring"
}`;

      userPrompt = `Analysera denna anteckning:
Titel: ${data.title || 'Ingen titel'}
Innehåll: ${data.content}`;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid type. Use "recipe" or "note"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      parsedResponse = { 
        suggestedTags: [],
        reasoning: 'Kunde inte analysera innehållet.'
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-categorize:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett fel uppstod'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
