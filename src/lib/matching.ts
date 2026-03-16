export interface Habits {
  sleep_cycle: string;
  food_pref: string;
  study_habits: string;
  smoking_pref: string;
}

export const HABIT_WEIGHTS: Record<keyof Habits, number> = {
  sleep_cycle: 3,
  food_pref: 2,
  study_habits: 3,
  smoking_pref: 5, // High priority for safety/comfort
};

export function calculateCompatibilityScore(h1: Habits, h2: Habits): number {
  let totalWeightedMatch = 0;
  let totalPossibleWeight = 0;

  (Object.keys(HABIT_WEIGHTS) as Array<keyof Habits>).forEach((key) => {
    const weight = HABIT_WEIGHTS[key];
    totalPossibleWeight += weight;
    
    if (h1[key] === h2[key]) {
      totalWeightedMatch += weight;
    }
  });

  if (totalPossibleWeight === 0) return 0;
  
  const score = (totalWeightedMatch / totalPossibleWeight) * 100;
  return Math.round(score);
}
