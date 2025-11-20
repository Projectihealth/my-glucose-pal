import { useState, useEffect } from 'react';
import { ArrowLeft, PhoneOff, Mic, MicOff, Video, VideoOff, Bot, User } from 'lucide-react';

interface MobileVideoInterfaceProps {
  onBack: () => void;
  onCallEnded: () => void;
}

export function MobileVideoInterface({ onBack, onCallEnded }: MobileVideoInterfaceProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

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
    <div className="min-h-screen bg-gray-900 flex flex-col max-w-[390px] mx-auto relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-5 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="p-2.5 bg-white/20 backdrop-blur-md rounded-full active:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <h2 className="text-white">Olivia</h2>
            </div>
            <p className="text-white/80">{formatDuration(duration)}</p>
          </div>
          
          <div className="w-12" />
        </div>
      </div>

      {/* Main Video Area - Olivia */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        {/* Video Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#5B7FF3] to-[#4A6FE3] mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-[#5B7FF3]/30 animate-pulse">
              <Bot className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-white/90 mb-2">Olivia AI</h3>
            <p className="text-white/60">Your health companion</p>
          </div>
        </div>

        {/* User Video (Small floating window) */}
        <div className="absolute top-20 right-4 w-24 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
          {isVideoOn ? (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-10 h-10 text-white/60" />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/40" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-6 py-8">
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isMuted 
                ? 'bg-white/20 backdrop-blur-md' 
                : 'bg-white/10 backdrop-blur-md hover:bg-white/20'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-red-500/50"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
              !isVideoOn 
                ? 'bg-white/20 backdrop-blur-md' 
                : 'bg-white/10 backdrop-blur-md hover:bg-white/20'
            }`}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}