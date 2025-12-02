import React, { useState, useRef } from 'react';
import { format, subDays, isSameDay, isSameWeek, parseISO } from 'date-fns';
import { Habit, HabitCategory } from '../types';
import { 
  CheckIcon, 
  CameraIcon,
  PaperclipIcon,
  TrashIcon,
  EditIcon,
  MicIcon
} from './Icons';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onClickBody: (habit: Habit) => void;
  isCompletedToday: boolean;
  selectedDate: string;
}

const getCategoryStyles = (category: HabitCategory) => {
    switch (category) {
      case HabitCategory.NUTRITION: return { bg: 'bg-orange-50', text: 'text-orange-500', border: 'border-orange-100' };
      case HabitCategory.EXERCISE: return { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' };
      case HabitCategory.SLEEP: return { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' };
      case HabitCategory.MINDFULNESS: return { bg: 'bg-sky-50', text: 'text-sky-500', border: 'border-sky-100' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' };
    }
  };

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete, onEdit, onClickBody, isCompletedToday, selectedDate }) => {
  const styles = getCategoryStyles(habit.category);
  
  // History Modal State
  const [showHistory, setShowHistory] = useState(false);

  // Swipe State
  const [swipeOffset, setSwipeOffset] = useState(0);
  const offsetRef = useRef(0);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const todaysLog = habit.logs[selectedDate];

  // --- WEEKLY PROGRESS LOGIC ---
  const completedThisWeek = Object.keys(habit.logs).filter(dateStr => {
      const logDate = parseISO(dateStr);
      return isSameWeek(logDate, new Date(), { weekStartsOn: 1 });
  }).length;
  
  const targetFrequency = habit.frequency || 7;

  // History Dots Data (Keep for Modal)
  const historyDays = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const isDone = !!habit.logs[dateStr];
    const isToday = isSameDay(d, new Date());
    return { date: d, isDone, isToday, dateStr };
  });

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
        // Limit swipe range: -100 (Delete) to +100 (Edit)
        const constrainedDiff = Math.max(-100, Math.min(100, diff));
        updateOffset(constrainedDiff);
    }
  };

  const handleDragEnd = () => {
    // Snap logic
    if (offsetRef.current < -50) {
        // Snap to Delete (Left)
        updateOffset(-80);
    } else if (offsetRef.current > 50) {
        // Snap to Edit (Right)
        updateOffset(80);
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

  return (
    <div className="relative overflow-hidden rounded-3xl group">
      
      {/* Background Action Layer: DELETE (Left Swipe / Right Side) */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-red-50 flex items-center justify-end rounded-r-3xl z-0">
          <button 
            onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this habit permanently?")) {
                    onDelete(habit.id);
                } else {
                    resetSwipe();
                }
            }}
            className="flex flex-col items-center justify-center text-red-500 p-2 w-24 h-full hover:bg-red-100 transition-colors cursor-pointer"
          >
              <TrashIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">Delete</span>
          </button>
      </div>

      {/* Background Action Layer: EDIT (Right Swipe / Left Side) */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-50 flex items-center justify-start rounded-l-3xl z-0">
        <button
            onClick={(e) => {
                e.stopPropagation();
                onEdit(habit);
                resetSwipe();
            }}
            className="flex flex-col items-center justify-center text-blue-500 p-2 w-24 h-full hover:bg-blue-100 transition-colors cursor-pointer"
          >
              <EditIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">Edit</span>
          </button>
      </div>

      {/* Main Card Content - COMPACT LAYOUT APPLIED */}
      <div 
          ref={cardRef}
          className={`
              relative z-10 w-full p-4 
              border transition-transform duration-300 ease-out select-none
              bg-white
            ${isCompletedToday
                  ? 'border-slate-100' // Clean look for completed
                  : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'}
          `}
          style={{ transform: `translateX(${swipeOffset}px)` }}
          
          onClick={(e) => {
              if (isDragging.current) {
                  e.stopPropagation();
                  isDragging.current = false;
                  return;
              }
              // If swiped open, tap closes it
              if (Math.abs(swipeOffset) > 10) {
                  resetSwipe();
              } else {
                  onClickBody(habit);
              }
          }}

          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start gap-3 relative z-10">
          
          {/* Custom Circular Checkbox - COMPACT */}
          <div 
            onClick={(e) => {
                e.stopPropagation();
                onToggle(habit.id);
            }}
            className={`
              shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-0.5 cursor-pointer
              ${isCompletedToday 
                  ? 'bg-blue-500 border-blue-500 scale-100 shadow-[0_4px_12px_rgba(59,130,246,0.3)]' 
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}
          `}>
              <CheckIcon className={`w-4 h-4 text-white transition-transform duration-300 stroke-[3px] ${isCompletedToday ? 'scale-100' : 'scale-0'}`} />
          </div>

          {/* Content - Dimmed when completed - COMPACT SPACING */}
          <div className={`flex-1 min-w-0 cursor-pointer transition-opacity duration-300 ${isCompletedToday ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
            {habit.emoji && (
                        <span className="text-lg leading-none">{habit.emoji}</span>
            )}
                    <h3 className={`font-semibold text-base leading-tight transition-all duration-300 ${isCompletedToday ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-700'}`}>
              {habit.title}
            </h3>
                  </div>
          </div>

              {/* COMPACT: reduced mb-3 to mb-2 */}
              <p className="text-sm mt-1 mb-2 font-medium text-slate-500 leading-snug">
            {habit.description}
          </p>

              {/* Footer Metadata */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center flex-wrap gap-2">
                      {/* Category Pill */}
                      {!habit.emoji && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${styles.bg} ${styles.text} ${styles.border}`}>
                            {habit.category}
                        </span>
                      )}
                      
                      {/* Rich Data Indicators - Updated Colors */}
                      {todaysLog && (
                          <div className="flex gap-1 animate-in fade-in duration-300">
                              {todaysLog.photo && (
                                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100">
                                      <CameraIcon className="w-3 h-3" />
              </div>
            )}
                              {todaysLog.audio && (
                                  <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100">
                                      <MicIcon className="w-3 h-3" />
            </div>
                              )}
                              {todaysLog.note && (
                                  <div className="w-6 h-6 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200">
                                      <PaperclipIcon className="w-3 h-3" />
          </div>
                              )}
                              {todaysLog.status === 'PARTIAL' && (
                                  <div className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-[9px] font-bold text-amber-600 flex items-center">
                                      PARTIAL
                </div>
              )}
                </div>
              )}
            </div>

                   {/* Weekly Progress Visualization - COMPACT: reduced gap */}
                   <div 
                      className="flex flex-col items-end gap-1 pl-4 border-l border-slate-100 cursor-help ml-2"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setShowHistory(true);
                      }}
                   >
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                This Week
              </span>
              <div className="flex items-center gap-0.5">
                           {Array.from({ length: targetFrequency }).map((_, i) => (
                  <div
                                  key={i} 
                                  className={`
                                    h-1.5 w-3 rounded-full transition-all duration-500
                                    ${i < completedThisWeek 
                                        ? 'bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.4)]' 
                                        : 'bg-slate-200'}
                                  `}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-3xl animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
                setShowHistory(false);
            }}
        >
            <div className="w-full px-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-slate-700">Recent History</h4>
                    <button className="text-slate-400 hover:text-slate-600">
                        {/* Reusing existing Close approach concept */}
                        <span className="text-xs font-bold">Close</span>
                    </button>
                </div>
                <div className="flex justify-between items-end gap-1">
                    {historyDays.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                             <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border
                                ${day.isDone 
                                    ? 'bg-blue-500 border-blue-500 text-white' 
                                    : 'bg-white border-slate-200 text-slate-300'}
                             `}>
                                 {day.isDone && <CheckIcon className="w-3 h-3" />}
                             </div>
                             <span className={`text-[10px] ${day.isToday ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                                {format(day.date, 'EEEEE')}
                             </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
