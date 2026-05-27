'use client';

import { DiscoveryMode } from '@/data/types';
import { cn } from '@/lib/utils';
import { MessageSquare, FileSearch2 } from 'lucide-react';

interface Props {
  mode: DiscoveryMode;
  onChange: (mode: DiscoveryMode) => void;
}

const OPTIONS: { id: DiscoveryMode; label: string; sub: string; icon: typeof MessageSquare }[] = [
  {
    id: 'fresh',
    label: 'First conversation',
    sub: "Starting fresh — I don't know much yet",
    icon: MessageSquare,
  },
  {
    id: 'context',
    label: 'I have context',
    sub: 'Bring in notes, transcripts, or Drive files',
    icon: FileSearch2,
  },
];

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="inline-flex gap-2 p-1 bg-[#F4F4F5] rounded-xl">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-left transition-all duration-150',
              active ? 'bg-white shadow-sm text-[#18181B]' : 'text-[#71717A] hover:text-[#3F3F46]'
            )}
          >
            <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-[#4F46E5]' : 'text-[#A1A1AA]')} />
            <div>
              <div className="text-sm font-medium leading-tight">{opt.label}</div>
              <div className={cn('text-xs leading-tight mt-0.5', active ? 'text-[#71717A]' : 'text-[#A1A1AA]')}>
                {opt.sub}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
