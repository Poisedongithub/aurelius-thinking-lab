export interface Dilemma {
  id: string;
  scenario: string;
  optionA: string;
  optionB: string;
  compassion_vs_logic?: number;
  individual_vs_collective?: number;
  rules_vs_outcomes?: number;
  idealism_vs_pragmatism?: number;
  mercy_vs_justice?: number;
}

export interface MoralityResult {
  alignment: string;
  alignment_description: string;
  compassion_vs_logic: number;
  individual_vs_collective: number;
  rules_vs_outcomes: number;
  idealism_vs_pragmatism: number;
  mercy_vs_justice: number;
}

export const sampleDilemmas: Dilemma[] = [
  {
    id: "1",
    scenario: "You witness a friend cheating on an important exam. Do you report them?",
    optionA: "Report them to maintain academic integrity",
    optionB: "Stay silent to preserve the friendship",
    rules_vs_outcomes: 20,
    individual_vs_collective: -15
  },
  {
    id: "2",
    scenario: "A homeless person asks for money. You suspect they might use it for drugs.",
    optionA: "Give them money anyway - it's their choice",
    optionB: "Offer food instead to ensure proper use",
    compassion_vs_logic: 15,
    idealism_vs_pragmatism: -10
  }
];

export function pickDilemmas(count: number): Dilemma[] {
  // In a real app, this would fetch from API or larger dataset
  return sampleDilemmas.slice(0, Math.min(count, sampleDilemmas.length));
}

export function calculateMorality(answers: any[]): MoralityResult {
  // Simple calculation based on answers
  let compassion_vs_logic = 0;
  let individual_vs_collective = 0;
  let rules_vs_outcomes = 0;
  let idealism_vs_pragmatism = 0;
  let mercy_vs_justice = 0;

  answers.forEach((answer) => {
    if (answer.dilemma.compassion_vs_logic) {
      compassion_vs_logic += answer.choice === 'A' ? answer.dilemma.compassion_vs_logic : -answer.dilemma.compassion_vs_logic;
    }
    if (answer.dilemma.individual_vs_collective) {
      individual_vs_collective += answer.choice === 'A' ? answer.dilemma.individual_vs_collective : -answer.dilemma.individual_vs_collective;
    }
    if (answer.dilemma.rules_vs_outcomes) {
      rules_vs_outcomes += answer.choice === 'A' ? answer.dilemma.rules_vs_outcomes : -answer.dilemma.rules_vs_outcomes;
    }
    if (answer.dilemma.idealism_vs_pragmatism) {
      idealism_vs_pragmatism += answer.choice === 'A' ? answer.dilemma.idealism_vs_pragmatism : -answer.dilemma.idealism_vs_pragmatism;
    }
    if (answer.dilemma.mercy_vs_justice) {
      mercy_vs_justice += answer.choice === 'A' ? answer.dilemma.mercy_vs_justice : -answer.dilemma.mercy_vs_justice;
    }
  });

  // Determine alignment based on scores
  let alignment = 'Balanced Pragmatist';
  let alignment_description = 'You balance multiple perspectives in your moral reasoning.';

  if (Math.abs(compassion_vs_logic) > 50) {
    alignment = compassion_vs_logic > 0 ? 'Compassionate Idealist' : 'Logical Rationalist';
  } else if (Math.abs(rules_vs_outcomes) > 50) {
    alignment = rules_vs_outcomes > 0 ? 'Principled Deontologist' : 'Consequentialist Pragmatist';
  }

  return {
    alignment,
    alignment_description,
    compassion_vs_logic,
    individual_vs_collective,
    rules_vs_outcomes,
    idealism_vs_pragmatism,
    mercy_vs_justice
  };
}
