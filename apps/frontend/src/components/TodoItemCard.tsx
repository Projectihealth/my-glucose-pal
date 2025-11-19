import { useState, useEffect, useRef } from 'react';
import { Clock, Check, Plus, Minus, Pencil, X as XIcon } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface Todo {
  id: number;
  title: string;
  description?: string;
  category: 'diet' | 'exercise' | 'sleep' | 'stress' | 'medication' | 'other';
  health_benefit: string;
  time_of_day: string;
  time_description: string;
  target_count: number;
  current_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  selected: boolean;
  priority?: 'high' | 'medium' | 'low';
  recommendation_tag?: 'ai_recommended' | 'quick_win' | 'high_impact' | 'doctor_suggested';
}

interface TodoItemCardProps {
  todo: Todo;
  onToggleSelect: (todoId: number) => void;
  onUpdateFrequency: (todoId: number, delta: number) => void;
  onEdit: (todo: Todo) => void;
  onSave: (todo: Todo) => void;
  getCategoryIcon: (category: Todo['category']) => string;
  getCategoryColor: (category: Todo['category']) => string;
}

export function TodoItemCard({
  todo,
  onToggleSelect,
  onUpdateFrequency,
  onEdit,
  onSave,
  getCategoryIcon,
  getCategoryColor,
}: TodoItemCardProps) {
  const [isBenefitExpanded, setIsBenefitExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedTitle(todo.title);
  };

  const handleSave = () => {
    if (editedTitle.trim()) {
      onSave({ ...todo, title: editedTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(todo.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all relative group ${
        todo.selected
          ? 'bg-white border-[#3B82F6]/20 shadow-sm'
          : 'bg-gray-50/50 border-gray-200 opacity-60'
      }`}
    >
      {/* Checkbox - Top Right Corner */}
      <div className="absolute top-4 right-4 z-10">
        <Checkbox
          id={`todo-select-${todo.id}`}
          checked={todo.selected}
          onCheckedChange={() => onToggleSelect(todo.id)}
          className="w-5 h-5 data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]"
        />
      </div>

      {/* Edit Button - Top Right Corner - Only show when NOT editing */}
      {!isEditing && (
        <button
          onClick={handleStartEdit}
          className="absolute top-4 right-12 p-1.5 rounded-lg bg-gray-100 hover:bg-[#3B82F6] hover:text-white text-gray-400 opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-10"
          title="Edit habit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Save/Cancel Buttons - Only show when editing */}
      {isEditing && (
        <div className="absolute top-4 right-12 flex items-center gap-1 z-10">
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all active:scale-95"
            title="Save changes"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all active:scale-95"
            title="Cancel"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-start gap-3 pr-10">
        {/* Left: Category Icon */}
        <button
          onClick={() => setIsBenefitExpanded(!isBenefitExpanded)}
          className={`w-9 h-9 rounded-xl ${getCategoryColor(
            todo.category
          )} flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform active:scale-95 cursor-pointer text-lg`}
          title="Click to view health benefit"
        >
          {getCategoryIcon(todo.category)}
        </button>

        {/* Content - Full Width */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="mb-2">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-1 py-0.5 border-b-2 border-[#3B82F6] focus:outline-none text-gray-800"
              />
            ) : (
              <p className="text-gray-800 leading-relaxed pr-2 cursor-pointer" onClick={handleStartEdit}>
                {todo.title}
              </p>
            )}
          </div>

          {/* Time Badge */}
          <div className="flex items-center gap-1.5 text-gray-500 mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{todo.time_description}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs">{todo.time_of_day}</span>
          </div>

          {/* Frequency Adjuster - Redesigned with hover effect */}
          <div className="group/freq hover:bg-[#EFF6FF] rounded-xl p-3 transition-all">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-600 whitespace-nowrap">Weekly goal</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateFrequency(todo.id, -1)}
                  disabled={todo.target_count <= 1 || !todo.selected}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 group-hover/freq:border-[#BFDBFE] hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <div className="min-w-[50px] text-center bg-white rounded-lg px-3 py-1.5 border border-gray-200 group-hover/freq:border-[#BFDBFE]">
                  <span className="text-[#3B82F6] font-semibold">{todo.target_count}</span>
                  <span className="text-gray-500 text-xs ml-1">times</span>
                </div>
                <button
                  onClick={() => onUpdateFrequency(todo.id, 1)}
                  disabled={todo.target_count >= 7 || !todo.selected}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 group-hover/freq:border-[#BFDBFE] hover:border-[#3B82F6] hover:bg-[#3B82F6]/5 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Health Benefit */}
          {isBenefitExpanded && (
            <div className="mt-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">💡</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#3B82F6] font-medium mb-1">Health Benefit</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{todo.health_benefit}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
