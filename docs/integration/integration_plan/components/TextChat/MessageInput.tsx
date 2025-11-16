/**
 * MessageInput组件
 *
 * 消息输入框和发送按钮
 */

import { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;

    onSend(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 flex-shrink-0">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5B7FF3] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleSend}
        disabled={!inputValue.trim() || disabled}
        className="p-3 bg-[#5B7FF3] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4A6FE2] transition-colors active:scale-95"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
