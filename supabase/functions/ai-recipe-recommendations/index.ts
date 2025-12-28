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
    const { 
      householdCode, 
      type = 'general',  // 'seasonal', 'ingredients', 'event', 'dietary'
      context = {},      // Additional context like ingredients, event details, etc.
    } = await req.json();
    
    if (!householdCode) {
      return new Response(JSON.stringify({ error: 'Missing householdCode' }), {
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

    // Fetch household's recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, description, ingredients, category, tags, prep_time, cook_time, servings')
      .eq('household_code', householdCode);

    if (recipesError) {
      console.error('Error fetching recipes:', recipesError);
      throw new Error('Failed to fetch recipes');
    }

    // Fetch recent meal plans to understand preferences
    const { data: recentMealPlans } = await supabase
      .from('meal_plan_items')
      .select('recipe_id, recipes(title)')
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch event recipes for pattern analysis
    const { data: eventRecipes } = await supabase
      .from('event_recipes')
      .select('recipe_id, meal_type, events(event_category)')
      .limit(100);

    // Build context about household preferences
    const frequentRecipes = recentMealPlans?.reduce((acc: Record<string, number>, item: any) => {
      if (item.recipe_id) {
        acc[item.recipe_id] = (acc[item.recipe_id] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    const recipeContext = recipes?.map((r, i) => 
      `${i + 1}. ${r.title} (${r.category || 'Okänd'})
   - Tid: ${(r.prep_time || 0) + (r.cook_time || 0)} min
   - Portioner: ${r.servings || 'Ej angivet'}
   - Taggar: ${r.tags?.join(', ') || 'Inga'}
   - Frekvens: ${frequentRecipes[r.id] ? `Lagad ${frequentRecipes[r.id]} gånger nyligen` : 'Ej lagad nyligen'}`
    ).join('\n') || 'Inga recept i databasen.';

    // Determine current season
    const month = new Date().getMonth();
    const season = month >= 11 || month <= 1 ? 'vinter' : 
                   month >= 2 && month <= 4 ? 'vår' :
                   month >= 5 && month <= 7 ? 'sommar' : 'höst';
    
    const swedishHolidays: Record<string, string[]> = {
      'vinter': ['Jul', 'Nyår', 'Trettondedag'],
      'vår': ['Påsk', 'Valborg'],
      'sommar': ['Midsommar', 'Nationaldagen', 'Kräftskiva'],
      'höst': ['Halloween', 'Alla helgons dag', 'Lucia'],
    };

    let systemPrompt = `Du är en hjälpsam receptassistent för svenska familjer. Du ger receptförslag baserade på säsong, ingredienser, och familjens preferenser.

Aktuell säsong: ${season}
Kommande högtider: ${swedishHolidays[season].join(', ')}

Familjens recept:
${recipeContext}

`;

    let userPrompt = '';

    switch (type) {
      case 'seasonal':
        userPrompt = `Föreslå 5-7 recept som passar för ${season}. ${context.holiday ? `Fokusera på ${context.holiday}.` : ''}
        
Tänk på:
- Säsongsbetonade ingredienser
- Svenska traditioner
- Recepten som familjen redan har sparade
- Blanda gärna med nya förslag`;
        break;

      case 'ingredients':
        userPrompt = `Jag har dessa ingredienser hemma: ${context.ingredients?.join(', ') || 'Ej angivet'}

Föreslå 5-7 recept jag kan laga. Prioritera:
1. Recept från familjens sparade recept som använder dessa ingredienser
2. Nya förslag som passar ingredienserna`;
        break;

      case 'event':
        userPrompt = `Jag planerar ${context.eventName || 'en fest'} (kategori: ${context.eventCategory || 'övrigt'}).
Antal gäster: ${context.guestCount || 'Ej angivet'}

Föreslå 5-7 recept som passar. Inkludera:
- Förrätt
- Huvudrätt  
- Dessert/fika
- Basera på familjens tidigare lyckade recept för liknande tillfällen`;
        break;

      case 'dietary':
        userPrompt = `Föreslå ${context.restrictions || 'vegetariska'} recept för ${context.servings || 4} personer.

Begränsningar: ${context.restrictions || 'Vegetariskt'}
Tid att laga: ${context.maxTime || 'Ingen tidsbegränsning'} minuter
        
Prioritera familjens sparade recept som passar, men föreslå även nya idéer.`;
        break;

      default:
        userPrompt = `Ge mig 5-7 receptförslag för denna vecka. 
Blanda:
- Snabba vardagsrätter (under 30 min)
- Något mer avancerat för helgen
- Recept familjen redan gillar
- Nya inspirerande förslag`;
    }

    systemPrompt += `
Svara med giltig JSON:
{
  "recommendations": [
    {
      "title": "Recepttitel",
      "description": "Kort beskrivning",
      "reason": "Varför detta förslag passar",
      "isExisting": true/false,
      "existingRecipeId": "uuid om det finns",
      "estimatedTime": 30,
      "difficulty": "enkel/mellan/avancerad",
      "season": "vinter/vår/sommar/höst/alla",
      "tags": ["tag1", "tag2"]
    }
  ],
  "summary": "Sammanfattning av förslagen"
}`;

    console.log('AI Recipe Recommendations request:', { type, context });

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
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
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
        recommendations: [], 
        summary: 'Kunde inte generera förslag. Försök igen.' 
      };
    }

    // Log the interaction
    await supabase.from('ai_interactions').insert({
      household_code: householdCode,
      interaction_type: 'recipe_recommendations',
      query: JSON.stringify({ type, context }),
      response: parsedResponse,
    });

    // Enrich existing recipes with full data
    if (parsedResponse.recommendations && recipes) {
      parsedResponse.recommendations = parsedResponse.recommendations.map((rec: any) => {
        if (rec.isExisting && rec.existingRecipeId) {
          const fullRecipe = recipes.find(r => r.id === rec.existingRecipeId);
          if (fullRecipe) {
            return { ...rec, recipe: fullRecipe };
          }
        }
        return rec;
      });
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-recipe-recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett fel uppstod'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
