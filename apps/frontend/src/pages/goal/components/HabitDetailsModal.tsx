import React, { useState, useRef, useEffect } from 'react';
import { Habit, DailyLog } from '../types';
import { XIcon, CameraIcon, PaperclipIcon, CheckIcon, TrashIcon, PhotoIcon, MicIcon, PlayIcon, PauseIcon, StopIcon } from './Icons';
import { format } from 'date-fns';

interface HabitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  selectedDate: string; // YYYY-MM-DD
  onSave: (habitId: string, log: DailyLog | null) => void;
}

export const HabitDetailsModal: React.FC<HabitDetailsModalProps> = ({
  isOpen,
  onClose,
  habit,
  selectedDate,
  onSave
}) => {
  const [status, setStatus] = useState<'COMPLETED' | 'PARTIAL'>('COMPLETED');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audio, setAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Reset or load existing data when opening
  useEffect(() => {
    if (isOpen && habit) {
      const existingLog = habit.logs[selectedDate];
      if (existingLog) {
        setStatus(existingLog.status === 'PARTIAL' ? 'PARTIAL' : 'COMPLETED');
        setNote(existingLog.note || '');
        setPhoto(existingLog.photo || null);
        setAudio(existingLog.audio || null);
      } else {
        // Default to clean state
        setStatus('COMPLETED');
        setNote('');
        setPhoto(null);
        setAudio(null);
      }
    }
  }, [isOpen, habit, selectedDate]);

  // Cleanup on unmount/close
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen || !habit) return null;

  // --- Photo Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Audio Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
           setAudio(reader.result as string);
        };
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audio) return;

    if (isPlaying) {
        audioPlayerRef.current?.pause();
        setIsPlaying(false);
    } else {
        if (!audioPlayerRef.current) {
            audioPlayerRef.current = new Audio(audio);
            audioPlayerRef.current.onended = () => setIsPlaying(false);
        } else {
             // ensure src is correct in case of updates, though likely unnecessary here
             if (audioPlayerRef.current.src !== audio) audioPlayerRef.current.src = audio;
        }
        audioPlayerRef.current.play();
        setIsPlaying(true);
    }
  };

  const deleteAudio = () => {
     setAudio(null);
     if (audioPlayerRef.current) {
         audioPlayerRef.current.pause();
         audioPlayerRef.current = null;
     }
     setIsPlaying(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Submission ---
  const handleSubmit = () => {
    onSave(habit.id, {
      status,
      note,
      photo: photo || undefined,
      audio: audio || undefined,
      timestamp: Date.now()
    });
    onClose();
  };

  const handleRemoveLog = () => {
    onSave(habit.id, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-[#F8FAFC] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-white p-6 pb-4 border-b border-slate-100">
          <div className="flex justify-between items-start mb-2">
             <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{format(new Date(selectedDate), 'EEEE, MMM do')}</span>
                <h2 className="text-xl font-bold text-slate-900 leading-tight mt-1">{habit.title}</h2>
             </div>
             <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
               <XIcon className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">

          {/* Status Selection */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button
               onClick={() => setStatus('COMPLETED')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${status === 'COMPLETED' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <CheckIcon className="w-4 h-4" />
               Complete
             </button>
             <button
               onClick={() => setStatus('PARTIAL')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${status === 'PARTIAL' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[8px]">½</span>
               Partial
             </button>
          </div>

          {/* Photo Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CameraIcon className="w-4 h-4 text-blue-500" />
              Photo Proof
            </label>

            {photo ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                <img src={photo} alt="Habit proof" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                   <button
                     onClick={() => fileInputRef.current?.click()}
                     className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"
                   >
                     <PhotoIcon className="w-5 h-5" />
                   </button>
                   <button
                     onClick={() => setPhoto(null)}
                     className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600"
                   >
                     <TrashIcon className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <CameraIcon className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">Tap to upload photo</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Voice Note Section */}
          <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MicIcon className="w-4 h-4 text-blue-500" />
                  Voice Note
              </label>

              {!audio && !isRecording && (
                  <button
                      onClick={startRecording}
                      className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                          <MicIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium group-hover:text-blue-500">Tap to record audio</span>
                  </button>
              )}

              {isRecording && (
                  <div className="w-full py-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between px-6 animate-in fade-in">
                      <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-red-500 font-bold text-sm tracking-wide">{formatDuration(recordingDuration)}</span>
                      </div>
                      <button onClick={stopRecording} className="p-3 bg-white hover:bg-red-100 rounded-full text-red-500 shadow-sm transition-colors">
                          <StopIcon className="w-5 h-5 fill-current" />
                      </button>
                  </div>
              )}

              {audio && (
                  <div className="w-full py-3 px-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center gap-3">
                          <button
                              onClick={togglePlayback}
                              className="w-10 h-10 rounded-full bg-white text-purple-600 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                          >
                              {isPlaying ? <PauseIcon className="w-4 h-4 fill-current" /> : <PlayIcon className="w-4 h-4 ml-0.5 fill-current" />}
                          </button>
                          <div className="flex flex-col">
                              <span className="text-xs font-bold text-purple-900">Audio Note</span>
                              <span className="text-[10px] text-purple-400 font-medium">Recorded</span>
                          </div>
                      </div>
                      <button onClick={deleteAudio} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="w-4 h-4" />
                      </button>
                  </div>
              )}
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <PaperclipIcon className="w-4 h-4 text-blue-500" />
              Daily Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it feel? Any blockers?"
              className="w-full h-24 p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 border-t border-slate-100 flex gap-3">
           {habit.logs[selectedDate] && (
             <button
               onClick={handleRemoveLog}
               className="px-4 py-3 rounded-xl border border-red-100 text-red-500 font-bold text-sm hover:bg-red-50"
             >
               Clear
             </button>
           )}
           <button
             onClick={handleSubmit}
             className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
           >
             Save Entry
           </button>
        </div>

      </div>
    </div>
  );
};
