import React from 'react';
import { CGMIcon, OliviaIcon, TargetIcon, LearnIcon, ProfileIcon } from './Icons';

export const BottomNav: React.FC = () => {
  const navItems = [
    { icon: <CGMIcon className="w-6 h-6" />, label: 'My CGM' },
    { icon: <OliviaIcon className="w-6 h-6" />, label: 'Olivia' },
    { icon: <TargetIcon className="w-6 h-6" />, label: 'My Goals', active: true },
    { icon: <LearnIcon className="w-6 h-6" />, label: 'Learn' },
    { icon: <ProfileIcon className="w-6 h-6" />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors
              ${item.active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
