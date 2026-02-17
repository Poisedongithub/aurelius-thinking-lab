import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

interface DilemmaStep {
  title: string;
  scenario: string;
  choices: { text: string; next?: string; ending?: string }[];
}

interface ClassicDilemmaData {
  id: string;
  title: string;
  subtitle: string;
  intro: string;
  steps: Record<string, DilemmaStep>;
}

const classicDilemmas: Record<string, ClassicDilemmaData> = {
  "trolley-problem": {
    id: "trolley-problem",
    title: "The Trolley Problem",
    subtitle: "A thought experiment in ethics",
    intro: "A runaway trolley is heading toward five people tied to the tracks. You stand next to a lever that can divert the trolley to a side track — but one person is tied there. What do you do?",
    steps: {
      start: {
        title: "The Classic Dilemma",
        scenario: "A runaway trolley is barreling down the tracks toward five unsuspecting workers. You're standing next to a lever. If you pull it, the trolley will switch to a side track where only one worker stands. Do nothing, and five people die. Act, and one person dies by your hand.",
        choices: [
          { text: "Pull the lever — saving five lives is worth the sacrifice of one", next: "fat_man" },
          { text: "Do nothing — you refuse to be responsible for anyone's death", next: "inaction" },
        ],
      },
      fat_man: {
        title: "The Fat Man Variant",
        scenario: "Now imagine a different scenario. You're standing on a bridge above the tracks. The same trolley is heading toward five people. Next to you stands a very large man. If you push him off the bridge, his body would stop the trolley and save the five. He would die.",
        choices: [
          { text: "Push him — the math is the same, five lives for one", next: "surgeon" },
          { text: "Don't push — there's a moral difference between diverting harm and directly killing", next: "loop" },
        ],
      },
      inaction: {
        title: "The Weight of Inaction",
        scenario: "The five workers are dead. You chose not to intervene. Some would say you kept your hands clean. Others would say inaction is itself a choice — and you chose to let five people die when you could have saved them. A philosopher approaches you: 'Is there really a moral difference between killing and letting die?'",
        choices: [
          { text: "There is — I'm not responsible for a tragedy I didn't cause", ending: "deontologist" },
          { text: "Maybe not — perhaps I should have acted after all", next: "fat_man" },
        ],
      },
      surgeon: {
        title: "The Surgeon's Dilemma",
        scenario: "You're now a surgeon with five patients dying from organ failure. A healthy patient comes in for a routine checkup. You could harvest their organs to save all five. No one would ever know. The logic is identical to the trolley: one life for five.",
        choices: [
          { text: "Absolutely not — this crosses a fundamental moral line", ending: "threshold" },
          { text: "If the math justified the trolley, it should justify this too", ending: "consistent_utilitarian" },
        ],
      },
      loop: {
        title: "The Loop Variant",
        scenario: "Consider this: the side track loops back to the main track. Diverting the trolley would only save the five because the one person on the side track would stop it with their body. You're not just diverting — you're using someone as a means to an end. Is this different from pulling the original lever?",
        choices: [
          { text: "It's different — using someone as a tool is always wrong", ending: "kantian" },
          { text: "It's the same — the outcome is what matters, not the mechanism", ending: "utilitarian" },
        ],
      },
    },
  },
  "ship-of-theseus": {
    id: "ship-of-theseus",
    title: "Ship of Theseus",
    subtitle: "A paradox of identity",
    intro: "If you replace every plank of a ship one by one, is it still the same ship? And if you build a new ship from the old planks — which one is the real Ship of Theseus?",
    steps: {
      start: {
        title: "The First Plank",
        scenario: "The legendary ship of the hero Theseus is preserved in a museum. Over the centuries, as planks rot, they are replaced with new identical wood. After 100 years, every single plank has been replaced. The ship looks identical. The museum says it's the same ship. Is it?",
        choices: [
          { text: "Yes — identity persists through gradual change, like our own bodies", next: "reassembled" },
          { text: "No — once every part is replaced, it's a replica, not the original", next: "human_body" },
        ],
      },
      reassembled: {
        title: "The Reassembled Ship",
        scenario: "A collector has been saving every old plank removed from the ship. They reassemble all the original planks into a complete ship. Now there are two ships: the museum's gradually-replaced ship and the collector's reassembled-from-originals ship. Which is the real Ship of Theseus?",
        choices: [
          { text: "The museum ship — continuity of form and purpose defines identity", next: "teleporter" },
          { text: "The reassembled ship — the original matter is what makes it real", next: "mind_upload" },
        ],
      },
      human_body: {
        title: "Your Own Ship",
        scenario: "Consider this: your body replaces nearly all its cells every 7-10 years. The atoms in your body today are almost entirely different from those 10 years ago. Your memories change and fade. Your personality evolves. Are you the same person you were a decade ago?",
        choices: [
          { text: "Yes — my continuous stream of consciousness makes me the same person", next: "teleporter" },
          { text: "Not exactly — I'm a continuation, but not identical to who I was", next: "mind_upload" },
        ],
      },
      teleporter: {
        title: "The Teleporter",
        scenario: "A teleporter scans your body, destroys it, and recreates an exact copy at the destination — same atoms, same arrangement, same memories. The copy believes they are you. They have your memories, your feelings, your personality. Did you die? Or did you travel?",
        choices: [
          { text: "I traveled — if the copy is identical in every way, it IS me", ending: "pattern_identity" },
          { text: "I died — the copy is someone new who thinks they're me", ending: "material_identity" },
        ],
      },
      mind_upload: {
        title: "The Digital You",
        scenario: "Technology now allows uploading your mind to a computer. The digital version has all your memories, personality, and consciousness. Your biological body could then die peacefully. The digital you would live on, thinking and feeling. Would you do it?",
        choices: [
          { text: "Yes — consciousness is what matters, not the substrate it runs on", ending: "functionalist" },
          { text: "No — a copy of my mind is not me, no matter how perfect", ending: "embodied_identity" },
        ],
      },
    },
  },
  "platos-cave": {
    id: "platos-cave",
    title: "Plato's Cave",
    subtitle: "An allegory of enlightenment",
    intro: "Prisoners chained in a cave see only shadows on the wall. They believe the shadows are reality. What happens when one escapes and sees the sun?",
    steps: {
      start: {
        title: "Life in the Cave",
        scenario: "You've lived your entire life chained in a dark cave, facing a wall. Behind you, a fire casts shadows of objects carried by people on a walkway. These shadows are all you've ever known — they ARE your reality. One day, your chains break. You can turn around. Do you?",
        choices: [
          { text: "Turn around — I want to see what's really there", next: "blinding_light" },
          { text: "Stay facing the wall — the shadows are comfortable and familiar", next: "comfortable_chains" },
        ],
      },
      blinding_light: {
        title: "The Blinding Truth",
        scenario: "You turn and the firelight blinds you. As your eyes adjust, you see the objects casting the shadows — they're crude puppets. Everything you thought was real was a projection. You stumble toward the cave entrance and see sunlight for the first time. It's overwhelming and painful. Do you keep going?",
        choices: [
          { text: "Keep going — the pain of truth is better than the comfort of illusion", next: "the_sun" },
          { text: "Go back — this is too much, the shadows were easier to understand", next: "return_to_shadows" },
        ],
      },
      comfortable_chains: {
        title: "The Comfort of Shadows",
        scenario: "You stay. The shadows continue their dance. But now you know the chains are broken. You COULD turn around. The knowledge that you're choosing ignorance gnaws at you. Another prisoner whispers: 'I heard there's a world beyond the wall.' The other prisoners laugh at them.",
        choices: [
          { text: "Finally turn around — the doubt is worse than whatever truth awaits", next: "blinding_light" },
          { text: "Silence the doubter — if everyone questions reality, chaos follows", ending: "willful_ignorance" },
        ],
      },
      the_sun: {
        title: "The World Outside",
        scenario: "You emerge into the sunlight. Trees, rivers, stars — the real world is infinitely more complex and beautiful than shadows. You understand now that your entire previous existence was a pale imitation of truth. But your friends are still chained in the cave. Do you go back for them?",
        choices: [
          { text: "Go back — I must free them and show them the truth", next: "return_mission" },
          { text: "Stay outside — they wouldn't believe me anyway, and I can't force enlightenment", ending: "solitary_enlightenment" },
        ],
      },
      return_to_shadows: {
        title: "Back in the Dark",
        scenario: "You return to your spot. But the shadows look different now. You can see their edges, their flatness. You know they're not real. You can never un-know this. The other prisoners seem content. You envy their ignorance. Was it better to never have turned around at all?",
        choices: [
          { text: "Knowledge, even painful, is always better than ignorance", ending: "reluctant_philosopher" },
          { text: "Sometimes ignorance truly is bliss — I wish I never looked", ending: "tragic_awareness" },
        ],
      },
      return_mission: {
        title: "The Prophet's Dilemma",
        scenario: "You return to the cave. Your eyes, adjusted to sunlight, can barely see in the dark. The prisoners think you've gone blind. You try to describe the sun, trees, colors — they think you're insane. They threaten to kill anyone who tries to unchain them. The truth has made you an outcast.",
        choices: [
          { text: "Keep trying — even if only one person listens, it's worth it", ending: "persistent_teacher" },
          { text: "Accept it — you can't force people to see what they're not ready for", ending: "wise_acceptance" },
        ],
      },
    },
  },
  "veil-of-ignorance": {
    id: "veil-of-ignorance",
    title: "Veil of Ignorance",
    subtitle: "A thought experiment in justice",
    intro: "If you had to design society without knowing what position you'd hold in it — rich or poor, healthy or sick, majority or minority — what would you create?",
    steps: {
      start: {
        title: "Behind the Veil",
        scenario: "You're tasked with designing the rules of a new society. The catch: you don't know who you'll be in it. You might be born wealthy or destitute, healthy or disabled, in the majority or a persecuted minority. You must choose the fundamental economic system.",
        choices: [
          { text: "Maximum equality — ensure no one falls too far behind, even if it limits the top", next: "healthcare" },
          { text: "Maximum freedom — let people rise or fall on their merits, with a basic safety net", next: "healthcare" },
        ],
      },
      healthcare: {
        title: "The Healthcare Question",
        scenario: "Now design the healthcare system. Remember: you might be born with a chronic illness that requires expensive treatment, or you might be perfectly healthy your entire life. You don't know.",
        choices: [
          { text: "Universal healthcare for all — no one should die because they can't afford treatment", next: "education" },
          { text: "Private healthcare with public option — quality care requires market incentives", next: "education" },
        ],
      },
      education: {
        title: "The Education System",
        scenario: "Design education. You might be born to professors or to parents who never finished school. You might be gifted or struggle with learning disabilities. You might live in a city or a remote village.",
        choices: [
          { text: "Equal funding for all schools — every child deserves the same quality education", next: "criminal_justice" },
          { text: "School choice and competition — parents should pick what's best for their children", next: "criminal_justice" },
        ],
      },
      criminal_justice: {
        title: "Crime and Punishment",
        scenario: "Design the justice system. You might be falsely accused. You might be a victim of crime. You might grow up in conditions that make crime seem like the only option. You might be a judge.",
        choices: [
          { text: "Focus on rehabilitation — people can change and deserve second chances", next: "final_question" },
          { text: "Focus on deterrence — strong consequences protect the innocent", next: "final_question" },
        ],
      },
      final_question: {
        title: "The Final Question",
        scenario: "Your society is designed. Before the veil lifts and you learn your place in it, you're asked one final question: would you rather live in the society you just designed, or take your chances in the real world as it exists today?",
        choices: [
          { text: "My designed society — I trust the fairness of choices made behind the veil", ending: "rawlsian" },
          { text: "The real world — for all its flaws, it's real and I know what I'm getting", ending: "pragmatic_realist" },
        ],
      },
    },
  },
};

const endings: Record<string, { title: string; description: string; philosopher: string; quote: string }> = {
  deontologist: { title: "The Principled Observer", description: "You believe moral rules exist independently of outcomes. Some actions are simply wrong, regardless of their consequences. You align with Immanuel Kant's categorical imperative.", philosopher: "Immanuel Kant", quote: "Act only according to that maxim whereby you can at the same time will that it should become a universal law." },
  threshold: { title: "The Moral Threshold", description: "You found where utilitarian logic breaks down. There's a point where the math stops justifying the means. You've discovered your moral threshold — the line you won't cross.", philosopher: "Bernard Williams", quote: "There are some situations so monstrous that the idea that the processes of moral rationality could yield an answer in them is insane." },
  consistent_utilitarian: { title: "The Consistent Utilitarian", description: "You follow the logic wherever it leads, even to uncomfortable conclusions. If saving five justifies sacrificing one, the method shouldn't matter. Few have the courage to be this consistent.", philosopher: "Peter Singer", quote: "If it is in our power to prevent something bad from happening, without thereby sacrificing anything of comparable moral importance, we ought to do it." },
  kantian: { title: "The Kantian", description: "You believe people must never be used merely as means to an end. Every person has inherent dignity that cannot be traded away, no matter how many others might benefit.", philosopher: "Immanuel Kant", quote: "So act that you use humanity, whether in your own person or in the person of any other, always at the same time as an end, never merely as a means." },
  utilitarian: { title: "The Utilitarian", description: "You believe the right action is whatever produces the greatest good for the greatest number. Outcomes matter more than methods or intentions.", philosopher: "Jeremy Bentham", quote: "The greatest happiness of the greatest number is the foundation of morals and legislation." },
  pattern_identity: { title: "Pattern Identity Theorist", description: "You believe identity is defined by the pattern of information, not the physical matter. If the pattern is preserved, you are preserved — regardless of the substrate.", philosopher: "Derek Parfit", quote: "Personal identity is not what matters in survival." },
  material_identity: { title: "Material Identity Theorist", description: "You believe there's something irreducible about physical continuity. A perfect copy is still a copy, and the original is gone forever.", philosopher: "John Locke", quote: "Personal identity consists in the continuity of consciousness." },
  functionalist: { title: "The Functionalist", description: "You believe the mind is defined by what it does, not what it's made of. Consciousness can exist in silicon as easily as in carbon.", philosopher: "Daniel Dennett", quote: "The mind is the brain's software." },
  embodied_identity: { title: "The Embodied Self", description: "You believe consciousness is inseparable from the body. The lived experience of being a physical being in a physical world is essential to who you are.", philosopher: "Maurice Merleau-Ponty", quote: "The body is our general medium for having a world." },
  willful_ignorance: { title: "The Willing Prisoner", description: "You chose comfort over truth, and order over freedom. Sometimes stability requires that certain questions remain unasked. But at what cost?", philosopher: "Aldous Huxley", quote: "Most human beings have an almost infinite capacity for taking things for granted." },
  solitary_enlightenment: { title: "The Solitary Sage", description: "You chose truth for yourself but recognized you cannot force it on others. Enlightenment is a personal journey that each must choose to undertake.", philosopher: "Siddhartha Gautama", quote: "No one saves us but ourselves. No one can and no one may. We ourselves must walk the path." },
  reluctant_philosopher: { title: "The Reluctant Philosopher", description: "You learned that knowledge, once gained, cannot be unlearned. Even painful truth is preferable to comfortable lies. This is the burden and gift of awareness.", philosopher: "Socrates", quote: "The unexamined life is not worth living." },
  tragic_awareness: { title: "The Tragic Knower", description: "You discovered that awareness without the power to change things is its own form of suffering. Sometimes the price of knowledge is peace of mind.", philosopher: "Friedrich Nietzsche", quote: "And if you gaze long into an abyss, the abyss also gazes into you." },
  persistent_teacher: { title: "The Persistent Teacher", description: "Like Socrates in the agora, you chose to keep questioning and teaching, even when it made you unpopular. Truth is worth sharing, even at great personal cost.", philosopher: "Socrates", quote: "I cannot teach anybody anything. I can only make them think." },
  wise_acceptance: { title: "The Wise Acceptor", description: "You learned that wisdom includes knowing when to let go. You can offer truth, but you cannot force anyone to accept it. Each person must find their own way out of the cave.", philosopher: "Lao Tzu", quote: "When the student is ready, the teacher will appear." },
  rawlsian: { title: "The Rawlsian", description: "You trust the fairness of decisions made behind the veil of ignorance. A just society is one that anyone would choose without knowing their place in it.", philosopher: "John Rawls", quote: "Justice is the first virtue of social institutions, as truth is of systems of thought." },
  pragmatic_realist: { title: "The Pragmatic Realist", description: "You prefer the imperfect reality you know to the theoretical ideal you designed. There's wisdom in accepting the world as it is while working to improve it.", philosopher: "William James", quote: "The art of being wise is the art of knowing what to overlook." },
};

const ClassicDilemma = () => {
  const { dilemmaId } = useParams<{ dilemmaId: string }>();
  const navigate = useNavigate();
  useAuth();
  const [currentStep, setCurrentStep] = useState("start");
  const [ending, setEnding] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const dilemma = dilemmaId ? classicDilemmas[dilemmaId] : null;

  if (!dilemma) {
    return (
      <div className="phone-container min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-7">
          <p className="text-foreground/40 mb-4">Dilemma not found</p>
          <button onClick={() => navigate("/home")} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm">Go Home</button>
        </div>
      </div>
    );
  }

  const step = dilemma.steps[currentStep];
  const endingData = ending ? endings[ending] : null;

  const handleChoice = (choiceIndex: number) => {
    if (selecting !== null) return;
    setSelecting(choiceIndex);
    const choice = step.choices[choiceIndex];

    setTimeout(() => {
      setSelecting(null);
      if (choice.ending) {
        setEnding(choice.ending);
      } else if (choice.next) {
        setHistory([...history, currentStep]);
        setCurrentStep(choice.next);
      }
    }, 500);
  };

  const handleRestart = () => {
    setCurrentStep("start");
    setEnding(null);
    setHistory([]);
    setSelecting(null);
  };

  if (endingData) {
    return (
      <div className="phone-container min-h-screen flex flex-col bg-background">
        <div className="shrink-0 px-7 pt-6 pb-3">
          <button onClick={() => navigate("/home")} className="text-foreground/40 hover:text-foreground/60 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 px-7 flex flex-col justify-center pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-20 h-20 rounded-full border-2 border-primary/30 mx-auto mb-6 flex items-center justify-center">
              <span className="font-serif text-[32px] text-foreground">{endingData.title[0]}</span>
            </div>
            <h2 className="font-serif text-[28px] text-foreground text-center leading-tight mb-3">{endingData.title}</h2>
            <p className="text-[14px] text-foreground/50 font-light leading-relaxed text-center mb-8 max-w-[320px] mx-auto">{endingData.description}</p>
            <div className="glass-card rounded-2xl p-5 mb-8">
              <p className="font-serif italic text-[15px] text-foreground/60 leading-relaxed mb-3">"{endingData.quote}"</p>
              <span className="text-[11px] text-foreground/30 tracking-[0.15em] uppercase">{endingData.philosopher}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={handleRestart} className="flex-1 py-3.5 rounded-xl border border-border/40 text-foreground/60 text-sm font-light">Try Again</button>
              <button onClick={() => navigate("/home")} className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Home</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-container min-h-screen flex flex-col bg-background">
      <div className="shrink-0 px-7 pt-6 pb-5">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate("/home")} className="text-foreground/40 hover:text-foreground/60 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <span className="text-[11px] text-foreground/25 tracking-[0.15em] uppercase font-light">{dilemma.title}</span>
        </div>
        <div className="h-1 bg-foreground/6 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.8))" }}
            initial={{ width: 0 }} animate={{ width: `${((history.length + 1) / Object.keys(dilemma.steps).length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
      <div className="flex-1 px-7 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
            <h2 className="font-serif text-[28px] leading-[1.15] text-foreground/90 mb-3">{step.title}</h2>
            <p className="text-[14px] text-foreground/40 font-light leading-[1.7] mb-8">{step.scenario}</p>
            <div className="flex flex-col gap-3 mt-auto pb-10">
              {step.choices.map((choice, i) => (
                <motion.button key={i} onClick={() => handleChoice(i)} disabled={selecting !== null}
                  className={`text-left rounded-2xl px-5 py-[18px] transition-all duration-300 border ${selecting === i ? "bg-primary/15 border-primary/30" : "bg-card/30 border-border/40 hover:bg-card/50 hover:border-border/60"}`}
                  whileTap={{ scale: 0.985 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.06 }}>
                  <span className="text-[14px] text-foreground/70 font-light leading-relaxed">{choice.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClassicDilemma;
