export interface Arena {
  level: number;
  name: string;
  description: string;
  difficulty: string;
  challenge: string;
  passScore: number;
  rounds: number;
  tier: number;
  tierName: string;
}

export const tierNames = [
  "Novice", "Apprentice", "Adept", "Expert", "Master",
  "Grandmaster", "Sage", "Luminary", "Transcendent", "Immortal"
];

// Generate 100 arenas for any topic
export function getAllArenas(topicId: string): Arena[] {
  const arenas: Arena[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const tier = Math.ceil(i / 10);
    const tierName = tierNames[tier - 1];
    const roundsRequired = Math.min(3 + Math.floor(i / 20), 5); // 3-5 rounds
    const passScore = 50 + (i * 2); // Increases with level
    
    arenas.push({
      level: i,
      name: `${tierName} Challenge ${((i - 1) % 10) + 1}`,
      description: `A level ${i} debate challenge on ${topicId}`,
      difficulty: tierName,
      challenge: `Defend your position on ${topicId} with logical reasoning and evidence`,
      passScore,
      rounds: roundsRequired,
      tier,
      tierName
    });
  }
  
  return arenas;
}

export function getArenaByLevel(topicId: string, level: number): Arena | undefined {
  const arenas = getAllArenas(topicId);
  return arenas.find(a => a.level === level);
}

// Alias for compatibility
export const getArena = getArenaByLevel;
