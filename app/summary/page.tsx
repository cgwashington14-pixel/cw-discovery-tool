'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getTrack } from '@/data/tracks';
import { SOLUTIONS, PAIN_POINT_LABELS, IMPACT_STATS } from '@/data/solutions';
import { getRecommendedSolutions } from '@/lib/utils';
import { cn } from '@/lib/utils';
import WorkflowDiagram from '@/components/WorkflowDiagram';

const TRACK_EMOJIS: Record<string, string> = {
  solicitations: '🏛️',
  'third-party-review': '🔍',
  'drafting-approvals': '✍️',
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
  const { agencyProfile } = session;
  const trackEmoji = TRACK_EMOJIS[session.track] ?? '📋';

  function handleReset() {
    reset();
    router.push('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b-2 border-[#E9E7FF]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm font-bold text-[#5B5680] hover:text-[#1A1535] transition-colors bg-[#F8F7FF] border-2 border-[#E9E7FF] px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <span className="text-xl">{trackEmoji}</span>
            <span className="text-sm font-black text-[#1A1535]">Discovery Summary</span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm font-bold text-[#5B5680] hover:text-[#1A1535] transition-colors bg-[#F8F7FF] border-2 border-[#E9E7FF] px-3 py-1.5 rounded-full"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New session
          </button>
        </div>
      </header>

      {/* Celebration hero */}
      <div className="hero-gradient py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4 animate-bounce-in">
            <div className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/20 border-2 border-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Discovery Complete · {track.title}
            </div>
            {session.synthesis && (
              <div className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/20 border-2 border-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Context-enriched · {session.contextSources.length} source{session.contextSources.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 animate-slide-up">
            {agencyProfile.agencyName
              ? `${agencyProfile.agencyName}'s workflow, mapped. 🗺️`
              : "Your customer's workflow, mapped. 🗺️"}
          </h1>

          <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '60ms' }}>
            <div className="flex items-center gap-2 text-sm font-bold text-white/90 bg-white/15 border border-white/25 px-4 py-2 rounded-full backdrop-blur-sm">
              ⚡ <span>{painPointCount} process gap{painPointCount !== 1 ? 's' : ''} found</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-white/90 bg-white/15 border border-white/25 px-4 py-2 rounded-full backdrop-blur-sm">
              🎯 <span>{recommendedSolutions.length} solution{recommendedSolutions.length !== 1 ? 's' : ''} matched</span>
            </div>
            {session.synthesis && (
              <div className="flex items-center gap-2 text-sm font-bold text-white/90 bg-white/15 border border-white/25 px-4 py-2 rounded-full backdrop-blur-sm">
                ✨ <span>{Object.keys(session.synthesis.knownAnswers).length} pre-filled from notes</span>
              </div>
            )}
            {agencyProfile.contactName && (
              <div className="flex items-center gap-2 text-sm font-bold text-white/90 bg-white/15 border border-white/25 px-4 py-2 rounded-full backdrop-blur-sm">
                👤 <span>{agencyProfile.contactName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Synthesis context card */}
        {session.synthesis && (
          <div className="mb-6 rounded-3xl border-2 border-[#DDD6FE] bg-[#F5F3FF] p-6 animate-bounce-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">✨</span>
              <div className="flex-1">
                <p className="text-sm font-black text-[#6D28D9] mb-1">From your context</p>
                <p className="text-sm font-semibold text-[#4C1D95] leading-relaxed mb-3">{session.synthesis.contextSummary}</p>
                {session.synthesis.gapsToExplore.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-[#7C3AED] mb-2">Areas to follow up on:</p>
                    <ul className="flex flex-col gap-1.5">
                      {session.synthesis.gapsToExplore.map((g, i) => (
                        <li key={i} className="text-xs font-semibold text-[#6D28D9] flex items-start gap-2">
                          <span className="font-black text-[#A78BFA] mt-0.5">→</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {session.synthesis.agencyContext.agencyName && (
                <div className="text-right flex-shrink-0 bg-white border-2 border-[#DDD6FE] rounded-2xl px-3 py-2">
                  <p className="text-xs font-black text-[#7C3AED]">{session.synthesis.agencyContext.agencyName}</p>
                  {session.synthesis.agencyContext.agencyType && (
                    <p className="text-xs font-semibold text-[#A78BFA] capitalize">{session.synthesis.agencyContext.agencyType}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Workflow + Pain points */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Workflow diagram */}
            <div className="bg-white rounded-3xl border-2 border-[#E9E7FF] p-6 animate-slide-up shadow-[0_4px_24px_rgba(79,70,229,0.08)]">
              <h2 className="text-base font-black text-[#1A1535] mb-1 flex items-center gap-2">
                🗺️ Discovered Workflow
              </h2>
              <p className="text-xs font-semibold text-[#9B96C0] mb-5">
                Built from your answers — shows the current state with gaps highlighted.
              </p>
              <WorkflowDiagram steps={session.workflowSteps} accentColor={track.accentColor} />
            </div>

            {/* Pain points */}
            {session.identifiedPainPoints.length > 0 && (
              <div className="bg-white rounded-3xl border-2 border-[#E9E7FF] p-6 animate-slide-up shadow-[0_4px_24px_rgba(79,70,229,0.08)]">
                <h2 className="text-base font-black text-[#1A1535] mb-4 flex items-center gap-2">
                  ⚡ Identified Process Gaps
                </h2>
                <div className="flex flex-wrap gap-2">
                  {session.identifiedPainPoints.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-full bg-[#FFF1F0] text-[#FF6B6B] border-2 border-[#FECACA]"
                    >
                      ⚡ {PAIN_POINT_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Impact stats */}
            <div className="rounded-3xl p-6 animate-slide-up hero-gradient shadow-[0_4px_24px_rgba(79,70,229,0.25)]">
              <h2 className="text-base font-black text-white mb-5 flex items-center gap-2">
                📈 Impact Benchmarks
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {IMPACT_STATS.slice(0, 6).map((s) => (
                  <div key={s.stat} className="bg-white/15 border border-white/25 rounded-2xl p-3 backdrop-blur-sm">
                    <span className="text-2xl font-black text-white block">{s.stat}</span>
                    <span className="text-xs font-bold text-white/70 leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Solution cards */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-black text-[#9B96C0] uppercase tracking-widest flex items-center gap-2">
              🎯 Recommended Solutions
            </h2>

            {recommendedSolutions.length === 0 && (
              <div className="bg-white rounded-3xl border-2 border-[#E9E7FF] p-6 text-center">
                <div className="text-4xl mb-3">🌟</div>
                <p className="text-sm font-bold text-[#5B5680]">No specific gaps identified — great baseline process!</p>
              </div>
            )}

            {recommendedSolutions.map((sol, i) => {
              const matchCount = sol.painPoints.filter((p) =>
                session.identifiedPainPoints.includes(p as never)
              ).length;
              return (
                <div
                  key={sol.id}
                  className="bg-white rounded-3xl border-2 border-[#E9E7FF] p-5 animate-bounce-in flex flex-col gap-3 shadow-[0_4px_16px_rgba(79,70,229,0.08)] hover:shadow-[0_8px_32px_rgba(79,70,229,0.16)] transition-all"
                  style={{ animationDelay: `${i * 60}ms`, borderLeftColor: sol.accentColor, borderLeftWidth: 4 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div
                        className="text-sm font-black mb-1"
                        style={{ color: sol.accentColor }}
                      >
                        {sol.product}
                      </div>
                      <p className="text-xs font-semibold text-[#5B5680]">{sol.tagline}</p>
                    </div>
                    <span
                      className="text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0 border-2"
                      style={{
                        backgroundColor: `${sol.accentColor}12`,
                        borderColor: `${sol.accentColor}30`,
                        color: sol.accentColor,
                      }}
                    >
                      {matchCount} match{matchCount !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#5B5680] leading-relaxed">{sol.description}</p>

                  <div className="flex flex-col gap-1.5">
                    {sol.features.slice(0, 3).map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle2
                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                          style={{ color: sol.accentColor }}
                        />
                        <span className="text-xs font-semibold text-[#5B5680]">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex items-center justify-between pt-3 border-t-2 border-[#F0EFF9] mt-auto"
                  >
                    <div>
                      <span className="text-xl font-black" style={{ color: sol.accentColor }}>
                        {sol.impact.stat}
                      </span>
                      <span className="text-xs font-bold text-[#9B96C0] ml-1.5">{sol.impact.metric}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {recommendedSolutions.length > 0 && (
              <div className="bg-[#F8F7FF] rounded-2xl border-2 border-[#E9E7FF] p-4 text-xs font-semibold text-[#5B5680] leading-relaxed">
                <span className="font-black text-[#1A1535]">SC note:</span> These recommendations are ranked by
                the number of identified gaps each product addresses. Use this as a starting point — not a prescription.
              </div>
            )}
          </div>
        </div>

        {/* Full platform reference */}
        <div className="mt-8 bg-white rounded-3xl border-2 border-[#E9E7FF] p-6 animate-slide-up shadow-[0_4px_24px_rgba(79,70,229,0.08)]">
          <h2 className="text-base font-black text-[#1A1535] mb-1 flex items-center gap-2">
            🧰 Full IAM Platform Reference
          </h2>
          <p className="text-xs font-semibold text-[#9B96C0] mb-5">
            All DocuSign IAM products available for this conversation.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {SOLUTIONS.map((sol) => {
              const isRec = recommendedSolutions.some((r) => r.id === sol.id);
              return (
                <div
                  key={sol.id}
                  className={cn(
                    'rounded-2xl p-4 border-2 transition-all',
                    isRec
                      ? 'shadow-[0_4px_16px_rgba(79,70,229,0.12)] hover:scale-[1.02]'
                      : 'opacity-50'
                  )}
                  style={
                    isRec
                      ? { borderColor: `${sol.accentColor}40`, backgroundColor: `${sol.accentColor}08` }
                      : { borderColor: '#E9E7FF' }
                  }
                >
                  <div className="text-xs font-black mb-1" style={{ color: sol.accentColor }}>
                    {sol.product}
                  </div>
                  <div className="text-xs font-semibold text-[#5B5680] leading-tight mb-2">{sol.tagline}</div>
                  <div className="text-lg font-black" style={{ color: sol.accentColor }}>
                    {sol.impact.stat}
                  </div>
                  <div className="text-[10px] font-semibold text-[#9B96C0] leading-tight">{sol.impact.metric}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset */}
        <div className="mt-8 flex items-center justify-center gap-4 pb-8">
          <button
            onClick={() => router.push(`/discovery/${session.track}`)}
            className="text-sm font-bold text-[#5B5680] hover:text-[#1A1535] transition-colors border-2 border-[#E9E7FF] px-4 py-2 rounded-full bg-white"
          >
            ← Back to questions
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm font-black text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_24px_rgba(79,70,229,0.45)]"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New discovery session
          </button>
        </div>
      </main>
    </div>
  );
}
