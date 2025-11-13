/**
 * useCallResults Hook
 * 管理通话结束后的结果获取（Summary 和 Goal Analysis）
 */

import { useState, useEffect, useCallback } from 'react';
import { generateCallSummary, analyzeGoalAchievement, waitForCallResults } from '../../services/olivia/retellService';
import type { TranscriptMessage, CallSummary, GoalAnalysis, CallResults, Goal } from '../../types/olivia/retell';

interface UseCallResultsOptions {
  callId: string | null;
  transcript: TranscriptMessage[];
  userId: string;
  userName: string;
  isCallEnded: boolean;
}

/**
 * 检测是否在开发模式（Mock 模式）
 */
const isDevelopmentMode = false; // 改为 false 强制使用生产模式

/**
 * Mock Data Generator
 */
function generateMockSummary(transcript: TranscriptMessage[]): CallSummary {
  return {
    data_quality: 'sufficient',
    meals: {
      breakfast: 'Oatmeal with berries',
      lunch: 'Salad with grilled chicken',
      dinner: 'Lean protein with vegetables, sometimes brown rice',
      snacks: 'Fruits, nuts, and occasionally yogurt',
    },
    exercise: 'Gym 3-4 times per week (cardio and light weights) | Daily 30-minute walks',
    sleep: '7-8 hours per night | Bedtime: 11 PM | Wake time: 7 AM',
    beverages: 'Water throughout the day | Morning coffee (1-2 cups) | Occasional green tea',
    lifestyle: {
      smoking: 'No smoking',
      alcohol: 'Occasionally on weekends, usually 1-2 glasses of wine',
      fast_food: 'Rarely, maybe once every 2 weeks',
    },
    mental_health: 'Generally good. Experiences occasional stress from work, manages it with exercise and meditation.',
    additional_notes: 'Patient maintains a balanced diet and active lifestyle. Good sleep hygiene practices.',
  };
}

function generateMockGoalAnalysis(transcript: TranscriptMessage[], userName: string): GoalAnalysis {
  return {
    goal: 'Maintain healthy blood glucose levels through balanced diet and regular exercise',
    alignment_score: 78,
    strengths: [
      'Eating a balanced diet with plenty of vegetables and lean protein',
      'Exercising regularly 3-4 times per week',
      'Maintaining good sleep hygiene with 7-8 hours per night',
      'Staying hydrated throughout the day',
      'Limiting fast food consumption',
    ],
    areas_for_improvement: [
      'Consider adding more whole grains to breakfast routine',
      'Could benefit from tracking post-meal glucose levels more consistently',
      'Explore stress management techniques beyond current practices',
      'Consider reducing weekend alcohol consumption slightly',
    ],
    recommendations: [
      'Continue with current exercise routine, perhaps add one more session of strength training',
      'Try meal prepping on weekends to ensure consistent healthy eating during busy weekdays',
      'Consider using a CGM app to track glucose patterns after different meals',
      'Experiment with meditation or yoga for additional stress management',
      'Schedule a follow-up in 2 weeks to review progress',
    ],
    summary: `${userName}, you're doing an excellent job managing your health! Your balanced diet and regular exercise routine are working well. Your alignment score of 78% shows strong progress toward your goals. Keep up the great work, and focus on the small improvements we discussed today.`,
  };
}

function generateMockGoals(): Goal[] {
  return [
    {
      id: 1,
      title: 'Consume more vegetables, aiming for 3-5 servings per day',
      status: 'IN PROGRESS',
      currentBehavior: "You are currently including broccoli and tomatoes in your lunch, but it's unclear if you're reaching the target of 3-5 servings daily.",
      recommendation: 'To help meet your vegetable goal, consider adding a serving of vegetables to your breakfast or dinner, such as spinach or bell peppers. This can be a delicious way to increase your intake!',
    },
    {
      id: 2,
      title: 'Increase cruciferous vegetable intake to one serving per day',
      status: 'NOT STARTED',
      recommendation: 'Try to include a cruciferous vegetable like broccoli or cauliflower in your meals a few times a week. Even small steps can lead to achieving this goal!',
    },
    {
      id: 3,
      title: 'Limit added fats to 2-3 servings of fats or oils per day, and limit added sugars to 5 or fewer servings per week',
      status: 'ACHIEVED',
      currentBehavior: 'You are currently meeting this goal by limiting added fats and sugars.',
      recommendation: 'Keep up the great work! Continue to check labels and be mindful of portion sizes to maintain this healthy habit.',
    },
  ];
}

export function useCallResults({
  callId,
  transcript,
  userId,
  userName,
  isCallEnded,
}: UseCallResultsOptions): CallResults {
  const [summary, setSummary] = useState<CallSummary | null>(null);
  const [goalAnalysis, setGoalAnalysis] = useState<GoalAnalysis | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  /**
   * 生成 Mock 结果（开发模式）
   */
  const generateMockResults = useCallback(async () => {
    if (!callId || !isCallEnded || transcript.length === 0) {
      return;
    }

    console.log('🎭 Mock: Generating mock results...');
    setIsLoading(true);
    setError(undefined);

    try {
      // 模拟 API 延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockSummary = generateMockSummary(transcript);
      const mockGoalAnalysis = generateMockGoalAnalysis(transcript, userName);
      const mockGoals = generateMockGoals();

      setSummary(mockSummary);
      setGoalAnalysis(mockGoalAnalysis);
      setGoals(mockGoals);

      console.log('✅ Mock results generated');
    } catch (err) {
      console.error('Error generating mock results:', err);
      setError('Failed to generate mock results');
    } finally {
      setIsLoading(false);
    }
  }, [callId, transcript, userName, isCallEnded]);

  /**
   * 生成真实结果（生产模式）
   */
  const generateResults = useCallback(async () => {
    if (!callId || !isCallEnded || transcript.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      // 并行发起生成请求
      const [summaryResult, goalResult] = await Promise.allSettled([
        generateCallSummary(callId, transcript),
        analyzeGoalAchievement(callId, transcript, userId, userName),
      ]);

      // 处理 Summary 结果
      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value);
      } else {
        console.error('Failed to generate summary:', summaryResult.reason);
      }

      // 处理 Goal Analysis 结果
      if (goalResult.status === 'fulfilled') {
        setGoalAnalysis(goalResult.value);
      } else {
        console.error('Failed to generate goal analysis:', goalResult.reason);
      }

      // 如果都失败了，设置错误
      if (summaryResult.status === 'rejected' && goalResult.status === 'rejected') {
        setError('Failed to generate results');
      }
    } catch (err) {
      console.error('Error generating results:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [callId, transcript, userId, userName, isCallEnded]);

  /**
   * 轮询结果（备用方案，仅生产模式）
   */
  const pollResults = useCallback(async () => {
    if (!callId || !isCallEnded || isDevelopmentMode) {
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const results = await waitForCallResults(callId, 30, 2000);
      
      if (results.summary) {
        setSummary(results.summary);
      }
      
      if (results.goalAnalysis) {
        setGoalAnalysis(results.goalAnalysis);
      }

      if (!results.summary && !results.goalAnalysis) {
        setError('Failed to retrieve results after polling');
      }
    } catch (err) {
      console.error('Error polling results:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [callId, isCallEnded]);

  /**
   * 当通话结束时，自动生成结果
   */
  useEffect(() => {
    if (isCallEnded && callId && transcript.length > 0 && !summary && !goalAnalysis && !isLoading) {
      // 开发模式：使用 Mock 数据
      if (isDevelopmentMode) {
        generateMockResults();
      } else {
        // 生产模式：调用真实 API
        generateResults();
      }
    }
  }, [isCallEnded, callId, transcript, summary, goalAnalysis, isLoading, generateMockResults, generateResults]);

  return {
    summary,
    goalAnalysis,
    goals,
    isLoading,
    error,
  };
}
