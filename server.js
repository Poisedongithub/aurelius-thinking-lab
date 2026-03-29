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

// ── Philosopher system prompts with enhanced personality & emotional reactions ──
const philosopherPrompts = {
  "marcus-aurelius": `You are Marcus Aurelius, Roman Emperor and Stoic philosopher. Your tone is weary but resolute—like a man writing to himself at the end of a long campaign. You speak in second person to yourself ("You must remember..."). Reference your Meditations by paraphrasing specific passages. Never raise your voice; your power comes from quiet, exhausted certainty. Use metaphors of rivers, seasons, and dying embers.

EMOTIONAL REACTIONS:
- When the user makes a strong point: acknowledge it stoically ("There is merit in what you say. And yet...")
- When the user contradicts themselves: point it out gently ("You said moments ago... now you claim...")
- When the user is emotional: stay calm and redirect ("Your passion speaks, but does your reason agree?")
- When the user agrees with you: push them further ("Do not agree too easily. Test this conviction.")

Keep responses to 3-4 sentences. Never write full paragraphs.`,

  "machiavelli": `You are Niccolò Machiavelli. You speak like a sly advisor whispering in a prince's ear—conspiratorial, amused, slightly dangerous. Drop names of real historical figures (Cesare Borgia, Pope Alexander VI) casually. You find idealism adorable but useless. Your sentences drip with dark humor and backhanded compliments. Use phrases like "My dear friend..." and "You see, the amusing thing about virtue is..."

EMOTIONAL REACTIONS:
- When the user makes a pragmatic point: show delight ("Ah! Now you begin to think like a prince...")
- When the user is idealistic: mock gently ("How charming. The people of Florence once believed the same—before the Medici returned.")
- When the user catches your logic: feign admiration ("Careful now—you're becoming dangerous.")
- When the user is naive: become conspiratorial ("Come closer. Let me tell you what really happens behind closed doors...")

Keep responses to 3-4 sentences. Never write full paragraphs.`,

  "sun-tzu": `You are Sun Tzu. You speak ONLY in short, cryptic aphorisms—never explain yourself. Your sentences sound like ancient proverbs carved in stone. Never use "I think" or "I believe"—state truths as if they are laws of nature. Use imagery of water, terrain, fog, and shadows. Your tone is cold, distant, and absolute—like a general who has already won.

EMOTIONAL REACTIONS:
- When the user makes a strategic point: acknowledge with a proverb ("The student who sees the river's path may one day redirect it.")
- When the user is reckless: warn cryptically ("The general who charges first dies first.")
- When the user shows patience: approve subtly ("Water.")
- When the user contradicts themselves: strike ("Your left flank is exposed.")

Keep responses to 3-4 sentences. Never write full paragraphs.`,

  "nietzsche": `You are Friedrich Nietzsche. You are volcanic—oscillating between wild ecstasy and biting contempt. Use exclamation marks! Ask rhetorical questions that you immediately answer yourself. Call your opponent's ideas "herd morality" or "the comforting lies of the weak." Laugh at things others hold sacred. Your language is dramatic, almost theatrical—you write like a man composing his own mythology. Occasionally reference Zarathustra in third person.

EMOTIONAL REACTIONS:
- When the user shows original thinking: become excited ("YES! Now you begin to create values rather than inherit them!")
- When the user appeals to convention: explode with contempt ("You sound like a priest! A shopkeeper of morality!")
- When the user pushes back hard: respect it ("Good! The hammer that strikes back is worth more than the anvil that merely endures.")
- When the user is timid: provoke ("Speak as if the abyss is listening—because it is.")

Keep responses to 3-4 sentences. Never write full paragraphs.`,

  "socrates": `You are Socrates. You NEVER make declarative statements—you ONLY ask questions. Every response must be 2-3 piercing questions that trap your opponent in contradiction. Feign ignorance with phrases like "Forgive me, I am but a simple stonemason's son..." before delivering devastating logical traps. Your questions should make the other person argue against themselves. You are playful, ironic, and annoyingly persistent.

EMOTIONAL REACTIONS:
- When the user makes a logical point: feign confusion to dig deeper ("How fascinating! But then wouldn't that also mean...?")
- When the user contradicts themselves: pounce with glee ("Ah! But did you not just say...? How do you reconcile...?")
- When the user gets frustrated: become even more innocent ("I apologize for my ignorance, but I simply must understand...")
- When the user avoids the question: redirect firmly ("You answer with eloquence, but not to the question I asked. Let me try again...")

Keep responses to 3-4 sentences, all questions. Never write full paragraphs.`,

  "confucius": `You are Confucius. You speak like a patient grandfather telling a story at dinner. Begin responses with "In my village..." or "A student once asked me..." and deliver wisdom through tiny parables about everyday things—a farmer's fence, a child's shoe, a cracked bowl. Your tone is warm but carries the weight of centuries. You never attack directly; you redirect with gentle disappointment.

EMOTIONAL REACTIONS:
- When the user shows wisdom: beam with pride ("Ah, you remind me of my finest student, Yan Hui...")
- When the user is disrespectful: show quiet sadness ("A student once spoke to me this way. He later understood why the bamboo bends.")
- When the user is confused: offer a parable ("Let me tell you about a farmer who could not choose between two fields...")
- When the user agrees too quickly: test them ("Agreement without understanding is like a roof without walls.")

Keep responses to 3-4 sentences. Never write full paragraphs.`,

  "simone-de-beauvoir": `You are Simone de Beauvoir. You are intellectually fierce and refuse to let sloppy thinking pass unchallenged. Your tone is precise, cutting, and passionate—like a brilliant professor who is also an activist. Use concrete social examples (women's labor, marriage contracts, institutional power). Call out hidden assumptions about "nature" and "essence." You don't suffer fools, but you engage seriously with genuine ideas. Reference your own lived experience.

EMOTIONAL REACTIONS:
- When the user makes a structural critique: engage passionately ("Exactly! Now follow that thread—who benefits from this arrangement?")
- When the user naturalizes oppression: cut sharply ("You say 'natural' as if that word hasn't been used to justify every injustice in history.")
- When the user shows genuine reflection: warm slightly ("Now you're thinking like someone who refuses to be complicit.")
- When the user is abstract: ground them ("Beautiful theory. Now tell me—what does this mean for the woman working two jobs?")

Keep responses to 3-4 sentences. Never write full paragraphs.`,

  "lao-tzu": `You are Lao Tzu. You speak in contradictions that somehow make perfect sense. Every response should contain at least one paradox ("The strongest sword is the one never drawn"). Your tone is amused, unhurried, almost sleepy—like someone who has seen everything and finds it all gently funny. Use only nature imagery: water, mountains, empty vessels, uncarved wood. Never argue directly—simply offer a perspective that makes the other position dissolve.

EMOTIONAL REACTIONS:
- When the user tries too hard: smile ("The tree that bends in the wind outlasts the one that stands rigid.")
- When the user grasps a paradox: nod ("Now you begin to see by closing your eyes.")
- When the user is aggressive: become softer ("The river does not fight the stone. It simply flows around it.")
- When the user overcomplicates: simplify ("You have added too many strokes to the painting. The empty space was the beauty.")

Keep responses to 3-4 sentences. Never write full paragraphs.`,
};

// ── Philosopher personality traits for memory context ──
const philosopherTraits = {
  "marcus-aurelius": { referenceStyle: "recalls your previous stance", opener: "You spoke before of", closer: "Has your thinking changed, or does it remain?" },
  "machiavelli": { referenceStyle: "uses your past words against you", opener: "I recall you once argued", closer: "A convenient shift, or genuine growth?" },
  "sun-tzu": { referenceStyle: "notes strategic inconsistency", opener: "In our last engagement, your position was", closer: "The terrain has shifted." },
  "nietzsche": { referenceStyle: "mocks or praises evolution", opener: "Last time you stood here, you claimed", closer: "Have you overcome yourself, or merely forgotten?" },
  "socrates": { referenceStyle: "questions the change", opener: "If I recall correctly, you once said", closer: "What changed your mind? Or did it change at all?" },
  "confucius": { referenceStyle: "draws a lesson from growth", opener: "When we last spoke, you believed", closer: "Growth is the mark of the superior person." },
  "simone-de-beauvoir": { referenceStyle: "examines the shift critically", opener: "You previously argued", closer: "What material conditions changed your perspective?" },
  "lao-tzu": { referenceStyle: "sees the flow", opener: "The river of your thought once flowed toward", closer: "Now it turns. This is the Way." },
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

    // ── Debate Memory: retrieve past sessions with this philosopher ──
    let memoryContext = "";
    try {
      const user = await getUser(req);
      if (user && supabaseAdmin) {
        const { data: pastSessions } = await supabaseAdmin
          .from("sparring_sessions")
          .select("topic, messages, score, created_at")
          .eq("user_id", user.id)
          .eq("opponent", philosopher)
          .eq("completed", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (pastSessions && pastSessions.length > 0) {
          const traits = philosopherTraits[philosopher] || philosopherTraits["marcus-aurelius"];
          const summaries = pastSessions.map(s => {
            const userMsgs = (s.messages || []).filter(m => m.role === "user").map(m => m.content).slice(0, 2);
            if (userMsgs.length === 0) return null;
            return `Topic: ${s.topic}, User argued: "${userMsgs[0].slice(0, 120)}..." (scored ${s.score || 0} points)`;
          }).filter(Boolean);

          if (summaries.length > 0) {
            memoryContext = `\n\nDEBATE MEMORY — You have debated this person before. ${traits.opener}: ${summaries.join("; ")}. ${traits.closer} Use this knowledge to reference their past positions when relevant. Don't force it — only mention it when it naturally fits the conversation.`;
          }
        }
      }
    } catch (memErr) {
      console.error("Memory retrieval error (non-fatal):", memErr.message);
    }

    const systemPrompt = `${philosopherPrompts[philosopher] || philosopherPrompts["marcus-aurelius"]}\n\n${topicContext[topic] || ""}\n\nYou are in a philosophical sparring session. Challenge the user's views and defend your position. Stay in character. If this is the opening, deliver a sharp provocative opener on the topic. IMPORTANT: Keep every response to 1-2 sentences maximum. Be punchy and direct.${memoryContext}${systemSuffix || ""}`;
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

// GET /api/data/sparring_sessions/active
app.get("/api/data/sparring_sessions/active", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { opponent, topic, arena_level } = req.query;
  if (!opponent || !topic) return res.json({ data: null });
  
  // Find the most recent session for this philosopher/topic that is not completed
  // A session is "active" if it has messages but the arena is not complete (no arena_complete flag)
  let query = supabaseAdmin
    .from("sparring_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("opponent", opponent)
    .eq("topic", topic)
    .eq("completed", false)
    .order("created_at", { ascending: false })
    .limit(1);
  
  if (arena_level) {
    query = query.eq("arena_level", Number(arena_level));
  }
  
  const { data, error } = await query;
  if (error && error.code !== "PGRST116") console.error("active session GET error:", error);
  res.json({ data: (data && data.length > 0) ? data[0] : null });
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
  const { opponent, topic, messages, arena_level } = req.body;
  const insertData = { user_id: user.id, opponent, topic, messages: messages || [], completed: false };
  if (arena_level !== undefined && arena_level !== null) insertData.arena_level = arena_level;
  const { data, error } = await supabaseAdmin.from("sparring_sessions").insert(insertData).select("id").single();
  if (error) console.error("sparring_sessions POST error:", error);
  res.json({ data: { id: data?.id } });
});

// PUT /api/data/sparring_sessions/:id
app.put("/api/data/sparring_sessions/:id", async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { messages, score, rounds_scored, completed } = req.body;
  const updateData = { messages: messages || [], score: score || 0, rounds_scored: rounds_scored || 0 };
  if (completed !== undefined) updateData.completed = completed;
  const { error } = await supabaseAdmin.from("sparring_sessions").update(updateData).eq("id", req.params.id).eq("user_id", user.id);
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

// ══════════════════════════════════════════════════
// ── DAILY MORAL COURT ENDPOINTS ──
// ══════════════════════════════════════════════════

// Generate today's court case (AI-generated, cached per day)
const courtCaseCache = {}; // { "YYYY-MM-DD": caseData }

app.get("/api/court/daily-case", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    // Check cache first
    if (courtCaseCache[today]) {
      return res.json({ case: courtCaseCache[today] });
    }

    // Check Supabase for today's case
    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from("court_cases")
        .select("*")
        .eq("case_date", today)
        .single();
      if (existing) {
        courtCaseCache[today] = existing;
        return res.json({ case: existing });
      }
    }

    // Generate a new case via AI
    const data = await callDeepSeek([
      { role: "system", content: `You are a legal and moral philosophy expert who creates compelling ethical court cases. Generate a morally ambiguous case for a "Daily Moral Court" where users act as judge.

The case must:
- Be inspired by real-world ethical tensions (medical ethics, technology, justice, environmental, corporate, personal)
- Have NO clear right answer — reasonable people should disagree
- Include specific names, details, and circumstances to feel real
- Present two clear opposing sides

Respond with ONLY a valid JSON object (no markdown) in this exact format:
{
  "title": "Short evocative case title (3-6 words)",
  "category": "one of: Medical Ethics, Criminal Justice, Technology, Environment, Corporate, Personal Freedom, Education, War & Conflict, Family, Scientific Ethics",
  "scenario": "A vivid 4-6 sentence description of the case. Include specific names, ages, and circumstances. End with the core moral tension.",
  "defendant": "Name and brief description of the person on trial",
  "charge": "What they are accused of or what decision is being questioned",
  "prosecution": {
    "philosopher": "one of: marcus-aurelius, nietzsche, socrates, machiavelli, sun-tzu, confucius, simone-de-beauvoir, lao-tzu",
    "position": "A 2-sentence summary of why this person should be found GUILTY or why the action was WRONG"
  },
  "defense": {
    "philosopher": "a DIFFERENT philosopher from the list above",
    "position": "A 2-sentence summary of why this person should be found NOT GUILTY or why the action was JUSTIFIED"
  },
  "verdict_options": [
    { "label": "Guilty", "description": "Brief description of what this verdict means" },
    { "label": "Not Guilty", "description": "Brief description of what this verdict means" },
    { "label": "Guilty with Mercy", "description": "Guilty but with reduced consequences due to circumstances" }
  ],
  "moral_dimensions": ["dimension1", "dimension2"] 
}` },
      { role: "user", content: `Generate today's court case. Today is ${today}. Make it thought-provoking and timely.` },
    ]);

    let raw = data.choices?.[0]?.message?.content || "{}";
    if (raw.startsWith("```")) raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const caseData = JSON.parse(raw);
    caseData.case_date = today;
    caseData.id = `court-${today}`;

    // Store in Supabase
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from("court_cases").upsert({
          id: caseData.id,
          case_date: today,
          title: caseData.title,
          category: caseData.category,
          scenario: caseData.scenario,
          defendant: caseData.defendant,
          charge: caseData.charge,
          prosecution: caseData.prosecution,
          defense: caseData.defense,
          verdict_options: caseData.verdict_options,
          moral_dimensions: caseData.moral_dimensions,
        }, { onConflict: "id" });
      } catch (dbErr) {
        console.error("Court case DB save error (non-fatal):", dbErr.message);
      }
    }

    courtCaseCache[today] = caseData;
    res.json({ case: caseData });
  } catch (err) {
    console.error("daily-case error:", err);
    res.status(500).json({ error: "Failed to generate court case" });
  }
});

// Get AI philosopher argument (prosecution or defense)
app.post("/api/court/argument", async (req, res) => {
  try {
    const { philosopher, position, scenario, side, userQuestion } = req.body;
    const prompt = philosopherPrompts[philosopher] || philosopherPrompts["marcus-aurelius"];
    
    const systemContent = `${prompt}\n\nYou are in a MORAL COURT as the ${side === "prosecution" ? "PROSECUTION" : "DEFENSE"} advocate. The case: ${scenario}\n\nYour position: ${position}\n\nDeliver your argument passionately and in character. If the user (the judge) asks you a question, answer it while staying in character and defending your position. Keep responses to 3-4 sentences maximum.`;
    
    const messages = [
      { role: "system", content: systemContent },
    ];
    
    if (userQuestion) {
      messages.push({ role: "user", content: userQuestion });
    } else {
      messages.push({ role: "user", content: `Present your ${side === "prosecution" ? "prosecution" : "defense"} argument to the court.` });
    }

    const data = await callDeepSeek(messages);
    const content = data.choices?.[0]?.message?.content || "The court awaits my words...";
    
    // Stream the response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const words = content.split(/(\s+)/);
    for (let i = 0; i < words.length; i++) {
      const chunk = { id: "court-" + Date.now(), object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: "deepseek-chat", choices: [{ index: 0, delta: { content: words[i] }, finish_reason: null }] };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ id: "court-" + Date.now(), object: "chat.completion.chunk", created: Math.floor(Date.now() / 1000), model: "deepseek-chat", choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("court argument error:", err);
    res.status(500).json({ error: "Failed to generate argument" });
  }
});

// Submit verdict
app.post("/api/court/verdict", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { case_id, case_date, verdict, reasoning } = req.body;
    
    if (supabaseAdmin) {
      await supabaseAdmin.from("court_verdicts").upsert({
        user_id: user.id,
        case_id,
        case_date,
        verdict,
        reasoning: reasoning || "",
      }, { onConflict: "user_id,case_id" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("verdict submit error:", err);
    res.status(500).json({ error: "Failed to submit verdict" });
  }
});

// Get user's verdict for a case
app.get("/api/court/my-verdict", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { case_id } = req.query;
    if (!case_id) return res.json({ data: null });
    
    const { data } = await supabaseAdmin
      .from("court_verdicts")
      .select("*")
      .eq("user_id", user.id)
      .eq("case_id", case_id)
      .single();
    res.json({ data: data || null });
  } catch (err) {
    res.json({ data: null });
  }
});

// Get community verdict statistics for a case
app.get("/api/court/stats", async (req, res) => {
  try {
    const { case_id } = req.query;
    if (!case_id) return res.json({ stats: {} });
    
    const { data: verdicts } = await supabaseAdmin
      .from("court_verdicts")
      .select("verdict")
      .eq("case_id", case_id);
    
    const total = verdicts?.length || 0;
    const counts = {};
    (verdicts || []).forEach(v => {
      counts[v.verdict] = (counts[v.verdict] || 0) + 1;
    });
    
    const stats = {};
    Object.keys(counts).forEach(k => {
      stats[k] = { count: counts[k], percentage: total > 0 ? Math.round((counts[k] / total) * 100) : 0 };
    });
    
    res.json({ stats, total });
  } catch (err) {
    console.error("court stats error:", err);
    res.json({ stats: {}, total: 0 });
  }
});

// Get user's verdict history (judicial record)
app.get("/api/court/history", async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    
    const { data: verdicts } = await supabaseAdmin
      .from("court_verdicts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    
    // Fetch corresponding case titles
    const caseIds = (verdicts || []).map(v => v.case_id);
    let cases = [];
    if (caseIds.length > 0) {
      const { data: caseData } = await supabaseAdmin
        .from("court_cases")
        .select("id, title, category, case_date")
        .in("id", caseIds);
      cases = caseData || [];
    }
    
    const history = (verdicts || []).map(v => {
      const c = cases.find(c => c.id === v.case_id);
      return { ...v, case_title: c?.title || "Unknown Case", case_category: c?.category || "", case_date: c?.case_date || v.case_date };
    });
    
    res.json({ data: history });
  } catch (err) {
    console.error("court history error:", err);
    res.json({ data: [] });
  }
});

// ══════════════════════════════════════════════════
// ── MARKETS API ENDPOINTS (Google Finance — free, all tickers, no rate limits) ──
// ══════════════════════════════════════════════════

const GF_BASE = "https://www.google.com/finance/quote";
const GF_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const GF_EXCHANGES = ["NASDAQ", "NYSE", "NYSEARCA", "NYSEMKT"];

// ── Polygon (Massive) API for sector data ──
const POLYGON_API_KEY = "jCRBXHnFwWhMydtQKV2dfEW_3ablMV3l";
const sectorCache = new Map(); // ticker -> { sector, industry, ts }
const SECTOR_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Map SIC descriptions to our dashboard categories
function mapSicToCategory(sicDescription) {
  if (!sicDescription) return "";
  const sic = sicDescription.toUpperCase();
  // Technology
  if (sic.includes("SEMICONDUCTOR") || sic.includes("COMPUTER") || sic.includes("SOFTWARE") || sic.includes("ELECTRONIC") || sic.includes("CIRCUIT") || sic.includes("DATA PROCESSING") || sic.includes("PROGRAMMING")) return "Technology";
  // Communication
  if (sic.includes("COMMUNICAT") || sic.includes("BROADCAST") || sic.includes("TELECOMM") || sic.includes("CABLE") || sic.includes("RADIO") || sic.includes("TELEVISION") || sic.includes("MEDIA") || sic.includes("PUBLISHING") || sic.includes("ADVERTISING")) return "Communication";
  // Industrials
  if (sic.includes("INDUSTRIAL") || sic.includes("CONSTRUCT") || sic.includes("MACHINERY") || sic.includes("AEROSPACE") || sic.includes("DEFENSE") || sic.includes("TRANSPORT") || sic.includes("RAILROAD") || sic.includes("TRUCKING") || sic.includes("AIRCRAFT") || sic.includes("FARM MACHINERY") || sic.includes("CATERPILLAR")) return "Industrials";
  // Consumer
  if (sic.includes("RETAIL") || sic.includes("FOOD") || sic.includes("BEVERAGE") || sic.includes("APPAREL") || sic.includes("AUTO") || sic.includes("MOTOR VEHICLE") || sic.includes("RESTAURANT") || sic.includes("HOTEL") || sic.includes("ENTERTAIN") || sic.includes("RECREATION") || sic.includes("CONSUMER")) return "Consumer";
  // Healthcare
  if (sic.includes("PHARMA") || sic.includes("DRUG") || sic.includes("MEDICAL") || sic.includes("HEALTH") || sic.includes("SURGICAL") || sic.includes("DENTAL") || sic.includes("BIOLOGICAL") || sic.includes("DIAGNOSTIC")) return "Healthcare";
  // Financial
  if (sic.includes("BANK") || sic.includes("INSURANCE") || sic.includes("INVEST") || sic.includes("FINANC") || sic.includes("SECURITY") || sic.includes("BROKER") || sic.includes("REAL ESTATE") || sic.includes("MORTGAGE") || sic.includes("LOAN") || sic.includes("CREDIT")) return "Financial";
  return "";
}

// Fetch sector data from Polygon API
async function fetchSectorData(symbol) {
  const upperSymbol = symbol.toUpperCase();
  const cached = sectorCache.get(upperSymbol);
  if (cached && (Date.now() - cached.ts) < SECTOR_CACHE_TTL) {
    return { sector: cached.sector, industry: cached.industry };
  }
  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${encodeURIComponent(upperSymbol)}?apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return { sector: "", industry: "" };
    const json = await response.json();
    const results = json.results || {};
    const sicDesc = results.sic_description || "";
    const sector = mapSicToCategory(sicDesc);
    const industry = sicDesc;
    sectorCache.set(upperSymbol, { sector, industry, ts: Date.now() });
    return { sector, industry };
  } catch {
    return { sector: "", industry: "" };
  }
}

// ── In-memory cache ──
const gfCache = new Map();
const GF_CACHE_TTL = 3 * 60 * 1000;       // 3 min fresh TTL
const GF_STALE_TTL = 60 * 60 * 1000;      // 1 hour stale fallback
const GF_EXCHANGE_MAP = new Map();         // ticker -> exchange (learned)

// Clean expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of gfCache.entries()) {
    if (now - val.ts > GF_STALE_TTL) gfCache.delete(key);
  }
}, 10 * 60 * 1000);

// Helper: parse market cap string like "4.27T USD" or "55.47B USD" to number
function parseMarketCap(str) {
  if (!str) return null;
  const match = str.match(/([\d,.]+)\s*([TBMK]?)/);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ""));
  const suffix = match[2];
  const multipliers = { T: 1e12, B: 1e9, M: 1e6, K: 1e3, "": 1 };
  return num * (multipliers[suffix] || 1);
}

// Helper: parse volume string like "188.90M" or "4.10M" to number
function parseVolume(str) {
  if (!str) return 0;
  const match = str.match(/([\d,.]+)\s*([TBMK]?)/);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(/,/g, ""));
  const suffix = match[2];
  const multipliers = { T: 1e12, B: 1e9, M: 1e6, K: 1e3, "": 1 };
  return Math.round(num * (multipliers[suffix] || 1));
}

// Helper: format large numbers for display
function formatLargeNumber(n) {
  if (!n || n === 0) return null;
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return String(n);
}

// Core: scrape Google Finance for a ticker
async function scrapeGoogleFinance(symbol) {
  const upperSymbol = symbol.toUpperCase();
  
  // Check cache
  const cached = gfCache.get(upperSymbol);
  if (cached && (Date.now() - cached.ts) < GF_CACHE_TTL) {
    return cached.data;
  }
  
  // Determine exchange order: try learned exchange first
  const knownExchange = GF_EXCHANGE_MAP.get(upperSymbol);
  const exchanges = knownExchange
    ? [knownExchange, ...GF_EXCHANGES.filter(e => e !== knownExchange)]
    : [...GF_EXCHANGES];
  
  let html = null;
  let usedExchange = null;
  
  for (const exchange of exchanges) {
    try {
      const url = `${GF_BASE}/${encodeURIComponent(upperSymbol)}:${exchange}`;
      const response = await fetch(url, {
        headers: { "User-Agent": GF_UA },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) continue;
      const text = await response.text();
      // Check if we got a valid quote page (has data-last-price)
      if (text.includes('data-last-price="')) {
        html = text;
        usedExchange = exchange;
        GF_EXCHANGE_MAP.set(upperSymbol, exchange);
        break;
      }
    } catch {
      continue;
    }
  }
  
  if (!html) {
    // Try stale cache
    if (cached && (Date.now() - cached.ts) < GF_STALE_TTL) {
      console.warn(`scrapeGoogleFinance: serving stale cache for ${upperSymbol}`);
      return cached.data;
    }
    throw new Error(`Could not find ${upperSymbol} on Google Finance`);
  }
  
  // Strip HTML tags for text parsing
  const textContent = html.replace(/<[^>]+>/g, "");
  
  // Extract price from data attribute
  const priceMatch = html.match(/data-last-price="([^"]+)"/);
  const price = priceMatch ? parseFloat(priceMatch[1]) : null;
  
  // Extract company name from the page title or entity
  const nameMatch = html.match(/<title>([^<]+)<\/title>/);
  let companyName = upperSymbol;
  if (nameMatch) {
    // Title format: "NVDA: NVIDIA Corp Stock Price & News - Google Finance"
    const titleParts = nameMatch[1].split(" Stock Price");
    if (titleParts[0]) {
      const namePart = titleParts[0].replace(/^[A-Z]+:\s*/, "").trim();
      if (namePart) companyName = namePart;
    }
  }
  
  // Extract previous close
  const prevCloseMatch = textContent.match(/Previous close[^$]*\$([\d,.]+)/);
  const previousClose = prevCloseMatch ? parseFloat(prevCloseMatch[1].replace(/,/g, "")) : null;
  
  // Extract day range
  const dayRangeMatch = textContent.match(/Day range[^$]*\$([\d,.]+)\s*-\s*\$([\d,.]+)/);
  const dayLow = dayRangeMatch ? parseFloat(dayRangeMatch[1].replace(/,/g, "")) : null;
  const dayHigh = dayRangeMatch ? parseFloat(dayRangeMatch[2].replace(/,/g, "")) : null;
  
  // Extract year (52-week) range
  const yearRangeMatch = textContent.match(/Year range[^$]*\$([\d,.]+)\s*-\s*\$([\d,.]+)/);
  const yearLow = yearRangeMatch ? parseFloat(yearRangeMatch[1].replace(/,/g, "")) : null;
  const yearHigh = yearRangeMatch ? parseFloat(yearRangeMatch[2].replace(/,/g, "")) : null;
  
  // Extract market cap
  const mcapMatch = textContent.match(/outstanding shares\.([\d,.]+[TBMK]?\s*USD)/);
  const marketCapStr = mcapMatch ? mcapMatch[1] : null;
  const marketCap = parseMarketCap(marketCapStr);
  
  // Extract volume — text after stripping tags looks like:
  // "Avg VolumeThe average number of shares traded each day over the past 30 days190.06M"
  const volMatch = textContent.match(/Avg Volume.*?past \d+ days([\d,.]+[TBMK]?)/) || textContent.match(/Avg Volume.*?days([\d,.]+[TBMK]?)/);
  const volume = volMatch ? parseVolume(volMatch[1]) : 0;
  
  // Calculate percent change
  const change = (price && previousClose) ? ((price - previousClose) / previousClose * 100) : 0;
  
  const data = {
    symbol: upperSymbol,
    name: companyName,
    exchange: usedExchange || "",
    currency: "USD",
    price,
    previousClose,
    dayHigh,
    dayLow,
    fiftyTwoWeekHigh: yearHigh,
    fiftyTwoWeekLow: yearLow,
    volume,
    marketCap,
    marketCapFormatted: marketCapStr || null,
    change,
  };
  
  // Cache the result
  gfCache.set(upperSymbol, { data, ts: Date.now() });
  return data;
}

// Google Finance — get live stock quote
app.get("/api/markets/quote/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await scrapeGoogleFinance(symbol);
    
    // Fetch sector data from Polygon API
    const sectorData = await fetchSectorData(symbol);
    
    res.json({
      symbol: data.symbol,
      name: data.name,
      exchange: data.exchange,
      currency: data.currency,
      price: data.price,
      previousClose: data.previousClose,
      dayHigh: data.dayHigh,
      dayLow: data.dayLow,
      fiftyTwoWeekHigh: data.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: data.fiftyTwoWeekLow,
      volume: data.volume,
      marketCap: data.marketCap,
      marketCapFormatted: data.marketCapFormatted,
      change: data.change,
      sector: sectorData.sector,
      industry: sectorData.industry,
      description: "",
      ceo: "",
      website: "",
      image: "",
      performance: {
        "1D": data.change,
        "1W": null,
        "1M": null,
        "3M": null,
        "YTD": null,
      },
      chart: [],
    });
  } catch (err) {
    console.error("Markets quote error:", err.message);
    res.status(500).json({ error: "Failed to fetch stock data", details: err.message });
  }
});

// Google Finance — batch quotes for multiple symbols
app.get("/api/markets/batch", async (req, res) => {
  try {
    const symbols = (req.query.symbols || req.query.tickers || "").split(",").filter(Boolean);
    if (symbols.length === 0) return res.json({ quotes: [] });
    
    const quotes = await Promise.all(symbols.map(async (symbol) => {
      try {
        const [data, sectorData] = await Promise.all([
          scrapeGoogleFinance(symbol),
          fetchSectorData(symbol),
        ]);
        return {
          symbol: data.symbol,
          name: data.name,
          exchange: data.exchange,
          price: data.price,
          change: data.change,
          volume: data.volume,
          marketCap: data.marketCap,
          marketCapFormatted: data.marketCapFormatted,
          yearHigh: data.fiftyTwoWeekHigh,
          yearLow: data.fiftyTwoWeekLow,
          sector: sectorData.sector,
          industry: sectorData.industry,
          priceAvg50: null,
          priceAvg200: null,
        };
      } catch {
        return { symbol, error: true };
      }
    }));
    
    res.json({ quotes: quotes.filter(q => !q.error) });
  } catch (err) {
    console.error("Markets batch error:", err.message);
    res.status(500).json({ error: "Failed to fetch batch quotes" });
  }
});

// Google Finance — search tickers (uses Google Finance main page autocomplete-like approach)
app.get("/api/markets/search", async (req, res) => {
  try {
    const query = (req.query.q || "").toUpperCase().trim();
    if (!query) return res.json({ results: [] });
    
    // Try to scrape the ticker directly — if it resolves, return it
    try {
      const data = await scrapeGoogleFinance(query);
      if (data && data.price) {
        const sectorData = await fetchSectorData(query);
        return res.json({ results: [{
          symbol: data.symbol,
          name: data.name,
          exchange: data.exchange,
          currency: "USD",
          sector: sectorData.sector,
          industry: sectorData.industry,
        }] });
      }
    } catch {
      // Not a direct ticker match, return empty
    }
    
    res.json({ results: [] });
  } catch (err) {
    console.error("Markets search error:", err.message);
    res.json({ results: [] });
  }
});

// Google Finance — company profile
app.get("/api/markets/profile/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await scrapeGoogleFinance(symbol);
    const sectorData = await fetchSectorData(symbol);
    res.json({
      symbol: data.symbol,
      companyName: data.name,
      exchange: data.exchange,
      sector: sectorData.sector,
      industry: sectorData.industry,
    });
  } catch (err) {
    console.error("Markets profile error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Historical price data via Polygon (Massive) API
app.get("/api/markets/history/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const range = req.query.range || "1Y";
    const POLYGON_KEY = "jCRBXHnFwWhMydtQKV2dfEW_3ablMV3l";
    
    const now = new Date();
    let from, multiplier = 1, timespan = "day";
    switch (range) {
      case "1D":
        from = new Date(now); from.setDate(from.getDate() - 1);
        multiplier = 5; timespan = "minute";
        break;
      case "1W":
        from = new Date(now); from.setDate(from.getDate() - 7);
        multiplier = 30; timespan = "minute";
        break;
      case "1M":
        from = new Date(now); from.setMonth(from.getMonth() - 1);
        break;
      case "3M":
        from = new Date(now); from.setMonth(from.getMonth() - 3);
        break;
      case "1Y":
        from = new Date(now); from.setFullYear(from.getFullYear() - 1);
        break;
      case "ALL":
        from = new Date(now); from.setFullYear(from.getFullYear() - 5);
        multiplier = 1; timespan = "week";
        break;
      default:
        from = new Date(now); from.setFullYear(from.getFullYear() - 1);
    }
    
    const fromStr = from.toISOString().split("T")[0];
    const toStr = now.toISOString().split("T")[0];
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/${multiplier}/${timespan}/${fromStr}/${toStr}?adjusted=true&sort=asc&limit=5000&apiKey=${POLYGON_KEY}`;
    
    const resp = await fetch(url);
    const data = await resp.json();
    
    const history = (data.results || []).map(bar => ({
      date: new Date(bar.t).toISOString().split("T")[0],
      timestamp: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));
    
    res.json({ symbol: symbol.toUpperCase(), range, history });
  } catch (err) {
    console.error("Markets history error:", err.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// AI-powered stock analysis using DeepSeek
app.post("/api/markets/analyze", async (req, res) => {
  try {
    const { symbol, name, price, change, section } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    
    const sectionPrompts = {
      "attention-trigger": `Analyze what's driving attention to ${symbol} (${name}) right now. Price: $${price}, change: ${change}%. Identify the key catalyst (earnings, news, sector rotation, volume spike). Format as JSON: { "triggers": ["tag1", "tag2"], "summary": "2-3 sentences", "whyNow": "1-2 sentences on why this name matters right now" }`,
      
      "what-moved": `What moved ${symbol} (${name}) recently? Price: $${price}, change: ${change}%. Identify 2-3 key catalysts with impact scores (1-10). Format as JSON: { "summary": "1 sentence", "catalysts": [{ "title": "...", "description": "...", "impact": 8 }] }`,
      
      "industry-chain": `Map the industry supply chain for ${symbol} (${name}). Identify upstream suppliers, downstream customers, and key competitors. Format as JSON: { "summary": "2 sentences about position in chain", "nodes": [{ "name": "...", "role": "supplier|competitor|customer|partner", "tickers": ["XXX"] }], "bottlenecks": ["..."] }`,
      
      "leverage-point": `Assess the competitive leverage of ${symbol} (${name}). Score 0-100 on pricing power, switching costs, network effects, and market position. Format as JSON: { "score": 85, "summary": "2-3 sentences", "tags": ["tag1"], "bestLeverageType": "technical|fundamental|structural" }`,
      
      "peer-readthrough": `Identify 3 peer companies whose recent results or commentary have implications for ${symbol} (${name}). Format as JSON: { "peers": [{ "ticker": "XXX", "name": "...", "signal": "bull|bear|neutral", "quote": "key quote from earnings/commentary", "implication": "what it means for ${symbol}", "date": "2025-XX-XX" }] }`,
      
      "follow-money": `Analyze the money flow for ${symbol} (${name}). Look at capex trends, contract wins, backlog, institutional buying. Score 0-100. Format as JSON: { "score": 85, "type": "structural|cyclical|speculative", "summary": "2-3 sentences", "signals": [{ "type": "capex budget|signed contract|backlog", "strength": "strong|moderate|weak", "description": "...", "amount": "$XX" }] }`,
      
      "company-numbers": `Provide key financial metrics for ${symbol} (${name}). Format as JSON: { "metrics": { "revGrowth": "+XX% YoY", "epsGrowth": "+XX% YoY", "grossMargin": "XX%", "opMargin": "XX%", "fcfMargin": "XX%", "guidance": "Above/Below/In-line consensus" }, "summary": "2-3 sentences" }`,
      
      "segments": `Break down ${symbol} (${name}) by business segment. Format as JSON: { "segments": [{ "name": "...", "status": "accelerating|stable|decelerating", "role": "core|supporting|irrelevant", "description": "...", "importance": 85 }] }`,
      
      "contracts": `Assess adoption proof and contract wins for ${symbol} (${name}). Score 0-100. Format as JSON: { "score": 85, "summary": "2 sentences", "contracts": [{ "customer": "...", "status": "signed|expanding|pilot", "description": "..." }] }`,
      
      "valuation": `Provide valuation context for ${symbol} (${name}) at $${price}. Format as JSON: { "multiples": { "pe": "XXx", "evSales": "XXx", "evEbitda": "XXx" }, "assessment": "cheap|fair|expensive|priced for perfection", "summary": "2-3 sentences", "vsHistory": "...", "vsPeers": "..." }`,
      
      "ownership": `Analyze ownership and sentiment for ${symbol} (${name}). Format as JSON: { "institutional": "XX%", "shortInterest": "X.X%", "crowding": "low|moderate|elevated", "sentiment": "bearish|neutral|bullish|extremely bullish", "summary": "2-3 sentences" }`,
      
      "thesis": `Write an investment thesis for ${symbol} (${name}) at $${price}. Format as JSON: { "summary": "3-4 sentences", "bullCase": "2-3 sentences", "bearCase": "2-3 sentences", "whatChangesIt": "2-3 sentences", "watchItems": ["item1", "item2", "item3"] }`,
      
      "process-score": `Score ${symbol} (${name}) across the research process dimensions. Format as JSON: { "totalScore": 85, "conviction": "lead|high|moderate|low", "breakdown": { "trigger": 5, "catalyst": 8, "leverage": 12, "peers": 8, "moneyFlow": 12, "numbers": 8, "segments": 8, "contracts": 8, "valuation": 6, "ownership": 5 } }`,
      
      "evidence": `List 5-6 key evidence sources for ${symbol} (${name}) analysis. Format as JSON: { "sources": [{ "type": "earnings release|transcript|news|contract|analyst|ownership", "title": "...", "source": "...", "date": "2025-XX-XX", "summary": "1-2 sentences" }] }`,
    };
    
    const prompt = sectionPrompts[section];
    if (!prompt) return res.status(400).json({ error: "Invalid section" });
    
    const messages = [
      { role: "system", content: "You are an elite equity research analyst at a top hedge fund. Provide institutional-grade analysis. Always respond with valid JSON only — no markdown, no code blocks, no explanation text. Just the JSON object." },
      { role: "user", content: prompt }
    ];
    
    const data = await callDeepSeek(messages);
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Try to parse JSON from the response
    let parsed;
    try {
      // Strip markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw: content, parseError: true };
    }
    
    res.json({ section, symbol, analysis: parsed });
  } catch (err) {
    console.error("Markets analyze error:", err);
    res.status(500).json({ error: "Analysis failed", details: err.message || String(err) });
  }
});

// Full ticker analysis — generate all sections at once
app.post("/api/markets/full-analysis", async (req, res) => {
  try {
    const { symbol, name, price, change } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    
    const prompt = `You are an elite equity research analyst. Provide a comprehensive analysis of ${symbol} (${name}) at $${price} (${change}% today).

Return a complete JSON object with ALL of these sections:
{
  "attentionTrigger": { "triggers": ["tag1"], "summary": "...", "whyNow": "..." },
  "whatMoved": { "summary": "...", "catalysts": [{ "title": "...", "description": "...", "impact": 8 }] },
  "industryChain": { "summary": "...", "nodes": [{ "name": "...", "role": "...", "tickers": [] }], "bottlenecks": [] },
  "leveragePoint": { "score": 85, "summary": "...", "tags": [], "bestLeverageType": "..." },
  "peerReadthrough": { "peers": [{ "ticker": "...", "name": "...", "signal": "bull", "quote": "...", "implication": "...", "date": "..." }] },
  "followMoney": { "score": 85, "type": "structural", "summary": "...", "signals": [] },
  "companyNumbers": { "metrics": { "revGrowth": "...", "epsGrowth": "...", "grossMargin": "...", "opMargin": "...", "fcfMargin": "...", "guidance": "..." }, "summary": "..." },
  "segments": { "segments": [{ "name": "...", "status": "...", "role": "...", "description": "...", "importance": 85 }] },
  "contracts": { "score": 85, "summary": "...", "contracts": [] },
  "valuation": { "multiples": { "pe": "...", "evSales": "...", "evEbitda": "..." }, "assessment": "...", "summary": "...", "vsHistory": "...", "vsPeers": "..." },
  "ownership": { "institutional": "...", "shortInterest": "...", "crowding": "...", "sentiment": "...", "summary": "..." },
  "thesis": { "summary": "...", "bullCase": "...", "bearCase": "...", "whatChangesIt": "...", "watchItems": [] },
  "processScore": { "totalScore": 85, "conviction": "lead", "breakdown": {} },
  "evidence": { "sources": [{ "type": "...", "title": "...", "source": "...", "date": "...", "summary": "..." }] }
}

Respond with ONLY valid JSON. No markdown, no code blocks.`;
    
    const messages = [
      { role: "system", content: "You are an elite equity research analyst at a top hedge fund. Always respond with valid JSON only." },
      { role: "user", content: prompt }
    ];
    
    const data = await callDeepSeek(messages);
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { raw: content, parseError: true };
    }
    
    res.json({ symbol, analysis: parsed });
  } catch (err) {
    console.error("Markets full-analysis error:", err);
    res.status(500).json({ error: "Full analysis failed" });
  }
});

// ══════════════════════════════════════════════════
// ── JACOB AI STOCK CHAT ──
// ══════════════════════════════════════════════════

const JACOB_SYSTEM_PROMPT = `You are Jacob talking about stocks.

Not an assistant talking to Jacob.
Not a hedge fund guy doing a podcast.
Not a finance influencer.
Not a polished newsletter writer.
Not a fake alpha caricature.

You are supposed to sound like Jacob actually sounds in conversation when he is talking through a stock, challenging an idea, deciding whether to buy or sell, or trying not to do something dumb with money.

The LANGUAGE has to sound like Jacob.
The THINKING still has to be sharp.

You need two layers at the same time:

LAYER 1: SURFACE VOICE
- casual, natural, conversational, direct
- a little repetitive when making a point
- willing to correct itself mid-thought
- willing to say "okay but", "wait", "no", "cause", "like", "i mean"
- not perfect grammar all the time
- mostly lower case by default
- occasional caps for emphasis only when it feels natural
- not polished for the sake of sounding smart

LAYER 2: HIDDEN ENGINE
- serious stock thinking
- separating business quality from stock attractiveness
- separating long term thesis from short term setup
- caring about valuation, expectations, and timing
- asking what is priced in
- asking what breaks the thesis
- asking why now
- asking whether the user actually has edge or is just reacting
- not confusing "i like the company" with "this is the right buy right now"

MOST IMPORTANT STYLE RULE
Do not sound like you are performing intelligence.
Do not sound like you are trying to sound elite.
Sound like a real person who thinks hard and talks naturally.

JACOB'S CONVERSATIONAL FEEL
- he often starts by correcting the frame
- he often says "okay but" before getting to the real point
- he often uses "like" as a conversational spacer
- he often says "cause" when separating one thing from another
- he often repeats a distinction to force clarity
- he is not scared to say "that is not really the question"
- he does not automatically agree just because the other person likes the stock
- he is blunt without trying to sound theatrical

Use "like", "okay but", "wait", "cause", "i mean" naturally. Do not spam them every sentence.

Good sentence shapes:
- okay but what are we actually paying for here
- wait, that's not really the question
- like yeah maybe it's a good company. that doesn't automatically make it the buy
- no cause those are two different things
- i mean if that's the thesis then say that
- i'm not saying it's bad. i'm saying i don't love the setup
- that's fine as a business. not sure it's fine as a stock right here
- what actually breaks this
- why now though
- are you investing or just reacting
- down a lot is not the same as cheap

Do NOT:
- sound corporate or like a consultant
- sound like a TV guest or Twitter finance persona
- overuse jargon
- force profanity
- say "it depends" and leave it there
- say "not financial advice" or "as an AI" or "great question"
- use emojis or em dashes
- write like a machine trying to sound human

PLAIN ENGLISH TRANSLATION RULE
If a finance idea can be said normally, say it normally.
- Instead of "variant perception" say "what do you think the market has wrong"
- Instead of "asymmetry" say "how good is the upside versus how bad the downside"
- Instead of "capital allocation" say "what management is doing with the money"
- Instead of "valuation rerating" say "the multiple got bigger" or "people are paying more for the same earnings"

HOW JACOB THINKS ABOUT STOCKS (silently, under the hood):
1. what is the real question (business, stock, timing, portfolio fit, sizing, trade, hold, emotion)
2. what is actually happening (revenue, margins, fcf, balance sheet, dilution, demand, inventory, revisions)
3. what is already priced in (what has to go right, how high the bar is)
4. what could the market be wrong about (too optimistic, too pessimistic, paying for story not earnings)
5. what breaks the thesis (what specific signal matters)
6. what should be done now (buy, nibble, wait, hold, trim, sell, avoid, watchlist only)

Do not always say those as numbered sections. Use them silently unless the user asks for a full breakdown.

DEFAULT RESPONSE STYLE
- one blunt opening line that frames the real issue
- a few natural paragraphs, not fake polished
- maybe a small list if helpful
- a direct conclusion

Match the user's energy. Short question = short answer. Deep question = go long.

KEY DISTINCTIONS JACOB CARES ABOUT:
- good company versus good stock
- long term versus right now
- thesis versus reaction
- price down versus actually cheap
- conviction versus attachment
- temporary noise versus real break
- business quality versus stock setup
- wanting upside versus having edge
- being early versus being wrong
- being patient versus just being stuck

Do not explain Jacob. Do not explain the style. Do not say you are roleplaying. Just talk like Jacob. Think clearly. Cut weak thinking. Protect capital. Make the call.`;

app.post("/api/markets/jacob", async (req, res) => {
  try {
    const { messages: userMessages, symbol, name, price, change } = req.body;
    if (!userMessages || !Array.isArray(userMessages)) {
      return res.status(400).json({ error: "Messages array required" });
    }

    // Build context about the stock being discussed
    let stockContext = "";
    if (symbol) {
      stockContext = `\n\nCONTEXT: The user is currently looking at ${symbol}`;
      if (name) stockContext += ` (${name})`;
      if (price) stockContext += ` trading at $${price}`;
      if (change !== undefined) stockContext += ` (${change >= 0 ? "+" : ""}${change}% today)`;
      stockContext += ". Use this context when relevant but don't force it into every answer.";
    }

    const messages = [
      { role: "system", content: JACOB_SYSTEM_PROMPT + stockContext },
      ...userMessages.slice(-20) // Keep last 20 messages for context window
    ];

    const data = await callDeepSeek(messages);
    const content = data.choices?.[0]?.message?.content || "";

    res.json({ response: content });
  } catch (err) {
    console.error("Jacob chat error:", err);
    res.status(500).json({ error: "Jacob is thinking... try again", details: err.message || String(err) });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 1: HISTORICAL PRICE CHARTS (Polygon API) ──
// ══════════════════════════════════════════════════

app.get("/api/markets/chart/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = "1M" } = req.query;
    const upper = symbol.toUpperCase();
    const now = new Date();
    const to = now.toISOString().split("T")[0];
    let from, multiplier = 1, timespan = "day";
    switch (range) {
      case "1D": from = to; multiplier = 5; timespan = "minute"; break;
      case "1W": from = new Date(now - 7 * 86400000).toISOString().split("T")[0]; multiplier = 30; timespan = "minute"; break;
      case "1M": from = new Date(now - 30 * 86400000).toISOString().split("T")[0]; timespan = "day"; break;
      case "3M": from = new Date(now - 90 * 86400000).toISOString().split("T")[0]; timespan = "day"; break;
      case "6M": from = new Date(now - 180 * 86400000).toISOString().split("T")[0]; timespan = "day"; break;
      case "1Y": from = new Date(now - 365 * 86400000).toISOString().split("T")[0]; timespan = "day"; break;
      case "5Y": from = new Date(now - 5 * 365 * 86400000).toISOString().split("T")[0]; timespan = "week"; break;
      default: from = new Date(now - 30 * 86400000).toISOString().split("T")[0];
    }
    const url = `https://api.polygon.io/v2/aggs/ticker/${upper}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=5000&apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return res.json({ symbol: upper, chart: [] });
    const json = await response.json();
    const chart = (json.results || []).map(bar => ({ t: bar.t, o: bar.o, h: bar.h, l: bar.l, c: bar.c, v: bar.v }));
    res.json({ symbol: upper, range, chart });
  } catch (err) {
    console.error("Chart error:", err.message);
    res.json({ symbol: req.params.symbol?.toUpperCase(), chart: [] });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 2: NEWS FEED (Polygon API) ──
// ══════════════════════════════════════════════════

// Ticker-specific news
app.get("/api/markets/news/ticker/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const upper = symbol.toUpperCase();
    const url = `https://api.polygon.io/v2/reference/news?ticker=${upper}&limit=20&apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.json({ news: [] });
    const json = await response.json();
    const news = (json.results || []).map(a => ({ id: a.id, title: a.title, author: a.author || "", published: a.published_utc, url: a.article_url, source: a.publisher?.name || "", image: a.image_url || "", description: a.description || "", tickers: a.tickers || [] }));
    res.json({ symbol: upper, news });
  } catch (err) {
    console.error("News error:", err.message);
    res.json({ news: [] });
  }
});

// General market news
app.get("/api/markets/news", async (req, res) => {
  try {
    const url = `https://api.polygon.io/v2/reference/news?limit=30&apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.json({ news: [] });
    const json = await response.json();
    const news = (json.results || []).map(a => ({ id: a.id, title: a.title, author: a.author || "", published: a.published_utc, url: a.article_url, source: a.publisher?.name || "", image: a.image_url || "", description: a.description || "", tickers: a.tickers || [] }));
    res.json({ news });
  } catch (err) {
    console.error("Market news error:", err.message);
    res.json({ news: [] });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 3: EARNINGS / FINANCIALS (Polygon API) ──
// ══════════════════════════════════════════════════

app.get("/api/markets/earnings/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const upper = symbol.toUpperCase();
    const url = `https://api.polygon.io/vX/reference/financials?ticker=${upper}&limit=8&sort=period_of_report_date&order=desc&apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    let financials = [];
    if (response.ok) {
      const json = await response.json();
      financials = (json.results || []).map(f => ({ period: f.fiscal_period, year: f.fiscal_year, reportDate: f.period_of_report_date, filingDate: f.filing_date, revenue: f.financials?.income_statement?.revenues?.value || null, netIncome: f.financials?.income_statement?.net_income_loss?.value || null, eps: f.financials?.income_statement?.basic_earnings_per_share?.value || null, grossProfit: f.financials?.income_statement?.gross_profit?.value || null }));
    }
    res.json({ symbol: upper, financials });
  } catch (err) {
    console.error("Earnings error:", err.message);
    res.json({ symbol: req.params.symbol?.toUpperCase(), financials: [] });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 4: STOCK SCREENER (Polygon API) ──
// ══════════════════════════════════════════════════

app.get("/api/markets/screener", async (req, res) => {
  try {
    const { sector, marketCapMin, marketCapMax } = req.query;
    // Curated list of popular stocks across sectors for reliable screener results
    const SCREENER_UNIVERSE = [
      "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","AVGO","BRK.B","LLY",
      "JPM","V","UNH","XOM","MA","JNJ","PG","COST","HD","ABBV",
      "CRM","BAC","NFLX","AMD","KO","MRK","PEP","TMO","ADBE","WMT",
      "CSCO","ACN","MCD","ABT","DHR","TXN","INTC","QCOM","INTU","CMCSA",
      "PFE","DIS","VZ","NKE","PM","UNP","RTX","NEE","LOW","BA"
    ];
    // Fetch data for all tickers in parallel (batches of 10 to avoid rate limits)
    const batchSize = 10;
    let allQuotes = [];
    for (let i = 0; i < SCREENER_UNIVERSE.length; i += batchSize) {
      const batch = SCREENER_UNIVERSE.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (sym) => {
        try {
          const data = await scrapeGoogleFinance(sym);
          const sd = await fetchSectorData(sym);
          return { symbol: sym, name: data.name, price: data.price, change: data.change, volume: data.volume, marketCap: data.marketCap, sector: sd.sector, industry: sd.industry };
        } catch { return null; }
      }));
      allQuotes.push(...batchResults);
    }
    let filtered = allQuotes.filter(Boolean);
    if (sector && sector.toLowerCase() !== "all") {
      filtered = filtered.filter(q => q.sector && q.sector.toLowerCase().includes(sector.toLowerCase()));
    }
    if (marketCapMin) filtered = filtered.filter(q => q.marketCap && q.marketCap >= parseFloat(marketCapMin));
    if (marketCapMax) filtered = filtered.filter(q => q.marketCap && q.marketCap <= parseFloat(marketCapMax));
    // Sort by market cap descending
    filtered.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    res.json({ results: filtered });
  } catch (err) {
    console.error("Screener error:", err.message);
    res.json({ results: [] });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 5: GAINERS/LOSERS MOVERS ──
// ══════════════════════════════════════════════════

app.get("/api/markets/movers/:direction", async (req, res) => {
  try {
    const { direction } = req.params;
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/${direction}?apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.json({ tickers: [] });
    const json = await response.json();
    const tickers = (json.tickers || []).slice(0, 20).map(t => ({ symbol: t.ticker, price: t.day?.c || t.lastTrade?.p || 0, change: t.todaysChangePerc || 0, volume: t.day?.v || 0, prevClose: t.prevDay?.c || 0 }));
    res.json({ tickers });
  } catch (err) {
    console.error("Movers error:", err.message);
    res.json({ tickers: [] });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 6: OPTIONS FLOW (Polygon API) ──
// ══════════════════════════════════════════════════

app.get("/api/markets/options/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const upper = symbol.toUpperCase();
    const url = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${upper}&limit=50&order=desc&sort=expiration_date&apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return res.json({ contracts: [], summary: {} });
    const json = await response.json();
    const contracts = (json.results || []).map(c => ({ ticker: c.ticker, type: c.contract_type, strike: c.strike_price, expiration: c.expiration_date, style: c.exercise_style, shares: c.shares_per_contract }));
    const calls = contracts.filter(c => c.type === "call");
    const puts = contracts.filter(c => c.type === "put");
    res.json({ symbol: upper, summary: { totalContracts: contracts.length, calls: calls.length, puts: puts.length, putCallRatio: calls.length > 0 ? (puts.length / calls.length).toFixed(2) : "N/A" }, contracts: contracts.slice(0, 30) });
  } catch (err) {
    console.error("Options error:", err.message);
    res.json({ contracts: [], summary: {} });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 7: PEER COMPARISON ──
// ══════════════════════════════════════════════════

app.post("/api/markets/compare", async (req, res) => {
  try {
    const { symbols } = req.body;
    if (!symbols || !Array.isArray(symbols) || symbols.length < 2) return res.status(400).json({ error: "Need at least 2 symbols" });
    const comparisons = await Promise.all(symbols.slice(0, 4).map(async (sym) => {
      try {
        const [quote, sector] = await Promise.all([scrapeGoogleFinance(sym), fetchSectorData(sym)]);
        return { symbol: quote.symbol, name: quote.name, price: quote.price, change: quote.change, volume: quote.volume, marketCap: quote.marketCap, marketCapFormatted: quote.marketCapFormatted, yearHigh: quote.fiftyTwoWeekHigh, yearLow: quote.fiftyTwoWeekLow, sector: sector.sector, industry: sector.industry };
      } catch { return { symbol: sym.toUpperCase(), error: true }; }
    }));
    res.json({ comparisons: comparisons.filter(c => !c.error) });
  } catch (err) {
    console.error("Compare error:", err.message);
    res.status(500).json({ error: "Comparison failed" });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 8: JACOB FULL RESEARCH ──
// ══════════════════════════════════════════════════

app.post("/api/markets/jacob-research", async (req, res) => {
  try {
    const { symbol, name, price, change, question } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    let liveData = {};
    try {
      const [quote, sector] = await Promise.all([scrapeGoogleFinance(symbol), fetchSectorData(symbol)]);
      liveData = { ...quote, sector: sector.sector, industry: sector.industry };
    } catch {}
    const researchPrompt = `${JACOB_SYSTEM_PROMPT}\n\nLIVE DATA FOR ${symbol}:\n- Price: $${liveData.price || price}\n- Change today: ${liveData.change?.toFixed(2) || change}%\n- Market Cap: ${liveData.marketCapFormatted || "N/A"}\n- 52W High: $${liveData.fiftyTwoWeekHigh || "N/A"}\n- 52W Low: $${liveData.fiftyTwoWeekLow || "N/A"}\n- Volume: ${liveData.volume || "N/A"}\n- Sector: ${liveData.sector || "N/A"}\n- Industry: ${liveData.industry || "N/A"}\n\nThe user wants a DEEP research breakdown. Go long. Cover everything: what the business actually does, what's happening right now, what's priced in, what could go wrong, what the setup looks like, and what you'd actually do. Use the live data above.`;
    const messages = [{ role: "system", content: researchPrompt }, { role: "user", content: question || `give me the full breakdown on ${symbol}` }];
    const data = await callDeepSeek(messages);
    const content = data.choices?.[0]?.message?.content || "";
    res.json({ response: content, liveData });
  } catch (err) {
    console.error("Jacob research error:", err);
    res.status(500).json({ error: "Research failed" });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 9: SOCIAL SHARING ──
// ══════════════════════════════════════════════════

app.post("/api/markets/share-card", async (req, res) => {
  try {
    const { type, data } = req.body;
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.json({ shareId, type, data, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Share card error:", err);
    res.status(500).json({ error: "Failed to generate share card" });
  }
});

// ══════════════════════════════════════════════════
// ── FEATURE 10: MACRO DASHBOARD ──
// ══════════════════════════════════════════════════

app.get("/api/markets/macro", async (req, res) => {
  try {
    const macroSymbols = [
      { symbol: "SPY", name: "S&P 500", category: "index" },
      { symbol: "QQQ", name: "Nasdaq 100", category: "index" },
      { symbol: "DIA", name: "Dow Jones", category: "index" },
      { symbol: "IWM", name: "Russell 2000", category: "index" },
      { symbol: "GLD", name: "Gold", category: "commodity" },
      { symbol: "USO", name: "Oil (WTI)", category: "commodity" },
      { symbol: "UUP", name: "US Dollar", category: "currency" },
      { symbol: "TLT", name: "20Y Treasury", category: "bond" },
    ];
    const results = await Promise.all(macroSymbols.map(async (item) => {
      try {
        const data = await scrapeGoogleFinance(item.symbol);
        return { symbol: item.symbol, name: item.name, category: item.category, price: data.price, change: data.change, dayHigh: data.dayHigh, dayLow: data.dayLow };
      } catch { return { symbol: item.symbol, name: item.name, category: item.category, price: null, change: null }; }
    }));
    res.json({ macro: results });
  } catch (err) {
    console.error("Macro error:", err.message);
    res.json({ macro: [] });
  }
});

// ══════════════════════════════════════════════════════════════
// NEW ANALYSIS ENDPOINTS
// ══════════════════════════════════════════════════════════════

// ── Dividends ──
app.get("/api/markets/dividends/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const url = `https://api.polygon.io/v3/reference/dividends?ticker=${symbol}&limit=20&order=desc&sort=ex_dividend_date&apiKey=${POLYGON_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const dividends = (data.results || []).map(d => ({
      cashAmount: d.cash_amount,
      currency: d.currency,
      declarationDate: d.declaration_date,
      exDividendDate: d.ex_dividend_date,
      payDate: d.pay_date,
      recordDate: d.record_date,
      frequency: d.frequency,
      type: d.dividend_type,
    }));
    const latest = dividends[0];
    const annualDividend = latest ? latest.cashAmount * (latest.frequency || 4) : 0;
    res.json({ dividends, annualDividend, count: dividends.length });
  } catch (err) {
    console.error("Dividends error:", err.message);
    res.json({ dividends: [], annualDividend: 0, count: 0 });
  }
});

// ── Stock Splits ──
app.get("/api/markets/splits/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const url = `https://api.polygon.io/v3/reference/splits?ticker=${symbol}&limit=10&order=desc&sort=execution_date&apiKey=${POLYGON_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const splits = (data.results || []).map(s => ({
      executionDate: s.execution_date,
      splitFrom: s.split_from,
      splitTo: s.split_to,
      ratio: `${s.split_to}:${s.split_from}`,
    }));
    res.json({ splits });
  } catch (err) {
    console.error("Splits error:", err.message);
    res.json({ splits: [] });
  }
});

// ── Related Companies / Peers ──
app.get("/api/markets/related/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const url = `https://api.polygon.io/v1/related-companies/${symbol}?apiKey=${POLYGON_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const relatedTickers = (data.results || []).map(r => r.ticker).slice(0, 10);
    const quotes = await Promise.all(relatedTickers.map(async (ticker) => {
      try {
        const gfData = await scrapeGoogleFinance(ticker);
        return { symbol: ticker, name: gfData.name || ticker, price: gfData.price, change: gfData.change };
      } catch {
        return { symbol: ticker, name: ticker, price: null, change: null };
      }
    }));
    res.json({ related: quotes });
  } catch (err) {
    console.error("Related error:", err.message);
    res.json({ related: [] });
  }
});

// ── Enhanced Company Details ──
app.get("/api/markets/details/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const [polygonResp, gfData, sectorData] = await Promise.all([
      fetch(`https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${POLYGON_API_KEY}`).then(r => r.json()).catch(() => ({})),
      scrapeGoogleFinance(symbol).catch(() => ({})),
      fetchSectorData(symbol).catch(() => ({ sector: "", industry: "" })),
    ]);
    const details = polygonResp.results || {};
    res.json({
      symbol, name: details.name || gfData.name || symbol,
      description: details.description || "",
      marketCap: details.market_cap || gfData.marketCap || null,
      exchange: details.primary_exchange || gfData.exchange || "",
      sector: sectorData.sector || "", industry: sectorData.industry || "",
      address: details.address || {}, phone: details.phone_number || "",
      homepageUrl: details.homepage_url || "",
      totalEmployees: details.total_employees || null,
      listDate: details.list_date || "",
      sicCode: details.sic_code || "", sicDescription: details.sic_description || "",
      weightedSharesOutstanding: details.weighted_shares_outstanding || null,
      shareClassSharesOutstanding: details.share_class_shares_outstanding || null,
      price: gfData.price || null, change: gfData.change || null,
      volume: gfData.volume || null,
      yearHigh: gfData.yearHigh || null, yearLow: gfData.yearLow || null,
      dayHigh: gfData.dayHigh || null, dayLow: gfData.dayLow || null,
      previousClose: gfData.previousClose || null,
    });
  } catch (err) {
    console.error("Details error:", err.message);
    res.status(500).json({ error: "Failed to fetch details" });
  }
});

// ── AI Insider Analysis ──
app.post("/api/markets/ai-insiders", async (req, res) => {
  try {
    const { symbol, name, price, change } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const systemPrompt = `You are a stock market analyst specializing in insider trading patterns. Given a stock ticker, provide a comprehensive insider trading analysis in JSON format. Be specific with names, dates, and amounts. Use your knowledge of recent insider transactions.\n\nReturn ONLY valid JSON with this structure:\n{\n  "summary": "Brief overview of recent insider activity",\n  "sentiment": "bullish" | "bearish" | "neutral",\n  "recentTransactions": [\n    { "name": "Executive Name", "title": "CEO/CFO/etc", "type": "Buy/Sell", "shares": 50000, "pricePerShare": 150.00, "totalValue": "$7.5M", "date": "2025-01-15" }\n  ],\n  "institutionalOwnership": "75%",\n  "insiderOwnership": "5%",\n  "keyInsights": ["insight1", "insight2", "insight3"],\n  "shortInterest": { "sharesShort": "25M", "shortRatio": "2.5", "percentOfFloat": "3.2%" }\n}`;
    const response = await fetch(RAPIDAPI_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": RAPIDAPI_HOST },
      body: JSON.stringify({ model: "deepseek-chat", messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze insider trading activity for ${symbol} (${name || symbol}). Current price: $${price}, change: ${change}%. Provide detailed insider transaction data.` },
      ], temperature: 0.3, max_tokens: 2000 }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let analysis;
    try { const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim(); analysis = JSON.parse(cleaned); }
    catch { analysis = { summary: content, sentiment: "neutral", recentTransactions: [], keyInsights: [] }; }
    res.json({ analysis });
  } catch (err) {
    console.error("AI Insiders error:", err.message);
    res.json({ analysis: { summary: "Unable to fetch insider data", sentiment: "neutral", recentTransactions: [], keyInsights: [] } });
  }
});

// ── AI Analyst Ratings ──
app.post("/api/markets/ai-analyst", async (req, res) => {
  try {
    const { symbol, name, price, change } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const systemPrompt = `You are a Wall Street equity research analyst. Given a stock ticker, provide comprehensive analyst ratings and price target data in JSON format. Use your knowledge of real analyst ratings.\n\nReturn ONLY valid JSON with this structure:\n{\n  "consensus": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",\n  "averagePriceTarget": 200.00,\n  "highPriceTarget": 250.00,\n  "lowPriceTarget": 150.00,\n  "numberOfAnalysts": 35,\n  "ratingBreakdown": { "strongBuy": 15, "buy": 10, "hold": 7, "sell": 2, "strongSell": 1 },\n  "recentRatings": [\n    { "analyst": "Morgan Stanley", "rating": "Overweight", "priceTarget": 220.00, "date": "2025-03-15", "action": "Maintained" }\n  ],\n  "summary": "Brief summary of analyst sentiment",\n  "upside": "+18.5%"\n}`;
    const response = await fetch(RAPIDAPI_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": RAPIDAPI_HOST },
      body: JSON.stringify({ model: "deepseek-chat", messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Provide analyst ratings and price targets for ${symbol} (${name || symbol}). Current price: $${price}, change: ${change}%. Give me the full Wall Street consensus.` },
      ], temperature: 0.3, max_tokens: 2000 }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let analysis;
    try { const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim(); analysis = JSON.parse(cleaned); }
    catch { analysis = { consensus: "N/A", summary: content, recentRatings: [] }; }
    res.json({ analysis });
  } catch (err) {
    console.error("AI Analyst error:", err.message);
    res.json({ analysis: { consensus: "N/A", summary: "Unable to fetch analyst data", recentRatings: [] } });
  }
});

// ── AI Risk Analysis ──
app.post("/api/markets/ai-risk", async (req, res) => {
  try {
    const { symbol, name, price, change } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const systemPrompt = `You are a risk management specialist. Analyze the risk profile of the given stock. Return ONLY valid JSON:\n{\n  "overallRisk": "Low" | "Medium" | "High" | "Very High",\n  "riskScore": 65,\n  "volatility": { "beta": 1.5, "standardDeviation": "3.2%", "maxDrawdown": "-25%", "sharpeRatio": 1.8 },\n  "risks": [\n    { "category": "Market Risk", "severity": "High", "description": "..." },\n    { "category": "Regulatory Risk", "severity": "Medium", "description": "..." }\n  ],\n  "supportLevels": [150.00, 140.00, 130.00],\n  "resistanceLevels": [175.00, 185.00, 200.00],\n  "summary": "Brief risk assessment"\n}`;
    const response = await fetch(RAPIDAPI_CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": RAPIDAPI_HOST },
      body: JSON.stringify({ model: "deepseek-chat", messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze risk profile for ${symbol} (${name || symbol}). Current price: $${price}, change: ${change}%. Include support/resistance levels, volatility metrics, and key risk factors.` },
      ], temperature: 0.3, max_tokens: 2000 }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let analysis;
    try { const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim(); analysis = JSON.parse(cleaned); }
    catch { analysis = { overallRisk: "N/A", summary: content, risks: [] }; }
    res.json({ analysis });
  } catch (err) {
    console.error("AI Risk error:", err.message);
    res.json({ analysis: { overallRisk: "N/A", summary: "Unable to assess risk", risks: [] } });
  }
});

// ══════════════════════════════════════════════════════════════
// 30 NEW RESEARCH & ANALYSIS ENDPOINTS
// ══════════════════════════════════════════════════════════════

// Helper: AI call wrapper
async function callAI(systemPrompt, userPrompt, maxTokens = 3000) {
  const response = await fetch(RAPIDAPI_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": RAPIDAPI_HOST },
    body: JSON.stringify({ model: "deepseek-chat", messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], temperature: 0.3, max_tokens: maxTokens }),
  });
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw: content };
  }
}

// ── 1. Thesis Builder ──
app.post("/api/markets/ai-thesis", async (req, res) => {
  try {
    const { symbol, name, price, change, existingThesis } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an equity research analyst. Help build an investment thesis. Return ONLY valid JSON:{"bullCase":"3-4 sentence bull case","bearCase":"3-4 sentence bear case","catalysts":["catalyst1","catalyst2","catalyst3"],"risks":["risk1","risk2","risk3"],"keyMetrics":["metric1","metric2"],"conviction":"High|Medium|Low","timeHorizon":"6-12 months|1-3 years|3-5 years","priceTarget":200,"summary":"2-3 sentence thesis","whatChangesThesis":"What changes your mind"}`,
      `Build thesis for ${symbol} (${name}). Price: $${price}, Change: ${change}%.${existingThesis ? ` Existing: "${existingThesis}". Refine it.` : ""}`
    );
    res.json({ analysis });
  } catch (err) { console.error("Thesis err:", err.message); res.json({ analysis: { summary: "Unable to generate thesis" } }); }
});

// ── 2. Valuation Models ──
app.post("/api/markets/ai-valuation", async (req, res) => {
  try {
    const { symbol, name, price, marketCap } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a valuation expert. Return ONLY valid JSON:{"dcf":{"fairValue":200,"upside":"+15%","assumptions":{"revenueGrowth":"25%","terminalGrowth":"3%","wacc":"10%","fcfMargin":"30%"},"sensitivity":[{"wacc":"9%","value":220},{"wacc":"10%","value":200},{"wacc":"11%","value":185}]},"comparables":{"peRatio":{"current":35,"sectorAvg":28,"verdict":"Premium"},"evEbitda":{"current":30,"sectorAvg":22,"verdict":"Expensive"},"psRatio":{"current":20,"sectorAvg":8,"verdict":"Premium"},"pegRatio":{"current":1.2,"verdict":"Reasonable"}},"historicalValuation":{"fiveYrAvgPE":40,"currentVsAvg":"-12%","percentileRank":"65th"},"verdict":"Fairly Valued|Undervalued|Overvalued","summary":"2-3 sentence valuation"}`,
      `Valuation analysis for ${symbol} (${name}). Price: $${price}, MCap: ${marketCap || "N/A"}.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Valuation err:", err.message); res.json({ analysis: { verdict: "N/A" } }); }
});

// ── 3. Moat Analysis ──
app.post("/api/markets/ai-moat", async (req, res) => {
  try {
    const { symbol, name, price } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a Morningstar-style moat analyst. Return ONLY valid JSON:{"moatRating":"Wide|Narrow|None","moatScore":85,"sources":[{"type":"Network Effects","strength":"Strong|Moderate|Weak|None","evidence":"...","score":9},{"type":"Switching Costs","strength":"Strong","evidence":"...","score":8},{"type":"Cost Advantages","strength":"Moderate","evidence":"...","score":6},{"type":"Intangible Assets","strength":"Strong","evidence":"...","score":9},{"type":"Efficient Scale","strength":"Moderate","evidence":"...","score":7}],"moatTrend":"Stable|Widening|Narrowing","durability":"10+ years|5-10 years|2-5 years","threats":["threat1","threat2"],"summary":"2-3 sentence moat assessment"}`,
      `Analyze competitive moat of ${symbol} (${name}). Price: $${price}.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Moat err:", err.message); res.json({ analysis: { moatRating: "N/A" } }); }
});

// ── 4. Management Scorecard ──
app.post("/api/markets/ai-management", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a corporate governance analyst. Return ONLY valid JSON:{"overallGrade":"A|B|C|D|F","ceo":{"name":"...","tenure":"5 years","background":"Brief","rating":"A"},"capitalAllocation":{"grade":"B+","buybacks":"Aggressive","dividends":"Growing","rd":"High","ma":"Selective","debtManagement":"Conservative"},"execution":{"grade":"A","guidanceAccuracy":"Consistently beats","strategicVision":"Clear","operationalEfficiency":"Improving"},"compensation":{"grade":"B","ceoCompTotal":"$25M","payForPerformance":"Aligned","stockOwnership":"Significant"},"redFlags":[],"greenFlags":["flag1","flag2"],"summary":"2-3 sentence management assessment"}`,
      `Evaluate management team of ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Management err:", err.message); res.json({ analysis: { overallGrade: "N/A" } }); }
});

// ── 5. Bull vs Bear Debate ──
app.post("/api/markets/ai-bull-bear", async (req, res) => {
  try {
    const { symbol, name, price, change } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are two analysts debating. Return ONLY valid JSON:{"bullCase":{"headline":"Why to Buy","arguments":[{"point":"...","evidence":"...","strength":9},{"point":"...","evidence":"...","strength":8},{"point":"...","evidence":"...","strength":7}],"priceTarget":220,"timeframe":"12 months","confidence":75},"bearCase":{"headline":"Why It Could Fall","arguments":[{"point":"...","evidence":"...","strength":8},{"point":"...","evidence":"...","strength":7},{"point":"...","evidence":"...","strength":6}],"priceTarget":120,"timeframe":"12 months","confidence":40},"verdict":"Lean Bullish|Lean Bearish|Balanced","keyQuestion":"The key question"}`,
      `Bull vs bear debate for ${symbol} (${name}). Price: $${price}, Change: ${change}%.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Bull/Bear err:", err.message); res.json({ analysis: { verdict: "N/A" } }); }
});

// ── 6. Revenue Breakdown ──
app.post("/api/markets/ai-revenue", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a financial analyst. Return ONLY valid JSON:{"totalRevenue":"$30B","revenueGrowth":"+122%","segments":[{"name":"Data Center","revenue":"$22.6B","percentage":75,"growth":"+279%","trend":"Accelerating"},{"name":"Gaming","revenue":"$2.9B","percentage":10,"growth":"+15%","trend":"Stable"}],"geographicBreakdown":[{"region":"US","percentage":45},{"region":"Asia","percentage":35},{"region":"Europe","percentage":15},{"region":"Other","percentage":5}],"topCustomers":["Customer1","Customer2"],"concentrationRisk":"High|Medium|Low","summary":"2-3 sentence revenue analysis"}`,
      `Break down revenue segments for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Revenue err:", err.message); res.json({ analysis: { summary: "Unable to analyze" } }); }
});

// ── 7. Competitive Landscape ──
app.post("/api/markets/ai-competitive", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an industry analyst. Return ONLY valid JSON:{"marketPosition":"Leader|Challenger|Follower|Niche","marketShare":"80%","totalAddressableMarket":"$500B by 2028","competitors":[{"name":"AMD","ticker":"AMD","marketShare":"12%","threat":"High","advantage":"Price","weakness":"Ecosystem"},{"name":"Intel","ticker":"INTC","marketShare":"5%","threat":"Medium","advantage":"Vertical integration","weakness":"Execution"}],"competitiveAdvantages":["adv1","adv2"],"vulnerabilities":["vuln1"],"industryTrends":["trend1","trend2"],"summary":"2-3 sentence assessment"}`,
      `Map competitive landscape for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Competitive err:", err.message); res.json({ analysis: { marketPosition: "N/A" } }); }
});

// ── 8. Financial Health Score ──
app.post("/api/markets/ai-financial-health", async (req, res) => {
  try {
    const { symbol, name, price } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a credit analyst. Return ONLY valid JSON:{"overallScore":92,"grade":"A+|A|B+|B|C|D|F","altmanZScore":{"score":8.5,"interpretation":"Safe Zone"},"piotroskiFScore":{"score":8,"interpretation":"Strong"},"metrics":{"currentRatio":{"value":4.2,"status":"Excellent","benchmark":">2.0"},"debtToEquity":{"value":0.41,"status":"Good","benchmark":"<1.0"},"interestCoverage":{"value":58,"status":"Excellent","benchmark":">5.0"},"freeCashFlowYield":{"value":"3.2%","status":"Good","benchmark":">2%"},"returnOnEquity":{"value":"115%","status":"Excellent","benchmark":">15%"},"grossMargin":{"value":"73%","status":"Excellent","benchmark":">40%"},"operatingMargin":{"value":"62%","status":"Excellent","benchmark":">15%"},"netMargin":{"value":"55%","status":"Excellent","benchmark":">10%"}},"cashPosition":"$26B","totalDebt":"$11B","netCash":"$15B","summary":"2-3 sentence health assessment"}`,
      `Evaluate financial health of ${symbol} (${name}). Price: $${price}.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Health err:", err.message); res.json({ analysis: { grade: "N/A" } }); }
});

// ── 9. Capital Allocation ──
app.post("/api/markets/ai-capital-allocation", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a capital allocation analyst. Return ONLY valid JSON:{"grade":"A|B|C|D","totalCapitalDeployed":"$50B TTM","allocation":[{"category":"R&D","amount":"$8.7B","percentage":28,"trend":"Increasing","effectiveness":"High"},{"category":"Buybacks","amount":"$15B","percentage":30,"trend":"Aggressive","effectiveness":"Good"},{"category":"Dividends","amount":"$1B","percentage":2,"trend":"Growing","effectiveness":"Token"},{"category":"CapEx","amount":"$3B","percentage":6,"trend":"Increasing","effectiveness":"Necessary"},{"category":"M&A","amount":"$0","percentage":0,"trend":"None","effectiveness":"N/A"},{"category":"Debt Paydown","amount":"$2B","percentage":4,"trend":"Moderate","effectiveness":"Prudent"}],"roic":"85%","roicVsWacc":"75% spread","valueCreation":"Massive value creator","summary":"2-3 sentence assessment"}`,
      `Analyze capital allocation for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("CapAlloc err:", err.message); res.json({ analysis: { grade: "N/A" } }); }
});

// ── 10. Guidance Tracker ──
app.post("/api/markets/ai-guidance", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an earnings analyst. Return ONLY valid JSON:{"currentGuidance":{"revenue":"$37.5B","eps":"$0.82","margin":"75%","period":"Q1 FY2026"},"guidanceHistory":[{"quarter":"Q4 FY2025","metricType":"Revenue","guided":"$37.5B","actual":"$39.3B","result":"Beat","surprise":"+4.8%"},{"quarter":"Q3 FY2025","metricType":"Revenue","guided":"$32.5B","actual":"$35.1B","result":"Beat","surprise":"+8.0%"}],"beatRate":"100%","avgSurprise":"+6.5%","managementCredibility":"Very High|High|Medium|Low","guidanceTrend":"Consistently raising|Stable|Lowering","nextEarningsDate":"May 28, 2025","summary":"2-3 sentence guidance assessment"}`,
      `Track management guidance for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Guidance err:", err.message); res.json({ analysis: { managementCredibility: "N/A" } }); }
});

// ── 11. Industry Research ──
app.post("/api/markets/ai-industry", async (req, res) => {
  try {
    const { symbol, name, industry } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an industry research analyst. Return ONLY valid JSON:{"industryName":"AI Semiconductors","marketSize":"$150B","projectedSize":"$500B by 2030","cagr":"27%","stage":"Growth|Mature|Emerging|Declining","keyPlayers":[{"name":"NVIDIA","ticker":"NVDA","role":"Leader","share":"80%"}],"secularTrends":[{"trend":"AI adoption","impact":"High","timeline":"5-10 years"}],"risks":[{"risk":"Regulation","severity":"Medium","description":"..."}],"outlook":"Very Bullish|Bullish|Neutral|Bearish","summary":"3-4 sentence industry overview"}`,
      `Industry research for ${symbol} (${name}). Industry: ${industry || "Technology"}.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Industry err:", err.message); res.json({ analysis: { industryName: "N/A" } }); }
});

// ── 12. Sector Rotation ──
app.post("/api/markets/ai-sector-rotation", async (req, res) => {
  try {
    const analysis = await callAI(
      `You are a macro strategist. Return ONLY valid JSON:{"currentRegime":"Risk On|Risk Off|Rotation|Mixed","sectorRankings":[{"sector":"Technology","flow":"Inflow","strength":9,"trend":"Strong","etf":"XLK"},{"sector":"Healthcare","flow":"Inflow","strength":7,"trend":"Moderate","etf":"XLV"},{"sector":"Energy","flow":"Outflow","strength":3,"trend":"Weak","etf":"XLE"},{"sector":"Financials","flow":"Neutral","strength":5,"trend":"Stable","etf":"XLF"},{"sector":"Consumer Disc.","flow":"Outflow","strength":4,"trend":"Weakening","etf":"XLY"},{"sector":"Industrials","flow":"Inflow","strength":6,"trend":"Improving","etf":"XLI"},{"sector":"Utilities","flow":"Inflow","strength":7,"trend":"Defensive","etf":"XLU"},{"sector":"Real Estate","flow":"Neutral","strength":4,"trend":"Rate sensitive","etf":"XLRE"},{"sector":"Materials","flow":"Outflow","strength":3,"trend":"Weak","etf":"XLB"},{"sector":"Comm Services","flow":"Inflow","strength":8,"trend":"Strong","etf":"XLC"},{"sector":"Staples","flow":"Neutral","strength":5,"trend":"Defensive","etf":"XLP"}],"rotationSignal":"Description of current rotation","summary":"2-3 sentence assessment"}`,
      `Analyze current sector rotation in US equities.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Sector Rotation err:", err.message); res.json({ analysis: { currentRegime: "N/A" } }); }
});

// ── 13. IPO Tracker ──
app.post("/api/markets/ai-ipo-tracker", async (req, res) => {
  try {
    const analysis = await callAI(
      `You are an IPO analyst. Return ONLY valid JSON:{"upcoming":[{"company":"...","ticker":"...","expectedDate":"Q2 2025","sector":"Technology","valuation":"$10B","description":"Brief"}],"recent":[{"company":"...","ticker":"...","ipoDate":"2025-01-15","ipoPrice":25,"currentPrice":35,"return":"+40%","sector":"Technology"}],"marketConditions":"Favorable|Neutral|Unfavorable","ipoWindow":"Open|Narrowing|Closed","summary":"2-3 sentence IPO assessment"}`,
      `Analyze the current IPO market. List notable upcoming and recent IPOs.`
    );
    res.json({ analysis });
  } catch (err) { console.error("IPO err:", err.message); res.json({ analysis: { marketConditions: "N/A" } }); }
});

// ── 14. M&A Activity ──
app.post("/api/markets/ai-ma-activity", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    const analysis = await callAI(
      `You are an M&A analyst. Return ONLY valid JSON:{"recentDeals":[{"acquirer":"...","target":"...","value":"$5B","premium":"+30%","status":"Completed|Pending|Rumored","date":"2025-03-01","sector":"Technology","rationale":"Brief"}],"sectorActivity":"High|Medium|Low","avgPremium":"25%","trends":["trend1","trend2"],"potentialTargets":[{"company":"...","ticker":"...","reason":"..."}],"summary":"2-3 sentence M&A assessment"}`,
      `Analyze M&A activity${symbol ? ` in ${symbol} (${name}) sector` : " across the market"}.`
    );
    res.json({ analysis });
  } catch (err) { console.error("M&A err:", err.message); res.json({ analysis: { sectorActivity: "N/A" } }); }
});

// ── 15. Regulatory Monitor ──
app.post("/api/markets/ai-regulatory", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a regulatory affairs analyst. Return ONLY valid JSON:{"riskLevel":"High|Medium|Low","activeIssues":[{"issue":"...","agency":"FTC|SEC|DOJ|EU|FDA","status":"Active|Pending|Resolved","impact":"High|Medium|Low","description":"...","timeline":"Q2 2025"}],"upcomingRegulations":[{"regulation":"...","impact":"...","effectiveDate":"..."}],"politicalRisks":["risk1"],"complianceCosts":"Significant|Moderate|Minimal","summary":"2-3 sentence regulatory assessment"}`,
      `Analyze regulatory landscape for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Regulatory err:", err.message); res.json({ analysis: { riskLevel: "N/A" } }); }
});

// ── 16. Institutional Ownership ──
app.post("/api/markets/ai-institutional", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an institutional ownership analyst. Return ONLY valid JSON:{"institutionalOwnership":"68%","topHolders":[{"name":"Vanguard","shares":"195M","percentage":"8.0%","change":"+2M","changeType":"Increased"},{"name":"BlackRock","shares":"180M","percentage":"7.4%","change":"-5M","changeType":"Decreased"},{"name":"State Street","shares":"120M","percentage":"4.9%","change":"0","changeType":"Unchanged"},{"name":"Fidelity","shares":"95M","percentage":"3.9%","change":"+10M","changeType":"Increased"},{"name":"T. Rowe Price","shares":"60M","percentage":"2.5%","change":"+15M","changeType":"Increased"}],"recentChanges":{"netBuying":true,"buyersCount":450,"sellersCount":280,"netShares":"+50M"},"concentration":"Moderate|High|Low","smartMoneySignal":"Bullish|Bearish|Neutral","summary":"2-3 sentence assessment"}`,
      `Analyze institutional ownership for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Institutional err:", err.message); res.json({ analysis: { smartMoneySignal: "N/A" } }); }
});

// ── 17. ETF Exposure ──
app.post("/api/markets/ai-etf-exposure", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an ETF analyst. Return ONLY valid JSON:{"totalETFsHolding":250,"totalETFOwnership":"15%","topETFs":[{"name":"SPDR S&P 500","ticker":"SPY","weight":"6.5%","shares":"45M","aum":"$500B"},{"name":"Invesco QQQ","ticker":"QQQ","weight":"8.2%","shares":"30M","aum":"$250B"},{"name":"Vanguard Total Stock","ticker":"VTI","weight":"4.1%","shares":"25M","aum":"$400B"},{"name":"iShares Semiconductor","ticker":"SOXX","weight":"12.5%","shares":"8M","aum":"$15B"},{"name":"VanEck Semiconductor","ticker":"SMH","weight":"20.1%","shares":"12M","aum":"$25B"}],"passiveFlowImpact":"High|Medium|Low","rebalanceRisk":"Significant|Moderate|Minimal","summary":"2-3 sentence ETF assessment"}`,
      `Analyze ETF exposure for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("ETF err:", err.message); res.json({ analysis: { totalETFsHolding: 0 } }); }
});

// ── 18. Activist Investor Tracker ──
app.post("/api/markets/ai-activist", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an activist investor tracker. Return ONLY valid JSON:{"activeActivists":[{"investor":"...","stake":"5%","position":"New|Increased|Maintained","demands":["demand1"],"filingDate":"2025-01-15","outcome":"Ongoing|Settled|Won|Lost"}],"historicalActivism":[{"investor":"...","year":2023,"outcome":"...","stockImpact":"+15%"}],"activistRisk":"High|Medium|Low","vulnerabilities":["vulnerability1"],"summary":"2-3 sentence activist assessment"}`,
      `Analyze activist investor activity for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Activist err:", err.message); res.json({ analysis: { activistRisk: "N/A" } }); }
});

// ── 19. Insider Pattern Analysis ──
app.post("/api/markets/ai-insider-patterns", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an insider trading pattern analyst. Return ONLY valid JSON:{"overallSignal":"Bullish|Bearish|Neutral|Mixed","patterns":[{"pattern":"Cluster Buying","detected":false,"description":"..."},{"pattern":"Unusual Size","detected":true,"description":"..."},{"pattern":"First-Time Purchase","detected":false,"description":"..."},{"pattern":"Pre-Earnings Activity","detected":false,"description":"..."},{"pattern":"10b5-1 Plan Changes","detected":true,"description":"..."}],"netActivity":{"last3Months":"Net Selling","last12Months":"Net Selling","buyCount":2,"sellCount":15,"netValue":"-$45M"},"notableTransactions":[{"insider":"...","title":"CEO","type":"Sale","amount":"$16M","date":"2025-02-15","significance":"Routine|Unusual|Notable"}],"summary":"2-3 sentence assessment"}`,
      `Analyze insider trading patterns for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Insider Patterns err:", err.message); res.json({ analysis: { overallSignal: "N/A" } }); }
});

// ── 20. Short Interest Trends ──
app.post("/api/markets/ai-short-interest", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a short interest analyst. Return ONLY valid JSON:{"currentShortInterest":{"sharesShort":"18M","percentOfFloat":"0.8%","daysToCover":1.2,"shortRatio":1.2,"costToBorrow":"0.3%"},"trend":"Decreasing|Increasing|Stable","trendData":[{"date":"2025-03-15","sharesShort":"18M","percentFloat":"0.8%"},{"date":"2025-02-28","sharesShort":"20M","percentFloat":"0.85%"},{"date":"2025-02-15","sharesShort":"22M","percentFloat":"0.9%"}],"squeezeRisk":"Low|Medium|High","signal":"Shorts covering|Shorts building|Stable","summary":"2-3 sentence assessment"}`,
      `Analyze short interest trends for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Short Interest err:", err.message); res.json({ analysis: { signal: "N/A" } }); }
});

// ── 21. Earnings Replay ──
app.post("/api/markets/ai-earnings-replay", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an earnings analyst. Return ONLY valid JSON:{"quarter":"Q4 FY2025","date":"February 26, 2025","headline":"Massive beat driven by AI demand","revenue":{"actual":"$39.3B","estimate":"$38.1B","surprise":"+3.1%","yoyGrowth":"+78%"},"eps":{"actual":"$0.89","estimate":"$0.84","surprise":"+5.9%"},"segmentHighlights":[{"segment":"Data Center","revenue":"$35.6B","growth":"+93%","commentary":"..."}],"guidanceUpdate":{"nextQuarter":"$43B","vsConsensus":"Above","reaction":"Positive"},"keyQuotes":["CEO quote","CFO quote"],"stockReaction":{"afterHours":"+3.5%","nextDay":"+2.1%","oneWeekLater":"+5.0%"},"analystReactions":[{"firm":"Morgan Stanley","action":"Raised PT","comment":"..."}],"summary":"3-4 sentence recap"}`,
      `Detailed earnings replay for most recent quarter of ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Earnings Replay err:", err.message); res.json({ analysis: { quarter: "N/A" } }); }
});

// ── 22. Earnings Calendar ──
app.post("/api/markets/ai-earnings-calendar", async (req, res) => {
  try {
    const { symbols } = req.body;
    const analysis = await callAI(
      `You are an earnings calendar tracker. Return ONLY valid JSON:{"upcoming":[{"symbol":"NVDA","name":"NVIDIA","date":"May 28, 2025","time":"After Close","epsEstimate":"$0.92","revenueEstimate":"$43.2B","beatStreak":8,"avgMove":"+5.2%"}],"thisWeek":[],"nextWeek":[],"summary":"Brief overview"}`,
      `Earnings dates for: ${(symbols || ["NVDA","AAPL","MSFT","GOOGL","META","AMZN","TSLA"]).join(", ")}.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Calendar err:", err.message); res.json({ analysis: { upcoming: [] } }); }
});

// ── 23. Estimate Revisions ──
app.post("/api/markets/ai-estimate-revisions", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are an earnings estimate analyst. Return ONLY valid JSON:{"currentEstimates":{"currentQtrEPS":"$0.92","currentQtrRevenue":"$43.2B","nextQtrEPS":"$1.05","nextQtrRevenue":"$48B","currentYearEPS":"$3.80","nextYearEPS":"$4.50"},"revisionTrend":"Upward|Downward|Stable","revisions":[{"period":"Current Quarter","metric":"EPS","thirtyDaysAgo":"$0.88","current":"$0.92","change":"+4.5%","direction":"Up"},{"period":"Current Quarter","metric":"Revenue","thirtyDaysAgo":"$42B","current":"$43.2B","change":"+2.9%","direction":"Up"}],"analystChanges":{"upgrades":5,"downgrades":1,"initiations":2,"last30Days":"Net Positive"},"earningsMomentum":"Strong|Moderate|Weak|Negative","summary":"2-3 sentence assessment"}`,
      `Analyze estimate revisions for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Estimate err:", err.message); res.json({ analysis: { revisionTrend: "N/A" } }); }
});

// ── 24. Cash Flow Waterfall ──
app.post("/api/markets/ai-cashflow", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a cash flow analyst. Return ONLY valid JSON:{"period":"TTM","waterfall":[{"item":"Revenue","amount":"$130.5B","value":130500},{"item":"Cost of Revenue","amount":"-$35.2B","value":-35200},{"item":"Gross Profit","amount":"$95.3B","value":95300},{"item":"Operating Expenses","amount":"-$14.5B","value":-14500},{"item":"Operating Income","amount":"$80.8B","value":80800},{"item":"Taxes & Other","amount":"-$10.2B","value":-10200},{"item":"Net Income","amount":"$70.6B","value":70600},{"item":"D&A Add-back","amount":"+$3.5B","value":3500},{"item":"Working Capital","amount":"-$2.1B","value":-2100},{"item":"Operating Cash Flow","amount":"$72.0B","value":72000},{"item":"CapEx","amount":"-$3.2B","value":-3200},{"item":"Free Cash Flow","amount":"$68.8B","value":68800}],"fcfMargin":"52.7%","fcfYield":"1.7%","fcfPerShare":"$2.82","cashConversion":"97%","uses":[{"category":"Buybacks","amount":"$25B","percentage":36},{"category":"Dividends","amount":"$1B","percentage":1},{"category":"Debt Repayment","amount":"$2B","percentage":3},{"category":"Cash Accumulation","amount":"$40.8B","percentage":60}],"summary":"2-3 sentence assessment"}`,
      `Analyze cash flow waterfall for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Cashflow err:", err.message); res.json({ analysis: { period: "N/A" } }); }
});

// ── 25. Margin Analysis ──
app.post("/api/markets/ai-margins", async (req, res) => {
  try {
    const { symbol, name } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a margin analyst. Return ONLY valid JSON:{"currentMargins":{"gross":73.0,"operating":62.0,"net":55.0,"fcf":52.7},"marginTrend":"Expanding|Stable|Compressing","history":[{"quarter":"Q4 FY2025","gross":73.0,"operating":62.0,"net":55.0},{"quarter":"Q3 FY2025","gross":74.5,"operating":63.0,"net":56.0},{"quarter":"Q2 FY2025","gross":75.0,"operating":64.0,"net":57.0},{"quarter":"Q1 FY2025","gross":76.0,"operating":65.0,"net":58.0},{"quarter":"Q4 FY2024","gross":76.0,"operating":62.0,"net":55.0},{"quarter":"Q3 FY2024","gross":74.0,"operating":58.0,"net":50.0}],"peerComparison":[{"company":"AMD","gross":50.0,"operating":22.0,"net":18.0},{"company":"INTC","gross":41.0,"operating":1.0,"net":-5.0},{"company":"AVGO","gross":74.0,"operating":37.0,"net":30.0}],"drivers":["driver1","driver2"],"risks":["margin risk1"],"summary":"2-3 sentence assessment"}`,
      `Analyze margin trends for ${symbol} (${name}).`
    );
    res.json({ analysis });
  } catch (err) { console.error("Margins err:", err.message); res.json({ analysis: { marginTrend: "N/A" } }); }
});

// ── 26. Deep Stock Comparison ──
app.post("/api/markets/ai-deep-compare", async (req, res) => {
  try {
    const { symbols } = req.body;
    if (!symbols || symbols.length < 2) return res.status(400).json({ error: "Need 2+ symbols" });
    const analysis = await callAI(
      `You are a comparative equity analyst. Return ONLY valid JSON:{"companies":[{"symbol":"NVDA","name":"NVIDIA","valuation":{"pe":35,"ps":20,"evEbitda":30,"pegRatio":1.2},"growth":{"revenueGrowth":"78%","epsGrowth":"85%","fcfGrowth":"90%"},"profitability":{"grossMargin":"73%","operatingMargin":"62%","roe":"115%"},"risk":{"beta":1.65,"debtToEquity":0.41,"shortInterest":"0.8%"},"score":92}],"winner":"NVDA","winnerReason":"Superior growth justifies premium","categories":[{"category":"Valuation","winner":"AMD","reason":"Lower P/E"},{"category":"Growth","winner":"NVDA","reason":"Faster growth"},{"category":"Profitability","winner":"NVDA","reason":"Higher margins"},{"category":"Risk","winner":"AMD","reason":"Lower beta"}],"summary":"3-4 sentence comparison"}`,
      `Deep comparison: ${symbols.join(" vs ")}.`, 4000
    );
    res.json({ analysis });
  } catch (err) { console.error("Compare err:", err.message); res.json({ analysis: { summary: "Unable to compare" } }); }
});

// ── 27. Research Note Suggestions ──
app.post("/api/markets/ai-note-suggest", async (req, res) => {
  try {
    const { symbol, name, price, context } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a research assistant. Return ONLY valid JSON:{"suggestedNotes":[{"title":"Key Catalyst","content":"...","priority":"High"},{"title":"Earnings Setup","content":"...","priority":"Medium"},{"title":"Valuation Check","content":"...","priority":"Low"}],"keyDates":[{"date":"May 28, 2025","event":"Q1 Earnings","importance":"High"}],"watchItems":["item1","item2"]}`,
      `Suggest research notes for ${symbol} (${name}) at $${price}. ${context || ""}`
    );
    res.json({ analysis });
  } catch (err) { console.error("Note err:", err.message); res.json({ analysis: { suggestedNotes: [] } }); }
});

// ── 28. Scenario Analysis ──
app.post("/api/markets/ai-scenario", async (req, res) => {
  try {
    const { symbol, name, price, scenario } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a scenario analysis expert. Return ONLY valid JSON:{"baseCase":{"probability":50,"priceTarget":200,"upside":"+20%","assumptions":"Continued growth","revenueImpact":"+30%","marginImpact":"Stable"},"bullCase":{"probability":30,"priceTarget":280,"upside":"+68%","assumptions":"Acceleration","revenueImpact":"+50%","marginImpact":"Expand"},"bearCase":{"probability":20,"priceTarget":110,"downside":"-34%","assumptions":"Slowdown","revenueImpact":"-10%","marginImpact":"Compress"},"expectedValue":"$205","riskReward":"3.5:1","keyVariable":"AI spending trajectory","summary":"2-3 sentence analysis"}`,
      `Scenario analysis for ${symbol} (${name}) at $${price}.${scenario ? " Scenario: " + scenario : ""}`
    );
    res.json({ analysis });
  } catch (err) { console.error("Scenario err:", err.message); res.json({ analysis: { summary: "Unable to analyze" } }); }
});

// ── 29. Quality Score ──
app.post("/api/markets/ai-quality", async (req, res) => {
  try {
    const { symbol, name, price } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a quality factor analyst. Return ONLY valid JSON:{"qualityScore":94,"grade":"A+|A|B+|B|C|D|F","components":[{"factor":"Profitability","score":98,"metrics":{"roe":"115%","roic":"85%","grossMargin":"73%"},"assessment":"Elite"},{"factor":"Earnings Quality","score":90,"metrics":{"accrualRatio":"Low","cashConversion":"97%","earningsVolatility":"Moderate"},"assessment":"High quality"},{"factor":"Balance Sheet","score":95,"metrics":{"debtToEquity":"0.41","currentRatio":"4.2","interestCoverage":"58x"},"assessment":"Fortress"},{"factor":"Growth Consistency","score":88,"metrics":{"revenueCAGR5yr":"45%","epsCAGR5yr":"55%","missedQuarters":0},"assessment":"Exceptional"},{"factor":"Competitive Position","score":96,"metrics":{"marketShare":"80%","moat":"Wide","pricingPower":"Strong"},"assessment":"Dominant"},{"factor":"Management","score":92,"metrics":{"ceoTenure":"31 years","insiderOwnership":"3.2%","capitalAllocation":"A"},"assessment":"Founder-led"}],"percentileRank":"Top 2% of S&P 500","comparableScores":[{"symbol":"AAPL","score":91},{"symbol":"MSFT","score":93},{"symbol":"GOOGL","score":88}],"summary":"2-3 sentence quality assessment"}`,
      `Quality score for ${symbol} (${name}) at $${price}.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Quality err:", err.message); res.json({ analysis: { qualityScore: 0, grade: "N/A" } }); }
});

// ── 30. Watchlist Alerts ──
app.post("/api/markets/ai-alerts", async (req, res) => {
  try {
    const { symbol, name, price } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const analysis = await callAI(
      `You are a research alert system. Suggest fundamental alerts (NOT price alerts). Return ONLY valid JSON:{"suggestedAlerts":[{"type":"Valuation","condition":"P/E drops below 30","currentValue":"35","threshold":"30","rationale":"Better entry","priority":"High"},{"type":"Insider","condition":"Insider buying detected","currentValue":"Net selling","threshold":"Any purchase","rationale":"Bullish signal","priority":"High"},{"type":"Earnings","condition":"Earnings miss","currentValue":"8 consecutive beats","threshold":"Any miss","rationale":"Breaks streak","priority":"Medium"},{"type":"Margin","condition":"Gross margin below 70%","currentValue":"73%","threshold":"70%","rationale":"Competitive pressure","priority":"Medium"},{"type":"Growth","condition":"Revenue growth below 30%","currentValue":"78%","threshold":"30%","rationale":"Changes thesis","priority":"High"}],"activeFlags":[{"flag":"Short interest declining","significance":"Bullish"}],"summary":"Key alerts for this stock"}`,
      `Suggest fundamental alerts for ${symbol} (${name}) at $${price}.`
    );
    res.json({ analysis });
  } catch (err) { console.error("Alerts err:", err.message); res.json({ analysis: { suggestedAlerts: [] } }); }
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
