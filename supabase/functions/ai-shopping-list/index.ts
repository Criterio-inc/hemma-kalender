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
    const { recipes, servingsMultiplier = 1 } = await req.json();
    
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or empty recipes array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const recipesContext = recipes.map((r: any, i: number) => 
      `Recept ${i + 1}: ${r.title}\nPortioner: ${r.servings || 'Ej angivet'}\nIngredienser: ${JSON.stringify(r.ingredients)}`
    ).join('\n\n');

    const systemPrompt = `Du är en expert på att skapa konsoliderade inköpslistor från recept.

Din uppgift är att:
1. Kombinera dubbletter av ingredienser och summera mängderna
2. Justera mängderna om en multiplikator anges
3. Gruppera ingredienser efter kategori

Kategorier att använda:
- mejeri (mjölk, smör, ost, grädde, ägg)
- kött (nötkött, fläsk, kyckling, köttfärs)
- fisk (fisk, skaldjur)
- grönsaker (alla grönsaker)
- frukt (alla frukter)
- bröd (bröd, bullar, knäckebröd)
- torrvaror (mjöl, socker, ris, pasta, kryddor)
- konserv (burkar, passerade tomater)
- frys (frysta varor)
- dryck (drycker)
- övrigt (allt annat)

Svara ENDAST med giltig JSON:
{
  "items": [
    {"name": "Mjölk", "quantity": "1 liter", "category": "mejeri"},
    {"name": "Lök", "quantity": "3 st", "category": "grönsaker"}
  ],
  "summary": "Kort sammanfattning av inköpslistan"
}`;

    const userPrompt = `Skapa en inköpslista från dessa recept (multiplikator: ${servingsMultiplier}x):

${recipesContext}`;

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
      return new Response(JSON.stringify({ 
        error: 'Kunde inte skapa inköpslista. Försök igen.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-shopping-list:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett fel uppstod'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
