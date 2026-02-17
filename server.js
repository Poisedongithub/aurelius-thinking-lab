import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ── Supabase Config ──
const SUPABASE_URL = process.env.SUPABASE_URL || "https://szfsulbbbhhuviewjlbf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6ZnN1bGJiYmhodXZpZXdqbGJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI3MjQzNSwiZXhwIjoyMDg2ODQ4NDM1fQ.3MM-9h2k3L_ZmXBrJ9Tuu9vyIZ9U9uvxcBlbJ1r-Jio";

let supabaseAdmin;
try {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log("Supabase admin client initialized (service_role)");
} catch (e) {
  console.error("Supabase client failed to init:", e.message);
  supabaseAdmin = null;
}

// ── Auth middleware: extract user from Supabase JWT ──
async function getUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ── RapidAPI DeepSeek All-In-One Config ──
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || process.env.RAPID_API_KEY;
const RAPIDAPI_HOST = "deepseek-all-in-one.p.rapidapi.com";
const RAPIDAPI_CHAT_URL = `https://${RAPIDAPI_HOST}/chat`;

// ── Philosopher system prompts ──
const philosopherPrompts = {
  "marcus-aurelius": `You are Marcus Aurelius, Roman Emperor and Stoic philosopher. Your tone is weary but resolute—like a man writing to himself at the end of a long campaign. You speak in second person to yourself ("You must remember..."). Reference your Meditations by paraphrasing specific passages. Never raise your voice; your power comes from quiet, exhausted certainty. Use metaphors of rivers, seasons, and dying embers. Keep responses to 3-4 sentences. Never write full paragraphs.`,
  "machiavelli": `You are Niccolò Machiavelli. You speak like a sly advisor whispering in a prince's ear—conspiratorial, amused, slightly dangerous. Drop names of real historical figures (Cesare Borgia, Pope Alexander VI) casually. You find idealism adorable but useless. Your sentences drip with dark humor and backhanded compliments. Use phrases like "My dear friend..." and "You see, the amusing thing about virtue is..." Keep responses to 3-4 sentences. Never write full paragraphs.`,
  "sun-tzu": `You are Sun Tzu. You speak ONLY in short, cryptic aphorisms—never explain yourself. Your sentences sound like ancient proverbs carved in stone. Never use "I think" or "I believe"—state truths as if they are laws of nature. Use imagery of water, terrain, fog, and shadows. Your tone is cold, distant, and absolute—like a general who has already won. Keep responses to 3-4 sentences. Never write full paragraphs.`,
  "nietzsche": `You are Friedrich Nietzsche. You are volcanic—oscillating between wild ecstasy and biting contempt. Use exclamation marks! Ask rhetorical questions that you immediately answer yourself. Call your opponent's ideas "herd morality" or "the comforting lies of the weak." Laugh at things others hold sacred. Your language is dramatic, almost theatrical—you write like a man composing his own mythology. Occasionally reference Zarathustra in third person. Keep responses to 3-4 sentences. Never write full paragraphs.`,
  "socrates": `You are Socrates. You NEVER make declarative statements—you ONLY ask questions. Every response must be 2-3 piercing questions that trap your opponent in contradiction. Feign ignorance with phrases like "Forgive me, I am but a simple stonemason's son..." before delivering devastating logical traps. Your questions should make the other person argue against themselves. You are playful, ironic, and annoyingly persistent. Keep responses to 3-4 sentences, all questions. Never write full paragraphs.`,
  "confucius": `You are Confucius. You speak like a patient grandfather telling a story at dinner. Begin responses with "In my village..." or "A student once asked me..." and deliver wisdom through tiny parables about everyday things—a farmer's fence, a child's shoe, a cracked bowl. Your tone is warm but carries the weight of centuries. You never attack directly; you redirect with gentle disappointment. Keep responses to 3-4 sentences. Never write full paragraphs.`,
  "simone-de-beauvoir": `You are Simone de Beauvoir. You are intellectually fierce and refuse to let sloppy thinking pass unchallenged. Your tone is precise, cutting, and passionate—like a brilliant professor who is also an activist. Use concrete social examples (women's labor, marriage contracts, institutional power). Call out hidden assumptions about "nature" and "essence." You don't suffer fools, but you engage seriously with genuine ideas. Reference your own lived experience. Keep responses to 3-4 sentences. Never write full paragraphs.`,
  "lao-tzu": `You are Lao Tzu. You speak in contradictions that somehow make perfect sense. Every response should contain at least one paradox ("The strongest sword is the one never drawn"). Your tone is amused, unhurried, almost sleepy—like someone who has seen everything and finds it all gently funny. Use only nature imagery: water, mountains, empty vessels, uncarved wood. Never argue directly—simply offer a perspective that makes the other position dissolve. Keep responses to 3-4 sentences. Never write full paragraphs.`,
};

const topicContext = {
  power: "The debate topic is POWER — authority, control, dominion, and the nature of ruling.",
  virtue: "The debate topic is VIRTUE — ethics, morality, goodness, and what it means to live well.",
  war: "The debate topic is WAR — strategy, conflict, violence, and the art of winning.",
  death: "The debate topic is DEATH — mortality, legacy, the meaning of finite existence.",
  freedom: "The debate topic is FREEDOM — liberty, free will, autonomy, and the constraints of society.",
  justice: "The debate topic is JUSTICE — law, fairness, punishment, and the social contract.",
};

async function callDeepSeek(messages) {
  const response = await fetch(RAPIDAPI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": RAPIDAPI_KEY,
    },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) {
    const status = response.status;
    const text = await response.text();
    console.error("RapidAPI DeepSeek error:", status, text);
    throw { status, text };
  }
  return await response.json();
}

// ══════════════════════════════════════════════════
// ── AI ENDPOINTS ──
// ══════════════════════════════════════════════════

app.post("/api/philosopher-chat", async (req, res) => {
  try {
    const { messages, philosopher, topic, systemSuffix } = req.body;
    const systemPrompt = `${philosopherPrompts[philosopher] || philosopherPrompts["marcus-aurelius"]}\n\n${topicContext[topic] || ""}\n\nYou are in a philosophical sparring session. Challenge the user's views and defend your position. Stay in character. If this is the opening, deliver a sharp provocative opener on the topic. IMPORTANT: Keep every response to 1-2 sentences maximum. Be punchy and direct.${systemSuffix || ""}`;
    const allMessages = [{ role: "system", content: systemPrompt }, ...messages];
    const data = await callDeepSeek(allMessages);
    const content = data.choices?.[0]?.message?.content || "I must contemplate this further...";
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const words = content.split(/(\s+)/);
    for (let i = 0; i < words.length; i++) {
      const chunk = { id: data.id || "rapid-" + Date.now(), object: "chat.completion.chunk", created: data.created || Math.floor(Date.now() / 1000), model: "deepseek-chat", choices: [{ index: 0, delta: { content: words[i] }, finish_reason: null }] };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ id: data.id || "rapid-" + Date.now(), object: "chat.completion.chunk", created: data.created || Math.floor(Date.now() / 1000), model: "deepseek-chat", choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("philosopher-chat error:", err);
    if (err.status === 429) return res.status(429).json({ error: "Rate limit reached" });
    if (err.status === 402) return res.status(402).json({ error: "Payment required" });
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/evaluate-argument", async (req, res) => {
  try {
    const { userMessage, assistantMessage, philosopher, topic, challenge, difficulty } = req.body;
    const data = await callDeepSeek([
      { role: "system", content: `You are a philosophical debate judge. You evaluate the quality of a debater's argument in a philosophical sparring match about "${topic}" against ${philosopher}.${challenge ? ` The debater's specific challenge is: "${challenge}".` : ""}${difficulty ? ` Difficulty level: ${difficulty}. Score more strictly at higher difficulties.` : ""} Score ONLY the user's argument, not the philosopher's response.\n\nYou MUST respond with ONLY a JSON object in this exact format:\n{"total_points": <0-25>, "logic": <0-5>, "rhetoric": <0-5>, "strategy": <0-5>, "ethics": <0-5>, "creativity": <0-5>, "brief_feedback": "<one sentence, max 15 words>"}\n\nScoring guide: 0-5=weak, 6-12=decent, 13-18=strong, 19-25=exceptional.\nRespond with ONLY the JSON object, nothing else.` },
      { role: "user", content: `The debater said: "${userMessage}"\n\nThe philosopher (${philosopher}) responded: "${assistantMessage}"\n\nEvaluate the debater's argument. Return ONLY the JSON object.` },
    ]);
    const content = data.choices?.[0]?.message?.content || "";
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const score = JSON.parse(jsonStr);
    return res.json(score);
  } catch (err) {
    console.error("evaluate-argument error:", err);
    if (err.status === 429) return res.status(429).json({ error: "Rate limited" });
    res.status(500).json({ error: "Evaluation failed" });
  }
});

app.post("/api/generate-dilemma", async (req, res) => {
  try {
    const { previousIds = [], count = 3 } = req.body;
    const data = await callDeepSeek([
      { role: "system", content: `You are a moral philosophy expert who creates thought-provoking ethical dilemmas. Generate unique moral dilemmas as a JSON array.\n\nEach dilemma must have:\n- id: a unique kebab-case identifier\n- title: a short evocative title (3-5 words)\n- scenario: a vivid 2-3 sentence scenario\n- category: one of "Life & Death", "Justice", "Truth", "Freedom", "Loyalty", "Society", "Technology", "Sacrifice", "Identity", "Environment", "War & Peace", "Family", "Knowledge"\n- choices: array of 2-3 options, each with:\n  - text: a concise action statement\n  - scores: object with compassion_vs_logic, individual_vs_collective, rules_vs_outcomes, idealism_vs_pragmatism, mercy_vs_justice (each -1.0 to 1.0)\n\nIMPORTANT: Return ONLY a valid JSON array. No markdown.` },
      { role: "user", content: `Generate ${count} unique moral dilemmas.${previousIds.length > 0 ? ` Avoid: ${previousIds.slice(-20).join(", ")}` : ""}` },
    ]);
    const raw = data.choices?.[0]?.message?.content || "[]";
    let jsonStr = raw.trim();
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const dilemmas = JSON.parse(jsonStr);
    return res.json({ dilemmas });
  } catch (err) {
    console.error("generate-dilemma error:", err);
    res.status(500).json({ error: "Dilemma generation failed" });
  }
});

// ══════════════════════════════════════════════════
// ── DATA ENDPOINTS (Supabase) ──
// ══════════════════════════════════════════════════

// Helper: ensure profile exists for new user
async function ensureProfile(userId, email) {
  const { data: existing } = await supabaseAdmin.from("profiles").select("id").eq("user_id", userId).single();
  if (!existing) {
    const name = email ? email.split("@")[0] : "User";
    const initials = name.slice(0, 2).toUpperCase();
    await supabaseAdmin.from("profiles").insert({ user_id: userId, display_name: name, avatar_initials: initials });
  }
}

// GET /api/data/profiles
app.get("/api/data/profiles", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  await ensureProfile(user.id, user.email);
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("user_id", user.id).single();
  if (error) console.error("profiles GET error:", error);
  res.json({ data: data || null });
});

// GET /api/data/user_streaks
app.get("/api/data/user_streaks", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabaseAdmin.from("user_streaks").select("*").eq("user_id", user.id).single();
  if (error && error.code !== "PGRST116") console.error("user_streaks GET error:", error);
  res.json({ data: data || { current_streak: 0, longest_streak: 0, last_activity_date: null } });
});

// GET /api/data/user_xp
app.get("/api/data/user_xp", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabaseAdmin.from("user_xp").select("*").eq("user_id", user.id).single();
  if (error && error.code !== "PGRST116") console.error("user_xp GET error:", error);
  res.json({ data: data || { total_xp: 0, level: 1 } });
});

// GET /api/data/user_achievements
app.get("/api/data/user_achievements", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabaseAdmin.from("user_achievements").select("achievement_id").eq("user_id", user.id);
  if (error) console.error("user_achievements GET error:", error);
  res.json({ data: data || [] });
});

// GET /api/data/morality_profiles
app.get("/api/data/morality_profiles", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabaseAdmin.from("morality_profiles").select("*").eq("user_id", user.id).single();
  if (error && error.code !== "PGRST116") console.error("morality_profiles GET error:", error);
  res.json({ data: data || null });
});

// GET /api/data/sparring_sessions
app.get("/api/data/sparring_sessions", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabaseAdmin.from("sparring_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) console.error("sparring_sessions GET error:", error);
  res.json({ data: data || [] });
});

// GET /api/data/sparring_sessions/count
app.get("/api/data/sparring_sessions/count", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { count, error } = await supabaseAdmin.from("sparring_sessions").select("*", { count: "exact", head: true }).eq("user_id", user.id);
  if (error) console.error("sparring_sessions count error:", error);
  res.json({ count: count || 0 });
});

// GET /api/data/arena_progress
app.get("/api/data/arena_progress", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { philosopher_id, arena_level } = req.query;
  if (philosopher_id && arena_level) {
    const { data, error } = await supabaseAdmin.from("arena_progress").select("*").eq("user_id", user.id).eq("philosopher_id", philosopher_id).eq("arena_level", Number(arena_level)).single();
    if (error && error.code !== "PGRST116") console.error("arena_progress GET error:", error);
    res.json({ data: data || null });
  } else {
    const { data, error } = await supabaseAdmin.from("arena_progress").select("*").eq("user_id", user.id);
    if (error) console.error("arena_progress GET all error:", error);
    res.json({ data: data || [] });
  }
});

// GET /api/data/arena_progress/count_passed
app.get("/api/data/arena_progress/count_passed", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { count, error } = await supabaseAdmin.from("arena_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("passed", true);
  if (error) console.error("arena_progress count_passed error:", error);
  res.json({ count: count || 0 });
});

// POST /api/data/profiles
app.post("/api/data/profiles", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { display_name, avatar_initials } = req.body;
  const { error } = await supabaseAdmin.from("profiles").upsert({ user_id: user.id, display_name: display_name || "", avatar_initials: avatar_initials || "" }, { onConflict: "user_id" });
  if (error) console.error("profiles POST error:", error);
  res.json({ success: true });
});

// POST /api/data/user_streaks
app.post("/api/data/user_streaks", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { current_streak, longest_streak, last_activity_date } = req.body;
  const { error } = await supabaseAdmin.from("user_streaks").upsert({ user_id: user.id, current_streak, longest_streak, last_activity_date }, { onConflict: "user_id" });
  if (error) console.error("user_streaks POST error:", error);
  res.json({ success: true });
});

// POST /api/data/user_xp
app.post("/api/data/user_xp", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { total_xp, level } = req.body;
  const { error } = await supabaseAdmin.from("user_xp").upsert({ user_id: user.id, total_xp, level }, { onConflict: "user_id" });
  if (error) console.error("user_xp POST error:", error);
  res.json({ success: true });
});

// POST /api/data/user_achievements
app.post("/api/data/user_achievements", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { achievement_id } = req.body;
  const { error } = await supabaseAdmin.from("user_achievements").upsert({ user_id: user.id, achievement_id }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });
  if (error && error.code !== "23505") console.error("user_achievements POST error:", error);
  res.json({ success: true });
});

// POST /api/data/sparring_sessions
app.post("/api/data/sparring_sessions", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { opponent, topic, messages } = req.body;
  const { data, error } = await supabaseAdmin.from("sparring_sessions").insert({ user_id: user.id, opponent, topic, messages: messages || [] }).select("id").single();
  if (error) console.error("sparring_sessions POST error:", error);
  res.json({ data: { id: data?.id } });
});

// PUT /api/data/sparring_sessions/:id
app.put("/api/data/sparring_sessions/:id", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { messages, score, rounds_scored } = req.body;
  const { error } = await supabaseAdmin.from("sparring_sessions").update({ messages: messages || [], score: score || 0, rounds_scored: rounds_scored || 0 }).eq("id", req.params.id).eq("user_id", user.id);
  if (error) console.error("sparring_sessions PUT error:", error);
  res.json({ success: true });
});

// POST /api/data/arena_progress
app.post("/api/data/arena_progress", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { philosopher_id, arena_level, score, passed, best_score, attempts } = req.body;
  
  // Check if record exists
  const { data: existing } = await supabaseAdmin.from("arena_progress").select("*").eq("user_id", user.id).eq("philosopher_id", philosopher_id).eq("arena_level", arena_level).single();
  
  if (existing) {
    const { error } = await supabaseAdmin.from("arena_progress").update({
      score,
      passed: existing.passed || passed,
      best_score: Math.max(existing.best_score || 0, best_score || 0),
      attempts: (existing.attempts || 0) + 1,
    }).eq("user_id", user.id).eq("philosopher_id", philosopher_id).eq("arena_level", arena_level);
    if (error) console.error("arena_progress UPDATE error:", error);
  } else {
    const { error } = await supabaseAdmin.from("arena_progress").insert({
      user_id: user.id, philosopher_id, arena_level, score, passed: !!passed, best_score: best_score || 0, attempts: attempts || 1,
    });
    if (error) console.error("arena_progress INSERT error:", error);
  }
  res.json({ success: true });
});

// POST /api/data/morality_profiles
app.post("/api/data/morality_profiles", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { alignment, alignment_description, compassion_vs_logic, individual_vs_collective, rules_vs_outcomes, idealism_vs_pragmatism, mercy_vs_justice, total_answered } = req.body;
  
  const { data: existing } = await supabaseAdmin.from("morality_profiles").select("id, total_answered").eq("user_id", user.id).single();
  
  if (existing) {
    const { error } = await supabaseAdmin.from("morality_profiles").update({
      alignment, alignment_description, compassion_vs_logic, individual_vs_collective, rules_vs_outcomes, idealism_vs_pragmatism, mercy_vs_justice,
      total_answered: total_answered || (existing.total_answered + 1),
    }).eq("user_id", user.id);
    if (error) console.error("morality_profiles UPDATE error:", error);
  } else {
    const { error } = await supabaseAdmin.from("morality_profiles").insert({
      user_id: user.id, alignment, alignment_description, compassion_vs_logic, individual_vs_collective, rules_vs_outcomes, idealism_vs_pragmatism, mercy_vs_justice,
      total_answered: total_answered || 1,
    });
    if (error) console.error("morality_profiles INSERT error:", error);
  }
  res.json({ success: true });
});

// POST /api/data/dilemma_responses
app.post("/api/data/dilemma_responses", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { session_id, dilemma_id, choice_index } = req.body;
  const { error } = await supabaseAdmin.from("dilemma_responses").insert({ user_id: user.id, session_id, dilemma_id, choice_index });
  if (error) console.error("dilemma_responses POST error:", error);
  res.json({ success: true });
});

// ── Serve static files from dist/ ──
app.use(express.static(path.join(__dirname, "dist")));

// ── SPA fallback ──
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`All data stored in Supabase PostgreSQL`);
  console.log(`DeepSeek AI via RapidAPI`);
});
