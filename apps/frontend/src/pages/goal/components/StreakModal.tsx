import React, { useEffect, useState } from 'react';
import {
  XIcon,
  FireIcon,
  TrophyIcon,
  GiftIcon,
  CheckIcon,
  SparklesIcon
} from './Icons';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  bestStreak: number;
}

const MILESTONES = [
  { days: 3, reward: "3-Day Starter Badge", icon: <FireIcon className="w-5 h-5" /> },
  { days: 7, reward: "Weekly Warrior Status", icon: <TrophyIcon className="w-5 h-5" /> },
  { days: 30, reward: "Free CGM Sensor", icon: <GiftIcon className="w-5 h-5" /> },
  { days: 60, reward: "Premium Consultation", icon: <GiftIcon className="w-5 h-5" /> },
];

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  currentStreak,
  bestStreak
}) => {
  const [animateProgress, setAnimateProgress] = useState(0);

  // Find next milestone
  const nextMilestone = MILESTONES.find(m => m.days > currentStreak) || MILESTONES[MILESTONES.length - 1];
  const progressPercent = Math.min(100, Math.max(0, (currentStreak / nextMilestone.days) * 100));

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimateProgress(progressPercent), 300);
    } else {
      setAnimateProgress(0);
    }
  }, [isOpen, progressPercent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-[#F8FAFC] w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-white/50">

        {/* Header Area */}
        <div className="flex justify-between items-center p-6 pb-2">
            <h2 className="text-xl font-bold text-slate-900">Your Rewards</h2>
            <button
                onClick={onClose}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
            >
                <XIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">

            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-orange-50 text-slate-800 shadow-sm border border-orange-100 p-6">

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-orange-600 font-bold text-sm mb-1">Current Streak</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black tracking-tighter text-slate-900">{currentStreak}</span>
                            <span className="text-xl font-bold text-slate-500">days</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-orange-700">
                            <TrophyIcon className="w-4 h-4" />
                            <span className="text-xs font-bold">Best: {bestStreak} days</span>
                        </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg shadow-orange-200">
                        <FireIcon className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>

            {/* Next Milestone / Progress Section */}
            <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Next Milestone</p>
                        <p className="font-bold text-slate-800 text-lg">{nextMilestone.reward}</p>
                    </div>
                    <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm">
                        {nextMilestone.icon}
                    </div>
                </div>

                {/* Custom Progress Bar */}
                <div className="h-4 w-full bg-white rounded-full overflow-hidden p-1 shadow-inner">
                    <div
                        className="h-full bg-blue-500 rounded-full shadow-sm transition-all duration-1000 ease-out"
                        style={{ width: `${animateProgress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-sm font-medium">
                     <span className="text-blue-600">{currentStreak} days</span>
                     <span className="text-blue-400">{nextMilestone.days - currentStreak} days to go</span>
                     <span className="text-blue-600">{Math.round(progressPercent)}%</span>
                </div>
            </div>

            {/* Coming Up / Rewards Timeline */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 mb-4 px-1 uppercase tracking-wider">Coming Up</h3>
                <div className="space-y-3 relative">

                    {MILESTONES.map((milestone, index) => {
                        const isUnlocked = currentStreak >= milestone.days;

                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${isUnlocked ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-slate-100'}`}
                            >
                                {/* Icon Box */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center shrink-0
                                    ${isUnlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}
                                `}>
                                    {isUnlocked ? <CheckIcon className="w-6 h-6" /> : milestone.icon}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-slate-900">
                                            {milestone.days} Days
                                        </p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300'}`}>
                                            {isUnlocked ? 'COMPLETED' : `${milestone.days}d`}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">{milestone.reward}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Motivational Footer */}
            <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
                <SparklesIcon className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                <p className="text-slate-700 font-medium text-sm">
                    Keep up the great work! You're building a {currentStreak}-day chain.
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="w-full px-6 py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
                Got it!
            </button>

        </div>
      </div>
    </div>
  );
};
