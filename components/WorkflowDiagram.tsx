'use client';

import { WorkflowStep } from '@/data/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, Zap, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  steps: WorkflowStep[];
  accentColor: string;
}

const STATUS_CONFIG = {
  current: {
    bg: '#F4F4F5',
    border: '#E4E4E7',
    text: '#71717A',
    dot: '#71717A',
    label: 'Manual',
    icon: Clock,
  },
  'pain-point': {
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#DC2626',
    dot: '#EF4444',
    label: 'Gap',
    icon: AlertTriangle,
  },
  opportunity: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
    dot: '#F59E0B',
    label: 'Opportunity',
    icon: Zap,
  },
  automated: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
    dot: '#10B981',
    label: 'Can Automate',
    icon: CheckCircle2,
  },
};

export default function WorkflowDiagram({ steps, accentColor }: Props) {
  if (steps.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-[#A1A1AA]">No workflow steps captured yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-5">
        {Object.entries(STATUS_CONFIG).map(([key, val]) => {
          const Icon = val.icon;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.dot }} />
              <span className="text-xs text-[#71717A]">{val.label}</span>
            </div>
          );
        })}
      </div>

      {/* Horizontal flow for 5 or fewer steps, vertical otherwise */}
      {steps.length <= 5 ? (
        <HorizontalFlow steps={steps} accentColor={accentColor} />
      ) : (
        <VerticalFlow steps={steps} accentColor={accentColor} />
      )}
    </div>
  );
}

function HorizontalFlow({ steps, accentColor }: Props) {
  return (
    <div className="flex items-start gap-2 min-w-max">
      {steps.map((step, i) => {
        const config = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.current;
        const Icon = config.icon;
        return (
          <div key={step.id} className="flex items-start gap-2">
            <div
              className="flex flex-col gap-2 w-36 p-3 rounded-xl border"
              style={{ backgroundColor: config.bg, borderColor: config.border }}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: config.dot }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: config.text }}
                >
                  {config.label}
                </span>
              </div>
              <p className="text-xs font-semibold leading-tight text-[#18181B]">{step.label}</p>
              {step.owner && <p className="text-[10px] text-[#A1A1AA]">{step.owner}</p>}
              {step.docusignProduct && (
                <p className="text-[10px] font-medium mt-1" style={{ color: accentColor }}>
                  → {step.docusignProduct}
                </p>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center h-full pt-5">
                <svg width="24" height="16" viewBox="0 0 24 16">
                  <path d="M0 8 L16 8 M12 4 L16 8 L12 12" stroke="#D4D4D8" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VerticalFlow({ steps, accentColor }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, i) => {
        const config = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.current;
        const Icon = config.icon;
        return (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border"
                style={{ backgroundColor: config.bg, borderColor: config.border }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: config.dot }} />
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 min-h-[16px] bg-[#E4E4E7] my-1" />
              )}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold leading-tight">{step.label}</p>
                  {step.owner && <p className="text-xs text-[#A1A1AA] mt-0.5">{step.owner}</p>}
                  {step.docusignProduct && (
                    <p className="text-xs font-medium mt-1" style={{ color: accentColor }}>
                      → {step.docusignProduct}
                    </p>
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: config.bg, color: config.text, border: `1px solid ${config.border}` }}
                >
                  {config.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
