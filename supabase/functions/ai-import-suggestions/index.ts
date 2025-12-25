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
    const { previousEvent, recipes, notes, links, todos, budgetItems, guests, images, timelinePhases } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create a summary of the previous event's data
    const dataSummary = {
      recipesCount: recipes?.length || 0,
      notesCount: notes?.length || 0,
      linksCount: links?.length || 0,
      todosCount: todos?.length || 0,
      completedTodos: todos?.filter((t: any) => t.completed)?.length || 0,
      budgetItemsCount: budgetItems?.length || 0,
      totalBudget: budgetItems?.reduce((sum: number, item: any) => sum + (item.estimated_cost || 0), 0) || 0,
      guestsCount: guests?.length || 0,
      confirmedGuests: guests?.filter((g: any) => g.rsvp_status === 'confirmed')?.length || 0,
      imagesCount: images?.length || 0,
      timelinePhasesCount: timelinePhases?.length || 0,
    };

    const prompt = `Du är en smart assistent för familjeplanerarappen. Analysera data från förra årets event och ge förslag på vad som bör importeras.

Förra årets event: ${previousEvent.title}
Datum: ${previousEvent.start_date}
Kategori: ${previousEvent.event_category}

Data från förra året:
- ${dataSummary.recipesCount} recept
- ${dataSummary.notesCount} anteckningar
- ${dataSummary.linksCount} länkar
- ${dataSummary.todosCount} uppgifter (${dataSummary.completedTodos} slutförda)
- ${dataSummary.budgetItemsCount} budgetposter (totalt ${dataSummary.totalBudget} kr)
- ${dataSummary.guestsCount} gäster (${dataSummary.confirmedGuests} bekräftade)
- ${dataSummary.imagesCount} bilder
- ${dataSummary.timelinePhasesCount} tidslinjefaser

Uppgiftsdetaljer: ${JSON.stringify(todos?.slice(0, 10)?.map((t: any) => ({ title: t.title, completed: t.completed, due_date: t.due_date })) || [])}

Ge ett kortfattat förslag på svenska om vad som bör importeras och varför. Inkludera:
1. En sammanfattning av vad som finns att importera
2. Rekommendationer för vilka kategorier som bör importeras
3. Tips baserat på förra årets erfarenhet (t.ex. om uppgifter slutfördes i god tid)

Håll svaret kortfattat och vänligt.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Du är en hjälpsam assistent för en svensk familjeplaneringsapp. Svara alltid på svenska." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "För många förfrågningar, vänta en stund." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Betalning krävs för AI-funktioner." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI-tjänsten är inte tillgänglig" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || "Kunde inte generera förslag";

    return new Response(JSON.stringify({ 
      suggestion,
      summary: dataSummary
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in ai-import-suggestions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
