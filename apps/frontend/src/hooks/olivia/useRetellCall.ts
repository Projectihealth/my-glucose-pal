/**
 * useRetellCall Hook
 * Manages the complete lifecycle of Retell Web Call
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

// Declare global RetellWebClient type
declare global {
  interface Window {
    RetellWebClient: any;
  }
}

/**
 * Detect if in development mode (Mock mode)
 * Set to false to use real Retell API
 */
const isDevelopmentMode = false; // Set to false to force production mode

/**
 * Mock Retell Client (for development testing)
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
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.emit('call_started');
    
    // Simulate Agent starting to speak
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
 * Load Retell Web Client SDK
 * Use Mock Client in development mode
 */
async function loadRetellSDK(): Promise<boolean> {
  // Development mode: Use Mock Client
  if (isDevelopmentMode) {
    console.log('🎭 Development Mode: Using Mock Retell Client');
    window.RetellWebClient = MockRetellClient;
    return true;
  }

  // Check if already loaded
  if (window.RetellWebClient) {
    console.log('✅ Retell SDK already loaded');
    return true;
  }

  // Production mode: Use ES Module dynamic import (correct approach)
  try {
    console.log('⏳ Loading Retell SDK via ES Module from cdn.jsdelivr.net...');
    
    // Use correct package name and ES Module format (same as your successful project)
    const { RetellWebClient } = await import('https://cdn.jsdelivr.net/npm/retell-client-js-sdk@latest/+esm');
    
    if (RetellWebClient) {
      window.RetellWebClient = RetellWebClient;
      console.log('✅ Retell SDK loaded successfully via ES Module');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to load Retell SDK via ES Module:', error);
  }

  // If ES Module loading fails, fallback to Mock Client
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
  const transcriptRef = useRef<TranscriptMessage[]>([]); // Use ref to save latest transcript

  // Load Retell SDK
  useEffect(() => {
    let mounted = true;

    async function initSDK() {
      const loaded = await loadRetellSDK();
      if (mounted) {
        setSdkLoaded(loaded);
        if (!loaded) {
          setCallStatus({ 
            status: 'error', 
            error: 'Failed to load Retell SDK. Please check your network connection.' 
          });
        }
      }
    }

    initSDK();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize Retell Web Client
  useEffect(() => {
    if (!sdkLoaded || !window.RetellWebClient) {
      return;
    }

    try {
      const client = new window.RetellWebClient();
      retellClientRef.current = client;

      // Listen to call update events
      client.on('call_started', () => {
        console.log('📞 Call started');
        // Record call start time
        callStartTimeRef.current = new Date().toISOString();
        setCallStatus({ status: 'connected', callId: callIdRef.current || undefined });
        // Start timer
        setDuration(0);
        durationIntervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      });

      client.on('call_ended', async () => {
        console.log('📞 Call ended');
        const endTime = new Date().toISOString();
        setCallStatus({ status: 'ended', callId: callIdRef.current || undefined });

        // Stop timer
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        // Save call data to database (use latest transcript from ref)
        const currentTranscript = transcriptRef.current;
        if (callIdRef.current && agentIdRef.current && currentTranscript.length > 0 && callStartTimeRef.current) {
          try {
            // Generate plain text transcript
            const textTranscript = currentTranscript
              .map(msg => `${msg.role === 'agent' ? 'Olivia' : 'User'}: ${msg.content}`)
              .join('\n');

            console.log(`💾 Saving call data with ${currentTranscript.length} transcript messages...`);

            // Prepare save data
            const saveParams: SaveCallDataParams = {
              userId: userId,
              callId: callIdRef.current,
              agentId: agentIdRef.current,
              callStatus: 'ended',
              callType: 'web_call',
              startTimestamp: callStartTimeRef.current,
              endTimestamp: endTime,
              callDuration: duration, // Use actual timer seconds
              transcript: textTranscript,
              transcriptObject: currentTranscript,
              // Optional fields - add here if Retell provides this data
              // callCost: callCostData,
              // disconnectionReason: 'user_hangup',
              // recordingUrl: recordingUrl,
            };

            await saveCallData(saveParams);
            console.log('✅ Call data saved to database successfully');
          } catch (error) {
            console.error('❌ Failed to save call data to database:', error);
          }
        } else {
          console.warn('⚠️ Missing required data for saving call:', {
            hasCallId: !!callIdRef.current,
            hasAgentId: !!agentIdRef.current,
            hasTranscript: currentTranscript.length > 0,
            transcriptLength: currentTranscript.length,
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
        // Handle real-time transcript updates
        if (update.transcript) {
          const newTranscript: TranscriptMessage[] = update.transcript.map((item: any) => ({
            role: item.role === 'agent' ? 'agent' : 'user',
            content: item.content,
            timestamp: item.timestamp || Date.now(),
          }));
          transcriptRef.current = newTranscript; // Update ref at the same time
          setTranscript(newTranscript);
        }
      });

      client.on('error', (error: any) => {
        console.error('❌ Retell error:', error);
        setCallStatus({ status: 'error', error: error.message || 'Unknown error' });
      });

      console.log('✅ Retell client initialized');

      return () => {
        // Cleanup
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
        error: 'Failed to initialize Retell Client' 
      });
    }
  }, [sdkLoaded]);

  /**
   * Start call
   */
  const startCall = useCallback(async () => {
    if (!sdkLoaded || !window.RetellWebClient) {
      setCallStatus({ 
        status: 'error', 
        error: 'Retell SDK not loaded. Please refresh the page and try again.' 
      });
      return;
    }

    try {
      setCallStatus({ status: 'connecting' });
      
      // Development mode: Use mock data, don't call backend
      if (isDevelopmentMode) {
        console.log('🎭 Mock: Using fake access token');
        callIdRef.current = 'mock_call_' + Date.now();
        
        // Start mock call directly
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
      
      // Production mode: Get access token from backend
      console.log('🔑 Requesting access token...');
      const response = await createWebCall(userId);
      callIdRef.current = response.call_id;
      agentIdRef.current = response.agent_id; // Save agent_id

      console.log('✅ Web call created:', response);

      // Start Retell call
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
   * End call
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
   * Toggle mute
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
