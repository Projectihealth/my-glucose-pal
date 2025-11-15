/**
 * useRetellCall Hook
 * 管理 Retell Web Call 的完整生命周期
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createWebCall, saveCallData, type SaveCallDataParams } from '../../services/olivia/retellService';
import type { TranscriptMessage, CallStatus } from '../../types/olivia/retell';

interface UseRetellCallResult {
  callStatus: CallStatus;
  transcript: TranscriptMessage[];
  isCallActive: boolean;
  isAgentSpeaking: boolean;
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  duration: number;
  callId: string | null;
}

// 声明全局 RetellWebClient 类型
declare global {
  interface Window {
    RetellWebClient: any;
  }
}

/**
 * 检测是否在开发模式（Mock 模式）
 * 设置为 false 以使用真实的 Retell API
 */
const isDevelopmentMode = false; // 改为 false 强制使用生产模式

/**
 * Mock Retell Client（用于开发测试）
 */
class MockRetellClient {
  private listeners: Map<string, Function[]> = new Map();
  private isCallActive = false;

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  async startCall(config: { accessToken: string }) {
    console.log('🎭 Mock: Starting call with token:', config.accessToken.slice(0, 20) + '...');
    this.isCallActive = true;
    
    // 模拟连接延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.emit('call_started');
    
    // 模拟 Agent 开始说话
    setTimeout(() => {
      this.emit('agent_start_talking');
      setTimeout(() => {
        this.emit('update', {
          transcript: [
            {
              role: 'agent',
              content: 'Hello! I\'m Olivia, your health coach. How are you feeling today?',
              timestamp: Date.now(),
            }
          ]
        });
        this.emit('agent_stop_talking');
      }, 2000);
    }, 1500);
  }

  stopCall() {
    console.log('🎭 Mock: Stopping call');
    this.isCallActive = false;
    this.emit('call_ended');
  }

  mute() {
    console.log('🎭 Mock: Muted');
  }

  unmute() {
    console.log('🎭 Mock: Unmuted');
  }
}

/**
 * 加载 Retell Web Client SDK
 * 在开发模式下使用 Mock Client
 */
async function loadRetellSDK(): Promise<boolean> {
  // 开发模式：使用 Mock Client
  if (isDevelopmentMode) {
    console.log('🎭 Development Mode: Using Mock Retell Client');
    window.RetellWebClient = MockRetellClient;
    return true;
  }

  // 检查是否已经加载
  if (window.RetellWebClient) {
    console.log('✅ Retell SDK already loaded');
    return true;
  }

  // 生产模式：使用 ES Module 动态导入（正确的方式）
  try {
    console.log('⏳ Loading Retell SDK via ES Module from cdn.jsdelivr.net...');
    
    // 使用正确的包名和 ES Module 格式（和你成功的 project 一样）
    const { RetellWebClient } = await import('https://cdn.jsdelivr.net/npm/retell-client-js-sdk@latest/+esm');
    
    if (RetellWebClient) {
      window.RetellWebClient = RetellWebClient;
      console.log('✅ Retell SDK loaded successfully via ES Module');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to load Retell SDK via ES Module:', error);
  }

  // 如果 ES Module 加载失败，降级使用 Mock Client
  console.warn('⚠️ Retell SDK failed to load, using Mock Client for development');
  window.RetellWebClient = MockRetellClient;
  return true;
}

export function useRetellCall(userId: string): UseRetellCallResult {
  const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const retellClientRef = useRef<any | null>(null);
  const callIdRef = useRef<string | null>(null);
  const agentIdRef = useRef<string | null>(null);
  const callStartTimeRef = useRef<string | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 加载 Retell SDK
  useEffect(() => {
    let mounted = true;

    async function initSDK() {
      const loaded = await loadRetellSDK();
      if (mounted) {
        setSdkLoaded(loaded);
        if (!loaded) {
          setCallStatus({ 
            status: 'error', 
            error: 'Retell SDK 加载失败。请检查网络连接。' 
          });
        }
      }
    }

    initSDK();

    return () => {
      mounted = false;
    };
  }, []);

  // 初始化 Retell Web Client
  useEffect(() => {
    if (!sdkLoaded || !window.RetellWebClient) {
      return;
    }

    try {
      const client = new window.RetellWebClient();
      retellClientRef.current = client;

      // 监听通话更新事件
      client.on('call_started', () => {
        console.log('📞 Call started');
        // 记录通话开始时间
        callStartTimeRef.current = new Date().toISOString();
        setCallStatus({ status: 'connected', callId: callIdRef.current || undefined });
        // 开始计时
        setDuration(0);
        durationIntervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      });

      client.on('call_ended', async () => {
        console.log('📞 Call ended');
        const endTime = new Date().toISOString();
        setCallStatus({ status: 'ended', callId: callIdRef.current || undefined });

        // 停止计时
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        // 保存通话数据到数据库
        if (callIdRef.current && agentIdRef.current && transcript.length > 0 && callStartTimeRef.current) {
          try {
            // 生成纯文本 transcript
            const textTranscript = transcript
              .map(msg => `${msg.role === 'agent' ? 'Olivia' : '用户'}: ${msg.content}`)
              .join('\n');

            // 准备保存数据
            const saveParams: SaveCallDataParams = {
              userId: userId,
              callId: callIdRef.current,
              agentId: agentIdRef.current,
              callStatus: 'ended',
              callType: 'web_call',
              startTimestamp: callStartTimeRef.current,
              endTimestamp: endTime,
              callDuration: duration, // 使用实际计时的秒数
              transcript: textTranscript,
              transcriptObject: transcript,
              // 可选字段 - 如果 Retell 提供这些数据，可以在这里添加
              // callCost: callCostData,
              // disconnectionReason: 'user_hangup',
              // recordingUrl: recordingUrl,
            };

            await saveCallData(saveParams);
            console.log('💾 Call data saved to database successfully');
          } catch (error) {
            console.error('❌ Failed to save call data to database:', error);
          }
        } else {
          console.warn('⚠️ Missing required data for saving call:', {
            hasCallId: !!callIdRef.current,
            hasAgentId: !!agentIdRef.current,
            hasTranscript: transcript.length > 0,
            hasStartTime: !!callStartTimeRef.current,
          });
        }
      });

      client.on('agent_start_talking', () => {
        console.log('🗣️ Agent started talking');
        setIsAgentSpeaking(true);
      });

      client.on('agent_stop_talking', () => {
        console.log('🤐 Agent stopped talking');
        setIsAgentSpeaking(false);
      });

      client.on('update', (update: any) => {
        // 处理实时 transcript 更新
        if (update.transcript) {
          const newTranscript: TranscriptMessage[] = update.transcript.map((item: any) => ({
            role: item.role === 'agent' ? 'agent' : 'user',
            content: item.content,
            timestamp: item.timestamp || Date.now(),
          }));
          setTranscript(newTranscript);
        }
      });

      client.on('error', (error: any) => {
        console.error('❌ Retell error:', error);
        setCallStatus({ status: 'error', error: error.message || 'Unknown error' });
      });

      console.log('✅ Retell client initialized');

      return () => {
        // 清理
        if (retellClientRef.current) {
          try {
            retellClientRef.current.stopCall();
          } catch (e) {
            console.warn('Error stopping call during cleanup:', e);
          }
        }
      };
    } catch (error) {
      console.error('Failed to initialize Retell client:', error);
      setCallStatus({ 
        status: 'error', 
        error: 'Retell Client 初始化失败' 
      });
    }
  }, [sdkLoaded]);

  /**
   * 开始通话
   */
  const startCall = useCallback(async () => {
    if (!sdkLoaded || !window.RetellWebClient) {
      setCallStatus({ 
        status: 'error', 
        error: 'Retell SDK 未加载。请刷新页面重试。' 
      });
      return;
    }

    try {
      setCallStatus({ status: 'connecting' });
      
      // 开发模式：使用 Mock 数据，不调用后端
      if (isDevelopmentMode) {
        console.log('🎭 Mock: Using fake access token');
        callIdRef.current = 'mock_call_' + Date.now();
        
        // 直接开始 Mock 通话
        if (retellClientRef.current) {
          console.log('📞 Starting Mock Retell call...');
          await retellClientRef.current.startCall({
            accessToken: 'mock_token_' + Date.now(),
          });
          setCallStatus({ status: 'connected', callId: callIdRef.current });
          console.log('✅ Mock call started successfully');
        }
        return;
      }
      
      // 生产模式：从后端获取 access token
      console.log('🔑 Requesting access token...');
      const response = await createWebCall(userId);
      callIdRef.current = response.call_id;
      agentIdRef.current = response.agent_id; // 保存 agent_id

      console.log('✅ Web call created:', response);

      // 开始 Retell 通话
      if (retellClientRef.current) {
        console.log('📞 Starting Retell call...');
        await retellClientRef.current.startCall({
          accessToken: response.access_token,
        });
        setCallStatus({ status: 'connected', callId: response.call_id });
        console.log('✅ Call started successfully');
      } else {
        throw new Error('Retell client not initialized');
      }
    } catch (error) {
      console.error('❌ Failed to start call:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start call';
      setCallStatus({ status: 'error', error: errorMessage });
    }
  }, [userId, sdkLoaded]);

  /**
   * 结束通话
   */
  const endCall = useCallback(() => {
    if (retellClientRef.current) {
      try {
        retellClientRef.current.stopCall();
        setCallStatus({ status: 'ended', callId: callIdRef.current || undefined });
        console.log('📞 Call ended by user');
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  }, []);

  /**
   * 切换静音
   */
  const toggleMute = useCallback(() => {
    if (retellClientRef.current) {
      const newMutedState = !isMuted;
      if (newMutedState) {
        retellClientRef.current.mute();
        console.log('🔇 Muted');
      } else {
        retellClientRef.current.unmute();
        console.log('🔊 Unmuted');
      }
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  const isCallActive = callStatus.status === 'connected';

  return {
    callStatus,
    transcript,
    isCallActive,
    isAgentSpeaking,
    startCall,
    endCall,
    toggleMute,
    isMuted,
    duration,
    callId: callIdRef.current,
  };
}
