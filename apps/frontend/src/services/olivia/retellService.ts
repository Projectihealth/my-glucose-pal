/**
 * Retell Service - API 服务层
 * 负责与 Minerva 后端通信
 */

import axios from 'axios';
import type { WebCallResponse, TranscriptMessage, CallSummary, GoalAnalysis } from '../../types/olivia/retell';

// 使用空字符串作为默认值，这样请求会走相对路径，被 Vite 代理到后端
const MINERVA_BACKEND_URL = import.meta.env.VITE_MINERVA_BACKEND_URL || '';

/**
 * 创建 Web Call
 */
export async function createWebCall(userId: string): Promise<WebCallResponse> {
  try {
    const response = await axios.post(
      `${MINERVA_BACKEND_URL}/intake/create-web-call`,
      { user_id: userId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to create web call:', error);
    throw new Error('Failed to create web call');
  }
}

/**
 * 保存通话数据的完整参数
 */
export interface SaveCallDataParams {
  userId: string;
  callId: string;
  agentId: string;
  callStatus?: string;
  callType?: string;
  startTimestamp: string;
  endTimestamp: string;
  callDuration: number;
  transcript: string;
  transcriptObject: TranscriptMessage[];
  callCost?: {
    total: number;
    currency: string;
    breakdown?: Record<string, number>;
  };
  disconnectionReason?: string;
  recordingUrl?: string;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 保存通话数据（通话结束后调用）
 */
export async function saveCallData(params: SaveCallDataParams): Promise<void> {
  try {
    const payload = {
      user_id: params.userId,
      call_id: params.callId,
      agent_id: params.agentId,
      call_status: params.callStatus || 'ended',
      call_type: params.callType || 'web_call',
      start_timestamp: params.startTimestamp,
      end_timestamp: params.endTimestamp,
      call_duration: params.callDuration,
      transcript: params.transcript,
      transcript_object: params.transcriptObject,
      call_cost: params.callCost,
      disconnection_reason: params.disconnectionReason,
      recording_url: params.recordingUrl,
      properties: params.properties,
      metadata: params.metadata,
    };

    console.log('💾 Saving call data to database:', {
      callId: params.callId,
      duration: params.callDuration,
      messages: params.transcriptObject.length,
    });

    await axios.post(
      `${MINERVA_BACKEND_URL}/intake/save-call-data`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Call data saved successfully');
  } catch (error) {
    console.error('❌ Failed to save call data:', error);
    throw new Error('Failed to save call data');
  }
}

/**
 * 生成通话摘要
 */
export async function generateCallSummary(
  callId: string,
  transcript: TranscriptMessage[]
): Promise<CallSummary> {
  try {
    const response = await axios.post(
      `${MINERVA_BACKEND_URL}/intake/generate-summary`,
      {
        call_id: callId,
        transcript: transcript,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.summary;
  } catch (error) {
    console.error('Failed to generate call summary:', error);
    throw new Error('Failed to generate call summary');
  }
}

/**
 * 获取通话摘要（轮询直到生成完成）
 */
export async function getCallSummary(callId: string): Promise<CallSummary | null> {
  try {
    const response = await axios.get(
      `${MINERVA_BACKEND_URL}/intake/get-summary/${callId}`
    );

    if (response.data.has_summary) {
      return response.data.summary;
    }
    return null;
  } catch (error) {
    console.error('Failed to get call summary:', error);
    return null;
  }
}

/**
 * 分析目标达成情况
 */
export async function analyzeGoalAchievement(
  callId: string,
  transcript: TranscriptMessage[],
  userId: string,
  userName: string
): Promise<GoalAnalysis> {
  try {
    const response = await axios.post(
      `${MINERVA_BACKEND_URL}/intake/analyze-goal-achievement`,
      {
        call_id: callId,
        transcript: transcript,
        patient_id: userId,
        patient_name: userName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to analyze goal achievement:', error);
    throw new Error('Failed to analyze goal achievement');
  }
}

/**
 * 获取目标分析结果（轮询）
 */
export async function getGoalAnalysis(callId: string): Promise<GoalAnalysis | null> {
  try {
    const response = await axios.get(
      `${MINERVA_BACKEND_URL}/intake/get-goal-analysis/${callId}`
    );

    return response.data.goal_analysis;
  } catch (error) {
    console.error('Failed to get goal analysis:', error);
    return null;
  }
}

/**
 * 轮询直到摘要和目标分析都生成完成
 */
export async function waitForCallResults(
  callId: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<{ summary: CallSummary | null; goalAnalysis: GoalAnalysis | null }> {
  let attempts = 0;
  let summary: CallSummary | null = null;
  let goalAnalysis: GoalAnalysis | null = null;

  while (attempts < maxAttempts) {
    // 尝试获取摘要
    if (!summary) {
      summary = await getCallSummary(callId);
    }

    // 尝试获取目标分析
    if (!goalAnalysis) {
      goalAnalysis = await getGoalAnalysis(callId);
    }

    // 如果两个都获取到了，返回
    if (summary && goalAnalysis) {
      return { summary, goalAnalysis };
    }

    // 等待后重试
    attempts++;
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  return { summary, goalAnalysis };
}

