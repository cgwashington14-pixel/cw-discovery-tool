'use client';

import { Track, WorkflowStep } from '@/data/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { AlertTriangle, Zap, Clock, CheckCircle2 } from 'lucide-react';

const STATUS_CONFIG = {
  current: {
    dot: '#71717A',
    bg: '#F4F4F5',
    label: 'Current',
    icon: Clock,
    textColor: '#71717A',
  },
  'pain-point': {
    dot: '#EF4444',
    bg: '#FEF2F2',
    label: 'Gap',
    icon: AlertTriangle,
    textColor: '#DC2626',
  },
  opportunity: {
    dot: '#F59E0B',
    bg: '#FFFBEB',
    label: 'Opportunity',
    icon: Zap,
    textColor: '#B45309',
  },
  automated: {
    dot: '#10B981',
    bg: '#ECFDF5',
    label: 'Automated',
    icon: CheckCircle2,
    textColor: '#059669',
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

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <div>
        <h3 className="text-xs font-semibold text-[#71717A] uppercase tracking-widest mb-1">
          Live Workflow Map
        </h3>
        <p className="text-xs text-[#A1A1AA] leading-tight">Builds as you answer questions</p>
      </div>

      {/* Status legend */}
      {steps.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {painCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-[10px] font-medium text-[#EF4444]">{painCount} gap{painCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {opportunityCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-[10px] font-medium text-[#B45309]">{opportunityCount} opportunity</span>
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      {steps.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-[#F4F4F5] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#A1A1AA]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#71717A]">Workflow building…</p>
            <p className="text-xs text-[#A1A1AA] mt-1">Answer questions to see your customer&apos;s process appear here.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {steps.map((step, i) => {
            const config = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.current;
            const Icon = config.icon;
            return (
              <div key={step.id} className="flex gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: config.dot }} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 min-h-[16px] bg-[#E4E4E7] my-1" />
                  )}
                </div>

                {/* Content */}
                <div className={cn('pb-3', i < steps.length - 1 && 'mb-0')}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-semibold leading-tight">{step.label}</span>
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{ backgroundColor: config.bg, color: config.textColor }}
                    >
                      {config.label}
                    </span>
                  </div>
                  {step.owner && (
                    <p className="text-[10px] text-[#A1A1AA]">↳ {step.owner}</p>
                  )}
                  {step.docusignProduct && (
                    <p
                      className="text-[10px] font-medium mt-0.5"
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

      {/* Pain point count CTA */}
      {painCount > 0 && (
        <div className="mt-auto p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
          <p className="text-xs font-semibold text-[#DC2626] mb-0.5">
            {painCount} gap{painCount !== 1 ? 's' : ''} identified
          </p>
          <p className="text-[10px] text-[#EF4444] leading-tight">
            These are where DocuSign drives the most immediate value. Keep going to complete the picture.
          </p>
        </div>
      )}
    </div>
  );
}
