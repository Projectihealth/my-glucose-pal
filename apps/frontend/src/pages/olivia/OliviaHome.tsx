import { useNavigate } from 'react-router-dom';
import { Mic, Video, MessageSquare } from 'lucide-react';

export function OliviaHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      <OliviaTab onNavigate={(view) => navigate(`/coach/${view}`)} />
    </div>
  );
}

function OliviaTab({ onNavigate }: { onNavigate: (view: 'text' | 'voice' | 'video') => void }) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-left space-y-4 pt-8 pb-4">
        <div className="space-y-2">
          <p className="text-[#5B7FF3] text-xs font-semibold tracking-[0.15em] uppercase">
            OLIVIA
          </p>
          <h1 className="text-gray-900 text-4xl font-bold leading-tight">
            Talk with your AI health companion
          </h1>
        </div>
        <p className="text-gray-600 text-lg leading-relaxed">
          Connect with Olivia through voice or video for personalized health guidance.
        </p>
      </div>

      {/* Chat Options */}
      <div className="space-y-4 pt-4">
        {/* Voice Chat Button - Featured First */}
        <button
          onClick={() => onNavigate('voice')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <Mic className="w-7 h-7 text-[#5B7FF3]" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-800 text-lg mb-1">Voice Chat</h3>
              <p className="text-gray-500 text-sm">
                Have a natural conversation about your health
              </p>
            </div>
          </div>
        </button>

        {/* Text Chat Button */}
        <button
          onClick={() => onNavigate('text')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-7 h-7 text-[#5B7FF3]" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-800 text-lg mb-1">Text Chat</h3>
              <p className="text-gray-500 text-sm">
                Message Olivia about your health
              </p>
            </div>
          </div>
        </button>

        {/* Video Chat Button */}
        <button
          onClick={() => onNavigate('video')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <Video className="w-7 h-7 text-[#5B7FF3]" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-800 text-lg mb-1">Video Chat</h3>
              <p className="text-gray-500 text-sm">
                Face-to-face interaction with visual support
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-[#EEF2FF] rounded-3xl p-6 mt-8">
        <h3 className="text-[#5B7FF3] text-sm mb-3 flex items-center gap-2">
          <span className="text-lg">✨</span>
          Olivia can help you with
        </h3>
        <div className="space-y-2 text-gray-600 text-sm">
          <p>• Real-time glucose monitoring and insights</p>
          <p>• Pattern identification and analysis</p>
          <p>• Personalized health recommendations</p>
          <p>• Progress tracking and goal setting</p>
        </div>
      </div>
    </div>
  );
}

export default OliviaHome;
