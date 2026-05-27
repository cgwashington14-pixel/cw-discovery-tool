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

  if (isComplete) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E4E4E7] bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (session.history.length > 0 ? goBack() : router.push('/'))}
              className="flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {session.history.length > 0 ? 'Back' : 'Home'}
            </button>
            <span className="text-[#E4E4E7]">·</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#4F46E5] flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">{track.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#71717A]">
              <span>
                {session.history.length + 1} of {track.questions.length}
              </span>
            </div>
            <div className="w-28 h-1.5 rounded-full bg-[#F4F4F5] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: track.accentColor }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Question area */}
        <div className="flex-1 flex flex-col">
          {currentQuestion ? (
            <QuestionStep key={currentQuestion.id} question={currentQuestion} track={track} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-[#71717A]">Loading…</p>
            </div>
          )}
        </div>

        {/* Workflow panel — right sidebar on desktop */}
        <div className="lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-[#E4E4E7] bg-[#FAFAFA]">
          <WorkflowPanel track={track} />
        </div>
      </div>
    </div>
  );
}
