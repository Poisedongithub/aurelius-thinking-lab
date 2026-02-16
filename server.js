import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ── Supabase Auth (for verifying user tokens) ──
const SUPABASE_URL = "https://szfsulbbbhhuviewjlbf.supabase.co";
const SUPABASE_SERVICE_KEY = "PLACEHOLDER_KEY";
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── SQLite Database ──
const DB_PATH = path.join(__dirname, "data", "app.db");
import fs from "fs";
fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// Auto-create all tables on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_initials TEXT NOT NULL DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS user_streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date TEXT
  );
  CREATE TABLE IF NOT EXISTS user_xp (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, achievement_id)
  );
  CREATE TABLE IF NOT EXISTS sparring_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    opponent TEXT NOT NULL,
    topic TEXT NOT NULL,
    messages TEXT DEFAULT '[]',
    score INTEGER DEFAULT 0,
    rounds_scored INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS arena_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    philosopher_id TEXT NOT NULL,
    arena_level INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    passed INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    UNIQUE(user_id, philosopher_id, arena_level)
  );
  CREATE TABLE IF NOT EXISTS morality_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    alignment TEXT DEFAULT '',
    alignment_description TEXT DEFAULT '',
    compassion_vs_logic REAL DEFAULT 0,
    individual_vs_collective REAL DEFAULT 0,
    rules_vs_outcomes REAL DEFAULT 0,
    idealism_vs_pragmatism REAL DEFAULT 0,
    mercy_vs_justice REAL DEFAULT 0,
    total_answered INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS dilemma_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    dilemma_id TEXT NOT NULL,
    choice_index INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);
console.log("SQLite database initialized with all tables.");

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
const RAPIDAPI_KEY = "abdf28565cmshe6fdb14c77cc9ffp1b49bfjsnb1f43db59e49";
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
// ── DATA ENDPOINTS (SQLite) ──
// ══════════════════════════════════════════════════

// Helper: ensure profile exists for new user
function ensureProfile(userId, email) {
  const existing = db.prepare("SELECT id FROM profiles WHERE user_id = ?").get(userId);
  if (!existing) {
    const name = email ? email.split("@")[0] : "User";
    const initials = name.slice(0, 2).toUpperCase();
    db.prepare("INSERT INTO profiles (user_id, display_name, avatar_initials) VALUES (?, ?, ?)").run(userId, name, initials);
  }
}

// GET /api/data/:table — generic read for simple tables
app.get("/api/data/profiles", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  ensureProfile(user.id, user.email);
  const row = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(user.id);
  res.json({ data: row || null });
});

app.get("/api/data/user_streaks", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const row = db.prepare("SELECT * FROM user_streaks WHERE user_id = ?").get(user.id);
  res.json({ data: row || { current_streak: 0, longest_streak: 0, last_activity_date: null } });
});

app.get("/api/data/user_xp", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const row = db.prepare("SELECT * FROM user_xp WHERE user_id = ?").get(user.id);
  res.json({ data: row || { total_xp: 0, level: 1 } });
});

app.get("/api/data/user_achievements", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const rows = db.prepare("SELECT achievement_id FROM user_achievements WHERE user_id = ?").all(user.id);
  res.json({ data: rows });
});

app.get("/api/data/morality_profiles", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const row = db.prepare("SELECT * FROM morality_profiles WHERE user_id = ?").get(user.id);
  res.json({ data: row || null });
});

app.get("/api/data/sparring_sessions", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const rows = db.prepare("SELECT * FROM sparring_sessions WHERE user_id = ? ORDER BY created_at DESC").all(user.id);
  res.json({ data: rows.map(r => ({ ...r, messages: JSON.parse(r.messages || "[]") })) });
});

app.get("/api/data/sparring_sessions/count", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const row = db.prepare("SELECT COUNT(*) as count FROM sparring_sessions WHERE user_id = ?").get(user.id);
  res.json({ count: row.count });
});

app.get("/api/data/arena_progress", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { philosopher_id, arena_level } = req.query;
  if (philosopher_id && arena_level) {
    const row = db.prepare("SELECT * FROM arena_progress WHERE user_id = ? AND philosopher_id = ? AND arena_level = ?").get(user.id, philosopher_id, Number(arena_level));
    res.json({ data: row || null });
  } else {
    const rows = db.prepare("SELECT * FROM arena_progress WHERE user_id = ?").all(user.id);
    res.json({ data: rows });
  }
});

app.get("/api/data/arena_progress/count_passed", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const row = db.prepare("SELECT COUNT(*) as count FROM arena_progress WHERE user_id = ? AND passed = 1").get(user.id);
  res.json({ count: row.count });
});

// POST /api/data/:table — upsert/insert
app.post("/api/data/profiles", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { display_name, avatar_initials } = req.body;
  db.prepare("INSERT INTO profiles (user_id, display_name, avatar_initials) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name, avatar_initials=excluded.avatar_initials")
    .run(user.id, display_name || "", avatar_initials || "");
  res.json({ success: true });
});

app.post("/api/data/user_streaks", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { current_streak, longest_streak, last_activity_date } = req.body;
  db.prepare("INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET current_streak=excluded.current_streak, longest_streak=excluded.longest_streak, last_activity_date=excluded.last_activity_date")
    .run(user.id, current_streak, longest_streak, last_activity_date);
  res.json({ success: true });
});

app.post("/api/data/user_xp", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { total_xp, level } = req.body;
  db.prepare("INSERT INTO user_xp (user_id, total_xp, level) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET total_xp=excluded.total_xp, level=excluded.level")
    .run(user.id, total_xp, level);
  res.json({ success: true });
});

app.post("/api/data/user_achievements", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { achievement_id } = req.body;
  try {
    db.prepare("INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)").run(user.id, achievement_id);
    res.json({ success: true });
  } catch {
    res.json({ success: true }); // already exists
  }
});

app.post("/api/data/sparring_sessions", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { opponent, topic, messages } = req.body;
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO sparring_sessions (id, user_id, opponent, topic, messages) VALUES (?, ?, ?, ?, ?)")
    .run(id, user.id, opponent, topic, JSON.stringify(messages || []));
  res.json({ data: { id } });
});

app.put("/api/data/sparring_sessions/:id", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { messages, score, rounds_scored } = req.body;
  db.prepare("UPDATE sparring_sessions SET messages = ?, score = ?, rounds_scored = ? WHERE id = ? AND user_id = ?")
    .run(JSON.stringify(messages || []), score || 0, rounds_scored || 0, req.params.id, user.id);
  res.json({ success: true });
});

app.post("/api/data/arena_progress", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { philosopher_id, arena_level, score, passed, best_score, attempts } = req.body;
  db.prepare(`INSERT INTO arena_progress (user_id, philosopher_id, arena_level, score, passed, best_score, attempts) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, philosopher_id, arena_level) DO UPDATE SET score=excluded.score, passed=MAX(arena_progress.passed, excluded.passed), best_score=MAX(arena_progress.best_score, excluded.best_score), attempts=arena_progress.attempts+1`)
    .run(user.id, philosopher_id, arena_level, score, passed ? 1 : 0, best_score, attempts || 1);
  res.json({ success: true });
});

app.post("/api/data/morality_profiles", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { alignment, alignment_description, compassion_vs_logic, individual_vs_collective, rules_vs_outcomes, idealism_vs_pragmatism, mercy_vs_justice, total_answered } = req.body;
  const existing = db.prepare("SELECT id, total_answered FROM morality_profiles WHERE user_id = ?").get(user.id);
  if (existing) {
    db.prepare("UPDATE morality_profiles SET alignment=?, alignment_description=?, compassion_vs_logic=?, individual_vs_collective=?, rules_vs_outcomes=?, idealism_vs_pragmatism=?, mercy_vs_justice=?, total_answered=? WHERE user_id=?")
      .run(alignment, alignment_description, compassion_vs_logic, individual_vs_collective, rules_vs_outcomes, idealism_vs_pragmatism, mercy_vs_justice, total_answered || (existing.total_answered + 1), user.id);
  } else {
    db.prepare("INSERT INTO morality_profiles (user_id, alignment, alignment_description, compassion_vs_logic, individual_vs_collective, rules_vs_outcomes, idealism_vs_pragmatism, mercy_vs_justice, total_answered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(user.id, alignment, alignment_description, compassion_vs_logic, individual_vs_collective, rules_vs_outcomes, idealism_vs_pragmatism, mercy_vs_justice, total_answered || 1);
  }
  res.json({ success: true });
});

app.post("/api/data/dilemma_responses", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { session_id, dilemma_id, choice_index } = req.body;
  db.prepare("INSERT INTO dilemma_responses (user_id, session_id, dilemma_id, choice_index) VALUES (?, ?, ?, ?)")
    .run(user.id, session_id, dilemma_id, choice_index);
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
  console.log(`Supabase Auth: ${SUPABASE_URL}`);
  console.log(`DeepSeek AI via RapidAPI`);
  console.log(`SQLite DB: ${DB_PATH}`);
});
