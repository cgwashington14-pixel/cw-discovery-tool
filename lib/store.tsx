'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { DiscoverySession, PainPointId, TrackId, WorkflowStep } from '@/data/types';
import { TRACKS } from '@/data/tracks';
import { SOLUTIONS } from '@/data/solutions';

type Action =
  | { type: 'SELECT_TRACK'; trackId: TrackId }
  | { type: 'ANSWER_QUESTION'; questionId: string; answer: string | string[]; nextId: string | null }
  | { type: 'GO_BACK' }
  | { type: 'RESET' };

const initialState: DiscoverySession = {
  track: null,
  currentQuestionId: null,
  answers: {},
  history: [],
  workflowSteps: [],
  identifiedPainPoints: [],
  identifiedSolutions: [],
};

function collectPainPoints(answer: string | string[], questionId: string, trackId: TrackId): PainPointId[] {
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) return [];
  const question = track.questions.find((q) => q.id === questionId);
  if (!question?.options) return [];

  const selectedIds = Array.isArray(answer) ? answer : [answer];
  const points: PainPointId[] = [];
  for (const optId of selectedIds) {
    const opt = question.options.find((o) => o.id === optId);
    if (opt?.painPoints) points.push(...(opt.painPoints as PainPointId[]));
  }
  return points;
}

function collectWorkflowSteps(answer: string | string[], questionId: string, trackId: TrackId): WorkflowStep[] {
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) return [];
  const question = track.questions.find((q) => q.id === questionId);
  if (!question?.options) return [];

  const selectedIds = Array.isArray(answer) ? answer : [answer];
  const steps: WorkflowStep[] = [];
  for (const optId of selectedIds) {
    const opt = question.options.find((o) => o.id === optId);
    if (opt?.workflowStep) {
      steps.push({
        id: `${questionId}-${optId}`,
        label: opt.workflowStep.label ?? opt.label,
        owner: opt.workflowStep.owner,
        status: opt.workflowStep.status ?? 'current',
        docusignProduct: opt.workflowStep.docusignProduct,
        note: opt.workflowStep.note,
      });
    }
  }
  return steps;
}

function resolveNextId(
  answer: string | string[],
  questionId: string,
  trackId: TrackId,
  answers: Record<string, string | string[]>
): string | null {
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) return null;
  const question = track.questions.find((q) => q.id === questionId);
  if (!question) return null;

  const nextRaw = question.next;
  let nextId: string | null = null;

  if (typeof nextRaw === 'function') {
    nextId = nextRaw({ ...answers, [questionId]: answer }) ?? null;
  } else if (typeof nextRaw === 'string') {
    nextId = nextRaw;
  }

  if (!nextId) {
    const selectedId = Array.isArray(answer) ? answer[0] : answer;
    const opt = question.options?.find((o) => o.id === selectedId);
    if (opt?.nextQuestion) nextId = opt.nextQuestion;
  }

  if (!nextId) {
    const idx = track.questions.findIndex((q) => q.id === questionId);
    if (idx >= 0 && idx < track.questions.length - 1) {
      nextId = track.questions[idx + 1].id;
    }
  }

  return nextId;
}

function deriveSolutions(painPoints: PainPointId[]): string[] {
  const solutionIds = new Set<string>();
  for (const sol of SOLUTIONS) {
    if (sol.painPoints.some((p) => painPoints.includes(p as PainPointId))) {
      solutionIds.add(sol.id);
    }
  }
  return Array.from(solutionIds);
}

function reducer(state: DiscoverySession, action: Action): DiscoverySession {
  switch (action.type) {
    case 'SELECT_TRACK': {
      const track = TRACKS.find((t) => t.id === action.trackId);
      return {
        ...initialState,
        track: action.trackId,
        currentQuestionId: track?.questions[0]?.id ?? null,
      };
    }
    case 'ANSWER_QUESTION': {
      const newAnswers = { ...state.answers, [action.questionId]: action.answer };
      const newPainPoints = [
        ...state.identifiedPainPoints,
        ...collectPainPoints(action.answer, action.questionId, state.track!),
      ];
      const uniquePainPoints = [...new Set(newPainPoints)] as PainPointId[];
      const newSteps = [
        ...state.workflowSteps,
        ...collectWorkflowSteps(action.answer, action.questionId, state.track!),
      ];
      return {
        ...state,
        answers: newAnswers,
        history: [...state.history, action.questionId],
        currentQuestionId: action.nextId,
        workflowSteps: newSteps,
        identifiedPainPoints: uniquePainPoints,
        identifiedSolutions: deriveSolutions(uniquePainPoints),
      };
    }
    case 'GO_BACK': {
      const prevHistory = [...state.history];
      const prevId = prevHistory.pop() ?? null;
      if (!prevId) return state;
      const prevAnswers = { ...state.answers };
      delete prevAnswers[prevId];
      const remainingHistory = prevHistory;
      const remainingPainPoints: PainPointId[] = [];
      for (const qId of remainingHistory) {
        const ans = prevAnswers[qId];
        if (ans) remainingPainPoints.push(...collectPainPoints(ans, qId, state.track!));
      }
      const uniqueRemaining = [...new Set(remainingPainPoints)] as PainPointId[];
      const remainingSteps: WorkflowStep[] = [];
      for (const qId of remainingHistory) {
        const ans = prevAnswers[qId];
        if (ans) remainingSteps.push(...collectWorkflowSteps(ans, qId, state.track!));
      }
      return {
        ...state,
        answers: prevAnswers,
        history: prevHistory,
        currentQuestionId: prevId,
        workflowSteps: remainingSteps,
        identifiedPainPoints: uniqueRemaining,
        identifiedSolutions: deriveSolutions(uniqueRemaining),
      };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface StoreContextValue {
  session: DiscoverySession;
  selectTrack: (id: TrackId) => void;
  answerQuestion: (questionId: string, answer: string | string[]) => void;
  goBack: () => void;
  reset: () => void;
  resolveNext: (questionId: string, answer: string | string[]) => string | null;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(reducer, initialState);

  const selectTrack = (id: TrackId) => dispatch({ type: 'SELECT_TRACK', trackId: id });

  const resolveNext = (questionId: string, answer: string | string[]) =>
    resolveNextId(answer, questionId, session.track!, session.answers);

  const answerQuestion = (questionId: string, answer: string | string[]) => {
    const nextId = resolveNext(questionId, answer);
    dispatch({ type: 'ANSWER_QUESTION', questionId, answer, nextId });
  };

  const goBack = () => dispatch({ type: 'GO_BACK' });
  const reset = () => dispatch({ type: 'RESET' });

  return (
    <StoreContext.Provider value={{ session, selectTrack, answerQuestion, goBack, reset, resolveNext }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
