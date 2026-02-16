import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { previousIds = [], count = 3 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    const systemPrompt = `You are a moral philosophy expert who creates thought-provoking ethical dilemmas. Generate unique moral dilemmas as a JSON array.\n\nEach dilemma must have:\n- id: a unique kebab-case identifier (e.g., "ai-warfare-decision")\n- title: a short evocative title (3-5 words)\n- scenario: a vivid 2-3 sentence scenario that presents a genuine moral tension\n- category: one of "Life & Death", "Justice", "Truth", "Freedom", "Loyalty", "Society", "Technology", "Sacrifice", "Identity", "Environment", "War & Peace", "Family", "Knowledge"\n- choices: array of 2-3 options, each with:\n  - text: a concise action statement (one sentence)\n  - scores: object with these 5 spectrum values, each between -1.0 and 1.0:\n    - compassion_vs_logic: negative = compassion-driven, positive = logic-driven\n    - individual_vs_collective: negative = individual rights, positive = collective good\n    - rules_vs_outcomes: negative = rules matter, positive = outcomes matter\n    - idealism_vs_pragmatism: negative = idealist, positive = pragmatist\n    - mercy_vs_justice: negative = mercy, positive = strict justice\n\nMake dilemmas diverse in topic, culturally varied, and genuinely challenging. Avoid simple right/wrong answers. Each choice should be defensible from a philosophical standpoint. Make scores nuanced — avoid extreme values unless truly warranted.\n\nIMPORTANT: Return ONLY a valid JSON array of dilemma objects. No markdown, no explanation.`;
    const userPrompt = `Generate ${count} unique moral dilemmas. ${previousIds.length > 0 ? `Avoid these topics/IDs which were already used: ${previousIds.slice(-20).join(", ")}` : ""}`;
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }),
    });
    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text(); console.error("AI gateway error:", response.status, t); throw new Error("AI gateway error");
    }
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "[]";
    let jsonStr = raw.trim();
    if (jsonStr.startsWith("```")) { jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, ""); }
    const dilemmas = JSON.parse(jsonStr);
    return new Response(JSON.stringify({ dilemmas }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-dilemma error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
