import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, MessageSquare, ChevronRight, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

interface DilemmaStep {
  title: string;
  scenario: string;
  choices: { text: string; next?: string; ending?: string }[];
  counterarguments?: Record<number, { philosopher: string; challenge: string; }>;
  commentary?: string;
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
        counterarguments: {
          0: { philosopher: "Immanuel Kant", challenge: "But by pulling the lever, you are choosing to kill. You are using that one person as a means to save others. Can you truly claim moral authority over who lives and who dies?" },
          1: { philosopher: "Peter Singer", challenge: "Five lives versus one — the mathematics of suffering is clear. By choosing inaction, aren't you simply hiding behind the illusion of clean hands while more people die?" },
        },
        commentary: "This dilemma, first introduced by Philippa Foot in 1967, reveals the tension between consequentialist thinking (outcomes matter most) and deontological ethics (some actions are inherently wrong regardless of outcomes).",
        choices: [
          { text: "Pull the lever — saving five lives is worth the sacrifice of one", next: "fat_man" },
          { text: "Do nothing — you refuse to be responsible for anyone's death", next: "inaction" },
        ],
      },
      fat_man: {
        title: "The Fat Man Variant",
        scenario: "Now imagine a different scenario. You're standing on a bridge above the tracks. The same trolley is heading toward five people. Next to you stands a very large man. If you push him off the bridge, his body would stop the trolley and save the five. He would die.",
        counterarguments: {
          0: { philosopher: "Judith Jarvis Thomson", challenge: "Notice how your moral intuition shifts. The math is identical — one for five — yet pushing someone feels fundamentally different from pulling a lever. Why? What does this reveal about your moral reasoning?" },
          1: { philosopher: "John Stuart Mill", challenge: "You drew a line between 'diverting' and 'pushing.' But is the distinction real, or is it just psychological comfort? The five people on the tracks don't care about your moral categories — they just want to live." },
        },
        commentary: "Judith Jarvis Thomson introduced this variant to show that most people's moral intuitions are not purely consequentialist. The physical act of pushing someone to their death triggers a different moral response than pulling a lever, even when the outcomes are identical.",
        choices: [
          { text: "Push him — the math is the same, five lives for one", next: "surgeon" },
          { text: "Don't push — there's a moral difference between diverting harm and directly killing", next: "loop" },
        ],
      },
      inaction: {
        title: "The Weight of Inaction",
        scenario: "The five workers are dead. You chose not to intervene. Some would say you kept your hands clean. Others would say inaction is itself a choice — and you chose to let five people die when you could have saved them. A philosopher approaches you: 'Is there really a moral difference between killing and letting die?'",
        counterarguments: {
          0: { philosopher: "Peter Singer", challenge: "If a child is drowning in a shallow pond and you walk past because you don't want to ruin your shoes, are your hands truly clean? Distance from the act doesn't erase responsibility." },
          1: { philosopher: "Marcus Aurelius", challenge: "Admitting doubt takes courage. But doubt without action is merely the mind's way of avoiding the weight of choice. What will you do differently next time?" },
        },
        commentary: "The distinction between killing and letting die (the 'act/omission distinction') is one of the most debated concepts in moral philosophy. James Rachels argued there is no moral difference; others like Warren Quinn disagreed.",
        choices: [
          { text: "There is — I'm not responsible for a tragedy I didn't cause", ending: "deontologist" },
          { text: "Maybe not — perhaps I should have acted after all", next: "fat_man" },
        ],
      },
      surgeon: {
        title: "The Surgeon's Dilemma",
        scenario: "You're now a surgeon with five patients dying from organ failure. A healthy patient comes in for a routine checkup. You could harvest their organs to save all five. No one would ever know. The logic is identical to the trolley: one life for five.",
        counterarguments: {
          0: { philosopher: "Philippa Foot", challenge: "Interesting — you found your limit. But can you articulate exactly WHY this is different? If you can't, perhaps your moral intuition is simply recoiling from the visceral nature of the act, not from a genuine moral principle." },
          1: { philosopher: "Jeremy Bentham", challenge: "Remarkable consistency. But consider: if everyone followed this logic, no one would ever visit a doctor. The collapse of trust would cause far more suffering than the five lives saved. Does your calculus account for systemic consequences?" },
        },
        commentary: "This thought experiment, created by Judith Jarvis Thomson, reveals why most people are not strict utilitarians. It suggests we have deep moral intuitions about bodily autonomy, trust, and the sanctity of institutions that override simple utilitarian calculations.",
        choices: [
          { text: "Absolutely not — this crosses a fundamental moral line", ending: "threshold" },
          { text: "If the math justified the trolley, it should justify this too", ending: "consistent_utilitarian" },
        ],
      },
      loop: {
        title: "The Loop Variant",
        scenario: "Consider this: the side track loops back to the main track. Diverting the trolley would only save the five because the one person on the side track would stop it with their body. You're not just diverting — you're using someone as a means to an end. Is this different from pulling the original lever?",
        counterarguments: {
          0: { philosopher: "Christine Korsgaard", challenge: "You've identified the Kantian principle: people are ends in themselves, never merely means. But consider — when you pull the original lever, aren't you also using the side track person instrumentally? The loop just makes it explicit." },
          1: { philosopher: "Derek Parfit", challenge: "If the outcome is identical, why should the mechanism matter? You're drawing moral lines based on the geometry of train tracks, not on any genuine ethical principle." },
        },
        commentary: "The loop variant, introduced by Thomson, is designed to test whether the 'doctrine of double effect' — the idea that harm caused as a side effect is more permissible than harm caused as a means — holds up under scrutiny.",
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
        counterarguments: {
          0: { philosopher: "Thomas Hobbes", challenge: "But consider: at what exact moment did the old ship become the new ship? If you can't identify the precise plank that changed its identity, perhaps 'identity' was never in the planks to begin with." },
          1: { philosopher: "Aristotle", challenge: "If the matter is what defines the ship, then you are not the same person you were seven years ago — your cells have almost entirely been replaced. Do you accept that consequence?" },
        },
        commentary: "This paradox, recorded by Plutarch, has puzzled philosophers for over 2,000 years. It strikes at the heart of what we mean by 'identity' — is it the matter, the form, the function, or the continuity that makes something what it is?",
        choices: [
          { text: "Yes — identity persists through gradual change, like our own bodies", next: "reassembled" },
          { text: "No — once every part is replaced, it's a replica, not the original", next: "human_body" },
        ],
      },
      reassembled: {
        title: "The Reassembled Ship",
        scenario: "A collector has been saving every old plank removed from the ship. They reassemble all the original planks into a complete ship. Now there are two ships: the museum's gradually-replaced ship and the collector's reassembled-from-originals ship. Which is the real Ship of Theseus?",
        counterarguments: {
          0: { philosopher: "Aristotle", challenge: "You privilege form over matter. But the reassembled ship has both the original matter AND the original form. How can the museum ship claim superiority when it shares neither?" },
          1: { philosopher: "John Locke", challenge: "You privilege matter over continuity. But those planks sat in a warehouse for decades — they weren't a ship during that time. Can identity be paused and resumed like a recording?" },
        },
        commentary: "Thomas Hobbes added this twist to the original paradox, creating a genuine philosophical crisis: two ships, each with a legitimate claim to being 'the real one.' It forces us to choose between competing theories of identity.",
        choices: [
          { text: "The museum ship — continuity of form and purpose defines identity", next: "teleporter" },
          { text: "The reassembled ship — the original matter is what makes it real", next: "mind_upload" },
        ],
      },
      human_body: {
        title: "Your Own Ship",
        scenario: "Consider this: your body replaces nearly all its cells every 7-10 years. The atoms in your body today are almost entirely different from those 10 years ago. Your memories change and fade. Your personality evolves. Are you the same person you were a decade ago?",
        counterarguments: {
          0: { philosopher: "Derek Parfit", challenge: "But your stream of consciousness is interrupted every night when you sleep. And general anesthesia creates a complete gap. If continuity is what matters, did you die and get replaced last time you went under?" },
          1: { philosopher: "David Hume", challenge: "A 'continuation' that isn't identical — what does that even mean? You're essentially saying you are a different person with the same name. At least you're honest about the paradox." },
        },
        commentary: "The Buddhist concept of 'anatta' (no-self) embraces this conclusion fully: there is no permanent, unchanging self. What we call 'I' is a constantly flowing river of experiences, thoughts, and sensations.",
        choices: [
          { text: "Yes — my continuous stream of consciousness makes me the same person", next: "teleporter" },
          { text: "Not exactly — I'm a continuation, but not identical to who I was", next: "mind_upload" },
        ],
      },
      teleporter: {
        title: "The Teleporter",
        scenario: "A teleporter scans your body, destroys it, and recreates an exact copy at the destination — same atoms, same arrangement, same memories. The copy believes they are you. They have your memories, your feelings, your personality. Did you die? Or did you travel?",
        counterarguments: {
          0: { philosopher: "Derek Parfit", challenge: "Now consider: what if the teleporter malfunctions and doesn't destroy the original? There are now two of you, both equally convinced they are 'the real one.' Which one is you? If the copy is you when the original is destroyed, why isn't it you when the original survives?" },
          1: { philosopher: "Daniel Dennett", challenge: "You say the copy is 'someone new who thinks they're you.' But from the copy's perspective, they have a continuous stream of memories leading up to stepping into the teleporter. Their experience of being you is identical to yours. On what grounds do you deny their identity?" },
        },
        commentary: "Derek Parfit used teleporter thought experiments to argue that personal identity is not what matters in survival. What matters is psychological continuity — and that can, in principle, be preserved through copying.",
        choices: [
          { text: "I traveled — if the copy is identical in every way, it IS me", ending: "pattern_identity" },
          { text: "I died — the copy is someone new who thinks they're me", ending: "material_identity" },
        ],
      },
      mind_upload: {
        title: "The Digital You",
        scenario: "Technology now allows uploading your mind to a computer. The digital version has all your memories, personality, and consciousness. Your biological body could then die peacefully. The digital you would live on, thinking and feeling. Would you do it?",
        counterarguments: {
          0: { philosopher: "Maurice Merleau-Ponty", challenge: "But can consciousness truly exist without a body? Your sense of self is shaped by hunger, fatigue, the warmth of sunlight on skin. A digital mind would experience none of this. Would it really be 'you' — or a disembodied ghost with your memories?" },
          1: { philosopher: "Nick Bostrom", challenge: "But consider: what if you're already a simulation? If consciousness can arise from biological neurons, why not digital ones? Your certainty that 'the real you' requires flesh may itself be a bias of your current substrate." },
        },
        commentary: "The mind uploading debate touches on the 'hard problem of consciousness' — whether subjective experience can be reduced to information processing, or whether there is something irreducibly physical about being conscious.",
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
        counterarguments: {
          0: { philosopher: "Nietzsche", challenge: "Brave! But are you prepared for what you'll find? What if the 'truth' behind you is just another set of shadows? What if there is no ultimate reality — only layers of interpretation?" },
          1: { philosopher: "Plato", challenge: "The shadows are comfortable because they are familiar, not because they are true. But comfort built on illusion is the most fragile kind. How long before the chains feel like a prison even without turning around?" },
        },
        commentary: "Plato's Allegory of the Cave, from Book VII of The Republic (circa 380 BCE), is perhaps the most famous metaphor in Western philosophy. It illustrates the journey from ignorance to knowledge — and the pain that accompanies it.",
        choices: [
          { text: "Turn around — I want to see what's really there", next: "blinding_light" },
          { text: "Stay facing the wall — the shadows are comfortable and familiar", next: "comfortable_chains" },
        ],
      },
      blinding_light: {
        title: "The Blinding Truth",
        scenario: "You turn and the firelight blinds you. As your eyes adjust, you see the objects casting the shadows — they're crude puppets. Everything you thought was real was a projection. You stumble toward the cave entrance and see sunlight for the first time. It's overwhelming and painful. Do you keep going?",
        counterarguments: {
          0: { philosopher: "Kierkegaard", challenge: "The leap into the unknown requires faith — faith that the pain of truth leads somewhere worthwhile. But what if it doesn't? What if the sun reveals a world even more confusing than the cave?" },
          1: { philosopher: "Epicurus", challenge: "There is no shame in choosing peace. The philosophers who chase 'ultimate truth' often end up more tormented than those who simply live well within their means. Is truth worth your tranquility?" },
        },
        commentary: "The pain of enlightenment is a recurring theme across traditions. In Buddhism, the first noble truth — that life is suffering — is itself a painful realization. In science, paradigm shifts (Copernicus, Darwin, Einstein) were resisted precisely because they were uncomfortable.",
        choices: [
          { text: "Keep going — the pain of truth is better than the comfort of illusion", next: "the_sun" },
          { text: "Go back — this is too much, the shadows were easier to understand", next: "return_to_shadows" },
        ],
      },
      comfortable_chains: {
        title: "The Comfort of Shadows",
        scenario: "You stay. The shadows continue their dance. But now you know the chains are broken. You COULD turn around. The knowledge that you're choosing ignorance gnaws at you. Another prisoner whispers: 'I heard there's a world beyond the wall.' The other prisoners laugh at them.",
        counterarguments: {
          0: { philosopher: "Socrates", challenge: "Doubt is the beginning of wisdom. But it is only the beginning. To doubt and then act — that is philosophy. To doubt and remain still — that is merely anxiety." },
          1: { philosopher: "Machiavelli", challenge: "A pragmatic choice! Those who control the narrative control the cave. If everyone questions reality, the social order collapses. Sometimes the wise ruler maintains useful illusions — including for themselves." },
        },
        commentary: "The choice to remain in comfortable ignorance raises questions about epistemic responsibility — do we have a moral duty to seek truth? Or is there wisdom in accepting the limits of our knowledge?",
        choices: [
          { text: "Finally turn around — the doubt is worse than whatever truth awaits", next: "blinding_light" },
          { text: "Silence the doubter — if everyone questions reality, chaos follows", ending: "willful_ignorance" },
        ],
      },
      the_sun: {
        title: "The World Outside",
        scenario: "You emerge into the sunlight. Trees, rivers, stars — the real world is infinitely more complex and beautiful than shadows. You understand now that your entire previous existence was a pale imitation of truth. But your friends are still chained in the cave. Do you go back for them?",
        counterarguments: {
          0: { philosopher: "Confucius", challenge: "Noble! But remember — the teacher who returns too quickly, still blinded by the light, may stumble and frighten those they wish to help. Are you truly ready to guide others, or do you first need to understand what you've seen?" },
          1: { philosopher: "Ayn Rand", challenge: "Why sacrifice your newfound freedom for those who chose chains? You owe them nothing. The world outside is vast and full of possibility. Why return to a cave of people who will hate you for what you know?" },
        },
        commentary: "Plato believed the enlightened philosopher had a duty to return to the cave and govern — even though the prisoners would resist and possibly kill them. This mirrors the fate of Socrates himself, executed by Athens for 'corrupting the youth.'",
        choices: [
          { text: "Go back — I must free them and show them the truth", next: "return_mission" },
          { text: "Stay outside — they wouldn't believe me anyway, and I can't force enlightenment", ending: "solitary_enlightenment" },
        ],
      },
      return_to_shadows: {
        title: "Back in the Dark",
        scenario: "You return to your spot. But the shadows look different now. You can see their edges, their flatness. You know they're not real. You can never un-know this. The other prisoners seem content. You envy their ignorance. Was it better to never have turned around at all?",
        counterarguments: {
          0: { philosopher: "Albert Camus", challenge: "You've discovered the absurd — the gap between what you know and what you can bear. But Camus would say: embrace it. The struggle itself is enough to fill a heart. One must imagine Sisyphus happy." },
          1: { philosopher: "Dostoevsky", challenge: "The Grand Inquisitor would agree with you. He argued that humanity doesn't want freedom or truth — they want bread, miracles, and authority. Perhaps you've simply discovered what the Church has always known." },
        },
        commentary: "This scenario echoes the concept of 'bad faith' in existentialism — the act of deceiving oneself about one's own freedom. Jean-Paul Sartre argued that we are 'condemned to be free' and that pretending otherwise is the deepest form of self-deception.",
        choices: [
          { text: "Knowledge, even painful, is always better than ignorance", ending: "reluctant_philosopher" },
          { text: "Sometimes ignorance truly is bliss — I wish I never looked", ending: "tragic_awareness" },
        ],
      },
      return_mission: {
        title: "The Prophet's Dilemma",
        scenario: "You return to the cave. Your eyes, adjusted to sunlight, can barely see in the dark. The prisoners think you've gone blind. You try to describe the sun, trees, colors — they think you're insane. They threaten to kill anyone who tries to unchain them. The truth has made you an outcast.",
        counterarguments: {
          0: { philosopher: "Martin Luther King Jr.", challenge: "Persistence in the face of rejection is the mark of every great moral leader. But remember: it's not enough to tell people they're in chains. You must show them what freedom looks like in terms they can understand." },
          1: { philosopher: "Lao Tzu", challenge: "The river does not force the stone to move. It flows around it, and in time, the stone is shaped. Perhaps the wisest teacher is the one who creates conditions for discovery, rather than demanding it." },
        },
        commentary: "This final scenario mirrors the fate of countless truth-tellers throughout history: Socrates (executed), Galileo (imprisoned), Semmelweis (institutionalized). The pattern suggests that society's resistance to truth is not a bug but a feature of how communities maintain stability.",
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
        counterarguments: {
          0: { philosopher: "Robert Nozick", challenge: "Equality sounds fair behind the veil, but in practice it requires constant redistribution — taking from those who earned more to give to those who earned less. Is forced equality truly just, or is it just another form of tyranny?" },
          1: { philosopher: "John Rawls", challenge: "Freedom without equality means freedom for the strong to exploit the weak. Behind the veil, you'd be gambling that you'll be born strong. Are you sure that's a bet you want to make?" },
        },
        commentary: "John Rawls introduced the 'veil of ignorance' in A Theory of Justice (1971) as a thought experiment to determine fair principles of justice. His key insight: rational people behind the veil would choose to protect the worst-off members of society.",
        choices: [
          { text: "Maximum equality — no one should start life with unfair advantages", next: "healthcare" },
          { text: "Maximum freedom — let people rise or fall on their merits, with a basic safety net", next: "healthcare" },
        ],
      },
      healthcare: {
        title: "The Healthcare Question",
        scenario: "Now design the healthcare system. Remember: you might be born with a chronic illness that requires expensive treatment, or you might be perfectly healthy your entire life. You don't know.",
        counterarguments: {
          0: { philosopher: "Friedrich Hayek", challenge: "Universal systems sound compassionate, but they require massive bureaucracies that inevitably become inefficient. The waiting lists, the rationing, the political control over medical decisions — is that truly better care?" },
          1: { philosopher: "Amartya Sen", challenge: "Market incentives in healthcare create a perverse system where the sickest people — who need care most — are the least profitable to treat. When profit drives medicine, the poor die of curable diseases." },
        },
        commentary: "Healthcare is where the veil of ignorance becomes most visceral. The genetic lottery determines much of our health, and no amount of personal responsibility can prevent being born with a chronic condition.",
        choices: [
          { text: "Universal healthcare for all — no one should die because they can't afford treatment", next: "education" },
          { text: "Private healthcare with public option — quality care requires market incentives", next: "education" },
        ],
      },
      education: {
        title: "The Education System",
        scenario: "Design education. You might be born to professors or to parents who never finished school. You might be gifted or struggle with learning disabilities. You might live in a city or a remote village.",
        counterarguments: {
          0: { philosopher: "Milton Friedman", challenge: "Equal funding doesn't mean equal outcomes. A one-size-fits-all system fails gifted students and struggling students alike. Competition between schools drives innovation and quality — monopolies breed mediocrity." },
          1: { philosopher: "Paulo Freire", challenge: "School choice without equal resources is a cruel joke. The 'freedom to choose' means nothing when the best schools cost more than a family earns in a year. Choice without equity is just segregation with extra steps." },
        },
        commentary: "Education is often called 'the great equalizer,' but research consistently shows that the single strongest predictor of educational outcomes is the socioeconomic status of a child's parents — suggesting the system reproduces inequality rather than eliminating it.",
        choices: [
          { text: "Equal funding for all schools — every child deserves the same quality education", next: "criminal_justice" },
          { text: "School choice and competition — parents should pick what's best for their children", next: "criminal_justice" },
        ],
      },
      criminal_justice: {
        title: "Crime and Punishment",
        scenario: "Design the justice system. You might be falsely accused. You might be a victim of crime. You might grow up in conditions that make crime seem like the only option. You might be a judge.",
        counterarguments: {
          0: { philosopher: "Michel Foucault", challenge: "Rehabilitation sounds humane, but who decides what a 'rehabilitated' person looks like? The power to reshape someone's mind is the most dangerous power a state can hold. Today's rehabilitation is tomorrow's re-education camp." },
          1: { philosopher: "Cesare Beccaria", challenge: "Deterrence assumes rational actors, but most crime is committed in moments of desperation, addiction, or mental illness. Harsh punishment doesn't deter — it just fills prisons with the poor and the sick." },
        },
        commentary: "Behind the veil, you don't know if you'll be the victim, the accused, or the judge. This uncertainty tends to push people toward systems that protect the rights of the accused — because any of us could be wrongly convicted.",
        choices: [
          { text: "Focus on rehabilitation — people can change and deserve second chances", next: "final_question" },
          { text: "Focus on deterrence — strong consequences protect the innocent", next: "final_question" },
        ],
      },
      final_question: {
        title: "The Final Question",
        scenario: "Your society is designed. Before the veil lifts and you learn your place in it, you're asked one final question: would you rather live in the society you just designed, or take your chances in the real world as it exists today?",
        counterarguments: {
          0: { philosopher: "Karl Marx", challenge: "You trust your design — but who will implement it? Every utopian vision has been corrupted by the people who seized power to build it. The gap between theory and practice has swallowed every ideal society in history." },
          1: { philosopher: "Hannah Arendt", challenge: "Choosing the real world takes courage — but it also means accepting its injustices as tolerable. By choosing reality over your own design, you're saying the current system, with all its flaws, is 'good enough.' Is it?" },
        },
        commentary: "This final question tests whether you truly believe in the principles you chose, or whether they were abstract ideals that crumble when you face the possibility of living under them.",
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
  const [showCounterargument, setShowCounterargument] = useState<{ philosopher: string; challenge: string } | null>(null);
  const [showCommentary, setShowCommentary] = useState(false);
  const [choiceMade, setChoiceMade] = useState<number | null>(null);
  const { theme } = useTheme();
  const isStoic = theme === "original";
  const isOcean = theme === "ocean";

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
    if (selecting !== null || choiceMade !== null) return;
    setSelecting(choiceIndex);
    const choice = step.choices[choiceIndex];

    setTimeout(() => {
      setSelecting(null);
      setChoiceMade(choiceIndex);

      // Show counterargument if available
      const counter = step.counterarguments?.[choiceIndex];
      if (counter) {
        setShowCounterargument(counter);
      }
    }, 400);
  };

  const handleContinue = () => {
    if (choiceMade === null) return;
    const choice = step.choices[choiceMade];
    setShowCounterargument(null);
    setShowCommentary(false);
    setChoiceMade(null);

    if (choice.ending) {
      setEnding(choice.ending);
    } else if (choice.next) {
      setHistory([...history, currentStep]);
      setCurrentStep(choice.next);
    }
  };

  const handleRestart = () => {
    setCurrentStep("start");
    setEnding(null);
    setHistory([]);
    setSelecting(null);
    setShowCounterargument(null);
    setShowCommentary(false);
    setChoiceMade(null);
  };

  if (endingData) {
    return (
      <div className={`phone-container min-h-screen flex flex-col bg-background ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
        <div className="shrink-0 px-7 pt-6 pb-3">
          <button onClick={() => navigate("/home")} className="text-foreground/40 hover:text-foreground/60 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 px-7 flex flex-col justify-center pb-10 overflow-y-auto">
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
              <button onClick={handleRestart} className="flex-1 py-3.5 rounded-xl border border-border/40 text-foreground/60 text-sm font-light flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button onClick={() => navigate("/home")} className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Home</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`phone-container min-h-screen flex flex-col bg-background ${isStoic ? "stoic-grain" : ""} ${isOcean ? "ocean-shimmer" : ""}`}>
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
      <div className="flex-1 px-7 flex flex-col overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep + (choiceMade !== null ? "-chosen" : "")} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col">
            <h2 className="font-serif text-[28px] leading-[1.15] text-foreground/90 mb-3">{step.title}</h2>
            <p className="text-[14px] text-foreground/40 font-light leading-[1.7] mb-6">{step.scenario}</p>

            {/* Choices */}
            <div className="flex flex-col gap-3">
              {step.choices.map((choice, i) => (
                <motion.button key={i} onClick={() => handleChoice(i)} disabled={selecting !== null || choiceMade !== null}
                  className={`text-left rounded-2xl px-5 py-[18px] transition-all duration-300 border ${
                    choiceMade === i ? "bg-primary/15 border-primary/40 ring-1 ring-primary/20" :
                    choiceMade !== null ? "opacity-30 border-border/20" :
                    selecting === i ? "bg-primary/15 border-primary/30" :
                    "bg-card/30 border-border/40 hover:bg-card/50 hover:border-border/60"
                  }`}
                  whileTap={choiceMade === null ? { scale: 0.985 } : {}} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.06 }}>
                  <span className="text-[14px] text-foreground/70 font-light leading-relaxed">{choice.text}</span>
                </motion.button>
              ))}
            </div>

            {/* Counterargument */}
            <AnimatePresence>
              {showCounterargument && (
                <motion.div
                  initial={{ opacity: 0, y: 16, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="mt-5"
                >
                  <div className="glass-card rounded-2xl p-5 border-l-2 border-primary/40">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-primary/60" />
                      <span className="text-[12px] text-primary/70 tracking-[0.1em] uppercase font-medium">{showCounterargument.philosopher} challenges you</span>
                    </div>
                    <p className="text-[14px] text-foreground/60 font-light leading-[1.7] italic">"{showCounterargument.challenge}"</p>
                  </div>

                  {/* Commentary toggle */}
                  {step.commentary && !showCommentary && (
                    <motion.button
                      onClick={() => setShowCommentary(true)}
                      className="mt-3 text-[12px] text-foreground/30 hover:text-foreground/50 transition-colors flex items-center gap-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span>Read philosophical context</span>
                      <ChevronRight className="w-3 h-3" />
                    </motion.button>
                  )}

                  {/* Commentary */}
                  <AnimatePresence>
                    {showCommentary && step.commentary && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 px-4 py-3 bg-foreground/3 rounded-xl border border-border/20"
                      >
                        <p className="text-[12px] text-foreground/35 font-light leading-[1.7]">{step.commentary}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Continue button */}
                  <motion.button
                    onClick={handleContinue}
                    className="mt-5 w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* If no counterargument, auto-continue after choice */}
            {choiceMade !== null && !showCounterargument && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5"
              >
                <button
                  onClick={handleContinue}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <div className="pb-10" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClassicDilemma;
