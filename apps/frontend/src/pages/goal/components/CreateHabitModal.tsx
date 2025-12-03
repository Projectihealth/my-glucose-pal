import React, { useState, useEffect } from 'react';
import { HabitCategory, Habit } from '../types';
import {
  XIcon,
  PlusIcon,
  RestoreIcon,
  SparklesIcon,
  NutritionIcon,
  ExerciseIcon,
  SleepIcon,
  MindfulnessIcon,
  TextIcon,
  CheckIcon
} from './Icons';
import { Bell } from 'lucide-react';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'logs' | 'streak'>) => void;
  archivedHabits: Habit[];
  onRestore: (habit: Habit) => void;
  initialData?: Habit | null; // For Editing
}

const SUGGESTED_HABITS = [
    {
        title: "Morning Hydration",
        description: "Drink a glass of water first thing.",
        category: HabitCategory.NUTRITION,
        frequency: 7,
        emoji: "💧"
    },
    {
        title: "Screen-Free Bedtime",
        description: "No phones 30 mins before sleep.",
        category: HabitCategory.SLEEP,
        frequency: 7,
        emoji: "😴"
    },
    {
        title: "Post-Lunch Walk",
        description: "10 min walk to lower glucose.",
        category: HabitCategory.EXERCISE,
        frequency: 7,
        emoji: "🚶"
    }
];

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 7 },
  { label: '5x/week', value: 5 },
  { label: '3x/week', value: 3 },
  { label: 'Weekly', value: 1 },
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  archivedHabits,
  onRestore,
  initialData
}) => {
  const [showArchived, setShowArchived] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>(HabitCategory.NUTRITION);
  const [frequency, setFrequency] = useState(7);
  const [emoji, setEmoji] = useState('✨');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00');

  // Simple Emoji List for MVP
  const EMOJI_LIST = ["⚡", "💧", "🥑", "🍳", "🏃", "🧘", "📚", "💤", "💊", "🥦", "🚶", "🏋️", "🥗", "🍵"];

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            // Edit Mode: Populate Fields
            setTitle(initialData.title);
            setDescription(initialData.description);
            setCategory(initialData.category);
            setFrequency(initialData.frequency);
            setEmoji(initialData.emoji || '✨');
            setNotificationEnabled(!!initialData.notificationTime);
            setNotificationTime(initialData.notificationTime || '09:00');
            setShowArchived(false);
        } else {
            // Create Mode: Reset Fields
            resetForm();
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onSave({
      title,
      description,
      category,
      frequency,
      emoji,
      notificationTime: notificationEnabled ? notificationTime : undefined
    });

    // Do not reset form immediately if it's an edit to prevent UI jump before close
    if (!initialData) resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(HabitCategory.NUTRITION);
    setFrequency(7);
    setEmoji('✨');
    setNotificationEnabled(false);
    setNotificationTime('09:00');
    setShowArchived(false);
  };

  const handleRestore = (habit: Habit) => {
      onRestore(habit);
      onClose();
  };

  const handleSuggestionClick = (habit: typeof SUGGESTED_HABITS[0]) => {
      setTitle(habit.title);
      setDescription(habit.description);
      setCategory(habit.category);
      setFrequency(habit.frequency);
      setEmoji(habit.emoji);
  };

  const getCategoryIcon = (cat: HabitCategory) => {
    switch (cat) {
      case HabitCategory.NUTRITION: return <NutritionIcon className="w-4 h-4" />;
      case HabitCategory.EXERCISE: return <ExerciseIcon className="w-4 h-4" />;
      case HabitCategory.SLEEP: return <SleepIcon className="w-4 h-4" />;
      case HabitCategory.MINDFULNESS: return <MindfulnessIcon className="w-4 h-4" />;
    }
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet Modal */}
      <div className="relative bg-white w-full max-w-md rounded-t-[32px] shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[95vh] overflow-y-auto no-scrollbar flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold text-slate-900">
            {showArchived ? 'Archived Habits' : (isEditMode ? 'Edit Habit' : 'Create New Habit')}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle View Link (Subtle) - Only show in Create Mode */}
        {!isEditMode && (
            !showArchived ? (
                <div className="px-6 mb-2">
                     <button
                        onClick={() => setShowArchived(true)}
                        className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                     >
                        <RestoreIcon className="w-3 h-3" />
                        View archived habits
                     </button>
                </div>
            ) : (
                <div className="px-6 mb-2">
                     <button
                        onClick={() => setShowArchived(false)}
                        className="text-xs font-semibold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                     >
                        <PlusIcon className="w-3 h-3" />
                        Back to create
                     </button>
                </div>
            )
        )}

        <div className="px-6 pb-8 pt-2 overflow-y-auto">
            {showArchived ? (
                <div className="space-y-3 pt-2">
                    {archivedHabits.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                            <p>No archived habits found.</p>
                        </div>
                    ) : (
                        archivedHabits.map((h) => (
                            <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <h4 className="font-bold text-slate-800">{h.title}</h4>
                                    <p className="text-xs text-slate-500">{h.category} • {h.frequency}x/week</p>
                                </div>
                                <button
                                onClick={() => handleRestore(h)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
                                >
                                    Restore
                                </button>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Suggested (Horizontal Scroll) - Hide in Edit Mode */}
                    {!isEditMode && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <SparklesIcon className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested for you</span>
                            </div>
                            <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
                                {SUGGESTED_HABITS.map((habit, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSuggestionClick(habit)}
                                        className="flex-shrink-0 flex flex-col justify-between p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl w-32 h-28 text-left transition-all active:scale-95 group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
                                            {habit.emoji}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 leading-tight mb-0.5 group-hover:text-blue-700">{habit.title}</p>
                                            <p className="text-[9px] font-medium text-slate-500 line-clamp-2 leading-tight">{habit.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Title Input & Emoji Picker */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Goal Title</label>
                        <div className="flex gap-3">
                             {/* Emoji Button */}
                             <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-14 h-14 rounded-xl bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center text-2xl transition-all"
                                >
                                    {emoji}
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 grid grid-cols-4 gap-1 w-48 animate-in zoom-in-95">
                                        {EMOJI_LIST.map(em => (
                                            <button
                                                key={em}
                                                type="button"
                                                onClick={() => { setEmoji(em); setShowEmojiPicker(false); }}
                                                className="w-10 h-10 flex items-center justify-center text-lg hover:bg-slate-100 rounded-lg"
                                            >
                                                {em}
                                            </button>
                                        ))}
                                    </div>
                                )}
                             </div>

                             {/* Text Input */}
                             <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Drink 2L of water"
                                className="flex-1 px-4 py-4 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal"
                                required
                            />
                        </div>
                    </div>

                    {/* Category Grid */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.values(HabitCategory).map((cat) => {
                                const isSelected = category === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
                                            ${isSelected
                                                ? 'bg-blue-50 border-blue-500/50 text-blue-700 shadow-sm ring-1 ring-blue-500/20'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}
                                        `}
                                    >
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                            ${isSelected ? 'bg-blue-200/50' : 'bg-slate-100'}
                                        `}>
                                            {getCategoryIcon(cat)}
                                        </div>
                                        <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-600'}`}>
                                            {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Frequency Buttons */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Frequency</label>
                        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                             {FREQUENCY_OPTIONS.map((opt) => {
                                 const isSelected = frequency === opt.value;
                                 return (
                                     <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFrequency(opt.value)}
                                        className={`
                                            flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200
                                            ${isSelected
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                                        `}
                                     >
                                         {opt.label}
                                     </button>
                                 );
                             })}
                        </div>
                    </div>

                    {/* Notification Setting */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reminder (Optional)</label>
                        <div className="space-y-3">
                            {/* Toggle Switch */}
                            <button
                                type="button"
                                onClick={() => setNotificationEnabled(!notificationEnabled)}
                                className={`
                                    w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-200
                                    ${notificationEnabled
                                        ? 'bg-blue-50 border-blue-500/50 text-blue-700'
                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                        ${notificationEnabled ? 'bg-blue-200/50' : 'bg-slate-100'}
                                    `}>
                                        <Bell className={`w-4 h-4 ${notificationEnabled ? 'text-blue-600' : 'text-slate-400'}`} />
                                    </div>
                                    <span className="text-sm font-bold">Daily Reminder</span>
                                </div>
                                <div className={`
                                    w-11 h-6 rounded-full transition-all duration-200 relative
                                    ${notificationEnabled ? 'bg-blue-500' : 'bg-slate-300'}
                                `}>
                                    <div className={`
                                        absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200
                                        ${notificationEnabled ? 'left-6' : 'left-1'}
                                    `} />
                                </div>
                            </button>

                            {/* Time Picker - Only show when enabled */}
                            {notificationEnabled && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <input
                                        type="time"
                                        value={notificationTime}
                                        onChange={(e) => setNotificationTime(e.target.value)}
                                        className="w-full px-4 py-4 rounded-xl bg-white border border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 font-medium text-center text-lg"
                                    />
                                    <p className="text-xs text-slate-500 mt-2 text-center">You'll receive a notification at this time each day</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description (Optional)</label>
                        <div className="relative">
                            <div className="absolute top-4 left-4 text-slate-400">
                                <TextIcon className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a motivation note..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal"
                            />
                        </div>
                    </div>

                    {/* Footer Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isEditMode ? (
                                <>
                                    <CheckIcon className="w-5 h-5" />
                                    Save Changes
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-5 h-5" />
                                    Create Goal
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};
