'use client';

import { Track } from '@/data/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  current: {
    emoji: '🔄',
    bg: '#F8F7FF',
    border: '#E9E7FF',
    label: 'In Progress',
    textColor: '#5B5680',
    dot: '#9B96C0',
  },
  'pain-point': {
    emoji: '⚡',
    bg: '#FFF1F0',
    border: '#FECACA',
    label: 'Gap',
    textColor: '#FF6B6B',
    dot: '#FF6B6B',
  },
  opportunity: {
    emoji: '🎯',
    bg: '#FFF7ED',
    border: '#FED7AA',
    label: 'Opportunity',
    textColor: '#F97316',
    dot: '#F97316',
  },
  automated: {
    emoji: '✅',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    label: 'Automated',
    textColor: '#10B981',
    dot: '#10B981',
  },
};

interface Props {
  track: Track;
}

export default function WorkflowPanel({ track }: Props) {
  const { session } = useStore();
  const steps = session.workflowSteps;

  const painCount = steps.filter((s) => s.status === 'pain-point').length;
  const opportunityCount = steps.filter((s) => s.status === 'opportunity').length;
  const automatedCount = steps.filter((s) => s.status === 'automated').length;

  return (
    <div className="p-5 flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h3 className="text-xs font-black text-[#1A1535] uppercase tracking-widest mb-1 flex items-center gap-1.5">
          🗺️ Live Workflow Map
        </h3>
        <p className="text-xs font-semibold text-[#9B96C0]">Builds as you answer questions</p>
      </div>

      {/* Status legend badges */}
      {steps.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {painCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF1F0] border-2 border-[#FECACA]">
              <span className="text-[10px]">⚡</span>
              <span className="text-[10px] font-black text-[#FF6B6B]">{painCount} gap{painCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {opportunityCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF7ED] border-2 border-[#FED7AA]">
              <span className="text-[10px]">🎯</span>
              <span className="text-[10px] font-black text-[#F97316]">{opportunityCount} opportunity</span>
            </div>
          )}
          {automatedCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border-2 border-[#A7F3D0]">
              <span className="text-[10px]">✅</span>
              <span className="text-[10px] font-black text-[#10B981]">{automatedCount} automated</span>
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      {steps.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10 text-center">
          <div className="text-5xl animate-float">🗺️</div>
          <div>
            <p className="text-sm font-black text-[#5B5680]">Workflow building…</p>
            <p className="text-xs font-semibold text-[#9B96C0] mt-1.5 leading-relaxed max-w-[160px] mx-auto">
              Answer questions to see your customer&apos;s process appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => {
            const config = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.current;
            return (
              <div
                key={step.id}
                className="flex gap-3 animate-bounce-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Timeline */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-base border-2"
                    style={{ backgroundColor: config.bg, borderColor: config.border }}
                  >
                    {config.emoji}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[12px] my-1 rounded-full" style={{ backgroundColor: config.border }} />
                  )}
                </div>

                {/* Content */}
                <div
                  className={cn(
                    'flex-1 p-3 rounded-2xl border-2 mb-1',
                  )}
                  style={{ backgroundColor: config.bg, borderColor: config.border }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-xs font-black text-[#1A1535] leading-tight">{step.label}</span>
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ backgroundColor: config.border, color: config.textColor }}
                    >
                      {config.label}
                    </span>
                  </div>
                  {step.owner && (
                    <p className="text-[10px] font-semibold text-[#9B96C0]">👤 {step.owner}</p>
                  )}
                  {step.docusignProduct && (
                    <p
                      className="text-[10px] font-black mt-1"
                      style={{ color: track.accentColor }}
                    >
                      → {step.docusignProduct}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pain point CTA */}
      {painCount > 0 && (
        <div className="mt-auto p-4 rounded-2xl bg-[#FFF1F0] border-2 border-[#FECACA] animate-bounce-in">
          <p className="text-sm font-black text-[#FF6B6B] mb-1">
            ⚡ {painCount} gap{painCount !== 1 ? 's' : ''} found!
          </p>
          <p className="text-xs font-semibold text-[#FF6B6B]/80 leading-tight">
            These are where DocuSign drives the most immediate value. Keep going to complete the picture.
          </p>
        </div>
      )}
    </div>
  );
}
