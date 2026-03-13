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
// ── MARKETS API ENDPOINTS (Yahoo Finance — free, all tickers) ──
// ══════════════════════════════════════════════════

const YF_BASE = "https://query1.finance.yahoo.com";
const YF_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };

// Helper: fetch from Yahoo Finance
async function yfFetch(path, params = {}) {
  const url = new URL(`${YF_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const response = await fetch(url.toString(), { headers: YF_HEADERS });
  if (!response.ok) throw new Error(`Yahoo Finance returned ${response.status}`);
  return response.json();
}

// Yahoo Finance — get live stock quote + historical chart
app.get("/api/markets/quote/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Fetch 3-month chart (includes current quote in meta) and search for sector info
    const [chartResp, searchResp] = await Promise.all([
      yfFetch(`/v8/finance/chart/${encodeURIComponent(symbol)}`, {
        interval: "1d", range: "3mo", includeAdjustedClose: "true"
      }),
      yfFetch(`/v1/finance/search`, {
        q: symbol, quotesCount: "1", newsCount: "0"
      }).catch(() => null),
    ]);
    
    const result = chartResp?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: "Symbol not found" });
    
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const adjClose = result.indicators?.adjclose?.[0]?.adjclose || [];
    
    // Build chart data (last 30 trading days)
    const chartData = [];
    const startIdx = Math.max(0, timestamps.length - 30);
    for (let i = startIdx; i < timestamps.length; i++) {
      if (quotes.close?.[i] != null) {
        chartData.push({
          date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
          open: quotes.open?.[i] || 0,
          high: quotes.high?.[i] || 0,
          low: quotes.low?.[i] || 0,
          close: quotes.close[i],
          volume: quotes.volume?.[i] || 0,
          adjClose: adjClose[i] || quotes.close[i],
        });
      }
    }
    
    // Calculate period returns
    const currentPrice = meta.regularMarketPrice;
    const getReturn = (daysBack) => {
      const idx = timestamps.length - 1 - daysBack;
      if (idx < 0 || !quotes.close?.[idx]) return null;
      return ((currentPrice - quotes.close[idx]) / quotes.close[idx] * 100);
    };
    
    // Get sector/industry from search results
    const searchQuote = searchResp?.quotes?.[0];
    
    // Estimate market cap from price * shares (not always available)
    // Yahoo chart meta doesn't include marketCap directly, but we can estimate
    const volume = meta.regularMarketVolume || 0;
    
    res.json({
      symbol: meta.symbol,
      name: meta.longName || meta.shortName || symbol,
      exchange: meta.fullExchangeName || meta.exchangeName || "",
      currency: meta.currency || "USD",
      price: currentPrice,
      previousClose: meta.chartPreviousClose || meta.previousClose || null,
      dayHigh: meta.regularMarketDayHigh || null,
      dayLow: meta.regularMarketDayLow || null,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || null,
      volume: volume,
      marketCap: null, // Yahoo chart doesn't provide this directly
      change: meta.chartPreviousClose ? ((currentPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100) : 0,
      sector: searchQuote?.sector || searchQuote?.sectorDisp || "",
      industry: searchQuote?.industry || searchQuote?.industryDisp || "",
      description: "",
      ceo: "",
      website: "",
      image: "",
      performance: {
        "1D": meta.chartPreviousClose ? ((currentPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100) : 0,
        "1W": getReturn(5),
        "1M": getReturn(21),
        "3M": getReturn(63),
        "YTD": null,
      },
      chart: chartData,
    });
  } catch (err) {
    console.error("Markets quote error:", err.message);
    res.status(500).json({ error: "Failed to fetch stock data", details: err.message });
  }
});

// Yahoo Finance — batch quotes for multiple symbols
app.get("/api/markets/batch", async (req, res) => {
  try {
    const symbols = (req.query.symbols || "").split(",").filter(Boolean);
    if (symbols.length === 0) return res.json({ quotes: [] });
    
    const quotes = await Promise.all(symbols.map(async (symbol) => {
      try {
        const data = await yfFetch(`/v8/finance/chart/${encodeURIComponent(symbol)}`, {
          interval: "1d", range: "5d"
        });
        const result = data?.chart?.result?.[0];
        if (!result) return { symbol, error: true };
        const meta = result.meta;
        const prevClose = meta.chartPreviousClose || meta.previousClose;
        const price = meta.regularMarketPrice;
        const changePct = prevClose ? ((price - prevClose) / prevClose * 100) : 0;
        return {
          symbol: meta.symbol,
          name: meta.longName || meta.shortName || symbol,
          exchange: meta.fullExchangeName || meta.exchangeName || "",
          price: price,
          change: changePct,
          volume: meta.regularMarketVolume || 0,
          marketCap: null,
          yearHigh: meta.fiftyTwoWeekHigh || null,
          yearLow: meta.fiftyTwoWeekLow || null,
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

// Yahoo Finance — search tickers by name or symbol
app.get("/api/markets/search", async (req, res) => {
  try {
    const query = req.query.q || "";
    if (!query) return res.json({ results: [] });
    
    const data = await yfFetch("/v1/finance/search", {
      q: query, quotesCount: "10", newsCount: "0"
    });
    
    const results = (data.quotes || [])
      .filter(r => r.quoteType === "EQUITY" && r.isYahooFinance)
      .slice(0, 10)
      .map(r => ({
        symbol: r.symbol,
        name: r.longname || r.shortname || r.symbol,
        exchange: r.exchDisp || r.exchange || "",
        currency: "USD",
        sector: r.sectorDisp || r.sector || "",
        industry: r.industryDisp || r.industry || "",
      }));
    
    res.json({ results });
  } catch (err) {
    console.error("Markets search error:", err.message);
    res.json({ results: [] });
  }
});

// Yahoo Finance — company profile (basic info from search)
app.get("/api/markets/profile/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await yfFetch("/v1/finance/search", {
      q: symbol, quotesCount: "1", newsCount: "0"
    });
    const quote = data?.quotes?.[0];
    if (!quote) return res.status(404).json({ error: "Profile not found" });
    res.json({
      symbol: quote.symbol,
      companyName: quote.longname || quote.shortname || symbol,
      exchange: quote.exchDisp || quote.exchange || "",
      sector: quote.sectorDisp || quote.sector || "",
      industry: quote.industryDisp || quote.industry || "",
    });
  } catch (err) {
    console.error("Markets profile error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Yahoo Finance — historical price data
app.get("/api/markets/history/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await yfFetch(`/v8/finance/chart/${encodeURIComponent(symbol)}`, {
      interval: "1d", range: "1y", includeAdjustedClose: "true"
    });
    const result = data?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: "Symbol not found" });
    
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};
    const history = timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split("T")[0],
      open: quotes.open?.[i] || 0,
      high: quotes.high?.[i] || 0,
      low: quotes.low?.[i] || 0,
      close: quotes.close?.[i] || 0,
      volume: quotes.volume?.[i] || 0,
    })).filter(d => d.close > 0);
    
    res.json({ symbol, history });
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
