import { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [currentSpeaker, setCurrentSpeaker] = useState<'AGENT' | 'USER' | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      content: 'I go to the gym 3-4 times a week, and I try to walk for at least 30 minutes every day.',
    },
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-start conversation
  useEffect(() => {
    let currentIndex = 0;

    const processNextMessage = () => {
      if (currentIndex >= mockConversation.length) {
        setCurrentSpeaker(null);
        setCurrentText('');
        return;
      }
      
      const msg = mockConversation[currentIndex];
      
      // Show speaker and text
      setCurrentSpeaker(msg.role);
      setCurrentText(msg.content);
      
      // Simulate speaking duration
      const speakingDuration = Math.min(msg.content.length * 40, 4000);
      
      setTimeout(() => {
        // Add to message history
        setMessages(prev => [...prev, { ...msg, timestamp: new Date() }]);
        currentIndex++;
        
        // Brief pause before next message
        setTimeout(processNextMessage, 1200);
      }, speakingDuration);
    };

    setTimeout(processNextMessage, 1000);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex flex-col max-w-[390px] mx-auto relative overflow-hidden">
      {/* Minimalist Header */}
      <div className="absolute top-6 left-0 right-0 text-center z-10">
        <p className="text-gray-400 text-sm">{formatDuration(duration)}</p>
      </div>

      {/* Main Content - Visual Focus */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-40 pt-20">
        {/* Central Orb with Breathing Animation */}
        <div className="relative w-full flex items-center justify-center mb-12" style={{ height: '50vh', maxHeight: '400px' }}>
          {/* Animated Wave Rings - Only when speaking */}
          <AnimatePresence>
            {currentSpeaker && (
              <>
                {/* Outer ring */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.3, 0, 0.3], scale: [1, 1.4, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className={`w-72 h-72 rounded-full ${
                    currentSpeaker === 'AGENT' ? 'bg-[#5B7FF3]' : 'bg-[#7C3AED]'
                  } opacity-20`}></div>
                </motion.div>

                {/* Middle ring */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.3, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className={`w-60 h-60 rounded-full ${
                    currentSpeaker === 'AGENT' ? 'bg-[#5B7FF3]' : 'bg-[#7C3AED]'
                  } opacity-30`}></div>
                </motion.div>

                {/* Inner ring */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.2, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className={`w-48 h-48 rounded-full ${
                    currentSpeaker === 'AGENT' ? 'bg-[#5B7FF3]' : 'bg-[#7C3AED]'
                  } opacity-40`}></div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Orb - Breathing effect */}
          <motion.div
            animate={{
              scale: currentSpeaker ? [1, 1.08, 1] : [1, 1.02, 1],
            }}
            transition={{
              duration: currentSpeaker ? 1.5 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10"
          >
            {/* Background glow */}
            <div className={`absolute inset-0 w-48 h-48 rounded-full blur-2xl transition-all duration-700 ${
              currentSpeaker === 'AGENT' 
                ? 'bg-[#5B7FF3] opacity-40' 
                : currentSpeaker === 'USER'
                ? 'bg-[#7C3AED] opacity-40'
                : 'bg-gray-300 opacity-20'
            }`}></div>

            {/* Main sphere */}
            <div className={`relative w-48 h-48 rounded-full transition-all duration-700 ${
              currentSpeaker === 'AGENT'
                ? 'bg-gradient-to-br from-[#6B8FF7] via-[#5B7FF3] to-[#4A6FE3]'
                : currentSpeaker === 'USER'
                ? 'bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9]'
                : 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400'
            }`} style={{
              boxShadow: currentSpeaker 
                ? '0 0 60px rgba(91, 127, 243, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.2)'
                : '0 0 30px rgba(0, 0, 0, 0.1), inset 0 0 30px rgba(255, 255, 255, 0.3)'
            }}>
              {/* Inner gradient highlight */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30"></div>
              
              {/* Animated shine */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full overflow-hidden"
              >
                <div className="absolute -top-1/2 -left-1/4 w-3/4 h-3/4 bg-gradient-to-br from-white/30 via-transparent to-transparent rotate-45"></div>
              </motion.div>

              {/* Waveform visualization when speaking */}
              {currentSpeaker && (
                <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scaleY: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                      }}
                      className="w-1.5 h-16 bg-white/80 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Current Text - Minimal, fade in/out */}
        <div className="w-full px-6 min-h-[80px] flex items-start justify-center">
          <AnimatePresence mode="wait">
            {currentText && (
              <motion.div
                key={currentText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-center max-w-sm"
              >
                <p className="text-gray-700 leading-relaxed">
                  {currentText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Controls - Minimalist */}
      <div className="absolute bottom-0 left-0 right-0 pb-8 px-6 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <div className="flex items-center justify-center gap-8">
          {/* Transcript Button */}
          <button
            onClick={() => setShowTranscript(true)}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform group"
          >
            <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 group-hover:border-gray-200 transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </div>
          </button>

          {/* Microphone Button - Larger, central */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="active:scale-95 transition-transform"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-[#5B7FF3] hover:bg-[#4A6FE3]'
            }`}>
              {isMuted ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </div>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform group"
          >
            <div className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-md flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Transcript Drawer - Slides from bottom */}
      <AnimatePresence>
        {showTranscript && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTranscript(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[70vh] flex flex-col"
            >
              {/* Drawer Handle */}
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="px-6 pb-3 pt-2 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800">Conversation</h3>
                  <button 
                    onClick={() => setShowTranscript(false)}
                    className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4 pb-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        message.role === 'AGENT'
                          ? 'bg-gray-100 text-gray-800 rounded-3xl rounded-tl-lg'
                          : 'bg-[#5B7FF3] text-white rounded-3xl rounded-tr-lg'
                      } px-4 py-3`}>
                        {message.role === 'AGENT' && (
                          <p className="text-xs text-gray-500 mb-1">Olivia</p>
                        )}
                        <p className="leading-relaxed text-sm">
                          {message.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
