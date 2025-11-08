import { useState, useEffect } from 'react';

interface UserData {
  user_id: string;
  name: string;
  health_goal?: string;
  conditions?: string;
  cgm_device?: string;
  current_glucose?: number;
  glucose_status?: string;
  avg_24h?: number;
  avg_7d?: number;
  min_glucose?: number;
  max_glucose?: number;
  time_in_range_24h?: number;
  time_in_range_7d?: number;
  reading_count_24h?: number;
  recent_readings?: Array<{ timestamp: string; glucose: number; status: string }>;
  patterns?: Array<{ pattern_name: string; severity: string; confidence: number; description: string }>;
  actions?: Array<{ title: string; detail: string; category: string; priority: number }>;
}

export default function App() {
  const [conversationUrl, setConversationUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);

  // 从 localStorage 获取当前用户 ID
  const getCurrentUserId = (): string => {
    return localStorage.getItem('currentUserId') || 'user_001';
  };

  // 从后端获取用户完整数据
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // 获取用户基本信息
      const userRes = await fetch(`${backendUrl}/api/user/${userId}`);
      const userInfo = await userRes.json();

      // 获取当前血糖
      const glucoseRes = await fetch(`${backendUrl}/api/glucose/${userId}`);
      const glucoseData = glucoseRes.ok ? await glucoseRes.json() : null;

      // 获取24小时统计
      const stats24Res = await fetch(`${backendUrl}/api/stats/${userId}`);
      const stats24Data = stats24Res.ok ? await stats24Res.json() : null;

      // 获取7天统计
      const stats7Res = await fetch(`${backendUrl}/api/stats/${userId}?days=7`);
      const stats7Data = stats7Res.ok ? await stats7Res.json() : null;

      // 获取最近的读数（20条）
      const recentRes = await fetch(`${backendUrl}/api/recent/${userId}/20`);
      const recentReadings = recentRes.ok ? await recentRes.json() : null;

      // 获取检测到的模式
      const patternsRes = await fetch(`${backendUrl}/api/patterns/${userId}`);
      const patternsData = patternsRes.ok ? await patternsRes.json() : null;

      // 获取健康建议
      const actionsRes = await fetch(`${backendUrl}/api/actions`);
      const actionsData = actionsRes.ok ? await actionsRes.json() : null;

      return {
        user_id: userId,
        name: userInfo.name || 'User',
        health_goal: userInfo.health_goal,
        conditions: userInfo.conditions,
        cgm_device: userInfo.cgm_device_type,
        current_glucose: glucoseData?.glucose,
        glucose_status: glucoseData?.status,
        avg_24h: stats24Data?.stats?.avg_glucose,
        avg_7d: stats7Data?.stats?.avg_glucose,
        min_glucose: stats24Data?.stats?.min_glucose,
        max_glucose: stats24Data?.stats?.max_glucose,
        time_in_range_24h: stats24Data?.time_in_range,
        time_in_range_7d: stats7Data?.time_in_range,
        reading_count_24h: stats24Data?.stats?.count,
        recent_readings: recentReadings?.map?.((r: any) => ({
          timestamp: r.timestamp,
          glucose: r.glucose_value,
          status: r.status
        })) || [],
        patterns: patternsData?.map?.((p: any) => ({
          pattern_name: p.pattern_type,
          severity: p.severity,
          confidence: p.confidence,
          description: p.description
        })) || [],
        actions: actionsData?.map?.((a: any) => ({
          title: a.action_title,
          detail: a.action_detail,
          category: a.category,
          priority: a.priority
        })) || []
      };
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  };

  // 构建 Conversational Context
  const buildConversationalContext = (data: UserData): string => {
    // 格式化模式列表
    const patternsStr = data.patterns?.length 
      ? data.patterns.map(p => `- ${p.pattern_name} (${p.severity}, ${Math.round(p.confidence * 100)}% confidence): ${p.description}`).join('\n')
      : 'No significant patterns detected';

    // 格式化最近读数
    const recentReadingsStr = data.recent_readings?.length
      ? data.recent_readings.slice(0, 10).map(r => `  ${r.timestamp}: ${r.glucose} mg/dL (${r.status})`).join('\n')
      : 'No recent readings available';

    // 格式化健康建议
    const actionsStr = data.actions?.length
      ? data.actions.slice(0, 5).map(a => `- [${a.category}] ${a.title}: ${a.detail} (Priority: ${a.priority})`).join('\n')
      : 'No specific recommendations at this time';
    
    const glucoseStatus = data.glucose_status || 'Unknown';
    
    return `
╔════════════════════════════════════════════════════════════════╗
║                    USER PROFILE & HEALTH CONTEXT               ║
╚════════════════════════════════════════════════════════════════╝

👤 PERSONAL INFORMATION:
- Name: ${data.name}
- User ID: ${data.user_id}
- Health Goal: ${data.health_goal || 'Not specified'}
- Conditions: ${data.conditions || 'Not specified'}
- CGM Device: ${data.cgm_device || 'Not specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CURRENT CGM STATUS:
- Current Glucose: ${data.current_glucose || 'N/A'} mg/dL (${glucoseStatus}) 🩺
- Status: ${glucoseStatus === 'Low' ? '⚠️ Below target range' : glucoseStatus === 'High' ? '⚠️ Above target range' : glucoseStatus === 'Elevated' ? '⚡ Slightly elevated' : '✅ In range'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 GLUCOSE STATISTICS:

24-Hour Metrics:
- Average: ${data.avg_24h ? data.avg_24h.toFixed(1) : 'N/A'} mg/dL
- Min-Max: ${data.min_glucose || 'N/A'} - ${data.max_glucose || 'N/A'} mg/dL
- Time In Range (70-140): ${data.time_in_range_24h ? data.time_in_range_24h.toFixed(1) : 'N/A'}%
- Reading Count: ${data.reading_count_24h || 'N/A'}

7-Day Metrics:
- Average: ${data.avg_7d ? data.avg_7d.toFixed(1) : 'N/A'} mg/dL
- Time In Range (70-140): ${data.time_in_range_7d ? data.time_in_range_7d.toFixed(1) : 'N/A'}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 DETECTED GLUCOSE PATTERNS (Last 24h):
${patternsStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 RECENT GLUCOSE READINGS (Last 20):
${recentReadingsStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 RECOMMENDED HEALTH ACTIONS:
${actionsStr}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS FOR OLIVIA:
1. Greet ${data.name} warmly and acknowledge their current glucose status
2. Use the personal information to tailor your response
3. Reference the detected patterns and explain what they mean
4. Provide insights based on their 24-hour and 7-day trends
5. If there are high-priority recommendations, proactively suggest them
6. Show enthusiasm about improvements and areas where they're doing well
7. Be supportive about any challenges shown in the data
8. Ask follow-up questions to understand their feelings about their glucose management

Remember: You are Olivia, an elegant and attentive health butler. Be warm, supportive, and genuinely interested in ${data.name}'s wellbeing.`.trim();
  };

  // 创建 Tavus 对话
  const createConversation = async (contextData: UserData) => {
    try {
      setLoading(true);
      setError('');
      
      // 先清理旧的对话以解决并发限制
      console.log('🧹 Cleaning up old conversations...');
      try {
        const cleanupRes = await fetch('http://localhost:5000/api/avatar/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        
        if (cleanupRes.ok) {
          const cleanupData = await cleanupRes.json();
          console.log(`✅ Cleaned up ${cleanupData.ended_count} old conversation(s)`);
        }
      } catch (cleanupErr) {
        console.warn('⚠️ Cleanup warning (non-critical):', cleanupErr);
      }
      
      // 通过环境变量获取（由 vite.config.ts 提供默认值）
      const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
      const personaId = import.meta.env.VITE_PERSONA_ID;
      const replicaId = import.meta.env.VITE_REPLICA_ID;

      if (!apiKey || !personaId || !replicaId) {
        throw new Error('Missing Tavus configuration');
      }

      // 构建 conversational context
      const context = buildConversationalContext(contextData);

      console.log('Creating conversation with context:', context);

      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          replica_id: replicaId,
          persona_id: personaId,
          conversational_context: context,
          custom_greeting: `Hi ${contextData.name}! 👋 I'm Olivia, your health butler. I see your recent glucose levels and patterns. How are you feeling today? What would you like to discuss?`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.conversation_url) {
        setConversationUrl(data.conversation_url);
        console.log('✅ Conversation created successfully');
        console.log('Conversation URL:', data.conversation_url);
        
        // 保存对话ID到 localStorage 便于后续清理
        try {
          const url = new URL(data.conversation_url);
          const conversationId = url.searchParams.get('c') || data.conversation_url.split('/').pop();
          
          // 保存到 localStorage
          localStorage.setItem('lastTavusConversationUrl', data.conversation_url);
          localStorage.setItem('lastTavusConversationId', conversationId);
          
          // 也发送到后端保存
          await fetch('http://localhost:5000/api/avatar/save-conversation-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversation_url: data.conversation_url,
              conversation_id: conversationId,
              created_at: new Date().toISOString()
            })
          }).catch(err => console.warn('⚠️ Failed to save conversation ID to backend:', err));
          
          console.log('💾 Conversation URL saved for cleanup');
        } catch (saveErr) {
          console.warn('⚠️ Failed to save conversation ID:', saveErr);
        }
      } else {
        throw new Error('No conversation URL in response');
      }
    } catch (err: any) {
      console.error('❌ Error creating conversation:', err);
      setError(err.message || 'Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  // 初始化：获取用户数据并创建对话
  useEffect(() => {
    const initializeConversation = async () => {
      const userId = getCurrentUserId();
      console.log('📍 Initializing for user:', userId);
      
      const data = await fetchUserData(userId);
      
      if (data) {
        setUserData(data);
        await createConversation(data);
      } else {
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    initializeConversation();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading Olivia - Your Health Butler...</p>
          <p style={styles.loadingSubtext}>Preparing your personalized health context...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!conversationUrl) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>⚠️ No Conversation URL</h2>
          <p>Failed to create a conversation. Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🩺 Olivia - Your Health Butler</h1>
        <p>Caring, Intelligent Glucose Management Support</p>
        {userData && (
          <p style={styles.userInfo}>
            👤 {userData.name} • Current Glucose: {userData.current_glucose} mg/dL ({userData.glucose_status})
          </p>
        )}
      </div>

      <div style={styles.conversationContainer}>
        <iframe
          src={conversationUrl}
          title="Olivia - Video Avatar"
          style={styles.iframe}
          allow="microphone;camera;display-capture"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation"
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#f5f7fa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '20px 40px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  userInfo: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '8px',
  },
  conversationContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    minHeight: 0,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '8px',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#1e3a8a',
  },
  loadingSubtext: {
    fontSize: '14px',
    color: '#6b7280',
  },
  errorBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
    padding: '40px',
    textAlign: 'center' as const,
  },
  retryButton: {
    padding: '10px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600' as const,
  },
};

