import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, PhoneOff, Bot, UserCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRetellCall } from "../../../hooks/olivia/useRetellCall";

interface MobileCallInterfaceProps {
  onBack: () => void;
  onCallEnded: (callId: string | null, transcript: any[]) => void;
}

export function MobileCallInterface({ onBack, onCallEnded }: MobileCallInterfaceProps) {
  const userId = import.meta.env.VITE_DEFAULT_USER_ID || 'user_001';
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    startCall,
    endCall,
    callStatus,
    transcript,
    duration,
    callId,
  } = useRetellCall(userId);

  // Auto-start call when component mounts
  useEffect(() => {
    startCall();
  }, [startCall]);

  // Handle call end
  const handleEndCall = async () => {
    await endCall();
    // Pass callId and transcript to parent for results page
    onCallEnded(callId, transcript);
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcript]);

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
            {callStatus.status === 'connecting' && (
              <div className="text-center text-gray-500 text-sm py-4">
                Connecting...
              </div>
            )}
            {callStatus.status === 'error' && (
              <div className="text-center text-red-500 text-sm py-4">
                {callStatus.error}
              </div>
            )}
            {transcript.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'agent' ? 'bg-[#EEF2FF]' : 'bg-gray-200'
                  }`}>
                    {message.role === 'agent' ? (
                      <Bot className="w-4 h-4 text-[#5B7FF3]" />
                    ) : (
                      <UserCircle className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'agent'
                      ? 'bg-white border border-gray-200'
                      : 'bg-[#5B7FF3] text-white'
                  }`}>
                    <p className={`text-sm leading-relaxed ${
                      message.role === 'agent' ? 'text-gray-700' : 'text-white'
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
          disabled={callStatus.status === 'idle' || callStatus.status === 'error'}
          className="w-full bg-red-500 text-white py-4 rounded-full text-lg active:scale-[0.98] transition-transform shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PhoneOff className="w-5 h-5" />
          End Call
        </button>
      </div>
    </div>
  );
}

