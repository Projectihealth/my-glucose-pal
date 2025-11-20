import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MessageCircle, Mic, Video, Sparkles, ChevronDown, ChevronUp, CheckCircle2, Utensils, Activity, Moon, Heart, Pill, MoreHorizontal, Target } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'olivia';
  text: string;
  timestamp: string; // "12:45 AM"
}

interface ActionItem {
  id: string;
  title: string;
  targetCount: number;
  benefit: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
}

interface ConversationData {
  id: string;
  type: 'voice' | 'video' | 'text';
  topic: string;
  topicTag?: string; // Added: topic tag like "Breakfast", "Snack", etc.
  date: string; // "Nov 16"
  fullDate: string; // "November 16, 2024"
  time: string; // "12:45 AM"
  summary: string;
  actionItems?: ActionItem[]; // Todos created in this conversation
  transcript: Message[];
  icon: string;
  color: string;
}

interface ConversationDetailProps {
  conversation: ConversationData;
  onBack: () => void;
}

// Helper function to get category icon (simplified, matching Goal Tab style)
function getCategoryIcon(category: string) {
  const iconMap = {
    diet: Utensils,
    exercise: Activity,
    sleep: Moon,
    stress: Heart,
    medication: Pill,
    other: MoreHorizontal,
  };
  
  return iconMap[category as keyof typeof iconMap] || iconMap.other;
}

export function ConversationDetail({ conversation, onBack }: ConversationDetailProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  
  const typeIcons = {
    voice: Mic,
    video: Video,
    text: MessageCircle,
  };
  
  const TypeIcon = typeIcons[conversation.type];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen pb-6">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
          <div className="max-w-[390px] mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1">
                <h1 className="text-gray-900" style={{ fontSize: '17px', fontWeight: 600 }}>
                  {conversation.topic}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TypeIcon className="w-3 h-3" />
                  <span>
                    {conversation.type === 'voice' ? 'Voice Chat' : 
                     conversation.type === 'video' ? 'Video Chat' : 'Text Chat'}
                  </span>
                  <span>•</span>
                  <span>{conversation.fullDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[390px] mx-auto px-4 py-4 space-y-3">
          {/* Summary Card - Simple, Non-collapsible with Topic Tag */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-[#5B7FF3] flex-shrink-0 mt-0.5" />
                <h2 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 700 }}>
                  Summary
                </h2>
              </div>
              {conversation.topicTag && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
                  {conversation.topicTag}
                </span>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed" style={{ fontSize: '15px' }}>
              {conversation.summary}
            </p>
          </motion.div>

          {/* Action Items Card - Simplified Design */}
          {conversation.actionItems && conversation.actionItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#5B7FF3] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-gray-900" style={{ fontSize: '17px', fontWeight: 600 }}>
                  Goals Created
                </h3>
                <span className="ml-auto px-2.5 py-0.5 bg-blue-100 text-[#5B7FF3] rounded-full text-xs" style={{ fontWeight: 600 }}>
                  {conversation.actionItems.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {conversation.actionItems.map((item, index) => {
                  const CategoryIcon = getCategoryIcon(item.category);
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="w-4 h-4 text-gray-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Target className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600" style={{ fontWeight: 600 }}>
                                {item.targetCount}x/week
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {item.benefit}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Conversation Transcript - Collapsible */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 text-sm mb-0.5" style={{ fontWeight: 600 }}>
                    Conversation
                  </h3>
                  <p className="text-xs text-gray-500">
                    {conversation.transcript.length} messages
                  </p>
                </div>
              </div>
              {showTranscript ? (
                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </button>

            {/* Expanded Transcript */}
            <AnimatePresence>
              {showTranscript && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                    {conversation.transcript.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {message.sender === 'olivia' ? (
                              <div 
                                className="w-7 h-7 rounded-full flex items-center justify-center text-base shadow-sm"
                                style={{ backgroundColor: `${conversation.color}15` }}
                              >
                                {conversation.icon}
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs">👤</span>
                              </div>
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div className="flex flex-col">
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl ${
                                message.sender === 'user'
                                  ? 'bg-[#5B7FF3] text-white rounded-tr-md'
                                  : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-md'
                              }`}
                            >
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                {message.text}
                              </p>
                            </div>
                            {/* Timestamp - only show for first and last message */}
                            {(index === 0 || index === conversation.transcript.length - 1) && (
                              <p className={`text-xs text-gray-400 mt-1 px-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                {message.timestamp}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* End of Conversation */}
                    <div className="flex items-center justify-center pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-8 h-px bg-gray-200"></div>
                        <span>End of conversation</span>
                        <div className="w-8 h-px bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
