'use client';

import { useState } from 'react';
import { Lightbulb, ChevronRight, Info } from 'lucide-react';
import { Question, Track } from '@/data/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Props {
  question: Question;
  track: Track;
}

const CATEGORY_LABELS: Record<string, string> = {
  intake: 'Intake & Origin',
  process: 'Current Process',
  approvals: 'Approval Chain',
  storage: 'Storage & Repository',
  'pain-points': 'Pain Points',
  risk: 'Risk Management',
};

export default function QuestionStep({ question, track }: Props) {
  const { answerQuestion } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [showInsight, setShowInsight] = useState(false);

  const isMulti = question.type === 'multi';

  function handleOptionClick(optionId: string) {
    if (isMulti) {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      answerQuestion(question.id, optionId);
    }
  }

  function handleMultiSubmit() {
    if (selected.length === 0) return;
    answerQuestion(question.id, selected);
  }

  return (
    <div className="flex-1 flex flex-col animate-slide-in">
      {/* Category badge */}
      <div className="px-8 pt-8 pb-0">
        <span
          className="text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-md"
          style={{ backgroundColor: track.bgColor, color: track.accentColor }}
        >
          {CATEGORY_LABELS[question.category] ?? question.category}
        </span>
      </div>

      {/* Question */}
      <div className="px-8 pt-5 pb-6 flex-1">
        <h2 className="text-2xl font-bold tracking-tight leading-snug mb-2">{question.question}</h2>
        {question.subtext && (
          <p className="text-[#71717A] text-sm leading-relaxed mb-6">{question.subtext}</p>
        )}
        {isMulti && (
          <p className="text-xs font-medium text-[#A1A1AA] mb-4">Select all that apply</p>
        )}

        {/* Options */}
        <div className="flex flex-col gap-2.5 max-w-xl">
          {question.options?.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={cn(
                  'group flex items-start gap-4 w-full text-left p-4 rounded-xl border transition-all duration-150',
                  isSelected || (!isMulti && false)
                    ? 'border-transparent shadow-sm'
                    : 'border-[#E4E4E7] bg-white hover:border-[#D4D4D8] hover:bg-[#FAFAFA]'
                )}
                style={
                  isSelected
                    ? {
                        borderColor: `${track.accentColor}50`,
                        backgroundColor: `${track.accentColor}08`,
                      }
                    : {}
                }
              >
                {/* Checkbox / radio indicator */}
                <div
                  className={cn(
                    'flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all',
                    isMulti ? 'rounded-md' : 'rounded-full'
                  )}
                  style={
                    isSelected
                      ? { borderColor: track.accentColor, backgroundColor: track.accentColor }
                      : { borderColor: '#D4D4D8' }
                  }
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-[#71717A] mt-0.5 leading-relaxed">{option.description}</div>
                  )}
                  {option.painPoints && option.painPoints.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {option.painPoints.slice(0, 2).map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#DC2626]"
                        >
                          ⚡ gap
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!isMulti && (
                  <ChevronRight
                    className="w-4 h-4 text-[#A1A1AA] flex-shrink-0 mt-0.5 group-hover:text-[#71717A] transition-colors"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Multi-select submit */}
        {isMulti && (
          <button
            onClick={handleMultiSubmit}
            disabled={selected.length === 0}
            className={cn(
              'mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              selected.length > 0
                ? 'text-white hover:opacity-90'
                : 'bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed'
            )}
            style={selected.length > 0 ? { backgroundColor: track.accentColor } : {}}
          >
            Continue
            {selected.length > 0 && ` (${selected.length} selected)`}
          </button>
        )}

        {/* DocuSign tip toggle */}
        {question.docusignTip && (
          <div className="mt-6 max-w-xl">
            <button
              onClick={() => setShowInsight(!showInsight)}
              className="flex items-center gap-2 text-xs font-medium text-[#71717A] hover:text-[#18181B] transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              {showInsight ? 'Hide' : 'Show'} DocuSign context
            </button>
            {showInsight && (
              <div className="mt-3 flex gap-3 p-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] animate-fade-in">
                <Lightbulb className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#4338CA] leading-relaxed">{question.docusignTip}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insight banner — shown after insight */}
      {question.insight && (
        <div className="mx-8 mb-8 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
          <div className="flex gap-3">
            <Lightbulb className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E] leading-relaxed">{question.insight}</p>
          </div>
        </div>
      )}
    </div>
  );
}
