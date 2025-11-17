import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileCallInterface } from './MobileCallInterface';
import { CallResults } from './CallResults';

function VoiceChat() {
  const [view, setView] = useState<'call' | 'results'>('call');
  const [callId, setCallId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleCallEnded = (endedCallId: string | null, endedTranscript: any[]) => {
    setCallId(endedCallId);
    setTranscript(endedTranscript);
    setView('results');
  };

  const handleBackFromCall = () => {
    navigate('/');
  };

  const handleBackFromResults = () => {
    navigate('/');
  };

  return (
    <>
      {view === 'call' && (
        <MobileCallInterface 
          onBack={handleBackFromCall}
          onCallEnded={handleCallEnded}
        />
      )}
      {view === 'results' && (
        <CallResults 
          onBack={handleBackFromResults}
          callId={callId}
          transcript={transcript}
        />
      )}
    </>
  );
}

export default VoiceChat;
