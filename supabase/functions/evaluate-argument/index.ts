import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { userMessage, assistantMessage, philosopher, topic, challenge, difficulty } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are a philosophical debate judge. You evaluate the quality of a debater's argument in a philosophical sparring match about "${topic}" against ${philosopher}.${challenge ? ` The debater's specific challenge is: "${challenge}".` : ""}${difficulty ? ` Difficulty level: ${difficulty}. Score more strictly at higher difficulties.` : ""} Score ONLY the user's argument, not the philosopher's response.` },
          { role: "user", content: `The debater said: "${userMessage}"\n\nThe philosopher (${philosopher}) responded: "${assistantMessage}"\n\nEvaluate the debater's argument.` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "score_argument",
            description: "Score the debater's philosophical argument on multiple dimensions",
            parameters: {
              type: "object",
              properties: {
                total_points: { type: "integer", description: "Total points earned for this argument, 0-25. 0-5=weak, 6-12=decent, 13-18=strong, 19-25=exceptional" },
                logic: { type: "integer", description: "Logic and reasoning score 0-5" },
                rhetoric: { type: "integer", description: "Persuasiveness and eloquence 0-5" },
                strategy: { type: "integer", description: "Strategic thinking and counterargument quality 0-5" },
                ethics: { type: "integer", description: "Ethical reasoning and moral depth 0-5" },
                creativity: { type: "integer", description: "Originality and creative thinking 0-5" },
                brief_feedback: { type: "string", description: "One-sentence feedback on the argument, max 15 words" }
              },
              required: ["total_points", "logic", "rhetoric", "strategy", "ethics", "creativity", "brief_feedback"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "score_argument" } },
      }),
    });
    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text(); console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Evaluation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const score = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(score), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "No score returned" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("evaluate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
