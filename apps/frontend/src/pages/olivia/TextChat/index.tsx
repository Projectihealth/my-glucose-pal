/**
 * TextChat页面组件
 *
 * GPT-4o文本聊天界面
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTextChat } from "../../../hooks/olivia/useTextChat";
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { getStoredUserId } from '@/utils/userUtils';
import { getAgentConfig } from '@/config/agentConfig';

function TextChat() {
  const navigate = useNavigate();
  const userId = getStoredUserId();
  const [agentName, setAgentName] = useState<string>("Olivia");
  const { messages, isLoading, error, sendMessage, endChat } = useTextChat(userId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const endChatRef = useRef(endChat);

  // Fetch user's agent preference
  useEffect(() => {
    const fetchAgentPreference = async () => {
      try {
        const backendUrl = import.meta.env.DEV
          ? "http://localhost:5000"
          : (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");
        const response = await fetch(`${backendUrl}/api/user/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          const agentConfig = getAgentConfig(userData.agent_preference);
          setAgentName(agentConfig.displayName);
        }
      } catch (error) {
        console.error("Failed to fetch agent preference:", error);
      }
    };

    fetchAgentPreference();

    // Listen for agent preference changes
    const handleAgentPreferenceChange = (event: any) => {
      const agentConfig = getAgentConfig(event.detail?.agentPreference);
      setAgentName(agentConfig.displayName);
    };
    window.addEventListener('agentPreferenceChanged', handleAgentPreferenceChange);

    return () => {
      window.removeEventListener('agentPreferenceChanged', handleAgentPreferenceChange);
    };
  }, [userId]);

  // 保持 endChatRef 最新
  useEffect(() => {
    endChatRef.current = endChat;
  }, [endChat]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 页面卸载时结束聊天（只在真正卸载时调用）
  useEffect(() => {
    return () => {
      endChatRef.current();
    };
  }, []); // 空依赖数组，只在挂载和卸载时运行

  const handleBack = async () => {
    await endChat();
    navigate('/');
  };

  return (
    <div className="absolute inset-0 bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center flex-shrink-0">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="ml-3 flex-1">
          <h1 className="text-gray-800 font-medium">Chat with {agentName}</h1>
          <p className="text-xs text-gray-500">Your AI health companion</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex-shrink-0">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Messages - with proper flex sizing */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input - fixed at bottom */}
      <div className="flex-shrink-0">
        <MessageInput
          onSend={sendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default TextChat;
