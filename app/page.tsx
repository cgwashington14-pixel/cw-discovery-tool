'use client';

import { useRouter } from 'next/navigation';
import { FileSearch, GitMerge, PenLine, ArrowRight, Zap, Shield, Database, Workflow } from 'lucide-react';
import { TRACKS } from '@/data/tracks';
import { TrackId } from '@/data/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const TRACK_ICONS = {
  FileSearch,
  GitMerge,
  PenLine,
};

const PRODUCT_BADGES = [
  { name: 'Maestro', icon: Workflow, color: '#4F46E5' },
  { name: 'Navigator', icon: Database, color: '#7C3AED' },
  { name: 'CLM', icon: FileSearch, color: '#0EA5E9' },
  { name: 'Playbooks', icon: Shield, color: '#F59E0B' },
  { name: 'App Center', icon: Zap, color: '#10B981' },
];

export default function HomePage() {
  const router = useRouter();
  const { selectTrack } = useStore();

  function handleSelectTrack(id: TrackId) {
    selectTrack(id);
    router.push(`/discovery/${id}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="border-b border-[#E4E4E7] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CW Discovery Tool</span>
            <span className="text-[#A1A1AA] text-sm hidden sm:inline">· State & Local Gov</span>
          </div>
          <span className="text-xs text-[#71717A] bg-[#F4F4F5] px-2.5 py-1 rounded-full font-medium">
            DocuSign IAM
          </span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 animate-slide-up">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#4F46E5] bg-[#EEF2FF] px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
              Solutions Consultant Discovery Guide
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
              Map the workflow.
              <br />
              <span className="text-[#4F46E5]">Find the opportunity.</span>
            </h1>
            <p className="text-lg text-[#71717A] leading-relaxed mb-8 max-w-xl">
              A guided discovery tool for state & local government customers. Step through pointed questions,
              visualize their approval process, and surface exactly where DocuSign drives measurable impact.
            </p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_BADGES.map((b) => {
                const Icon = b.icon;
                return (
                  <span
                    key={b.name}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[#E4E4E7] bg-white text-[#71717A]"
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: b.color }} />
                    {b.name}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        {/* Track selector */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest mb-5">
            Choose a Discovery Track
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {TRACKS.map((track, i) => {
              const Icon = TRACK_ICONS[track.icon as keyof typeof TRACK_ICONS] ?? FileSearch;
              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={cn(
                    'group relative text-left p-6 rounded-2xl border border-[#E4E4E7] bg-white',
                    'hover:border-transparent hover:shadow-xl hover:shadow-black/5',
                    'transition-all duration-200 cursor-pointer animate-slide-up'
                  )}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: track.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: track.accentColor }} />
                  </div>
                  <h3 className="font-semibold text-base mb-1">{track.title}</h3>
                  <p className="text-xs font-medium mb-3" style={{ color: track.accentColor }}>
                    {track.subtitle}
                  </p>
                  <p className="text-sm text-[#71717A] leading-relaxed mb-5">{track.description}</p>
                  <div
                    className="inline-flex items-center gap-1.5 text-sm font-medium"
                    style={{ color: track.accentColor }}
                  >
                    Start discovery
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-[#E4E4E7] bg-white">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-widest mb-8">How It Works</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Choose a track',
                  body: "Select the workflow you're exploring — solicitations, third-party review, or drafting approvals.",
                },
                {
                  step: '02',
                  title: 'Answer pointed questions',
                  body: 'Discovery questions branch based on the customer\'s actual process — no wasted time.',
                },
                {
                  step: '03',
                  title: 'See their workflow',
                  body: 'A visual process map builds in real time with pain points highlighted automatically.',
                },
                {
                  step: '04',
                  title: 'Get the solution map',
                  body: 'DocuSign products matched to each gap — with impact stats and value-anchored talking points.',
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-3">
                  <span className="text-3xl font-bold text-[#E4E4E7] font-mono leading-none">{item.step}</span>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-sm text-[#71717A] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IAM insight strip */}
        <section className="bg-[#18181B] text-white">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#52525B] uppercase tracking-widest mb-3">
                  The IAM Shift
                </p>
                <p className="text-xl font-semibold leading-snug">
                  Agreements aren&apos;t static files anymore.
                  <br />
                  <span className="text-[#A78BFA]">They&apos;re data — structured, searchable, actionable.</span>
                </p>
              </div>
              <div className="flex gap-8 sm:gap-12 flex-shrink-0">
                {[
                  { stat: '80%', label: 'less time finding agreements' },
                  { stat: '70%', label: 'faster processing' },
                  { stat: '36%', label: 'avg. efficiency gain' },
                ].map((s) => (
                  <div key={s.stat} className="text-center">
                    <div className="text-2xl font-bold">{s.stat}</div>
                    <div className="text-xs text-[#71717A] mt-1 max-w-[72px] leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E4E4E7] py-5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-[#A1A1AA]">CW Discovery Tool · DocuSign IAM · State & Local Government</p>
          <p className="text-xs text-[#A1A1AA]">For SC use only</p>
        </div>
      </footer>
    </div>
  );
}
