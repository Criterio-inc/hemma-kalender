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
      preferences = {},
    } = await req.json();
    
    if (!householdCode) {
      return new Response(JSON.stringify({ error: 'Missing householdCode' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      cuisinePreference = 'mix',      // 'swedish', 'italian', 'asian', 'mix'
      difficultyLevel = 'mellan',     // 'enkel', 'mellan', 'avancerad'
      quickWeekdays = true,           // Quick meals on weekdays (<30 min)
      budgetLevel = 'normal',         // 'ekonomiskt', 'normal', 'festligt'
      dietaryRestrictions = [],       // ['vegetarian', 'glutenfree', etc.]
      servings = 4,
    } = preferences;

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

    // Fetch recent meal plans
    const { data: recentMealPlans } = await supabase
      .from('meal_plan_items')
      .select('recipe_id, meal_type, day_of_week, recipes(title)')
      .order('created_at', { ascending: false })
      .limit(100);

    // Analyze patterns
    const frequentRecipes = recentMealPlans?.reduce((acc: Record<string, number>, item: any) => {
      if (item.recipe_id) {
        acc[item.recipe_id] = (acc[item.recipe_id] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    const recipeContext = recipes?.map((r) => {
      const totalTime = (r.prep_time || 0) + (r.cook_time || 0);
      return `- ${r.title} (${r.category || 'övrigt'}, ${totalTime} min, ${frequentRecipes[r.id] ? `favorit - lagad ${frequentRecipes[r.id]}x` : 'ny'})`;
    }).join('\n') || 'Inga sparade recept.';

    const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

    const systemPrompt = `Du är en expert på veckoplanering av mat för svenska familjer. Skapa en balanserad veckomatsedel.

Familjens sparade recept:
${recipeContext}

Preferenser:
- Kök: ${cuisinePreference === 'mix' ? 'Blandat' : cuisinePreference}
- Svårighetsgrad: ${difficultyLevel}
- Snabbt på vardagar: ${quickWeekdays ? 'Ja (<30 min)' : 'Nej'}
- Budget: ${budgetLevel}
- Kostbegränsningar: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'Inga'}
- Antal portioner: ${servings}

Regler:
1. Vardagar (mån-fre): ${quickWeekdays ? 'Snabba rätter under 30 min' : 'Normala rätter'}
2. Helg (lör-sön): Mer avancerade rätter är OK
3. Variera proteiner (fisk, kött, vegetariskt genom veckan)
4. Inkludera minst 2 vegetariska dagar
5. Använd familjens favoritrecept men blanda med variation
6. Tänk på rester - laga mer på söndag för måndag lunch

Svara med JSON:
{
  "mealPlan": [
    {
      "dayOfWeek": 0,
      "dayName": "Måndag",
      "dinner": {
        "title": "Recepttitel",
        "description": "Kort beskrivning",
        "isExisting": true/false,
        "existingRecipeId": "uuid om finns",
        "estimatedTime": 25,
        "category": "kategori"
      },
      "lunch": null
    }
  ],
  "shoppingList": [
    {"name": "Ingrediens", "quantity": "mängd", "category": "kategori"}
  ],
  "tips": "Planeringstips för veckan",
  "summary": "Sammanfattning av veckans matsedel"
}`;

    const userPrompt = `Skapa en veckomatsedel för ${servings} personer. Fokusera på middag men föreslå lunch för helgen.`;

    console.log('AI Meal Plan request:', preferences);

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
        mealPlan: [], 
        shoppingList: [],
        tips: '',
        summary: 'Kunde inte generera matsedel. Försök igen.' 
      };
    }

    // Log the interaction
    await supabase.from('ai_interactions').insert({
      household_code: householdCode,
      interaction_type: 'meal_plan_generator',
      query: JSON.stringify(preferences),
      response: parsedResponse,
    });

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-meal-plan-generator:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Ett fel uppstod'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
