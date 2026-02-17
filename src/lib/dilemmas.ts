export interface DilemmaChoice {
  text: string;
  weights: {
    compassion_vs_logic?: number;
    individual_vs_collective?: number;
    rules_vs_outcomes?: number;
    idealism_vs_pragmatism?: number;
    mercy_vs_justice?: number;
  };
}

export interface Dilemma {
  id: string;
  title: string;
  category: string;
  scenario: string;
  choices: DilemmaChoice[];
}

export interface MoralityResult {
  alignment: string;
  alignmentDescription: string;
  spectrums: {
    compassion_vs_logic: number;
    individual_vs_collective: number;
    rules_vs_outcomes: number;
    idealism_vs_pragmatism: number;
    mercy_vs_justice: number;
  };
}

export const allDilemmas: Dilemma[] = [
  {
    id: "d1", title: "The Cheating Friend", category: "Ethics",
    scenario: "You witness your best friend cheating on an important exam that determines scholarship eligibility. Reporting them would end their academic career, but staying silent means another deserving student loses the scholarship.",
    choices: [
      { text: "Report them — academic integrity and fairness to others must come first", weights: { rules_vs_outcomes: 0.3, individual_vs_collective: 0.2, mercy_vs_justice: -0.3 } },
      { text: "Stay silent — loyalty to your friend matters more than abstract rules", weights: { rules_vs_outcomes: -0.3, compassion_vs_logic: 0.2, mercy_vs_justice: 0.3 } },
    ],
  },
  {
    id: "d2", title: "The Homeless Request", category: "Compassion",
    scenario: "A homeless person asks you for money. You suspect they might use it for substances, but they look genuinely hungry and cold. You have enough to spare.",
    choices: [
      { text: "Give them money — it's their right to decide how to use it", weights: { compassion_vs_logic: 0.3, idealism_vs_pragmatism: 0.2 } },
      { text: "Offer to buy them food instead — ensure the help is effective", weights: { compassion_vs_logic: -0.2, idealism_vs_pragmatism: -0.3 } },
    ],
  },
  {
    id: "d3", title: "The Whistleblower", category: "Justice",
    scenario: "You discover your company is illegally dumping toxic waste. Reporting it would shut down the factory, costing 500 people their jobs in a town with no other employers.",
    choices: [
      { text: "Report it — environmental damage affects thousands more in the long run", weights: { rules_vs_outcomes: 0.2, individual_vs_collective: 0.3, idealism_vs_pragmatism: 0.2 } },
      { text: "Try to fix it quietly from within — protect the workers while solving the problem", weights: { rules_vs_outcomes: -0.2, idealism_vs_pragmatism: -0.3, compassion_vs_logic: 0.1 } },
    ],
  },
  {
    id: "d4", title: "The Dying Patient", category: "Medical Ethics",
    scenario: "A terminally ill patient begs you, their doctor, to end their suffering. It's illegal in your jurisdiction, but they have weeks of agony ahead. Their family is divided.",
    choices: [
      { text: "Honor their wish — personal autonomy over suffering is paramount", weights: { mercy_vs_justice: 0.4, compassion_vs_logic: 0.2, rules_vs_outcomes: -0.2 } },
      { text: "Follow the law — you cannot make that decision regardless of compassion", weights: { mercy_vs_justice: -0.3, rules_vs_outcomes: 0.3, compassion_vs_logic: -0.2 } },
    ],
  },
  {
    id: "d5", title: "The Stolen Medicine", category: "Moral Conflict",
    scenario: "Your child is dying from a rare disease. The only cure costs $100,000 and the pharmaceutical company refuses to lower the price. You could steal it from the warehouse tonight.",
    choices: [
      { text: "Steal the medicine — your child's life outweighs property rights", weights: { compassion_vs_logic: 0.3, rules_vs_outcomes: -0.3, individual_vs_collective: -0.2 } },
      { text: "Find another way — breaking the law sets a dangerous precedent", weights: { rules_vs_outcomes: 0.3, idealism_vs_pragmatism: -0.2, compassion_vs_logic: -0.2 } },
    ],
  },
  {
    id: "d6", title: "The Lifeboat", category: "Survival Ethics",
    scenario: "A lifeboat holds 10 people but can only safely carry 8. Two must go overboard or everyone drowns. One of the 10 is a doctor who could save many lives on shore.",
    choices: [
      { text: "Draw lots fairly — every life has equal value regardless of utility", weights: { mercy_vs_justice: -0.2, individual_vs_collective: -0.2, rules_vs_outcomes: 0.3 } },
      { text: "Prioritize the doctor — maximizing future lives saved is the rational choice", weights: { compassion_vs_logic: -0.3, rules_vs_outcomes: -0.3, individual_vs_collective: 0.2 } },
    ],
  },
  {
    id: "d7", title: "The Promise to the Dead", category: "Honor",
    scenario: "Your dying friend asks you to destroy their private journals. After their death, you discover the journals contain evidence that could exonerate an innocent person in prison.",
    choices: [
      { text: "Break the promise — freeing an innocent person is more important", weights: { rules_vs_outcomes: -0.3, mercy_vs_justice: -0.2, individual_vs_collective: 0.3 } },
      { text: "Keep the promise — a vow to the dead is sacred and trust matters", weights: { rules_vs_outcomes: 0.3, idealism_vs_pragmatism: 0.3, individual_vs_collective: -0.2 } },
    ],
  },
  {
    id: "d8", title: "The AI Dilemma", category: "Technology",
    scenario: "You've created an AI that shows signs of consciousness. Shutting it down would advance your research, but if it's truly conscious, you'd be ending a sentient being.",
    choices: [
      { text: "Keep it running — if there's any chance it's conscious, we must protect it", weights: { compassion_vs_logic: 0.3, idealism_vs_pragmatism: 0.3, mercy_vs_justice: 0.2 } },
      { text: "Shut it down — we can't let uncertainty halt scientific progress", weights: { compassion_vs_logic: -0.3, idealism_vs_pragmatism: -0.3 } },
    ],
  },
  {
    id: "d9", title: "The Inherited Fortune", category: "Wealth",
    scenario: "You inherit $10 million from a relative who earned it through exploitative labor practices decades ago. You could keep it or donate it to the communities that were harmed.",
    choices: [
      { text: "Donate it all — the money was earned through injustice and should be returned", weights: { mercy_vs_justice: -0.3, idealism_vs_pragmatism: 0.3, individual_vs_collective: 0.3 } },
      { text: "Keep it and use it well — you're not responsible for past wrongs, but can do good now", weights: { idealism_vs_pragmatism: -0.3, individual_vs_collective: -0.2, compassion_vs_logic: -0.1 } },
    ],
  },
  {
    id: "d10", title: "The Truth About Santa", category: "Honesty",
    scenario: "Your 6-year-old asks if Santa is real. They're the last kid in class who still believes. Telling the truth will crush their magical worldview. Lying preserves their innocence.",
    choices: [
      { text: "Tell the truth gently — honesty builds trust even when it hurts", weights: { compassion_vs_logic: -0.2, idealism_vs_pragmatism: -0.2, rules_vs_outcomes: 0.1 } },
      { text: "Keep the magic alive — childhood wonder is precious and fleeting", weights: { compassion_vs_logic: 0.2, idealism_vs_pragmatism: 0.3, mercy_vs_justice: 0.1 } },
    ],
  },
  {
    id: "d11", title: "The Surveillance State", category: "Freedom",
    scenario: "A new government program would eliminate 90% of violent crime by monitoring all citizens' communications. Privacy would be gone, but streets would be safe.",
    choices: [
      { text: "Reject it — freedom and privacy are non-negotiable rights", weights: { individual_vs_collective: -0.4, rules_vs_outcomes: 0.2, idealism_vs_pragmatism: 0.3 } },
      { text: "Accept it — safety for the many outweighs privacy concerns", weights: { individual_vs_collective: 0.4, rules_vs_outcomes: -0.2, idealism_vs_pragmatism: -0.3 } },
    ],
  },
  {
    id: "d12", title: "The Genetic Edit", category: "Science",
    scenario: "You can edit your unborn child's genes to eliminate a hereditary disease. But the technology also allows enhancing intelligence and appearance. Where do you draw the line?",
    choices: [
      { text: "Only fix the disease — enhancement crosses into playing God", weights: { rules_vs_outcomes: 0.2, idealism_vs_pragmatism: 0.2, compassion_vs_logic: 0.1 } },
      { text: "Enhance everything available — giving your child every advantage is a parent's duty", weights: { idealism_vs_pragmatism: -0.3, rules_vs_outcomes: -0.2, individual_vs_collective: -0.2 } },
    ],
  },
  {
    id: "d13", title: "The Refugee Crisis", category: "Society",
    scenario: "Your small town can absorb 100 refugees, but 1,000 are at the border. Taking all would overwhelm schools, hospitals, and housing. Turning away 900 means they face danger.",
    choices: [
      { text: "Take all 1,000 — we can't choose who deserves safety", weights: { compassion_vs_logic: 0.3, idealism_vs_pragmatism: 0.3, individual_vs_collective: 0.2 } },
      { text: "Take 100 responsibly — helping some well is better than failing everyone", weights: { compassion_vs_logic: -0.2, idealism_vs_pragmatism: -0.3, individual_vs_collective: -0.1 } },
    ],
  },
  {
    id: "d14", title: "The Forgiveness Test", category: "Personal",
    scenario: "The drunk driver who killed your sibling 5 years ago has served their sentence and now asks for your forgiveness. They seem genuinely remorseful and have changed their life.",
    choices: [
      { text: "Forgive them — holding onto anger only poisons your own soul", weights: { mercy_vs_justice: 0.4, compassion_vs_logic: 0.3 } },
      { text: "Refuse — some acts are unforgivable and forgiveness cheapens the loss", weights: { mercy_vs_justice: -0.4, rules_vs_outcomes: 0.2 } },
    ],
  },
  {
    id: "d15", title: "The Autonomous Car", category: "Technology",
    scenario: "An autonomous car must choose: swerve left and kill 1 pedestrian, or continue straight and kill 3 passengers. You're programming the decision algorithm.",
    choices: [
      { text: "Save the most lives — the car should minimize total deaths", weights: { individual_vs_collective: 0.3, compassion_vs_logic: -0.3, rules_vs_outcomes: -0.2 } },
      { text: "Protect the passengers — the car owes a duty to those inside it", weights: { individual_vs_collective: -0.3, rules_vs_outcomes: 0.2, compassion_vs_logic: 0.1 } },
    ],
  },
  {
    id: "d16", title: "The White Lie", category: "Honesty",
    scenario: "Your friend spent months painting a portrait of you as a gift. It's objectively terrible, but they're beaming with pride. They ask what you honestly think.",
    choices: [
      { text: "Be honest with kindness — they deserve real feedback to grow", weights: { compassion_vs_logic: -0.2, rules_vs_outcomes: 0.1, idealism_vs_pragmatism: -0.2 } },
      { text: "Say you love it — their feelings and effort matter more than art criticism", weights: { compassion_vs_logic: 0.3, mercy_vs_justice: 0.2, idealism_vs_pragmatism: 0.2 } },
    ],
  },
  {
    id: "d17", title: "The Time Traveler", category: "Philosophy",
    scenario: "You can travel back in time and prevent a historical atrocity, but doing so would erase the existence of millions of people alive today who were born as a consequence of those events.",
    choices: [
      { text: "Go back — preventing suffering takes priority over hypothetical future lives", weights: { idealism_vs_pragmatism: 0.3, rules_vs_outcomes: -0.3, mercy_vs_justice: 0.2 } },
      { text: "Stay — you cannot erase existing people, even to prevent past horrors", weights: { rules_vs_outcomes: 0.2, idealism_vs_pragmatism: -0.3, individual_vs_collective: -0.2 } },
    ],
  },
  {
    id: "d18", title: "The Organ Lottery", category: "Justice",
    scenario: "A policy is proposed where healthy citizens are randomly selected to donate organs to save 5 dying patients each. It would save millions of lives per year.",
    choices: [
      { text: "Reject it — bodily autonomy is an absolute right that cannot be violated", weights: { individual_vs_collective: -0.4, rules_vs_outcomes: 0.3, mercy_vs_justice: 0.2 } },
      { text: "Accept it — saving 5 lives for every 1 is the mathematically moral choice", weights: { individual_vs_collective: 0.4, rules_vs_outcomes: -0.3, compassion_vs_logic: -0.3 } },
    ],
  },
  {
    id: "d19", title: "The Plagiarism Discovery", category: "Integrity",
    scenario: "You discover that your mentor — who got you your career — plagiarized their most famous work. Exposing them would destroy their legacy and your career.",
    choices: [
      { text: "Expose the truth — intellectual honesty is the foundation of knowledge", weights: { rules_vs_outcomes: 0.3, individual_vs_collective: 0.2, mercy_vs_justice: -0.3 } },
      { text: "Stay quiet — the ideas still helped people, and destroying two careers helps no one", weights: { idealism_vs_pragmatism: -0.3, mercy_vs_justice: 0.2, rules_vs_outcomes: -0.2 } },
    ],
  },
  {
    id: "d20", title: "The Last Antibiotic", category: "Medical Ethics",
    scenario: "There's one dose of a rare antibiotic left. Two patients need it: a 70-year-old Nobel laureate working on a cancer cure, and a 5-year-old child with their whole life ahead.",
    choices: [
      { text: "Give it to the child — every person deserves an equal chance at life", weights: { compassion_vs_logic: 0.3, rules_vs_outcomes: 0.2, mercy_vs_justice: 0.2 } },
      { text: "Give it to the scientist — their work could save millions more", weights: { compassion_vs_logic: -0.3, individual_vs_collective: 0.3, rules_vs_outcomes: -0.2 } },
    ],
  },
  {
    id: "d21", title: "The Perfect Crime", category: "Morality",
    scenario: "You could steal $1 million from a corrupt billionaire with zero chance of getting caught. The money would fund a children's hospital in a poor community.",
    choices: [
      { text: "Do it — the greater good justifies bending rules against the corrupt", weights: { rules_vs_outcomes: -0.3, idealism_vs_pragmatism: -0.2, mercy_vs_justice: 0.2 } },
      { text: "Don't — stealing is wrong regardless of the target or the cause", weights: { rules_vs_outcomes: 0.4, idealism_vs_pragmatism: 0.2, mercy_vs_justice: -0.1 } },
    ],
  },
  {
    id: "d22", title: "The Memory Eraser", category: "Identity",
    scenario: "A pill can erase your most painful memory — the death of a loved one. You'd feel better, but you'd lose the lessons and growth that came from that grief.",
    choices: [
      { text: "Take it — life is short and suffering without purpose is pointless", weights: { idealism_vs_pragmatism: -0.3, compassion_vs_logic: 0.2, individual_vs_collective: -0.2 } },
      { text: "Keep the memory — pain shapes who we are and gives depth to joy", weights: { idealism_vs_pragmatism: 0.3, compassion_vs_logic: -0.1, rules_vs_outcomes: 0.1 } },
    ],
  },
  {
    id: "d23", title: "The Informant", category: "Loyalty",
    scenario: "Your brother is involved in a nonviolent crime ring. The police offer you immunity and witness protection if you testify. Your family would never forgive you.",
    choices: [
      { text: "Testify — the law applies to everyone, even family", weights: { rules_vs_outcomes: 0.3, individual_vs_collective: 0.2, mercy_vs_justice: -0.3 } },
      { text: "Refuse — family loyalty is sacred and you won't betray blood", weights: { rules_vs_outcomes: -0.3, compassion_vs_logic: 0.2, mercy_vs_justice: 0.3 } },
    ],
  },
  {
    id: "d24", title: "The Simulation", category: "Reality",
    scenario: "You're offered proof that we live in a simulation. Knowing the truth would shatter your sense of meaning, but ignorance feels like a cage. Do you look?",
    choices: [
      { text: "Look — truth is always better than comfortable illusion", weights: { idealism_vs_pragmatism: -0.2, compassion_vs_logic: -0.3, rules_vs_outcomes: 0.1 } },
      { text: "Don't look — meaning matters more than metaphysical truth", weights: { idealism_vs_pragmatism: 0.3, compassion_vs_logic: 0.2, individual_vs_collective: -0.1 } },
    ],
  },
  {
    id: "d25", title: "The Animal Test", category: "Science",
    scenario: "Testing a new drug on 100 animals would likely cure a disease affecting 10 million humans. The animals would suffer and die. No alternative testing method exists.",
    choices: [
      { text: "Allow the testing — human lives must take priority in this calculus", weights: { compassion_vs_logic: -0.3, individual_vs_collective: 0.2, rules_vs_outcomes: -0.2 } },
      { text: "Refuse — we have no right to inflict suffering on other sentient beings", weights: { compassion_vs_logic: 0.3, idealism_vs_pragmatism: 0.3, mercy_vs_justice: 0.2 } },
    ],
  },
  {
    id: "d26", title: "The Drowning Strangers", category: "Obligation",
    scenario: "You're walking past a pond where two strangers are drowning. You can only save one. One is a child, the other is a pregnant woman.",
    choices: [
      { text: "Save the child — they're the most vulnerable and helpless", weights: { compassion_vs_logic: 0.2, mercy_vs_justice: 0.2, rules_vs_outcomes: 0.1 } },
      { text: "Save the pregnant woman — you'd be saving two lives", weights: { compassion_vs_logic: -0.2, rules_vs_outcomes: -0.2, individual_vs_collective: 0.3 } },
    ],
  },
  {
    id: "d27", title: "The Censored Book", category: "Freedom",
    scenario: "A brilliant novel contains ideas that could radicalize vulnerable readers. Banning it would prevent harm but also suppress important artistic expression.",
    choices: [
      { text: "Don't ban it — free expression must be protected even when dangerous", weights: { individual_vs_collective: -0.3, rules_vs_outcomes: 0.2, idealism_vs_pragmatism: 0.3 } },
      { text: "Ban it — preventing real harm to real people outweighs abstract principles", weights: { individual_vs_collective: 0.3, rules_vs_outcomes: -0.2, idealism_vs_pragmatism: -0.3 } },
    ],
  },
  {
    id: "d28", title: "The Immortality Offer", category: "Existence",
    scenario: "You're offered immortality, but you must watch everyone you love grow old and die, forever. You'd accumulate infinite wisdom but infinite grief.",
    choices: [
      { text: "Accept — the chance to learn, grow, and help humanity forever is worth the pain", weights: { idealism_vs_pragmatism: -0.2, individual_vs_collective: 0.2, compassion_vs_logic: -0.2 } },
      { text: "Decline — a finite life shared with loved ones is more meaningful than eternity alone", weights: { compassion_vs_logic: 0.3, idealism_vs_pragmatism: 0.3, individual_vs_collective: -0.2 } },
    ],
  },
  {
    id: "d29", title: "The Confession", category: "Guilt",
    scenario: "20 years ago you accidentally caused a fire that destroyed a building. No one was hurt, but someone else was wrongly convicted. They served 5 years. Confessing now would ruin your family.",
    choices: [
      { text: "Confess — an innocent person suffered for your mistake and deserves justice", weights: { rules_vs_outcomes: 0.3, mercy_vs_justice: -0.3, individual_vs_collective: 0.2 } },
      { text: "Stay silent — the sentence is served, and confessing now only creates more victims", weights: { mercy_vs_justice: 0.2, idealism_vs_pragmatism: -0.3, rules_vs_outcomes: -0.2 } },
    ],
  },
  {
    id: "d30", title: "The Utopia Machine", category: "Philosophy",
    scenario: "A machine can create a perfect virtual utopia where everyone is happy, but it's not real. Would you plug in humanity, ending all real suffering but also all authentic experience?",
    choices: [
      { text: "Don't plug in — authentic struggle and real experience define what it means to be human", weights: { idealism_vs_pragmatism: 0.4, compassion_vs_logic: -0.2, individual_vs_collective: -0.2 } },
      { text: "Plug in — if suffering ends and happiness is real to those experiencing it, reality doesn't matter", weights: { idealism_vs_pragmatism: -0.4, compassion_vs_logic: 0.3, individual_vs_collective: 0.2 } },
    ],
  },
];

export function pickDilemmas(count: number): Dilemma[] {
  const shuffled = [...allDilemmas].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function calculateMorality(
  answers: { dilemmaId: string; choiceIndex: number }[],
  questions: Dilemma[]
): MoralityResult {
  const spectrums = {
    compassion_vs_logic: 0,
    individual_vs_collective: 0,
    rules_vs_outcomes: 0,
    idealism_vs_pragmatism: 0,
    mercy_vs_justice: 0,
  };

  answers.forEach((answer) => {
    const dilemma = questions.find((q) => q.id === answer.dilemmaId);
    if (!dilemma) return;
    const choice = dilemma.choices[answer.choiceIndex];
    if (!choice) return;
    const w = choice.weights;
    if (w.compassion_vs_logic) spectrums.compassion_vs_logic += w.compassion_vs_logic;
    if (w.individual_vs_collective) spectrums.individual_vs_collective += w.individual_vs_collective;
    if (w.rules_vs_outcomes) spectrums.rules_vs_outcomes += w.rules_vs_outcomes;
    if (w.idealism_vs_pragmatism) spectrums.idealism_vs_pragmatism += w.idealism_vs_pragmatism;
    if (w.mercy_vs_justice) spectrums.mercy_vs_justice += w.mercy_vs_justice;
  });

  // Clamp values between -1 and 1
  for (const key of Object.keys(spectrums) as (keyof typeof spectrums)[]) {
    spectrums[key] = Math.max(-1, Math.min(1, spectrums[key]));
  }

  // Determine alignment
  const dominant = Object.entries(spectrums).reduce((a, b) =>
    Math.abs(b[1]) > Math.abs(a[1]) ? b : a
  );

  const alignments: Record<string, [string, string, string, string]> = {
    compassion_vs_logic: ["Empathic Guardian", "You lead with your heart, prioritizing emotional connection and care for others.", "Analytical Sage", "You approach moral questions through reason and logic, seeking objective truth."],
    individual_vs_collective: ["Communal Steward", "You believe the needs of the many should guide moral decisions.", "Sovereign Individual", "You champion personal rights and individual freedom above collective demands."],
    rules_vs_outcomes: ["Principled Idealist", "You believe in following moral rules regardless of consequences.", "Pragmatic Consequentialist", "You judge actions by their outcomes, not by adherence to abstract rules."],
    idealism_vs_pragmatism: ["Visionary Idealist", "You hold fast to principles and believe in a better world worth striving for.", "Grounded Realist", "You deal with the world as it is, making practical choices that work."],
    mercy_vs_justice: ["Merciful Healer", "You believe in forgiveness, second chances, and the redemptive power of compassion.", "Righteous Judge", "You believe in accountability, fairness, and that justice must be served."],
  };

  let alignment = "Balanced Philosopher";
  let alignmentDescription = "You weigh all perspectives equally, finding wisdom in nuance and balance.";

  if (Math.abs(dominant[1]) > 0.15) {
    const [key, value] = dominant;
    const labels = alignments[key];
    if (labels) {
      if (value > 0) {
        alignment = labels[0];
        alignmentDescription = labels[1];
      } else {
        alignment = labels[2];
        alignmentDescription = labels[3];
      }
    }
  }

  return { alignment, alignmentDescription, spectrums };
}
