/**
 * MessageList组件
 *
 * 显示聊天消息列表
 */

import type { Message } from "../../../types/olivia/conversation";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="p-4 space-y-4">
      {messages.map((msg, index) => (
        <div
          key={`${msg.timestamp}-${index}`}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-[#5B7FF3] text-white'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>

            {/* Function Call Badge */}
            {msg.metadata?.functionCall && (
              <div className="mt-2 pt-2 border-t border-current/10">
                <span className="text-xs opacity-70">
                  📊 Retrieved real-time data
                </span>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs opacity-50 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
