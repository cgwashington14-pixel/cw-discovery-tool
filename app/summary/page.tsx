'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, Zap, TrendingUp, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getTrack } from '@/data/tracks';
import { SOLUTIONS, PAIN_POINT_LABELS, IMPACT_STATS } from '@/data/solutions';
import { getRecommendedSolutions } from '@/lib/utils';
import { cn } from '@/lib/utils';
import WorkflowDiagram from '@/components/WorkflowDiagram';

const CATEGORY_COLORS: Record<string, string> = {
  workflow: '#4F46E5',
  repository: '#7C3AED',
  authoring: '#0EA5E9',
  risk: '#F59E0B',
  integration: '#10B981',
  analytics: '#06B6D4',
};

export default function SummaryPage() {
  const router = useRouter();
  const { session, reset } = useStore();

  useEffect(() => {
    if (!session.track || session.history.length === 0) {
      router.replace('/');
    }
  }, [session.track, session.history.length, router]);

  if (!session.track) return null;

  const track = getTrack(session.track);
  if (!track) return null;

  const recommendedSolutions = getRecommendedSolutions(session.identifiedPainPoints);
  const painPointCount = session.identifiedPainPoints.length;

  function handleReset() {
    reset();
    router.push('/');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E4E4E7] bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <span className="text-[#E4E4E7]">·</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#4F46E5] flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">Discovery Summary</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New session
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {/* Summary header */}
        <div className="mb-10 animate-slide-up">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ backgroundColor: track.bgColor, color: track.accentColor }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Discovery Complete · {track.title}
            </div>
            {session.synthesis && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#F5F3FF] text-[#7C3AED]">
                <Sparkles className="w-3.5 h-3.5" />
                Context-enriched · {session.contextSources.length} source{session.contextSources.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Your customer&apos;s workflow, mapped.</h1>
          <p className="text-[#71717A] text-base">
            {painPointCount} process gap{painPointCount !== 1 ? 's' : ''} identified ·{' '}
            {recommendedSolutions.length} DocuSign solution{recommendedSolutions.length !== 1 ? 's' : ''} matched
            {session.synthesis && ` · ${Object.keys(session.synthesis.knownAnswers).length} pre-filled from notes`}
          </p>
        </div>

        {/* Synthesis context card — shown when context mode was used */}
        {session.synthesis && (
          <div className="mb-6 rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] p-5 animate-slide-up">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#6D28D9] mb-1">From your context</p>
                <p className="text-sm text-[#4C1D95] leading-relaxed mb-3">{session.synthesis.contextSummary}</p>
                {session.synthesis.gapsToExplore.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#7C3AED] mb-1.5">Areas to follow up on:</p>
                    <ul className="flex flex-col gap-1">
                      {session.synthesis.gapsToExplore.map((g, i) => (
                        <li key={i} className="text-xs text-[#6D28D9] flex items-start gap-1.5">
                          <span className="font-bold text-[#A78BFA]">→</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {session.synthesis.agencyContext.agencyName && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-[#7C3AED]">{session.synthesis.agencyContext.agencyName}</p>
                  {session.synthesis.agencyContext.agencyType && (
                    <p className="text-xs text-[#A78BFA] capitalize">{session.synthesis.agencyContext.agencyType}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Workflow + Pain points */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Workflow diagram */}
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 animate-slide-up">
              <h2 className="text-sm font-semibold mb-1">Discovered Workflow</h2>
              <p className="text-xs text-[#71717A] mb-5">
                Built from your answers — shows the current state with gaps highlighted.
              </p>
              <WorkflowDiagram steps={session.workflowSteps} accentColor={track.accentColor} />
            </div>

            {/* Pain points */}
            {session.identifiedPainPoints.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 animate-slide-up">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  <h2 className="text-sm font-semibold">Identified Process Gaps</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.identifiedPainPoints.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                      {PAIN_POINT_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Impact stats */}
            <div className="bg-[#18181B] rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-[#A78BFA]" />
                <h2 className="text-sm font-semibold text-white">Impact Benchmarks</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {IMPACT_STATS.slice(0, 6).map((s) => (
                  <div key={s.stat} className="flex flex-col gap-1">
                    <span className="text-2xl font-bold text-white">{s.stat}</span>
                    <span className="text-xs text-[#71717A] leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Solution cards */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest">
              Recommended Solutions
            </h2>
            {recommendedSolutions.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 text-center">
                <p className="text-sm text-[#71717A]">No specific gaps identified — great baseline process!</p>
              </div>
            )}
            {recommendedSolutions.map((sol, i) => {
              const matchCount = sol.painPoints.filter((p) =>
                session.identifiedPainPoints.includes(p as never)
              ).length;
              return (
                <div
                  key={sol.id}
                  className="bg-white rounded-2xl border border-[#E4E4E7] p-5 animate-slide-up flex flex-col gap-3"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div
                        className="text-xs font-semibold mb-1"
                        style={{ color: sol.accentColor }}
                      >
                        {sol.product}
                      </div>
                      <p className="text-xs text-[#71717A]">{sol.tagline}</p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${sol.accentColor}15`,
                        color: sol.accentColor,
                      }}
                    >
                      {matchCount} match{matchCount !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  <p className="text-xs text-[#71717A] leading-relaxed">{sol.description}</p>

                  <div className="flex flex-col gap-1.5">
                    {sol.features.slice(0, 3).map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle2
                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                          style={{ color: sol.accentColor }}
                        />
                        <span className="text-xs text-[#71717A]">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex items-center justify-between pt-3 border-t border-[#F4F4F5] mt-auto"
                  >
                    <div>
                      <span className="text-lg font-bold" style={{ color: sol.accentColor }}>
                        {sol.impact.stat}
                      </span>
                      <span className="text-xs text-[#A1A1AA] ml-1.5">{sol.impact.metric}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* All-solutions note */}
            {recommendedSolutions.length > 0 && (
              <div className="bg-[#F4F4F5] rounded-xl p-4 text-xs text-[#71717A] leading-relaxed">
                <strong className="text-[#71717A]">SC note:</strong> These recommendations are ranked by
                the number of identified gaps each product addresses. Use this as a starting point — not a
                prescription.
              </div>
            )}
          </div>
        </div>

        {/* All solutions reference */}
        <div className="mt-8 bg-white rounded-2xl border border-[#E4E4E7] p-6 animate-slide-up">
          <h2 className="text-sm font-semibold mb-1">Full IAM Platform Reference</h2>
          <p className="text-xs text-[#71717A] mb-5">
            All DocuSign IAM products available for this conversation.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {SOLUTIONS.map((sol) => (
              <div
                key={sol.id}
                className={cn(
                  'rounded-xl p-4 border transition-all',
                  recommendedSolutions.some((r) => r.id === sol.id)
                    ? 'border-transparent shadow-sm'
                    : 'border-[#F4F4F5] opacity-60'
                )}
                style={
                  recommendedSolutions.some((r) => r.id === sol.id)
                    ? { borderColor: `${sol.accentColor}30`, backgroundColor: `${sol.accentColor}08` }
                    : {}
                }
              >
                <div className="text-xs font-semibold mb-1" style={{ color: sol.accentColor }}>
                  {sol.product}
                </div>
                <div className="text-xs text-[#71717A] leading-tight">{sol.tagline}</div>
                <div className="mt-2 text-sm font-bold" style={{ color: sol.accentColor }}>
                  {sol.impact.stat}
                </div>
                <div className="text-xs text-[#A1A1AA] leading-tight">{sol.impact.metric}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="mt-8 flex items-center justify-center gap-4 pb-4">
          <button
            onClick={() => router.push(`/discovery/${session.track}`)}
            className="text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
          >
            ← Back to questions
          </button>
          <span className="text-[#E4E4E7]">·</span>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#18181B] px-4 py-2 rounded-lg hover:bg-[#27272A] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New discovery session
          </button>
        </div>
      </main>
    </div>
  );
}
