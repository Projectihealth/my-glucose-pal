import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Mic, Video, MessageCircle, Sparkles, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { processConversations } from '../../utils/conversationHelpers';
import { getStoredUserId, USER_ID_CHANGE_EVENT } from '@/utils/userUtils';
import { useConversationHistory, usePrefetchConversationDetail } from '../../hooks/useConversations';
import { TabHeader } from '@/components/TabHeader';
import { deleteConversation } from '../../services/conversationsApi';
import { useQueryClient } from '@tanstack/react-query';

function OliviaHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <OliviaTab onNavigate={(view) => navigate(`/coach/${view}`)} />
    </div>
  );
}

interface ProcessedConversation {
  id: string;
  date: string;
  fullDate: string;
  type: 'voice' | 'video' | 'text';
  topic: string;
  summary: string;
  fullSummary: string;
  achievement?: string;
  icon: string;
  color: string;
}

function OliviaTab({ onNavigate }: { onNavigate: (view: 'voice' | 'video' | 'text') => void }) {
  const [showChatModal, setShowChatModal] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [activeUserId, setActiveUserId] = useState(() => getStoredUserId());
  const queryClient = useQueryClient();
  
  // Use React Query hook for conversation history (with caching)
  const { data, isLoading, error } = useConversationHistory(activeUserId, 10);
  const prefetchDetail = usePrefetchConversationDetail();

  // Process conversations data
  const conversationHistory = useMemo(() => {
    if (!data?.conversations) return [];
    return processConversations(data.conversations);
  }, [data]);

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      
      // Invalidate and refetch conversation history
      queryClient.invalidateQueries({ queryKey: ['conversationHistory', activeUserId] });
      
      console.log(`✅ Deleted conversation: ${conversationId}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  // Listen for user changes
  useEffect(() => {
    const handleUserChange = () => {
      setActiveUserId(getStoredUserId());
    };
    window.addEventListener('storage', handleUserChange);
    window.addEventListener(USER_ID_CHANGE_EVENT, handleUserChange);
    return () => {
      window.removeEventListener('storage', handleUserChange);
      window.removeEventListener(USER_ID_CHANGE_EVENT, handleUserChange);
    };
  }, []);

  const recentConversations = showAllHistory
    ? conversationHistory
    : conversationHistory.slice(0, 2);

  return (
    <>
      <div className="px-6 space-y-6">
        <TabHeader
          eyebrow="Olivia AI"
          title="Your Personal Health Companion"
          subtitle="Connect with Olivia for personalized health guidance and support."
        />

        {/* Main Chat Button */}
        <button
          onClick={() => setShowChatModal(true)}
          className="w-full group relative overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-[#5B7FF3]/5 to-[#7B9FF9]/5 rounded-3xl p-8 border border-[#5B7FF3]/20 hover:border-[#5B7FF3]/40 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B7FF3]/10 to-[#5B7FF3]/5 flex items-center justify-center border border-[#5B7FF3]/20">
                    <Sparkles className="w-8 h-8 text-[#5B7FF3]" strokeWidth={2.5} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="text-left">
                  <h2 className="text-gray-900 text-xl mb-1" style={{ fontWeight: 700 }}>
                    Chat with Olivia
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Voice • Video • Text
                  </p>
                </div>
              </div>
              <div className="text-[#5B7FF3]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </button>

        {/* Recent Conversations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900" style={{ fontSize: '17px', fontWeight: 600 }}>
              Recent Conversations
            </h3>
            {conversationHistory.length > 2 && (
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#5B7FF3] hover:bg-[#5B7FF3]/5 active:scale-95 transition-all duration-200 shadow-sm"
              >
                <span className="text-[#5B7FF3] text-sm" style={{ fontWeight: 600 }}>
                  {showAllHistory ? 'Show Less' : `View All (${conversationHistory.length})`}
                </span>
                {showAllHistory ? (
                  <ChevronUp className="w-4 h-4 text-[#5B7FF3]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#5B7FF3]" />
                )}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <MessageCircle className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm mb-1" style={{ fontWeight: 500 }}>
                Loading conversations...
              </p>
            </div>
          ) : conversationHistory.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm mb-1" style={{ fontWeight: 500 }}>
                No conversations yet
              </p>
              <p className="text-gray-400 text-xs">
                Start chatting with Olivia to see your history here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentConversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onNavigate={onNavigate}
                  onPrefetch={prefetchDetail}
                  onDelete={handleDeleteConversation}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="text-center">
              <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#5B7FF3' }}>
                24/7
              </div>
              <p className="text-xs text-gray-500">Available</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="text-center">
              <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#5B7FF3' }}>
                &lt;1s
              </div>
              <p className="text-xs text-gray-500">Response</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="text-center">
              <div className="text-2xl mb-1" style={{ fontWeight: 700, color: '#5B7FF3' }}>
                100%
              </div>
              <p className="text-xs text-gray-500">Private</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#F5F7FA] rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-[#5B7FF3] mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
            <span>✨</span>
            Olivia can help you with
          </h3>
          <div className="space-y-3 text-gray-600 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
              <p>Daily health check-ins and symptom tracking</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
              <p>Meal planning and nutrition guidance</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
              <p>Exercise and activity recommendations</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
              <p>Sleep pattern analysis and improvement tips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Mode Selection Modal */}
      {showChatModal && (
        <ChatModeModal
          onClose={() => setShowChatModal(false)}
          onSelectMode={(mode) => {
            setShowChatModal(false);
            onNavigate(mode);
          }}
        />
      )}
    </>
  );
}

function ConversationCard({
  conversation,
  onNavigate,
  onPrefetch,
  onDelete,
}: {
  conversation: ProcessedConversation;
  onNavigate: (view: 'voice' | 'video' | 'text') => void;
  onPrefetch?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
}) {
  const navigate = useNavigate();
  
  // Swipe State
  const [swipeOffset, setSwipeOffset] = useState(0);
  const offsetRef = useRef(0);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    // If swiped open, tap closes it
    if (Math.abs(swipeOffset) > 10) {
      resetSwipe();
      return;
    }
    // Navigate to conversation detail page
    navigate(`/coach/conversation/${conversation.id}`);
  };

  const handleMouseEnter = () => {
    // Prefetch conversation detail on hover
    if (onPrefetch) {
      onPrefetch(conversation.id);
    }
  };

  // --- SWIPE LOGIC ---
  const updateOffset = (val: number) => {
    offsetRef.current = val;
    setSwipeOffset(val);
  };

  const resetSwipe = () => {
    updateOffset(0);
  };

  const handleDragStart = (clientX: number) => {
    startX.current = clientX;
    isDragging.current = false;
  };

  const handleDragMove = (clientX: number) => {
    if (startX.current === null) return;
    const diff = clientX - startX.current;
    if (Math.abs(diff) > 5) isDragging.current = true;

    if (isDragging.current) {
      // Only allow left swipe (negative values) for delete
      const constrainedDiff = Math.max(-100, Math.min(0, diff));
      updateOffset(constrainedDiff);
    }
  };

  const handleDragEnd = () => {
    // Snap logic
    if (offsetRef.current < -50) {
      // Snap to Delete (Left)
      updateOffset(-80);
    } else {
      // Reset
      updateOffset(0);
    }
    startX.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleDragEnd();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startX.current !== null && e.buttons === 1) {
      e.preventDefault();
      handleDragMove(e.clientX);
    }
  };

  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => {
    if (startX.current !== null) handleDragEnd();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation? This action cannot be undone.")) {
      if (onDelete) {
        onDelete(conversation.id);
      }
    } else {
      resetSwipe();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl group w-full">
      {/* Background Action Layer: DELETE (Left Swipe / Right Side) */}
      <div className="absolute inset-y-0 right-0 w-24 bg-red-50 flex items-center justify-end rounded-r-2xl z-0">
        <button 
          onClick={handleDelete}
          className="flex flex-col items-center justify-center text-red-500 p-2 w-full h-full hover:bg-red-100 transition-colors cursor-pointer"
        >
          <Trash2 className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase">Delete</span>
        </button>
      </div>

      {/* Main Card Content */}
      <button
        ref={cardRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="w-full opacity-0 animate-fade-in relative z-10 transition-transform duration-300 ease-out select-none"
        style={{
          animation: 'fadeIn 0.5s ease-out forwards',
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5B7FF3]/30 transition-all duration-200 active:scale-[0.98]">
          <div className="flex items-start gap-3.5">
          {/* Icon - Emoji with soft gradient background */}
          <div className="flex flex-col items-center gap-1.5 min-w-[60px] pt-0.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${conversation.color}20 0%, ${conversation.color}10 100%)`,
                border: `1.5px solid ${conversation.color}30`
              }}
            >
              <span className="text-2xl">{conversation.icon}</span>
            </div>
            <p className="text-[10px] text-gray-400 text-center leading-tight" style={{ fontWeight: 500 }}>
              {conversation.date}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            {/* Header with topic and type icon */}
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-gray-900 leading-tight pr-2" style={{ fontSize: '16px', fontWeight: 600 }}>
                {conversation.topic}
              </h4>
              <div className="flex-shrink-0">
                {conversation.type === 'voice' ? (
                  <Mic className="w-4 h-4 text-gray-400" />
                ) : conversation.type === 'video' ? (
                  <Video className="w-4 h-4 text-gray-400" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Summary - Limited to 2 lines */}
            <p className="text-gray-600 leading-snug mb-2.5 line-clamp-2" style={{ fontSize: '14px' }}>
              {conversation.summary}
            </p>

            {/* Achievement badge - Purple bubble style */}
            {conversation.achievement && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                   style={{
                     backgroundColor: '#7C3AED15',
                     border: '1px solid #7C3AED30'
                   }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
                <span className="text-xs" style={{ fontWeight: 600, color: '#7C3AED' }}>
                  {conversation.achievement}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

function ChatModeModal({
  onClose,
  onSelectMode,
}: {
  onClose: () => void;
  onSelectMode: (mode: 'voice' | 'video' | 'text') => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        animation: 'fadeIn 0.3s ease-out forwards',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Bottom Sheet */}
      <div
        className={`relative bg-white rounded-t-3xl shadow-2xl w-full max-w-[390px] transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle Bar */}
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-6 pb-8 pt-2">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-gray-900 text-center text-xl mb-1" style={{ fontWeight: 700 }}>
              Choose Chat Mode
            </h2>
            <p className="text-gray-500 text-center text-sm">
              Select how you'd like to connect with Olivia
            </p>
          </div>

          {/* Chat Mode Options */}
          <div className="space-y-3 mb-4">
            {/* Voice Chat */}
            <button
              onClick={() => onSelectMode('voice')}
              className="w-full group"
            >
              <div className="bg-gradient-to-r from-[#5B7FF3]/5 to-[#7B9FF9]/5 rounded-2xl p-5 border border-[#5B7FF3]/20 hover:border-[#5B7FF3]/40 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5B7FF3]/10 to-[#5B7FF3]/5 flex items-center justify-center border border-[#5B7FF3]/10">
                      <Mic className="w-6 h-6 text-[#5B7FF3]" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-gray-900 mb-0.5" style={{ fontSize: '17px', fontWeight: 600 }}>
                      Voice Chat
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Natural conversation
                    </p>
                  </div>
                  <div className="text-[#5B7FF3]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {/* Video Chat */}
            <button
              onClick={() => onSelectMode('video')}
              className="w-full group"
            >
              <div className="bg-gradient-to-r from-[#5B7FF3]/5 to-[#7B9FF9]/5 rounded-2xl p-5 border border-[#5B7FF3]/20 hover:border-[#5B7FF3]/40 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5B7FF3]/10 to-[#5B7FF3]/5 flex items-center justify-center border border-[#5B7FF3]/10">
                      <Video className="w-6 h-6 text-[#5B7FF3]" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-gray-900 mb-0.5" style={{ fontSize: '17px', fontWeight: 600 }}>
                      Video Chat
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Face-to-face support
                    </p>
                  </div>
                  <div className="text-[#5B7FF3]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {/* Text Chat */}
            <button
              onClick={() => onSelectMode('text')}
              className="w-full group"
            >
              <div className="bg-gradient-to-r from-[#5B7FF3]/5 to-[#7B9FF9]/5 rounded-2xl p-5 border border-[#5B7FF3]/20 hover:border-[#5B7FF3]/40 hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5B7FF3]/10 to-[#5B7FF3]/5 flex items-center justify-center border border-[#5B7FF3]/10">
                      <MessageCircle className="w-6 h-6 text-[#5B7FF3]" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-gray-900 mb-0.5" style={{ fontSize: '17px', fontWeight: 600 }}>
                      Text Chat
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Message-based assistance
                    </p>
                  </div>
                  <div className="text-[#5B7FF3]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={handleClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl py-3.5 transition-all active:scale-[0.98] text-center"
            style={{ fontWeight: 600, fontSize: '15px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default OliviaHome;
