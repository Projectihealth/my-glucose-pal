/**
 * ChatModeSelector组件
 *
 * 选择聊天模式的卡片列表（更新OliviaHome页面使用）
 */

import { MessageSquare, Mic, Video } from 'lucide-react';

interface ChatMode {
  id: string;
  title: string;
  description: string;
  icon: typeof MessageSquare;
  path: string;
}

interface ChatModeSelectorProps {
  onNavigate: (path: string) => void;
}

export function ChatModeSelector({ onNavigate }: ChatModeSelectorProps) {
  const modes: ChatMode[] = [
    {
      id: 'text',
      title: 'Text Chat',
      description: 'Message Olivia about your health',
      icon: MessageSquare,
      path: 'text-chat'
    },
    {
      id: 'voice',
      title: 'Voice Chat',
      description: 'Have a natural conversation about your health',
      icon: Mic,
      path: 'voice-chat'
    },
    {
      id: 'video',
      title: 'Video Chat',
      description: 'Face-to-face interaction with visual support',
      icon: Video,
      path: 'video-chat'
    }
  ];

  return (
    <div className="space-y-4 pt-4">
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => onNavigate(mode.path)}
            className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                <Icon className="w-7 h-7 text-[#5B7FF3]" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-gray-800 text-lg mb-1">{mode.title}</h3>
                <p className="text-gray-500 text-sm">{mode.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
