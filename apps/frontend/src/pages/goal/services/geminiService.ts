import { Habit, UserStats, Recommendation, HabitCategory } from '../types';

// Mock AI service - in production, this would call a real Gemini API
export async function getHealthRecommendation(
  stats: UserStats,
  habits: Habit[]
): Promise<Recommendation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const recommendations: Recommendation[] = [];

  // Example recommendation logic
  if (stats.dailyProgress < 50) {
    recommendations.push({
      id: 'rec-motivation-1',
      title: 'Keep Going!',
      content: `You're at ${stats.dailyProgress}% today. Small steps lead to big changes. Try checking in with one habit now!`,
      kind: 'ENCOURAGEMENT',
      category: HabitCategory.MINDFULNESS
    });
  }

  // Suggest new habit if doing well
  if (stats.dailyProgress >= 80 && habits.length < 5) {
    recommendations.push({
      id: 'rec-habit-1',
      title: 'Add a Mindfulness Practice',
      content: 'Since you\'re crushing your current goals, consider adding 5 minutes of meditation.',
      kind: 'HABIT_SUGGESTION',
      category: HabitCategory.MINDFULNESS,
      habitData: {
        frequency: 5,
        impact: 'HIGH'
      }
    });
  }

  // Check for missing categories
  const categories = new Set(habits.map(h => h.category));
  if (!categories.has(HabitCategory.SLEEP)) {
    recommendations.push({
      id: 'rec-habit-sleep',
      title: 'Improve Your Sleep',
      content: 'Good sleep helps regulate blood sugar. Try dimming lights 1 hour before bed.',
      kind: 'HABIT_SUGGESTION',
      category: HabitCategory.SLEEP,
      habitData: {
        frequency: 7,
        impact: 'HIGH'
      }
    });
  }

  return recommendations;
}
