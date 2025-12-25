import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, householdCode } = await req.json();
    
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

    // Fetch all recipes for the household
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, description, ingredients, category, tags')
      .eq('household_code', householdCode);

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      throw new Error('Failed to fetch recipes');
    }

    if (!recipes || recipes.length === 0) {
      return new Response(JSON.stringify({ 
        results: [],
        message: 'Inga recept hittades i ditt hushåll.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create recipe context for AI
    const recipeContext = recipes.map((r, i) => 
      `${i + 1}. ID: ${r.id}\n   Titel: ${r.title}\n   Beskrivning: ${r.description || 'Ingen'}\n   Kategori: ${r.category || 'Okänd'}\n   Taggar: ${r.tags?.join(', ') || 'Inga'}\n   Ingredienser: ${JSON.stringify(r.ingredients) || 'Ej angivet'}`
    ).join('\n\n');

    const systemPrompt = `Du är en receptsökningsassistent för svenska familjer. Din uppgift är att hitta de mest relevanta recepten baserat på användarens fråga.

Du har tillgång till följande recept:

${recipeContext}

Svara ENDAST med giltig JSON i följande format:
{
  "matches": [
    {"id": "uuid", "relevance": 0.95, "reason": "Kort förklaring varför detta recept matchar"}
  ],
  "suggestion": "En eventuell hjälpsam kommentar till användaren"
}

Returnera max 10 matchande recept, sorterade efter relevans (högst först).
Om inga recept matchar, returnera en tom matches-array och en hjälpsam suggestion.`;

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
        return new Response(JSON.stringify({ error: 'För många förfrågningar. Vänta en stund och försök igen.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI-krediter slut. Kontakta administratören.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse AI response
    let parsedResponse;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      parsedResponse = { matches: [], suggestion: 'Kunde inte tolka sökningen. Försök med en annan formulering.' };
    }

    // Log the interaction
    await supabase.from('ai_interactions').insert({
      household_code: householdCode,
      interaction_type: 'search',
      query,
      response: parsedResponse,
    });

    // Get full recipe data for matches
    const matchedIds = parsedResponse.matches?.map((m: any) => m.id) || [];
    const matchedRecipes = recipes.filter(r => matchedIds.includes(r.id));

    return new Response(JSON.stringify({
      results: matchedRecipes.map(r => ({
        ...r,
        relevance: parsedResponse.matches?.find((m: any) => m.id === r.id)?.relevance,
        reason: parsedResponse.matches?.find((m: any) => m.id === r.id)?.reason,
      })),
      suggestion: parsedResponse.suggestion,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-recipe-search:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett fel uppstod vid sökning'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
