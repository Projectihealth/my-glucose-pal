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
      <div className="space-y-4 pt-6 pb-2">
        <p className="text-[#5B7FF3] tracking-widest text-sm">
          OLIVIA
        </p>
        <h1 className="text-gray-900 text-4xl leading-tight" style={{ fontWeight: 700 }}>
          Talk with your AI health companion
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Connect with Olivia through voice or video for personalized health guidance.
        </p>
      </div>

      {/* Chat Options */}
      <div className="space-y-3 pt-2">
        {/* Voice Chat Button - Featured First */}
        <button
          onClick={() => onNavigate('voice')}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1ED6FF] via-[#1E90FF] to-[#1E5AA6] flex items-center justify-center flex-shrink-0 shadow-md">
              <Mic className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-800 mb-1">Voice Chat</h3>
              <p className="text-gray-500">
                Have a natural conversation about your health
              </p>
            </div>
          </div>
        </button>

        {/* Text Chat Button */}
        <button
          onClick={() => onNavigate('text')}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1ED6FF] via-[#1E90FF] to-[#1E5AA6] flex items-center justify-center flex-shrink-0 shadow-md">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-800 mb-1">Text Chat</h3>
              <p className="text-gray-500">
                Message Olivia about your health
              </p>
            </div>
          </div>
        </button>

        {/* Video Chat Button */}
        <button
          onClick={() => onNavigate('video')}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1ED6FF] via-[#1E90FF] to-[#1E5AA6] flex items-center justify-center flex-shrink-0 shadow-md">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-800 mb-1">Video Chat</h3>
              <p className="text-gray-500">
                Face-to-face interaction with visual support
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-[#F5F7FA] rounded-3xl p-6 mt-6 border border-gray-100 shadow-sm">
        <h3 className="text-[#5B7FF3] mb-4 flex items-center gap-2">
          <span>✨</span>
          Olivia can help you with
        </h3>
        <div className="space-y-3 text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
            <p>Real-time glucose monitoring and insights</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
            <p>Pattern identification and analysis</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
            <p>Personalized health recommendations</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5B7FF3] mt-2 flex-shrink-0"></div>
            <p>Progress tracking and goal setting</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OliviaHome;
