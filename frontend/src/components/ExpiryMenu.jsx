import React, { useState } from 'react';
import { Clock, ChevronDown, Flame, Timer, Zap } from 'lucide-react';

const EXPIRY_OPTIONS = [
  { id: '1v', label: '1 View (Self-destruct)', value: null, maxViews: 1, icon: Flame, color: 'text-red-400' },
  { id: '2m', label: '2 Minutes', value: 2 * 60 * 1000, icon: Timer, color: 'text-red-400' },
  { id: '10m', label: '10 Minutes', value: 10 * 60 * 1000, icon: Timer, color: 'text-orange-400' },
  { id: '1h', label: '1 Hour', value: 60 * 60 * 1000, icon: Clock, color: 'text-blue-400' },
  { id: '24h', label: '24 Hours', value: 24 * 60 * 60 * 1000, icon: Clock, color: 'text-gray-400' },
  { id: '7d', label: '7 Days', value: 7 * 24 * 60 * 60 * 1000, icon: Clock, color: 'text-gray-400' },
  { id: '30d', label: '30 Days', value: 30 * 24 * 60 * 60 * 1000, icon: Clock, color: 'text-gray-400' },
  { id: 'never', label: 'Never', value: null, icon: Zap, color: 'text-purple-400' },
];

export default function ExpiryMenu({ current, onChange }) {
  const [open, setOpen] = useState(false);
  const active = EXPIRY_OPTIONS.find(o => o.id === current) || EXPIRY_OPTIONS[5];
  const ActiveIcon = active.icon;

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm transition-colors border border-gray-700/50"
      >
        <ActiveIcon className={`w-4 h-4 ${active.color}`} />
        <span className="capitalize">{active.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 w-56 bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-100 origin-top">
          <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Expiration</div>
          {EXPIRY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onChange(opt.id, opt.value ? new Date(Date.now() + opt.value) : null, opt.maxViews || 0);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${
                  current === opt.id ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${opt.color}`} />
                  <span>{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
