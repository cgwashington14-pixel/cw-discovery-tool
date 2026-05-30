'use client';

import { DiscoveryMode } from '@/data/types';
import { cn } from '@/lib/utils';
import { MessageSquare, FileSearch2 } from 'lucide-react';

interface Props {
  mode: DiscoveryMode;
  onChange: (mode: DiscoveryMode) => void;
}

const OPTIONS: {
  id: DiscoveryMode;
  label: string;
  sub: string;
  emoji: string;
  icon: typeof MessageSquare;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    id: 'fresh',
    label: 'Fresh start',
    sub: "I don't know much about them yet",
    emoji: '👋',
    icon: MessageSquare,
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
  },
  {
    id: 'context',
    label: 'I have context',
    sub: 'Bring in notes, transcripts, or Drive files',
    emoji: '📎',
    icon: FileSearch2,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
];

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="flex gap-3">
      {OPTIONS.map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left transition-all duration-150 border-2 font-bold',
              active
                ? 'shadow-[0_4px_16px_rgba(79,70,229,0.2)] scale-[1.02]'
                : 'bg-white border-[#E9E7FF] text-[#5B5680] hover:border-[#C7D2FE]'
            )}
            style={
              active
                ? { backgroundColor: opt.bg, borderColor: opt.border, color: opt.color }
                : {}
            }
          >
            <span className="text-xl">{opt.emoji}</span>
            <div>
              <div className="text-sm font-black leading-tight">{opt.label}</div>
              <div className={cn('text-xs font-semibold leading-tight mt-0.5', active ? 'opacity-80' : 'text-[#9B96C0]')}>
                {opt.sub}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
