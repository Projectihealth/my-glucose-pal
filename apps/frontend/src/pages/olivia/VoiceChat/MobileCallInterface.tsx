import { useState, useEffect } from 'react';
import { X, MessageSquare, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useRetellCall } from '../../../hooks/olivia/useRetellCall';
import { getStoredUserId } from '@/utils/userUtils';

interface MobileCallInterfaceProps {
  onBack: () => void;
  onCallEnded: (callId: string | null, transcript: any[], durationSeconds: number) => void;
}

interface UserInfo {
  name?: string;
  avatar?: string;
}

interface Message {
  speaker: 'coach' | 'patient';
  text: string;
  timestamp: number;
}

export function MobileCallInterface({ onBack, onCallEnded }: MobileCallInterfaceProps) {
  const userId = getStoredUserId();
  const [isMuted, setIsMuted] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: 'User' });

  const {
    startCall,
    endCall,
    callStatus,
    transcript,
    duration,
    callId,
    isAgentSpeaking,
    toggleMute,
    isMuted: hookIsMuted,
  } = useRetellCall(userId);

  // Fetch user info from backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            name: data.name || 'User',
            avatar: data.avatar_url,
          });
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };
    fetchUserInfo();
  }, [userId]);

  // Auto-start call when component mounts
  useEffect(() => {
    startCall();
  }, [startCall]);

  // Sync mute state with hook
  useEffect(() => {
    setIsMuted(hookIsMuted);
  }, [hookIsMuted]);

  // Convert transcript to messages format
  useEffect(() => {
    if (transcript.length > 0) {
      const newMessages: Message[] = transcript.map((msg, index) => ({
        speaker: msg.role === 'agent' ? 'coach' : 'patient',
        text: msg.content,
        timestamp: index,
      }));
      setMessages(newMessages);
    }
  }, [transcript]);

  // Add initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          speaker: 'coach',
          text: `Hi ${userInfo.name?.split(' ')[0] || 'there'}! I'm Olivia, your CGM health coach—here to support you on your health journey.`,
          timestamp: 0,
        },
      ]);
    }
  }, [userInfo.name]);

  // Current speaking message (last message)
  const currentMessage = messages[messages.length - 1];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const handleEndCall = async () => {
    await endCall();
    onCallEnded(callId, transcript, duration);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-blue-50 to-cyan-50 text-gray-900 relative">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-blue-700">Call Duration</div>
          <div className="px-3 py-1 bg-red-500/20 text-red-600 rounded-full text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Recording
          </div>
        </div>
        <div className="text-2xl text-gray-900 tabular-nums">{formatTime(duration)}</div>
      </div>

      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Status Messages */}
        {callStatus.status === 'connecting' && (
          <div className="text-center text-blue-600 text-sm py-4 mb-4">
            Connecting to Olivia...
          </div>
        )}
        {callStatus.status === 'error' && (
          <div className="text-center text-red-600 text-sm py-4 px-4 bg-red-500/20 rounded-lg mb-4">
            {callStatus.error}
          </div>
        )}

        {/* Animated Avatar Area */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Animated rings */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-32 h-32 rounded-full border-2 border-blue-400/50"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.6, 0.3, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>

          {/* Pulsing glow */}
          <motion.div
            className="absolute w-40 h-40 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Avatar */}
          <motion.div
            className="relative z-10"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl shadow-blue-500/20">
              <ImageWithFallback
                // Image file is located at: apps/frontend/public/images/olivia-nurse.png
                src="/images/olivia-nurse.png"
                alt="Olivia - Your CGM Nurse Coach"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Active speaking indicator */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/30 text-white"
              animate={{
                scale: isAgentSpeaking ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: isAgentSpeaking ? Infinity : 0,
              }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Olivia</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Session Title */}
        <div className="text-center mb-8">
          <div className="text-lg text-gray-900">Care Assistant</div>
          <div className="text-sm text-blue-600 mt-1">Daily Check-in</div>
        </div>

        {/* Live Caption - Current Message */}
        <div className="w-full max-w-md px-4">
          <AnimatePresence mode="wait">
            {currentMessage && (
              <motion.div
                key={currentMessage.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative bg-gradient-to-br from-white/80 via-blue-50/80 to-cyan-50/80 backdrop-blur-xl rounded-2xl p-4 border border-blue-300/50 shadow-xl shadow-blue-300/30 overflow-hidden"
              >
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-cyan-400/5 pointer-events-none"></div>
                
                {/* Inner glow effect */}
                <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="text-xs text-blue-600 mb-1 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    {currentMessage.speaker === 'coach' ? 'Olivia (Coach)' : userInfo.name}
                  </div>
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {currentMessage.text}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Transcript Button */}
      <Sheet open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
        <SheetTrigger asChild>
          <button className="fixed bottom-24 right-6 w-14 h-14 bg-white/90 backdrop-blur-md border border-blue-300 rounded-full flex items-center justify-center text-blue-600 hover:bg-white transition-colors shadow-lg shadow-blue-200/50">
            <MessageSquare className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] bg-white p-0">
          <SheetHeader className="px-6 py-4 border-b border-gray-200">
            <SheetTitle className="text-lg font-semibold text-gray-900">Live Transcript</SheetTitle>
            <SheetDescription className="text-sm text-gray-600">Complete conversation history</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(80vh-80px)] px-6 py-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.speaker === 'patient' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium text-white ${
                  msg.speaker === 'coach' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}>
                  {msg.speaker === 'coach' ? 'O' : (userInfo.name?.[0] || 'U')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center gap-2 mb-1 ${msg.speaker === 'patient' ? 'justify-end' : ''}`}>
                    <span className="text-xs font-medium text-gray-700">
                      {msg.speaker === 'coach' ? 'Olivia (Coach)' : userInfo.name}
                    </span>
                  </div>
                  <div className={`inline-block px-4 py-3 rounded-2xl max-w-full break-words ${
                    msg.speaker === 'coach'
                      ? 'bg-gray-100 text-gray-900 rounded-tl-sm'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-tr-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Control Bar */}
      <div className="px-6 py-6 safe-area-bottom">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleToggleMute}
            disabled={callStatus.status !== 'connected'}
            className={`w-16 h-16 rounded-full border-2 ${
              isMuted 
                ? 'bg-red-50 border-red-400 text-red-600 hover:bg-red-100' 
                : 'bg-white border-blue-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30"
          >
            <X className="w-7 h-7" />
          </Button>
        </div>
      </div>
    </div>
  );
}
