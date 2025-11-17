import { useState, useEffect, useRef } from 'react';
import { X, Mic, MessageSquare, MicOff, Bot, UserCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRetellCall } from "../../../hooks/olivia/useRetellCall";
import { getStoredUserId } from '@/utils/userUtils';

interface MobileCallInterfaceProps {
  onBack: () => void;
  onCallEnded: (callId: string | null, transcript: any[]) => void;
}

export function MobileCallInterface({ onBack, onCallEnded }: MobileCallInterfaceProps) {
  const userId = getStoredUserId();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentText, setCurrentText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const {
    startCall,
    endCall,
    callStatus,
    transcript,
    duration,
    callId,
    isAgentSpeaking,
  } = useRetellCall(userId);

  // Auto-start call when component mounts
  useEffect(() => {
    startCall();
  }, [startCall]);

  // Update current text when transcript changes
  useEffect(() => {
    if (transcript.length > 0) {
      const lastMessage = transcript[transcript.length - 1];
      setCurrentText(lastMessage.content);
      console.log('[MobileCallInterface] Updated text:', lastMessage.content.substring(0, 50) + '...');
    }
  }, [transcript]);

  // Debug: Log isAgentSpeaking changes
  useEffect(() => {
    console.log('[MobileCallInterface] isAgentSpeaking changed:', isAgentSpeaking);
  }, [isAgentSpeaking]);

  // Handle call end
  const handleEndCall = async () => {
    await endCall();
    onCallEnded(callId, transcript);
  };

  // Auto scroll to bottom when new messages arrive in transcript overlay
  useEffect(() => {
    if (scrollAreaRef.current && showTranscript) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcript, showTranscript]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9FA] to-[#E8EBF0] flex flex-col overflow-hidden">
      {/* Timer */}
      <div className="absolute top-6 left-0 right-0 text-center z-10">
        <p className="text-gray-500">{formatDuration(duration)}</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-12 pb-48">
        {/* Status Messages */}
        {callStatus.status === 'connecting' && (
          <div className="text-center text-gray-500 text-sm py-4">
            Connecting to Olivia...
          </div>
        )}
        {callStatus.status === 'error' && (
          <div className="text-center text-red-500 text-sm py-4 px-4 bg-red-50 rounded-lg">
            {callStatus.error}
          </div>
        )}

        {/* Animated Orb - Upper portion */}
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ height: '32vh' }}>
          {/* Outer glow rings - only show when agent is speaking */}
          {isAgentSpeaking && (
            <>
              <div className="absolute inset-0 w-56 h-56 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <div className="absolute inset-0 rounded-full bg-[#5B7FF3]/20 animate-ping" style={{ animationDuration: '2s' }}></div>
              </div>
              <div className="absolute inset-0 w-48 h-48 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <div className="absolute inset-0 rounded-full bg-[#5B7FF3]/30 animate-ping" style={{ animationDuration: '1.5s' }}></div>
              </div>
            </>
          )}

          {/* Background glow */}
          <div className="absolute inset-0 w-40 h-40 rounded-full bg-[#5B7FF3] blur-xl opacity-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Main avatar with photo */}
          <div className={`relative w-40 h-40 rounded-full shadow-2xl transition-all duration-300 overflow-hidden ${
            isAgentSpeaking ? 'scale-110' : 'scale-100'
          }`} style={{
            boxShadow: '0 0 60px rgba(91, 127, 243, 0.5), 0 0 100px rgba(91, 127, 243, 0.25)',
            backgroundImage: 'url(https://www.cincinnati.com/gcdn/presto/2023/06/15/PCIN/998a4762-200a-4e57-a3dc-f4bc0d91593c-male_nurse_jobs_1030x687.jpeg?crop=515,687,x412,y0)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {/* Subtle overlay for better integration */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 via-transparent to-white/10"></div>
            
            {/* Animated shine effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-40"></div>
            </div>
          </div>
        </div>

        {/* Text Display - Lower portion with fixed height */}
        <div className="flex-1 flex flex-col items-center justify-start px-4 pt-8 min-h-0">
          <div 
            className="text-center max-w-md transition-all duration-500 ease-out overflow-hidden"
            style={{ 
              opacity: currentText ? 1 : 0.3,
              transform: currentText ? 'translateY(0)' : 'translateY(20px)',
              maxHeight: '25vh'
            }}
          >
            <div className="overflow-y-auto max-h-full px-2">
              <p className="text-gray-800 text-lg leading-relaxed">
                {currentText || 'Listening...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 left-0 right-0 px-8 z-20">
        <div className="flex items-end justify-between">
          {/* Exit Button */}
          <button
            onClick={handleEndCall}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200">
              <X className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-xs text-gray-600">Exit</span>
          </button>

          {/* Microphone Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform -mb-4"
            disabled={callStatus.status !== 'connected'}
          >
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br shadow-2xl flex items-center justify-center transition-all ${
              isMuted
                ? 'from-gray-400 to-gray-500 shadow-gray-400/50'
                : 'from-[#5B7FF3] to-[#4A90E2] shadow-[#5B7FF3]/40'
            }`}>
              {isMuted ? (
                <MicOff className="w-9 h-9 text-white" />
              ) : (
                <Mic className="w-9 h-9 text-white" />
              )}
            </div>
          </button>

          {/* Transcript Button */}
          <button
            onClick={() => setShowTranscript(true)}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200">
              <MessageSquare className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-xs text-gray-600">Transcript</span>
          </button>
        </div>
      </div>

      {/* Transcript Overlay */}
      {showTranscript && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
            <button 
              onClick={() => setShowTranscript(false)} 
              className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-gray-800 ml-3 font-medium">Conversation Transcript</h2>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <div className="px-4 py-4 space-y-3">
                {transcript.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No conversation yet. Start talking to Olivia!
                  </div>
                ) : (
                  transcript.map((message, index) => (
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
                            ? 'bg-white border border-gray-200 shadow-sm'
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
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}

