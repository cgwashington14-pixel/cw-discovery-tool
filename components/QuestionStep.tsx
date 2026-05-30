'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, Info, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Question, Track } from '@/data/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Props {
  question: Question;
  track: Track;
}

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  intake:         { label: 'Intake & Origin',     emoji: '📥', color: '#4F46E5', bg: '#EEF2FF' },
  process:        { label: 'Current Process',     emoji: '⚙️', color: '#0EA5E9', bg: '#F0F9FF' },
  approvals:      { label: 'Approval Chain',      emoji: '✅', color: '#10B981', bg: '#ECFDF5' },
  storage:        { label: 'Storage & Repository',emoji: '🗄️', color: '#7C3AED', bg: '#F5F3FF' },
  'pain-points':  { label: 'Pain Points',         emoji: '⚡', color: '#FF6B6B', bg: '#FFF1F0' },
  risk:           { label: 'Risk Management',     emoji: '🛡️', color: '#F97316', bg: '#FFF7ED' },
};

export default function QuestionStep({ question, track }: Props) {
  const { answerQuestion, session } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [showInsight, setShowInsight] = useState(false);
  const [overriding, setOverriding] = useState(false);

  const isMulti = question.type === 'multi';
  const synthesisAnswer = session.synthesis?.knownAnswers?.[question.id];
  const isPreAnswered = !!synthesisAnswer && !overriding;
  const preAnsweredIds = synthesisAnswer
    ? Array.isArray(synthesisAnswer) ? synthesisAnswer : [synthesisAnswer]
    : [];

  useEffect(() => {
    if (isPreAnswered && preAnsweredIds.length > 0 && isMulti) {
      setSelected(preAnsweredIds);
    }
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOptionClick(optionId: string) {
    if (isPreAnswered) return;
    if (isMulti) {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
      );
    } else {
      answerQuestion(question.id, optionId);
    }
  }

  function handleConfirmSynthesis() {
    if (!synthesisAnswer) return;
    answerQuestion(question.id, synthesisAnswer);
  }

  function handleMultiSubmit() {
    if (selected.length === 0) return;
    answerQuestion(question.id, selected);
  }

  const effectivePreAnswerIds = isPreAnswered ? preAnsweredIds : [];
  const catCfg = CATEGORY_CONFIG[question.category] ?? CATEGORY_CONFIG.process;

  return (
    <div className="flex-1 flex flex-col animate-slide-in">
      {/* Category badge */}
      <div className="px-8 pt-8 pb-0 flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2"
          style={{
            backgroundColor: catCfg.bg,
            color: catCfg.color,
            borderColor: `${catCfg.color}30`,
          }}
        >
          <span>{catCfg.emoji}</span>
          {catCfg.label}
        </span>

        {isPreAnswered && (
          <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full bg-[#F5F3FF] border-2 border-[#DDD6FE] text-[#7C3AED] animate-bounce-in">
            <Sparkles className="w-3 h-3" />
            Pre-filled from your notes
          </span>
        )}
      </div>

      {/* Question */}
      <div className="px-8 pt-6 pb-8 flex-1">
        <h2 className="text-2xl font-black tracking-tight leading-snug mb-2 text-[#1A1535]">
          {question.question}
        </h2>
        {question.subtext && (
          <p className="text-[#5B5680] text-sm font-semibold leading-relaxed mb-5">{question.subtext}</p>
        )}
        {isMulti && !isPreAnswered && (
          <p className="text-xs font-black text-[#9B96C0] mb-4 uppercase tracking-wider">Select all that apply</p>
        )}

        {/* Pre-answered banner */}
        {isPreAnswered && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-[#F5F3FF] border-2 border-[#DDD6FE] animate-bounce-in">
            <Sparkles className="w-5 h-5 text-[#7C3AED] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-black text-[#6D28D9] mb-0.5">Answer found in your notes ✨</p>
              <p className="text-xs font-semibold text-[#7C3AED]">
                Claude identified this from the context you provided. Confirm to continue, or override to choose differently.
              </p>
            </div>
            <button
              onClick={() => { setOverriding(true); setSelected([]); }}
              className="text-xs font-bold text-[#A78BFA] hover:text-[#7C3AED] transition-colors flex items-center gap-1 flex-shrink-0 bg-white border-2 border-[#DDD6FE] px-3 py-1.5 rounded-full"
            >
              <RotateCcw className="w-3 h-3" />
              Override
            </button>
          </div>
        )}

        {/* Options */}
        <div className="flex flex-col gap-3 max-w-2xl">
          {question.options?.map((option, idx) => {
            const isSelectedManually = selected.includes(option.id);
            const isPreSelected = effectivePreAnswerIds.includes(option.id);
            const isHighlighted = isPreSelected || isSelectedManually;
            const hasPain = option.painPoints && option.painPoints.length > 0;

            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={isPreAnswered}
                className={cn(
                  'group flex items-start gap-4 w-full text-left p-5 rounded-2xl border-2 transition-all duration-150',
                  isHighlighted
                    ? 'shadow-[0_4px_20px_rgba(79,70,229,0.2)]'
                    : 'border-[#E9E7FF] bg-white hover:border-[#C7D2FE] hover:shadow-[0_2px_12px_rgba(79,70,229,0.1)] hover:scale-[1.01]',
                  isPreAnswered && !isPreSelected && 'opacity-40',
                  isPreAnswered && 'cursor-default',
                  !isPreAnswered && !isHighlighted && 'cursor-pointer'
                )}
                style={
                  isHighlighted
                    ? {
                        borderColor: isPreSelected ? '#DDD6FE' : `${track.accentColor}60`,
                        backgroundColor: isPreSelected ? '#F5F3FF' : `${track.accentColor}08`,
                      }
                    : {}
                }
              >
                {/* Indicator */}
                <div
                  className={cn(
                    'flex-shrink-0 w-6 h-6 border-2 flex items-center justify-center transition-all mt-0.5',
                    isMulti ? 'rounded-lg' : 'rounded-full'
                  )}
                  style={
                    isHighlighted
                      ? {
                          borderColor: isPreSelected ? '#7C3AED' : track.accentColor,
                          backgroundColor: isPreSelected ? '#7C3AED' : track.accentColor,
                        }
                      : { borderColor: '#C7D2FE', backgroundColor: 'white' }
                  }
                >
                  {isHighlighted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black leading-snug text-[#1A1535]">{option.label}</div>
                  {option.description && (
                    <div className="text-xs font-semibold text-[#5B5680] mt-1 leading-relaxed">{option.description}</div>
                  )}
                  {hasPain && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {option.painPoints!.slice(0, 2).map((p) => (
                        <span key={p} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFF1F0] border border-[#FECACA] text-[#FF6B6B]">
                          ⚡ process gap
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!isMulti && !isPreAnswered && (
                  <ChevronRight className="w-5 h-5 text-[#C7D2FE] flex-shrink-0 mt-0.5 group-hover:text-[#4F46E5] transition-colors" />
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm synthesis answer */}
        {isPreAnswered && (
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleConfirmSynthesis}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all hover:scale-105 shadow-[0_4px_16px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.45)]"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
            >
              <Sparkles className="w-4 h-4" />
              Confirm from notes & continue ✓
            </button>
          </div>
        )}

        {/* Multi-select submit */}
        {isMulti && !isPreAnswered && (
          <button
            onClick={handleMultiSubmit}
            disabled={selected.length === 0}
            className={cn(
              'mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all',
              selected.length > 0
                ? 'text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:scale-105 hover:shadow-[0_6px_24px_rgba(79,70,229,0.45)]'
                : 'bg-[#F0EFF9] text-[#9B96C0] cursor-not-allowed'
            )}
            style={selected.length > 0 ? { background: `linear-gradient(135deg, ${track.accentColor}, ${track.accentColor}cc)` } : {}}
          >
            Continue
            {selected.length > 0 && (
              <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs">
                {selected.length} selected
              </span>
            )}
          </button>
        )}

        {/* DocuSign tip toggle */}
        {question.docusignTip && (
          <div className="mt-7 max-w-2xl">
            <button
              onClick={() => setShowInsight(!showInsight)}
              className="flex items-center gap-2 text-xs font-black text-[#9B96C0] hover:text-[#4F46E5] transition-colors px-4 py-2 rounded-full border-2 border-[#E9E7FF] hover:border-[#C7D2FE] bg-white"
            >
              <Info className="w-3.5 h-3.5" />
              {showInsight ? 'Hide' : 'Show'} DocuSign context
            </button>
            {showInsight && (
              <div className="mt-3 flex gap-3 p-5 rounded-2xl bg-[#EEF2FF] border-2 border-[#C7D2FE] animate-bounce-in">
                <Lightbulb className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-[#4338CA] leading-relaxed">{question.docusignTip}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insight banner */}
      {question.insight && (
        <div className="mx-8 mb-8 p-5 rounded-2xl bg-[#FFF7ED] border-2 border-[#FED7AA]">
          <div className="flex gap-3">
            <span className="text-xl flex-shrink-0">💡</span>
            <p className="text-xs font-semibold text-[#92400E] leading-relaxed">{question.insight}</p>
          </div>
        </div>
      )}
    </div>
  );
}
