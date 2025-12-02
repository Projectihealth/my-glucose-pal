/**
 * Conversation Helpers
 *
 * Utility functions to process conversation data and generate display properties
 */

import { Conversation } from '../services/conversationsApi';

interface ConversationDisplayProps {
  topic: string;
  icon: string;
  color: string;
  achievement?: string;
}

/**
 * Category definitions with associated icons and colors
 * Icons are now SVG-based for a cleaner, more modern look
 */
const CATEGORIES = {
  nutrition: {
    keywords: ['breakfast', 'lunch', 'dinner', 'meal', 'eat', 'food', 'nutrition', 'diet', 'carbs', 'protein', 'snack',
               '早餐', '午餐', '晚餐', '饮食', '食物', '营养', '吃', '酸奶', '鸡蛋', '饺子', '零食', '夜间', '饥饿'],
    icons: ['🍳', '🥗', '🍎', '🥑', '🥕', '🍓', '🥐', '🥙'],
    color: '#FF9F43',
    achievement: 'Nutrition Goal Set'
  },
  sleep: {
    keywords: ['sleep', 'rest', 'bed', 'wake', 'tired', 'fatigue', 'nap',
               '睡眠', '休息', '床', '入睡', '疲劳', '困', '睡觉', '防蓝光', '灯光'],
    icons: ['🌙', '😴', '💤', '🛌', '⭐', '🌟'],
    color: '#A78BFA',
    achievement: 'Sleep Goal Set'
  },
  exercise: {
    keywords: ['exercise', 'workout', 'fitness', 'run', 'walk', 'gym', 'activity', 'sport', 'yoga', 'cardio',
               '运动', '锻炼', '健身', '跑步', '散步', '走路', '活动', '羽毛球', '高尔夫', '网球', '徒步', '膝盖'],
    icons: ['🏃', '🚴', '🧘', '💪', '🤸', '⚽', '🏊', '🚶'],
    color: '#34D399',
    achievement: 'Fitness Plan Ready'
  },
  stress: {
    keywords: ['stress', 'anxiety', 'worried', 'calm', 'relax', 'meditation', 'mindfulness', 'mental health',
               '压力', '焦虑', '担心', '放松', '冥想', '心理'],
    icons: ['💆', '🧘', '🌸', '💝', '🌺', '🦋'],
    color: '#A55EEA',
    achievement: 'Wellness Strategy'
  },
  glucose: {
    keywords: ['glucose', 'blood sugar', 'cgm', 'reading', 'spike', 'drop', 'level', 'range',
               '血糖', '葡萄糖', '读数', '水平'],
    icons: ['📊', '📈', '💉', '🩺', '📉', '🔬'],
    color: '#5B7FF3',
    achievement: 'Glucose Insight'
  },
  medication: {
    keywords: ['medication', 'medicine', 'pill', 'drug', 'prescription', 'dose', 'insulin',
               '药物', '药', '胰岛素', '处方'],
    icons: ['💊', '💉', '🩹', '⚕️', '🏥'],
    color: '#FC5C65',
    achievement: 'Med Plan Updated'
  },
  hydration: {
    keywords: ['water', 'drink', 'hydration', 'fluid', 'beverage',
               '水', '喝', '饮料', '水分'],
    icons: ['💧', '💦', '🥤', '🚰', '🌊'],
    color: '#60A5FA',
    achievement: 'Hydration Goal'
  },
  weight: {
    keywords: ['weight', 'lose', 'gain', 'scale', 'bmi',
               '体重', '减肥', '增重', '胖', '瘦'],
    icons: ['⚖️', '📏', '🎯', '💪', '🏋️'],
    color: '#FD9644',
    achievement: 'Weight Goal Set'
  },
  general: {
    keywords: ['health', 'wellness', 'goal', 'plan', 'habit',
               '健康', '目标', '计划', '习惯'],
    icons: ['✨', '🎯', '💫', '🌈', '🎉', '💡'],
    color: '#26DE81',
    achievement: 'New Goal Created'
  }
};

/**
 * Detect category from summary text and key topics
 */
function detectCategory(summary: string, keyTopics: string[] = []): keyof typeof CATEGORIES {
  // Combine summary and key topics for analysis
  const text = (summary + ' ' + keyTopics.join(' ')).toLowerCase();

  // Count matches for each category
  const scores: Record<string, number> = {};

  for (const [category, config] of Object.entries(CATEGORIES)) {
    scores[category] = config.keywords.filter(keyword =>
      text.includes(keyword.toLowerCase())
    ).length;
  }

  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores));

  if (maxScore > 0) {
    const detectedCategory = Object.entries(scores)
      .find(([_, score]) => score === maxScore)?.[0];

    if (detectedCategory && detectedCategory in CATEGORIES) {
      return detectedCategory as keyof typeof CATEGORIES;
    }
  }

  return 'general';
}

/**
 * Select an icon from the category's icon array based on conversation ID
 * This ensures the same conversation always gets the same icon, but different conversations get different icons
 */
function selectIconForConversation(conversationId: string, category: keyof typeof CATEGORIES): string {
  const icons = CATEGORIES[category].icons;

  // Use conversation ID to deterministically select an icon
  // This way the same conversation always shows the same icon
  let hash = 0;
  for (let i = 0; i < conversationId.length; i++) {
    hash = ((hash << 5) - hash) + conversationId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % icons.length;
  return icons[index];
}

/**
 * Comprehensive Chinese to English translation mapping
 */
const TRANSLATION_MAP: Record<string, string> = {
  // Topics
  '饮食习惯': 'Nutrition Habits',
  '睡眠改善': 'Sleep Schedule',
  '运动计划': 'Exercise Plan',
  '早餐改进': 'Breakfast Nutrition',
  '睡眠环境改善': 'Sleep Quality',
  '夜间饥饿的食物选择': 'Healthy Snacks',
  '膝盖疼痛后的运动计划': 'Recovery Plan',
  '体重管理': 'Weight Management',

  // Common phrases
  '早餐': 'breakfast',
  '午餐': 'lunch',
  '晚餐': 'dinner',
  '饮食': 'diet',
  '食物': 'food',
  '营养': 'nutrition',
  '睡眠': 'sleep',
  '休息': 'rest',
  '入睡': 'fall asleep',
  '运动': 'exercise',
  '锻炼': 'workout',
  '散步': 'walk',
  '走路': 'walking',
  '压力': 'stress',
  '放松': 'relax',
  '药物': 'medication',
  '酸奶': 'yogurt',
  '鸡蛋': 'eggs',
  '建议': 'suggest',
  '推荐': 'recommend',
  '计划': 'plan',
  '目标': 'goal',
};

/**
 * Translate Chinese text to English
 */
function translateToEnglish(text: string): string {
  if (!text) return text;

  // Check if text contains Chinese characters
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);
  if (!hasChinese) return text;

  let translated = text;

  // Replace known phrases
  for (const [chinese, english] of Object.entries(TRANSLATION_MAP)) {
    translated = translated.replace(new RegExp(chinese, 'g'), english);
  }

  // If still has Chinese, create a generic English fallback
  if (/[\u4e00-\u9fa5]/.test(translated)) {
    // Extract any English words that might be mixed in
    const englishWords = translated.match(/[a-zA-Z\s]+/g);
    if (englishWords && englishWords.length > 0) {
      return englishWords.join(' ').trim() || 'Health Discussion';
    }
    return 'Health Discussion';
  }

  return translated;
}

/**
 * Extract topic from summary (first meaningful sentence or key topics)
 */
function extractTopic(summary: string, keyTopics: string[] = [], extractedData: Record<string, any> = {}): string {
  // 0. Prefer model-generated session title if available
  if (extractedData && typeof (extractedData as any).session_title === 'string' && (extractedData as any).session_title.trim().length > 0) {
    return (extractedData as any).session_title.trim();
  }

  const normalizedSummary = (summary || '').toLowerCase();

  // 1. Special-case ultra-brief greeting conversations
  if (normalizedSummary.includes('brief interaction') && normalizedSummary.includes('no specific topics')) {
    return 'Brief Check-in';
  }

  // 2. Check key topics first
  if (keyTopics && keyTopics.length > 0) {
    const topic = translateToEnglish(keyTopics[0]);
    return topic;
  }

  // 3. Check recommendations for topic
  if (extractedData?.specific_recommendations?.[0]?.topic) {
    const topic = extractedData.specific_recommendations[0].topic;
    const translated = translateToEnglish(topic);
    return translated.split('（')[0].split('(')[0]; // Remove parentheses content
  }

  // 4. Check commitments for context
  if (extractedData?.user_commitments?.[0]) {
    const commitment = extractedData.user_commitments[0];
    if (commitment.includes('早餐') || commitment.includes('breakfast')) return 'Breakfast Nutrition';
    if (commitment.includes('睡眠') || commitment.includes('sleep')) return 'Sleep Schedule';
    if (commitment.includes('运动') || commitment.includes('exercise')) return 'Exercise Plan';
    if (commitment.includes('散步') || commitment.includes('walk')) return 'Walking Routine';
  }

  // 5. Fallback to first sentence (translate if needed)
  const firstSentence = summary.split(/[.!?。]/)[0].trim();
  const translated = translateToEnglish(firstSentence);

  if (translated.length > 40) {
    return translated.substring(0, 37) + '...';
  }

  return translated || 'Health Discussion';
}

/**
 * Generate a concise, collaborative summary for display
 * Transforms detailed summaries into 2-3 line snippets with "you and Olivia" perspective
 */
function generateConciseSummary(fullSummary: string, extractedData: Record<string, any>): string {
  // Check for goals/commitments in extracted data
  const hasCommitments = extractedData?.user_commitments?.length > 0;
  const hasRecommendations = extractedData?.specific_recommendations?.length > 0;

  // Template patterns for collaborative summaries
  const templates = {
    nutrition: [
      'Olivia shared benefits of {topic}, and you two set up a goal of {action}.',
      'You and Olivia discussed {topic} and decided on {action}.',
    ],
    sleep: [
      'Discussed improving sleep quality. You decided to {action}.',
      'You and Olivia talked about sleep, and you set a goal to {action}.',
    ],
    exercise: [
      'Created a personalized exercise routine with {action}.',
      'You and Olivia planned {action} to keep you active.',
    ],
    general: [
      'Olivia helped you plan {action}.',
      'You and Olivia worked on {action} together.',
    ],
  };

  // Extract main commitment or recommendation
  if (hasCommitments && extractedData.user_commitments[0]) {
    const commitment = extractedData.user_commitments[0];

    // Translate Chinese commitments to English summaries
    if (commitment.includes('早餐') || commitment.includes('breakfast')) {
      return 'Olivia shared benefits of eating breakfast, and you two set up a goal of eating nutritious breakfast 4 times a week.';
    }
    if (commitment.includes('睡眠') || commitment.includes('sleep') || commitment.includes('入睡')) {
      return 'Discussed improving sleep quality. You decided to go to bed before 11 PM every night.';
    }
    if (commitment.includes('散步') || commitment.includes('walking') || commitment.includes('walk')) {
      return 'Created a light activity plan with 20-30 minute walks while your knee recovers.';
    }
    if (commitment.includes('酸奶') || commitment.includes('yogurt')) {
      return 'Olivia suggested healthy nighttime snacks. You decided to try yogurt when feeling hungry.';
    }
  }

  // Check recommendations for context
  if (hasRecommendations && extractedData.specific_recommendations[0]) {
    const rec = extractedData.specific_recommendations[0];
    const topic = rec.topic || '';

    if (topic.includes('睡眠') || topic.includes('sleep')) {
      return 'You and Olivia discussed sleep strategies and created a wind-down routine for better rest.';
    }
    if (topic.includes('运动') || topic.includes('exercise')) {
      return 'Planned a gentle recovery exercise routine to help you stay active.';
    }
    if (topic.includes('早餐') || topic.includes('breakfast')) {
      return 'Talked about breakfast timing and portions to improve your appetite throughout the day.';
    }
  }

  // Fallback: extract key action from summary and translate
  const sentences = fullSummary.split(/[.。]/);
  if (sentences.length > 1) {
    // Look for key phrases that indicate action
    for (const sentence of sentences) {
      const translatedSentence = translateToEnglish(sentence);
      if (translatedSentence.includes('suggest') || translatedSentence.includes('recommend')) {
        const shortSentence = translatedSentence.substring(0, 80).trim();
        return 'Olivia ' + shortSentence.toLowerCase() + '.';
      }
      if (translatedSentence.includes('plan') || translatedSentence.includes('goal')) {
        return 'You and Olivia created a plan together to support your health goals.';
      }
    }
  }

  // Last fallback: translate and use first 100 characters
  const translatedSummary = translateToEnglish(fullSummary);
  const shortSummary = translatedSummary.substring(0, 100).trim();
  return shortSummary + (translatedSummary.length > 100 ? '...' : '');
}

/**
 * Format date to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Use local date comparison (ignore time) to avoid timezone issues
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return 'Last ' + days[date.getDay()];
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }
}

/**
 * Format full date
 */
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Determine if conversation has achievement based on extracted data
 */
function detectAchievement(conversation: Conversation, category: keyof typeof CATEGORIES): string | undefined {
  // Check if there are action items or goals created
  const hasGoals = conversation.extracted_data?.goals?.length > 0;
  const hasTodos = conversation.extracted_data?.todos?.length > 0;
  const hasActionItems = conversation.extracted_data?.action_items?.length > 0;

  if (hasGoals || hasTodos || hasActionItems) {
    return CATEGORIES[category].achievement;
  }

  return undefined;
}

/**
 * Process conversation data to generate display properties
 */
export function processConversation(conversation: Conversation): ConversationDisplayProps & {
  date: string;
  fullDate: string;
  type: 'voice' | 'video' | 'text';
  id: string;
  summary: string;
  fullSummary: string;
} {
  const category = detectCategory(conversation.summary, conversation.key_topics);
  const topic = extractTopic(conversation.summary, conversation.key_topics, conversation.extracted_data);
  const achievement = detectAchievement(conversation, category);
  const conciseSummary = generateConciseSummary(conversation.summary, conversation.extracted_data);
  const icon = selectIconForConversation(conversation.id, category);

  // Map conversation type
  let type: 'voice' | 'video' | 'text';
  if (conversation.type === 'retell_voice') {
    type = 'voice';
  } else if (conversation.type === 'tavus_video') {
    type = 'video';
  } else {
    type = 'text';
  }

  return {
    id: conversation.id,
    date: formatDate(conversation.started_at),
    fullDate: formatFullDate(conversation.started_at),
    type,
    topic,
    summary: conciseSummary,
    fullSummary: conversation.summary,
    achievement,
    icon,
    color: CATEGORIES[category].color,
  };
}

/**
 * Process multiple conversations
 */
export function processConversations(conversations: Conversation[]) {
  return conversations.map(processConversation);
}
