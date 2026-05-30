'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getTrack } from '@/data/tracks';
import { TrackId } from '@/data/types';
import { getProgress } from '@/lib/utils';
import QuestionStep from '@/components/QuestionStep';
import WorkflowPanel from '@/components/WorkflowPanel';

const TRACK_EMOJIS: Record<string, string> = {
  solicitations: '🏛️',
  'third-party-review': '🔍',
  'drafting-approvals': '✍️',
};

export default function DiscoveryPage({ params }: { params: Promise<{ track: string }> }) {
  const { track: trackParam } = use(params);
  const router = useRouter();
  const { session, selectTrack, goBack } = useStore();

  const track = getTrack(trackParam);

  useEffect(() => {
    if (!track) {
      router.replace('/');
      return;
    }
    if (session.track !== trackParam) {
      selectTrack(trackParam as TrackId);
    }
  }, [trackParam, track, session.track, selectTrack, router]);

  useEffect(() => {
    if (session.track === trackParam && session.currentQuestionId === null && session.history.length > 0) {
      router.push('/summary');
    }
  }, [session.currentQuestionId, session.track, trackParam, session.history.length, router]);

  if (!track) return null;

  const currentQuestion = track.questions.find((q) => q.id === session.currentQuestionId);
  const progress = getProgress(trackParam as TrackId, session.currentQuestionId);
  const isComplete = session.currentQuestionId === null && session.history.length > 0;
  const { agencyProfile } = session;
  const emoji = TRACK_EMOJIS[trackParam] ?? '📋';

  if (isComplete) return null;

  const questionNum = session.history.length + 1;
  const totalQ = track.questions.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b-2 border-[#E9E7FF]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (session.history.length > 0 ? goBack() : router.push('/'))}
              className="flex items-center gap-1.5 text-sm font-bold text-[#5B5680] hover:text-[#1A1535] transition-colors bg-[#F8F7FF] border-2 border-[#E9E7FF] px-3 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {session.history.length > 0 ? 'Back' : 'Home'}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xl">{emoji}</span>
              <div>
                <span className="text-sm font-black text-[#1A1535]">{track.title}</span>
                {agencyProfile.agencyName && (
                  <span className="ml-1.5 text-xs font-bold text-[#9B96C0]">· {agencyProfile.agencyName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs font-black text-[#9B96C0]">
              Question {questionNum} of {totalQ}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-36 h-3 rounded-full bg-[#E9E7FF] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${track.accentColor}, ${track.accentColor}cc)`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <span className="text-xs font-black" style={{ color: track.accentColor }}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Context banner when contact name present */}
      {(agencyProfile.agencyName || agencyProfile.contactName) && (
        <div
          className="px-6 py-2.5 flex items-center gap-2 text-xs font-bold border-b-2 border-[#E9E7FF]"
          style={{ backgroundColor: `${track.accentColor}10`, color: track.accentColor }}
        >
          <Zap className="w-3.5 h-3.5" />
          {agencyProfile.agencyName && <span>{agencyProfile.agencyName}</span>}
          {agencyProfile.agencyName && agencyProfile.contactName && <span className="opacity-50">·</span>}
          {agencyProfile.contactName && <span>{agencyProfile.contactName}</span>}
          <span className="opacity-60 ml-1">— personalized session active</span>
        </div>
      )}

      {/* Main split layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Question area */}
        <div className="flex-1 flex flex-col min-h-0">
          {currentQuestion ? (
            <QuestionStep key={currentQuestion.id} question={currentQuestion} track={track} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-4xl animate-float">⏳</div>
            </div>
          )}
        </div>

        {/* Workflow panel */}
        <div className="lg:w-80 xl:w-96 border-t-2 lg:border-t-0 lg:border-l-2 border-[#E9E7FF] bg-white">
          <WorkflowPanel track={track} />
        </div>
      </div>
    </div>
  );
}
