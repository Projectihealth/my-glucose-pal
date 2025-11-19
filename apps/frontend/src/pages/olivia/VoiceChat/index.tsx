import { useNavigate } from 'react-router-dom';
import { MobileCallInterface } from './MobileCallInterface';

function VoiceChat() {
  const navigate = useNavigate();

  const handleCallEnded = (endedCallId: string | null, endedTranscript: any[]) => {
    // Navigate to CallResultsPage with state
    // Note: We need to get conversationId and durationSeconds from the call
    // For now, using callId as conversationId (will be set by backend in saveCallData response)
    navigate('/olivia/call-results', {
      state: {
        conversationId: endedCallId || 'unknown',
        transcript: endedTranscript,
        durationSeconds: 0, // TODO: Pass actual duration from MobileCallInterface
      },
    });
  };

  const handleBackFromCall = () => {
    navigate('/');
  };

  return (
    <MobileCallInterface
      onBack={handleBackFromCall}
      onCallEnded={handleCallEnded}
    />
  );
}

export default VoiceChat;
