import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, PhoneOff, Bot, UserCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface MobileCallInterfaceProps {
  onBack: () => void;
  onCallEnded: () => void;
}

interface Message {
  role: 'AGENT' | 'USER';
  content: string;
  timestamp: Date;
}

export function MobileCallInterface({ onBack, onCallEnded }: MobileCallInterfaceProps) {
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock conversation data
  const mockConversation = [
    {
      role: 'AGENT' as const,
      content: "Hi Julia! I'm Olivia, your AI health companion. I'd like to learn about your daily routines to help personalize your care. Does now work for you?",
    },
    {
      role: 'USER' as const,
      content: 'Yes, sounds good!',
    },
    {
      role: 'AGENT' as const,
      content: "Great! I'll ask about your eating, sleep, and lifestyle. The more detail you share, the better I can help. Ready?",
    },
    {
      role: 'USER' as const,
      content: "Sure, I'm ready.",
    },
    {
      role: 'AGENT' as const,
      content: "Let's start with your meals. Can you tell me about what you typically eat for breakfast, lunch, and dinner?",
    },
    {
      role: 'USER' as const,
      content: 'For breakfast I usually have oatmeal with berries. Lunch is typically a salad with grilled chicken. Dinner is usually lean protein with vegetables, sometimes brown rice.',
    },
    {
      role: 'AGENT' as const,
      content: "That sounds like a balanced diet! How about exercise? What does your typical weekly routine look like?",
    },
    {
      role: 'USER' as const,
      content: 'I go to the gym 3-4 times per week, mostly cardio and light weights. I also walk about 30 minutes every day.',
    },
    {
      role: 'AGENT' as const,
      content: "Excellent! And how about your sleep? How many hours do you typically get per night?",
    },
    {
      role: 'USER' as const,
      content: 'I try to get 7-8 hours. I usually go to bed around 11 PM and wake up at 7 AM.',
    },
    {
      role: 'AGENT' as const,
      content: "Perfect! Thank you for sharing all this information, Julia. This will really help us personalize your care plan.",
    },
  ];

  // Auto-start call when component mounts
  useEffect(() => {
    // Simulate conversation
    let delay = 1000;
    mockConversation.forEach((msg) => {
      setTimeout(() => {
        setMessages(prev => [...prev, { ...msg, timestamp: new Date() }]);
      }, delay);
      delay += 2500;
    });
  }, []);

  const handleEndCall = () => {
    onCallEnded();
  };

  // Duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 active:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-gray-800">Voice Chat</h1>
          <p className="text-sm text-gray-500">{formatDuration(duration)}</p>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="px-4 py-4 space-y-3 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.role === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'AGENT' ? 'bg-[#EEF2FF]' : 'bg-gray-200'
                  }`}>
                    {message.role === 'AGENT' ? (
                      <Bot className="w-4 h-4 text-[#5B7FF3]" />
                    ) : (
                      <UserCircle className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'AGENT'
                      ? 'bg-white border border-gray-200'
                      : 'bg-[#5B7FF3] text-white'
                  }`}>
                    <p className={`text-sm leading-relaxed ${
                      message.role === 'AGENT' ? 'text-gray-700' : 'text-white'
                    }`}>
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Call Controls */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
        <button
          onClick={handleEndCall}
          className="w-full bg-red-500 text-white py-4 rounded-full text-lg active:scale-[0.98] transition-transform shadow-sm flex items-center justify-center gap-2"
        >
          <PhoneOff className="w-5 h-5" />
          End Call
        </button>
      </div>
    </div>
  );
}
