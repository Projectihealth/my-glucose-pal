import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  MessageCircle,
  Mic,
  Video,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Utensils,
  Activity,
  Moon,
  Heart,
  Pill,
  MoreHorizontal,
  Target
} from 'lucide-react';
import { getConversationDetail, ConversationDetail as ConversationDetailType } from '../../services/conversationsApi';

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

interface ProcessedConversationData {
  id: string;
  type: 'voice' | 'video' | 'text';
  topic: string;
  topicTag?: string;
  date: string;
  fullDate: string;
  time: string;
  summary: string;
  actionItems?: ActionItem[];
  transcript: Message[];
  icon: string;
  color: string;
}

// Helper function to get category icon
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

// Helper function to parse transcript into message format
function parseTranscript(transcript: string, conversationType: string): Message[] {
  if (!transcript) return [];

  try {
    // Try to parse as JSON first (for structured transcripts)
    const parsed = JSON.parse(transcript);

    if (Array.isArray(parsed)) {
      // Already in array format
      return parsed.map((msg, index) => ({
        id: msg.id || `msg-${index}`,
        sender: msg.role === 'assistant' || msg.sender === 'olivia' ? 'olivia' : 'user',
        text: msg.content || msg.text || msg.message || '',
        timestamp: msg.timestamp || ''
      }));
    } else if (typeof parsed === 'object' && parsed.messages) {
      // Has a messages property
      return parsed.messages.map((msg: any, index: number) => ({
        id: msg.id || `msg-${index}`,
        sender: msg.role === 'assistant' || msg.sender === 'olivia' ? 'olivia' : 'user',
        text: msg.content || msg.text || msg.message || '',
        timestamp: msg.timestamp || ''
      }));
    }
  } catch (e) {
    // Not JSON, parse as plain text
  }

  // Parse plain text transcript
  const lines = transcript.split('\n').filter(line => line.trim());
  const messages: Message[] = [];

  lines.forEach((line, index) => {
    // Try to detect speaker patterns like "User: " or "Olivia: " or "Assistant: "
    const userMatch = line.match(/^(User|You):\s*(.+)$/i);
    const assistantMatch = line.match(/^(Olivia|Assistant|AI):\s*(.+)$/i);

    if (userMatch) {
      messages.push({
        id: `msg-${index}`,
        sender: 'user',
        text: userMatch[2].trim(),
        timestamp: ''
      });
    } else if (assistantMatch) {
      messages.push({
        id: `msg-${index}`,
        sender: 'olivia',
        text: assistantMatch[2].trim(),
        timestamp: ''
      });
    } else if (line.trim()) {
      // If no clear pattern, alternate between user and olivia
      messages.push({
        id: `msg-${index}`,
        sender: index % 2 === 0 ? 'user' : 'olivia',
        text: line.trim(),
        timestamp: ''
      });
    }
  });

  return messages;
}

// Helper function to translate Chinese to English
function translateText(text: string): string {
  if (!text) return text;
  
  const translationMap: Record<string, string> = {
    '饮食习惯': 'Nutrition Habits',
    '睡眠改善': 'Sleep Schedule',
    '夜间饥饿的食物选择': 'Healthy Snacks',
    '早餐': 'Breakfast',
    '午餐': 'Lunch',
    '晚餐': 'Dinner',
    '零食': 'Snack',
    '睡眠': 'Sleep',
    '运动': 'Exercise',
    '压力': 'Stress',
    '药物': 'Medication',
    '饮食': 'diet',
    '食物': 'food',
    '吃': 'eat',
    '散步': 'walk',
    '饱腹感': 'satiety',
    '锻炼': 'workout',
    '入睡': 'sleep',
    '放松': 'relax',
    '药': 'medication',
    '胰岛素': 'insulin',
  };
  
  let translated = text;
  for (const [chinese, english] of Object.entries(translationMap)) {
    translated = translated.replace(new RegExp(chinese, 'g'), english);
  }
  
  // If still contains Chinese, return English fallback
  if (/[\u4e00-\u9fa5]/.test(translated)) {
    const englishWords = translated.match(/[a-zA-Z\s]+/g);
    if (englishWords && englishWords.length > 0) {
      return englishWords.join(' ').trim() || text;
    }
  }
  
  return translated;
}

// Helper function to extract topic tag from key topics or summary
function extractTopicTag(keyTopics: string[] | null, extractedData: any): string | undefined {
  if (keyTopics && keyTopics.length > 0) {
    const firstTopic = keyTopics[0];
    return translateText(firstTopic);
  }

  // Try to extract from specific_recommendations
  if (extractedData?.specific_recommendations?.[0]?.topic) {
    const topic = extractedData.specific_recommendations[0].topic;
    return topic.split('（')[0].split('(')[0]; // Remove parentheses content
  }

  return undefined;
}

// Helper function to convert extracted data to action items format
function extractActionItems(extractedData: any, conversationIcon: string, conversationColor: string): ActionItem[] {
  const items: ActionItem[] = [];

  // Try to extract from user_commitments
  if (extractedData?.user_commitments && Array.isArray(extractedData.user_commitments)) {
    extractedData.user_commitments.forEach((commitment: string, index: number) => {
      // Translate the commitment text
      const translatedCommitment = translateText(commitment);
      
      // Try to extract target count from commitment text (Chinese or English)
      const countMatchChinese = commitment.match(/(\d+)\s*次/);
      const countMatchEnglish = translatedCommitment.match(/(\d+)\s*times?/i);
      const targetCount = countMatchChinese ? parseInt(countMatchChinese[1]) : 
                          countMatchEnglish ? parseInt(countMatchEnglish[1]) : 3;

      // Determine category based on keywords (check both original and translated)
      let category: ActionItem['category'] = 'other';
      const checkText = (commitment + ' ' + translatedCommitment).toLowerCase();
      
      if (checkText.includes('breakfast') || checkText.includes('diet') || checkText.includes('eat') || checkText.includes('food')) {
        category = 'diet';
      } else if (checkText.includes('exercise') || checkText.includes('walk') || checkText.includes('workout')) {
        category = 'exercise';
      } else if (checkText.includes('sleep')) {
        category = 'sleep';
      } else if (checkText.includes('stress') || checkText.includes('relax')) {
        category = 'stress';
      } else if (checkText.includes('medication') || checkText.includes('insulin')) {
        category = 'medication';
      }

      // Get benefit from specific_recommendations if available, and translate it
      let benefit = 'Helps improve overall health';
      if (extractedData.specific_recommendations?.[index]?.rationale) {
        benefit = translateText(extractedData.specific_recommendations[index].rationale);
      }

      items.push({
        id: `action-${index}`,
        title: translatedCommitment,
        targetCount,
        benefit,
        category
      });
    });
  }

  return items;
}

function ConversationDetailContent({ conversation, onBack }: {
  conversation: ProcessedConversationData;
  onBack: () => void;
}) {
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
          {/* Summary Card */}
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

          {/* Action Items Card */}
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
                        <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="w-4 h-4 text-gray-600" />
                        </div>

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
          {conversation.transcript && conversation.transcript.length > 0 && (
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
                              {message.timestamp && (index === 0 || index === conversation.transcript.length - 1) && (
                                <p className={`text-xs text-gray-400 mt-1 px-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                  {message.timestamp}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

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
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationDetail() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversation, setConversation] = useState<ConversationDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await getConversationDetail(conversationId);
        setConversation(data);
      } catch (err) {
        console.error('Failed to fetch conversation detail:', err);
        setError('Failed to load conversation details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <MessageCircle className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm" style={{ fontWeight: 500 }}>
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-full bg-[#F8F9FA]">
        <div className="px-6 py-8">
          <button
            onClick={() => navigate('/coach')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span style={{ fontWeight: 500 }}>Back</span>
          </button>

          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500 text-sm mb-1" style={{ fontWeight: 500 }}>
              {error || 'Conversation not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Process conversation data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Extract topic using the same logic as conversation cards
  const extractTopicFromData = (): string => {
    // Check key topics first
    if (conversation.key_topics && conversation.key_topics.length > 0) {
      const topic = translateText(conversation.key_topics[0]);
      return topic;
    }

    // Check recommendations for topic
    if (conversation.extracted_data?.specific_recommendations?.[0]?.topic) {
      const topic = conversation.extracted_data.specific_recommendations[0].topic;
      const translated = translateText(topic);
      return translated.split('（')[0].split('(')[0]; // Remove parentheses content
    }

    // Check commitments for context
    if (conversation.extracted_data?.user_commitments?.[0]) {
      const commitment = conversation.extracted_data.user_commitments[0];
      if (commitment.includes('早餐') || commitment.includes('breakfast')) return 'Breakfast Nutrition';
      if (commitment.includes('睡眠') || commitment.includes('sleep')) return 'Sleep Schedule';
      if (commitment.includes('运动') || commitment.includes('exercise')) return 'Exercise Plan';
      if (commitment.includes('散步') || commitment.includes('walk')) return 'Walking Routine';
      if (commitment.includes('酸奶') || commitment.includes('yogurt') || commitment.includes('夜间') || commitment.includes('饥饿')) return 'Healthy Snacks';
    }

    return 'Health Discussion';
  };

  const processedConversation: ProcessedConversationData = {
    id: conversation.id,
    type: conversation.type === 'retell_voice' ? 'voice' :
          conversation.type === 'tavus_video' ? 'video' : 'text',
    topic: extractTopicFromData(),
    topicTag: extractTopicTag(conversation.key_topics, conversation.extracted_data),
    date: formatDate(conversation.started_at).split(',')[0],
    fullDate: formatDate(conversation.started_at),
    time: formatTime(conversation.started_at),
    summary: translateText(conversation.summary || 'No summary available'),
    actionItems: extractActionItems(conversation.extracted_data, '✨', '#5B7FF3'),
    transcript: parseTranscript(conversation.transcript || '', conversation.type),
    icon: '✨',
    color: '#5B7FF3'
  };

  return (
    <ConversationDetailContent
      conversation={processedConversation}
      onBack={() => navigate('/coach')}
    />
  );
}

export default ConversationDetail;
