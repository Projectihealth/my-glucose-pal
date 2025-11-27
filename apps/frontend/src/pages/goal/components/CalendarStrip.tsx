import React from 'react';
import { WeeklyData } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarStripProps {
  dates: WeeklyData[];
  onSelectDate: (date: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  currentMonth: string;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  dates,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  currentMonth
}) => {
  return (
    <div className="w-full mb-8">
      {/* Navigation Header */}
      <div className="flex justify-between items-center px-2 mb-4">
        <button
            onClick={onPrevWeek}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
        >
            <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {currentMonth}
        </h2>
        <button
            onClick={onNextWeek}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors"
        >
            <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Days Strip */}
      <div className="flex justify-between items-center overflow-x-auto no-scrollbar py-2 px-1">
        {dates.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectDate(item.fullDate)}
            className={`
              relative flex flex-col items-center justify-center w-[3.25rem] h-[4.5rem] rounded-2xl transition-all duration-300 snap-center
              ${item.isSelected
                ? 'bg-blue-500 text-blue-100 shadow-lg shadow-blue-200 scale-105 -translate-y-1'
                : 'bg-white text-slate-400 hover:bg-slate-50 border border-transparent'}
            `}
          >
            <span className={`text-[11px] font-medium mb-0.5 ${item.isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
              {item.day}
            </span>
            <span className={`text-lg font-bold ${item.isSelected ? 'text-white' : 'text-slate-800'}`}>
              {item.date}
            </span>

            {/* Status Indicator Dot */}
            <div className={`
                mt-1.5 w-1.5 h-1.5 rounded-full transition-colors duration-300
                ${item.isSelected
                    ? 'bg-white'
                    : item.isCompleted
                        ? 'bg-blue-400'
                        : item.isToday ? 'bg-blue-400' : 'bg-transparent'}
            `} />
          </button>
        ))}
      </div>
    </div>
  );
};
