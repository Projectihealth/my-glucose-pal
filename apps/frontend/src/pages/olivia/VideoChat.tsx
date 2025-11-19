/**
 * VideoChat页面组件
 *
 * 使用现有的CVI组件库集成Tavus视频对话
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTavusConversation } from "../../hooks/olivia/useTavusConversation";
import { CVIProvider } from '@/components/olivia/cvi/components/cvi-provider';
import { Conversation } from '@/components/olivia/cvi/components/conversation';

function VideoChat() {
  const navigate = useNavigate();
  const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'user_001';
  const { conversation, isLoading, error, endConversation, retry } = useTavusConversation(userId);

  const handleLeave = async () => {
    await endConversation();
    navigate('/');
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center max-w-[430px] mx-auto">
        <div className="text-white text-center px-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-medium mb-2">Connecting to Olivia...</h2>
          <p className="text-sm text-white/70">Setting up your video call</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-6 max-w-[430px] mx-auto">
        <div className="bg-red-500/90 backdrop-blur-sm text-white px-8 py-6 rounded-2xl text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-3">Connection Error</h2>
          <p className="text-sm mb-6 leading-relaxed">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={retry}
              className="px-6 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white text-red-500 rounded-lg hover:bg-white/90 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 对话不可用
  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center max-w-[430px] mx-auto">
        <div className="text-white text-center px-6">
          <p className="text-lg">No conversation available</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 正常显示视频对话
  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-4 py-3 flex items-center">
        <button
          onClick={handleLeave}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white font-medium ml-3">Video Chat with Olivia</h1>
      </div>

      {/* CVI Conversation Component */}
      <CVIProvider>
        <Conversation
          conversationUrl={conversation.conversation_url}
          onLeave={handleLeave}
        />
      </CVIProvider>
    </div>
  );
}

export default VideoChat;
