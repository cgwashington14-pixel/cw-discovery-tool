'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSearch, GitMerge, PenLine, ArrowRight, Zap, Shield, Database, Workflow,
  Sparkles, Building2, Users, ChevronRight, Star,
} from 'lucide-react';
import { TRACKS } from '@/data/tracks';
import { TrackId } from '@/data/types';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import ModeToggle from '@/components/ModeToggle';
import ContextIngestion from '@/components/ContextIngestion';

const TRACK_ICONS = { FileSearch, GitMerge, PenLine };

const TRACK_GRADIENTS = {
  solicitations: 'track-gradient-indigo',
  'third-party-review': 'track-gradient-violet',
  'drafting-approvals': 'track-gradient-sky',
};

const TRACK_EMOJIS: Record<string, string> = {
  solicitations: '🏛️',
  'third-party-review': '🔍',
  'drafting-approvals': '✍️',
};

const PRODUCT_BADGES = [
  { name: 'Maestro', icon: Workflow, color: '#4F46E5', bg: '#EEF2FF' },
  { name: 'Navigator', icon: Database, color: '#7C3AED', bg: '#F5F3FF' },
  { name: 'CLM', icon: FileSearch, color: '#0EA5E9', bg: '#F0F9FF' },
  { name: 'Playbooks', icon: Shield, color: '#F97316', bg: '#FFF7ED' },
  { name: 'App Center', icon: Zap, color: '#10B981', bg: '#ECFDF5' },
];

const AGENCY_TYPES = [
  { id: 'city', label: '🏙️ City', icon: '🏙️' },
  { id: 'county', label: '🏛️ County', icon: '🏛️' },
  { id: 'state', label: '🗺️ State Agency', icon: '🗺️' },
  { id: 'school', label: '🎓 School District', icon: '🎓' },
  { id: 'transit', label: '🚌 Transit', icon: '🚌' },
  { id: 'other', label: '🏢 Other', icon: '🏢' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    emoji: '👋',
    title: 'Fill in agency info',
    body: 'Enter who you\'re meeting with. These details pre-fill your workflow so you\'re ready to go the moment you walk in.',
    color: '#4F46E5',
    bg: '#EEF2FF',
  },
  {
    step: '2',
    emoji: '📎',
    title: 'Add context (optional)',
    body: 'Link Google Drive docs, upload files, or paste call notes. Claude pre-fills as many answers as it can.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    step: '3',
    emoji: '🗺️',
    title: 'Step through questions',
    body: 'Pre-answered questions are highlighted. Skip, confirm, or override — the workflow map builds in real time.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
  },
  {
    step: '4',
    emoji: '🎯',
    title: 'Get the solution map',
    body: 'DocuSign products matched to every gap — with impact stats and value-anchored talking points.',
    color: '#10B981',
    bg: '#ECFDF5',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { session, selectTrack, setMode, setAgencyProfile } = useStore();

  const [agencyName, setAgencyName] = useState(session.agencyProfile.agencyName);
  const [agencyType, setAgencyType] = useState(session.agencyProfile.agencyType);
  const [contactName, setContactName] = useState(session.agencyProfile.contactName);

  function handleSelectTrack(id: TrackId) {
    setAgencyProfile({ agencyName, agencyType, contactName });
    selectTrack(id);
    router.push(`/discovery/${id}`);
  }

  const hasContext = session.mode === 'context';
  const hasSynthesis = !!session.synthesis;
  const profileFilled = agencyName.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b-2 border-[#E9E7FF]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl hero-gradient flex items-center justify-center shadow-md">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-black text-base text-[#1A1535] tracking-tight">CW Discovery</span>
              <span className="ml-2 text-xs font-bold text-[#9B96C0] hidden sm:inline">State & Local Gov</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7C3AED] bg-[#F5F3FF] border-2 border-[#DDD6FE] px-3 py-1.5 rounded-full">
              ⚡ DocuSign IAM
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="hero-gradient py-16 px-6">
            {/* Decorative blobs */}
            <div className="absolute top-8 right-16 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
            <div className="absolute bottom-4 left-12 w-24 h-24 bg-white/10 rounded-full blur-xl" style={{ animationDelay: '1s' }} />

            <div className="max-w-6xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-black text-white/90 bg-white/20 border border-white/30 px-4 py-2 rounded-full mb-6 backdrop-blur-sm animate-bounce-in">
                <Star className="w-3.5 h-3.5 fill-white" />
                Solutions Consultant Discovery Guide
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white mb-5 animate-slide-up">
                Map the workflow.
                <br />
                <span className="text-white/75">Find the win. 🎯</span>
              </h1>

              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-xl font-semibold animate-slide-up" style={{ animationDelay: '60ms' }}>
                A guided discovery tool for state & local government customers.
                Step through pointed questions, visualize their approval process,
                and surface exactly where DocuSign drives measurable impact.
              </p>

              {/* Product badges */}
              <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '120ms' }}>
                {PRODUCT_BADGES.map((b) => {
                  const Icon = b.icon;
                  return (
                    <span
                      key={b.name}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full bg-white/20 border border-white/30 text-white backdrop-blur-sm"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {b.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Agency Quick-Fill Card */}
        <section className="max-w-6xl mx-auto px-6 -mt-8 relative z-20 animate-bounce-in">
          <div className="bg-white rounded-3xl shadow-[0_8px_48px_rgba(79,70,229,0.18)] border-2 border-[#E9E7FF] p-7">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center flex-shrink-0 shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#1A1535] mb-1">👋 Who are you meeting with?</h2>
                <p className="text-sm font-semibold text-[#5B5680]">
                  Pre-fill your session so discovery feels ready-to-go the moment you open it.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Agency Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-[#5B5680] uppercase tracking-widest mb-2">
                  Agency Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. City of Austin, Travis County, CDOT…"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full border-2 border-[#E9E7FF] rounded-2xl px-4 py-3 text-sm font-bold text-[#1A1535] placeholder:font-semibold placeholder:text-[#9B96C0] focus:outline-none focus:border-[#4F46E5] focus:shadow-[0_0_0_4px_rgba(79,70,229,0.12)] transition-all bg-[#F8F7FF]"
                />
              </div>

              {/* Agency Type pills */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-[#5B5680] uppercase tracking-widest mb-2">
                  Agency Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {AGENCY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setAgencyType(agencyType === type.id ? '' : type.id)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-bold border-2 transition-all duration-150',
                        agencyType === type.id
                          ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-[0_4px_12px_rgba(79,70,229,0.35)]'
                          : 'bg-white border-[#E9E7FF] text-[#5B5680] hover:border-[#4F46E5] hover:text-[#4F46E5]'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-xs font-black text-[#5B5680] uppercase tracking-widest mb-2">
                  Your Contact <span className="normal-case font-semibold text-[#9B96C0]">(optional)</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B96C0]" />
                  <input
                    type="text"
                    placeholder="e.g. Sarah Chen, Procurement Dir."
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full border-2 border-[#E9E7FF] rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-[#1A1535] placeholder:font-semibold placeholder:text-[#9B96C0] focus:outline-none focus:border-[#4F46E5] focus:shadow-[0_0_0_4px_rgba(79,70,229,0.12)] transition-all bg-[#F8F7FF]"
                  />
                </div>
              </div>

              {/* Pre-fill hint */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F5F3FF] border-2 border-[#DDD6FE]">
                <Sparkles className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
                <p className="text-xs font-bold text-[#7C3AED] leading-relaxed">
                  These details pre-fill your session header and summary report — no retyping later.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mode toggle + context panel */}
        <section className="max-w-6xl mx-auto px-6 pt-8 pb-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-black text-[#9B96C0] uppercase tracking-widest mb-3">
                How are you going into this conversation?
              </p>
              <ModeToggle mode={session.mode} onChange={setMode} />
            </div>
            {hasContext && (
              <div className="max-w-xl animate-slide-up">
                <ContextIngestion />
              </div>
            )}
          </div>
        </section>

        {/* Track selector */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-black text-[#9B96C0] uppercase tracking-widest">
              Choose a Discovery Track
            </p>
            {profileFilled && (
              <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] border-2 border-[#A7F3D0] px-3 py-1.5 rounded-full animate-fade-in">
                ✓ Pre-filled for {agencyName}
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TRACKS.map((track, i) => {
              const Icon = TRACK_ICONS[track.icon as keyof typeof TRACK_ICONS] ?? FileSearch;
              const emoji = TRACK_EMOJIS[track.id] ?? '📋';
              const gradientClass = TRACK_GRADIENTS[track.id as keyof typeof TRACK_GRADIENTS];
              const isRecommended = hasSynthesis && session.synthesis?.recommendedTrack === track.id;

              return (
                <button
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={cn(
                    'group relative text-left rounded-3xl border-2 overflow-hidden',
                    'transition-all duration-200 cursor-pointer animate-bounce-in',
                    'hover:scale-[1.02] hover:shadow-[0_12px_48px_rgba(79,70,229,0.22)]',
                    isRecommended
                      ? 'border-transparent shadow-[0_0_0_3px_rgba(79,70,229,0.5)]'
                      : 'border-[#E9E7FF] bg-white'
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Gradient top strip */}
                  <div className={cn('h-2 w-full', gradientClass)} />

                  <div className="p-6">
                    {isRecommended && (
                      <div
                        className="absolute top-5 right-4 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ backgroundColor: `${track.accentColor}18`, color: track.accentColor }}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        Recommended
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-md text-2xl', gradientClass)}
                    >
                      {emoji}
                    </div>

                    <h3 className="font-black text-lg text-[#1A1535] mb-1 leading-tight">{track.title}</h3>
                    <p className="text-xs font-bold mb-3" style={{ color: track.accentColor }}>
                      {track.subtitle}
                    </p>
                    <p className="text-sm font-semibold text-[#5B5680] leading-relaxed mb-6">{track.description}</p>

                    <div
                      className="inline-flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-full text-white transition-all shadow-md group-hover:shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${track.accentColor}, ${track.accentColor}cc)` }}
                    >
                      {hasSynthesis && session.synthesis?.knownAnswers ? 'Start discovery' : 'Start discovery'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    {hasSynthesis && session.synthesis?.recommendedTrack === track.id && (
                      <p className="text-xs font-bold text-[#9B96C0] mt-3">
                        {Object.keys(session.synthesis.knownAnswers).length} questions pre-filled from your notes ✨
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white border-t-2 border-[#E9E7FF]">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <p className="text-xs font-black text-[#9B96C0] uppercase tracking-widest mb-10 text-center">
              How It Works
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((item, i) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-3xl border-2 border-[#E9E7FF] bg-[#F8F7FF] animate-slide-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm"
                    style={{ backgroundColor: item.bg }}
                  >
                    {item.emoji}
                  </div>
                  <div
                    className="absolute top-4 right-4 text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    Step {item.step}
                  </div>
                  <h3 className="font-black text-sm text-[#1A1535] mb-2">{item.title}</h3>
                  <p className="text-sm font-semibold text-[#5B5680] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IAM insight strip */}
        <section className="hero-gradient text-white">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <div className="flex-1">
                <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-3">The IAM Shift</p>
                <p className="text-2xl font-black leading-snug">
                  Agreements aren&apos;t static files anymore.
                  <br />
                  <span className="text-white/75">They&apos;re data — structured, searchable, actionable.</span>
                </p>
              </div>
              <div className="flex gap-8 sm:gap-12 flex-shrink-0">
                {[
                  { stat: '80%', label: 'less time finding agreements', emoji: '⚡' },
                  { stat: '70%', label: 'faster processing', emoji: '🚀' },
                  { stat: '36%', label: 'avg. efficiency gain', emoji: '📈' },
                ].map((s) => (
                  <div key={s.stat} className="text-center">
                    <div className="text-3xl mb-1">{s.emoji}</div>
                    <div className="text-2xl font-black">{s.stat}</div>
                    <div className="text-xs font-bold text-white/60 mt-1 max-w-[80px] leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[#E9E7FF] bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs font-bold text-[#9B96C0]">CW Discovery Tool · DocuSign IAM · State & Local Government</p>
          <p className="text-xs font-bold text-[#9B96C0] bg-[#F8F7FF] px-3 py-1.5 rounded-full border-2 border-[#E9E7FF]">For SC use only</p>
        </div>
      </footer>
    </div>
  );
}
