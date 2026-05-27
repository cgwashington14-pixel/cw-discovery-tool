import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TRACKS } from '@/data/tracks';
import { SOLUTIONS } from '@/data/solutions';
import { PainPointId, TrackId, DocuSignSolution } from '@/data/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProgress(trackId: TrackId, questionId: string | null): number {
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track || !questionId) return 0;
  const idx = track.questions.findIndex((q) => q.id === questionId);
  return idx < 0 ? 100 : Math.round(((idx + 1) / track.questions.length) * 100);
}

export function getRecommendedSolutions(painPoints: PainPointId[]): DocuSignSolution[] {
  if (!painPoints.length) return [];
  return SOLUTIONS.filter((s) => s.painPoints.some((p) => painPoints.includes(p as PainPointId))).sort((a, b) => {
    const aScore = a.painPoints.filter((p) => painPoints.includes(p as PainPointId)).length;
    const bScore = b.painPoints.filter((p) => painPoints.includes(p as PainPointId)).length;
    return bScore - aScore;
  });
}

export function getQuestionById(trackId: TrackId, questionId: string) {
  const track = TRACKS.find((t) => t.id === trackId);
  return track?.questions.find((q) => q.id === questionId);
}

export function formatAnswer(answer: string | string[]): string {
  if (Array.isArray(answer)) return answer.join(', ');
  return answer;
}
