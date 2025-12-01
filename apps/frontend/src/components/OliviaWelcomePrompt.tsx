import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, X, ArrowRight, Mic, Video, Heart, Zap, Star, MoveDown, ArrowDown } from 'lucide-react';

interface OliviaWelcomePromptProps {
  onClose: () => void;
}

// Floating bubble component
function FloatingBubble({ delay = 0, duration = 3 }: { delay?: number; duration?: number }) {
  const randomX = Math.random() * 100;
  const randomSize = 20 + Math.random() * 40;
  
  return (
    <motion.div
      initial={{ y: '100%', x: `${randomX}%`, opacity: 0 }}
      animate={{ 
        y: '-100%', 
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.5]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear'
      }}
      className="absolute bottom-0 pointer-events-none"
      style={{
        width: randomSize,
        height: randomSize,
      }}
    >
      <div className="w-full h-full rounded-full bg-white/30 backdrop-blur-sm" />
    </motion.div>
  );
}

// Floating emoji component
function FloatingEmoji({ emoji, delay = 0 }: { emoji: string; delay?: number }) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0, rotate: 0 }}
      animate={{ 
        y: [-10, -20, -10],
        opacity: [0, 1, 0],
        rotate: [0, 360],
        x: [0, 10, -10, 0]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="absolute text-2xl pointer-events-none"
    >
      {emoji}
    </motion.div>
  );
}

// Pulsing dot indicator
function PulsingDot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.6, 1, 0.6]
      }}
      transition={{
        duration: 1.5,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className="w-2 h-2 rounded-full bg-white"
    />
  );
}

export function OliviaWelcomePrompt({ onClose }: OliviaWelcomePromptProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show with delay for smooth appearance
    const timer = setTimeout(() => {
      setShow(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Prompt Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              mass: 0.8
            }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[61] max-w-sm mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
              {/* Header with gradient and floating elements */}
              <div className="relative bg-gradient-to-br from-[#5B7FF3] via-[#6B8FF9] to-[#7B9FF9] p-6 pb-24 overflow-hidden">
                {/* Floating bubbles in background */}
                {[...Array(6)].map((_, i) => (
                  <FloatingBubble key={i} delay={i * 0.5} duration={3 + i * 0.3} />
                ))}

                {/* Floating emojis */}
                <FloatingEmoji emoji="💬" delay={0} />
                <FloatingEmoji emoji="💙" delay={0.5} />
                <FloatingEmoji emoji="✨" delay={1} />
                
                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10 backdrop-blur-sm border border-white/30"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>

                {/* Main Olivia Icon with enhanced animations */}
                <div className="flex justify-center mb-4 relative">
                  {/* Outer pulsing ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="absolute inset-0 m-auto w-28 h-28 rounded-full bg-white"
                  />

                  {/* Middle ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0, 0.4]
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-white"
                  />

                  {/* Main icon container */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="relative z-10"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl relative"
                    >
                      <MessageCircle className="w-10 h-10 text-[#5B7FF3]" />
                      
                      {/* Online indicator */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#10B981] border-3 border-white rounded-full shadow-lg"
                      />
                    </motion.div>

                    {/* Sparkles around icon */}
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      className="absolute inset-0"
                    >
                      <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-300 fill-yellow-300" />
                      <Star className="absolute -bottom-2 -left-2 w-4 h-4 text-pink-300 fill-pink-300" />
                      <Zap className="absolute top-0 -left-3 w-4 h-4 text-blue-300 fill-blue-300" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Title with typing animation effect */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-white text-center mb-2 relative">
                    <span className="inline-block">
                      Meet Olivia 👋
                    </span>
                  </h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/90 text-center text-sm px-4"
                  >
                    Your AI health companion is ready to help!
                  </motion.p>
                </motion.div>

                {/* Animated wave decoration */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
                  <motion.svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="relative w-full h-16"
                    initial={{ x: 0 }}
                    animate={{ x: [-1200, 0] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    <path
                      d="M0,0 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,120 L0,120 Z"
                      fill="rgba(255,255,255,0.1)"
                    />
                  </motion.svg>
                  <motion.svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="absolute bottom-0 w-full h-16"
                    initial={{ x: 0 }}
                    animate={{ x: [-1200, 0] }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    <path
                      d="M0,20 C200,80 400,20 600,50 C800,80 1000,20 1200,50 L1200,120 L0,120 Z"
                      fill="rgba(255,255,255,0.15)"
                    />
                  </motion.svg>
                </div>
              </div>

              {/* Content with overlap */}
              <div className="relative -mt-16 px-6 pb-6 z-10">
                {/* Feature cards with stagger animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-xl p-4 mb-4 space-y-3 border border-gray-100"
                >
                  <FeatureItem
                    icon={MessageCircle}
                    title="Chat Anytime"
                    description="Ask me anything about your health"
                    color="#5B7FF3"
                    delay={0.5}
                  />
                  <FeatureItem
                    icon={Mic}
                    title="Voice Calls"
                    description="Talk to me like a real conversation"
                    color="#10B981"
                    delay={0.6}
                  />
                  <FeatureItem
                    icon={Video}
                    title="Video Chats"
                    description="Face-to-face health guidance"
                    color="#8B5CF6"
                    delay={0.7}
                  />
                </motion.div>

                {/* Animated typing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <span className="text-xs text-gray-400">Olivia is typing</span>
                  <div className="flex gap-1">
                    <PulsingDot delay={0} />
                    <PulsingDot delay={0.2} />
                    <PulsingDot delay={0.4} />
                  </div>
                </motion.div>

                {/* CTA Button with enhanced animation */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0 20px 40px -10px rgba(91, 127, 243, 0.4)'
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-[#5B7FF3] to-[#7B9FF9] text-white rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg shadow-[#5B7FF3]/30 relative overflow-hidden group"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{
                      x: [-200, 400],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: 'easeInOut'
                    }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                  
                  <span className="font-medium relative z-10">Start Chatting with Olivia</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>

                {/* Skip text with subtle animation */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={handleClose}
                  className="w-full text-center text-sm text-gray-400 mt-3 hover:text-gray-600 transition-colors"
                >
                  Maybe later ✨
                </motion.button>

                {/* Bottom decoration - hearts */}
                <div className="flex justify-center gap-2 mt-3">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                    >
                      <Heart className="w-3 h-3 text-pink-300 fill-pink-300" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Animated Arrow pointing to Olivia tab */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              >
                {/* Dotted line */}
                <motion.div
                  animate={{
                    scaleY: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-0.5 h-16 bg-gradient-to-b from-[#5B7FF3] to-transparent"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, #5B7FF3, #5B7FF3 4px, transparent 4px, transparent 8px)'
                  }}
                />
                
                {/* Bouncing arrow */}
                <motion.div
                  animate={{
                    y: [0, 8, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="relative"
                >
                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-[#5B7FF3] rounded-full blur-md"
                  />
                  
                  {/* Arrow icon */}
                  <div className="relative bg-[#5B7FF3] rounded-full p-2 shadow-lg">
                    <ArrowDown className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                </motion.div>

                {/* Pointing text */}
                <motion.div
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="mt-2 bg-[#5B7FF3] text-white text-xs px-3 py-1 rounded-full shadow-lg"
                >
                  Tap here to start
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function FeatureItem({ icon: Icon, title, description, color, delay = 0 }: {
  icon: any;
  title: string;
  description: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ x: 5 }}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
        style={{ backgroundColor: `${color}15` }}
      >
        {/* Pulse ring on hover */}
        <motion.div
          initial={{ scale: 1, opacity: 0 }}
          whileHover={{ scale: 1.5, opacity: 0.3 }}
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: color }}
        />
        <Icon className="w-5 h-5 relative z-10" style={{ color }} />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm font-medium">{title}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
      <motion.div
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Sparkles className="w-3 h-3 text-gray-300" />
      </motion.div>
    </motion.div>
  );
}