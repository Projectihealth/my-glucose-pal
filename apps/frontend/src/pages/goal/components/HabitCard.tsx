import React, { useState } from 'react';
import { Habit } from '../types';
import { CheckIcon, MoreIcon, EditIcon, TrashIcon } from './Icons';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onClickBody: (habit: Habit) => void;
  isCompletedToday: boolean;
  selectedDate: string;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggle,
  onDelete,
  onEdit,
  onClickBody,
  isCompletedToday,
  selectedDate
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(habit.id);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(habit);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (confirm(`Delete "${habit.title}"?`)) {
      onDelete(habit.id);
    }
  };

  const handleCardClick = () => {
    onClickBody(habit);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer relative group"
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all
            ${isCompletedToday
              ? 'bg-blue-500 border-blue-500'
              : 'border-slate-300 hover:border-blue-400'}
          `}
        >
          {isCompletedToday && <CheckIcon className="w-4 h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Emoji & Title */}
          <div className="flex items-center gap-2 mb-2">
            {habit.emoji && (
              <span className="text-2xl">{habit.emoji}</span>
            )}
            <h3 className={`text-base font-bold ${isCompletedToday ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              {habit.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            {habit.description}
          </p>

          {/* Streak & Frequency */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {habit.streak > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-bold text-orange-500">{habit.streak}</span>
                <span>day streak</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="font-bold">{habit.frequency}x</span>
              <span>per week</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreIcon className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[120px] z-50">
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <EditIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </div>
  );
};
