import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { parseVoiceTranscript } from "@/services/voiceParsingService";

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  onParseComplete?: (parsed: ParsedVoiceInput[]) => void;
  className?: string;
  autoStart?: boolean;
}

export interface ParsedVoiceInput {
  title: string;
  category: "food" | "lifestyle" | "medication" | "sleep" | "stress";
  note?: string;
  medicationName?: string;
  dose?: string;
}

export const VoiceInput = ({
  onTranscriptChange,
  onParseComplete,
  className,
  autoStart = false,
}: VoiceInputProps) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    continuous: true,
    interimResults: true,
    lang: "en-US",
  });

  const [isParsing, setIsParsing] = useState(false);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && isSupported) {
      startListening();
    }
  }, [autoStart, isSupported, startListening]);

  // Update parent with transcript changes
  useEffect(() => {
    const fullTranscript = transcript + (interimTranscript ? ` ${interimTranscript}` : "");
    onTranscriptChange(fullTranscript);
  }, [transcript, interimTranscript, onTranscriptChange]);

  // Parse transcript when user stops speaking
  useEffect(() => {
    if (!isListening && transcript.trim() && onParseComplete) {
      parseVoiceInput(transcript);
    }
  }, [isListening, transcript, onParseComplete]);

  const parseVoiceInput = async (text: string) => {
    setIsParsing(true);
    try {
      const parsed = await parseVoiceTranscript(text);
      onParseComplete?.(parsed);
    } catch (err) {
      console.error("Failed to parse voice input:", err);
      onParseComplete?.([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : "");

  return (
    <div className={cn("space-y-3", className)}>
      {/* Voice Recording Button */}
      <div className="flex items-center justify-center">
        <Button
          type="button"
          onClick={handleToggle}
          disabled={!isSupported || isParsing}
          size="lg"
          className={cn(
            "relative h-20 w-20 rounded-full transition-all duration-300",
            isListening
              ? "bg-red-500 hover:bg-red-600 scale-110 shadow-lg shadow-red-500/50"
              : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {isParsing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isListening ? (
            <>
              <MicOff className="h-8 w-8" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            </>
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Status Text */}
      <div className="text-center">
        {isParsing && (
          <p className="text-sm text-muted-foreground animate-pulse">Processing your voice input...</p>
        )}
        {isListening && !isParsing && (
          <p className="text-sm text-blue-600 font-medium">Listening... Tap to stop</p>
        )}
        {!isListening && !isParsing && !error && (
          <p className="text-sm text-muted-foreground">Tap the microphone to start speaking</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!isSupported && (
          <p className="text-sm text-destructive">
            Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
        )}
      </div>

      {/* Live Transcript Display */}
      {displayText.trim() && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border min-h-[80px]">
          <p className="text-sm">
            <span className="text-foreground">{transcript}</span>
            {interimTranscript && (
              <span className="text-muted-foreground italic">{interimTranscript}</span>
            )}
          </p>
        </div>
      )}

      {/* Visual Audio Wave Effect */}
      {isListening && (
        <div className="flex items-center justify-center gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-blue-600 rounded-full animate-pulse"
              style={{
                height: "100%",
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
