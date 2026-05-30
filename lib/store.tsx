'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import {
  DiscoverySession,
  DiscoveryMode,
  PainPointId,
  TrackId,
  WorkflowStep,
  ContextSource,
  SynthesisResult,
  AgencyProfile,
} from '@/data/types';
import { TRACKS } from '@/data/tracks';
import { SOLUTIONS } from '@/data/solutions';

type Action =
  | { type: 'SET_MODE'; mode: DiscoveryMode }
  | { type: 'SELECT_TRACK'; trackId: TrackId }
  | { type: 'ANSWER_QUESTION'; questionId: string; answer: string | string[]; nextId: string | null }
  | { type: 'GO_BACK' }
  | { type: 'RESET' }
  | { type: 'ADD_CONTEXT_SOURCE'; source: ContextSource }
  | { type: 'REMOVE_CONTEXT_SOURCE'; id: string }
  | { type: 'SET_SYNTHESIS'; synthesis: SynthesisResult }
  | { type: 'CLEAR_SYNTHESIS' }
  | { type: 'SET_ANALYZING'; value: boolean }
  | { type: 'SET_ANALYZE_ERROR'; error: string | null }
  | { type: 'SET_AGENCY_PROFILE'; profile: AgencyProfile };

const initialState: DiscoverySession = {
  mode: 'fresh',
  track: null,
  currentQuestionId: null,
  answers: {},
  history: [],
  workflowSteps: [],
  identifiedPainPoints: [],
  identifiedSolutions: [],
  contextSources: [],
  synthesis: null,
  isAnalyzing: false,
  analyzeError: null,
  agencyProfile: { agencyName: '', agencyType: '', contactName: '' },
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
  const ids = new Set<string>();
  for (const sol of SOLUTIONS) {
    if (sol.painPoints.some((p) => painPoints.includes(p as PainPointId))) ids.add(sol.id);
  }
  return Array.from(ids);
}

function reducer(state: DiscoverySession, action: Action): DiscoverySession {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SELECT_TRACK': {
      const track = TRACKS.find((t) => t.id === action.trackId);
      // If we have synthesis, merge known answers into initial state
      const knownAnswers = state.synthesis?.knownAnswers ?? {};
      const synthPainPoints = (state.synthesis?.identifiedPainPoints ?? []) as PainPointId[];
      return {
        ...state,
        track: action.trackId,
        currentQuestionId: track?.questions[0]?.id ?? null,
        answers: knownAnswers,
        history: [],
        workflowSteps: [],
        identifiedPainPoints: synthPainPoints,
        identifiedSolutions: deriveSolutions(synthPainPoints),
      };
    }

    case 'ANSWER_QUESTION': {
      const newAnswers = { ...state.answers, [action.questionId]: action.answer };
      const newPainPoints = [
        ...state.identifiedPainPoints,
        ...collectPainPoints(action.answer, action.questionId, state.track!),
      ];
      const unique = [...new Set(newPainPoints)] as PainPointId[];
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
        identifiedPainPoints: unique,
        identifiedSolutions: deriveSolutions(unique),
      };
    }

    case 'GO_BACK': {
      const prevHistory = [...state.history];
      const prevId = prevHistory.pop() ?? null;
      if (!prevId) return state;
      const prevAnswers = { ...state.answers };
      delete prevAnswers[prevId];
      const remainingPainPoints: PainPointId[] = [...(state.synthesis?.identifiedPainPoints ?? [])] as PainPointId[];
      for (const qId of prevHistory) {
        const ans = prevAnswers[qId];
        if (ans) remainingPainPoints.push(...collectPainPoints(ans, qId, state.track!));
      }
      const unique = [...new Set(remainingPainPoints)] as PainPointId[];
      const remainingSteps: WorkflowStep[] = [];
      for (const qId of prevHistory) {
        const ans = prevAnswers[qId];
        if (ans) remainingSteps.push(...collectWorkflowSteps(ans, qId, state.track!));
      }
      return {
        ...state,
        answers: prevAnswers,
        history: prevHistory,
        currentQuestionId: prevId,
        workflowSteps: remainingSteps,
        identifiedPainPoints: unique,
        identifiedSolutions: deriveSolutions(unique),
      };
    }

    case 'RESET':
      return { ...initialState };

    case 'ADD_CONTEXT_SOURCE':
      return { ...state, contextSources: [...state.contextSources, action.source] };

    case 'REMOVE_CONTEXT_SOURCE':
      return { ...state, contextSources: state.contextSources.filter((s) => s.id !== action.id) };

    case 'SET_SYNTHESIS':
      return { ...state, synthesis: action.synthesis, isAnalyzing: false, analyzeError: null };

    case 'CLEAR_SYNTHESIS':
      return { ...state, synthesis: null, contextSources: [], analyzeError: null };

    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.value, analyzeError: action.value ? null : state.analyzeError };

    case 'SET_ANALYZE_ERROR':
      return { ...state, analyzeError: action.error, isAnalyzing: false };

    case 'SET_AGENCY_PROFILE':
      return { ...state, agencyProfile: action.profile };

    default:
      return state;
  }
}

interface StoreContextValue {
  session: DiscoverySession;
  setMode: (mode: DiscoveryMode) => void;
  selectTrack: (id: TrackId) => void;
  answerQuestion: (questionId: string, answer: string | string[]) => void;
  goBack: () => void;
  reset: () => void;
  resolveNext: (questionId: string, answer: string | string[]) => string | null;
  addContextSource: (source: ContextSource) => void;
  removeContextSource: (id: string) => void;
  setSynthesis: (s: SynthesisResult) => void;
  clearSynthesis: () => void;
  setAnalyzing: (v: boolean) => void;
  setAnalyzeError: (err: string | null) => void;
  setAgencyProfile: (profile: AgencyProfile) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(reducer, initialState);

  const setMode = useCallback((mode: DiscoveryMode) => dispatch({ type: 'SET_MODE', mode }), []);
  const selectTrack = useCallback((id: TrackId) => dispatch({ type: 'SELECT_TRACK', trackId: id }), []);
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const addContextSource = useCallback((source: ContextSource) => dispatch({ type: 'ADD_CONTEXT_SOURCE', source }), []);
  const removeContextSource = useCallback((id: string) => dispatch({ type: 'REMOVE_CONTEXT_SOURCE', id }), []);
  const setSynthesis = useCallback((synthesis: SynthesisResult) => dispatch({ type: 'SET_SYNTHESIS', synthesis }), []);
  const clearSynthesis = useCallback(() => dispatch({ type: 'CLEAR_SYNTHESIS' }), []);
  const setAnalyzing = useCallback((value: boolean) => dispatch({ type: 'SET_ANALYZING', value }), []);
  const setAnalyzeError = useCallback((error: string | null) => dispatch({ type: 'SET_ANALYZE_ERROR', error }), []);
  const setAgencyProfile = useCallback((profile: AgencyProfile) => dispatch({ type: 'SET_AGENCY_PROFILE', profile }), []);

  const resolveNext = useCallback(
    (questionId: string, answer: string | string[]) =>
      resolveNextId(answer, questionId, session.track!, session.answers),
    [session.track, session.answers]
  );

  const answerQuestion = useCallback(
    (questionId: string, answer: string | string[]) => {
      const nextId = resolveNext(questionId, answer);
      dispatch({ type: 'ANSWER_QUESTION', questionId, answer, nextId });
    },
    [resolveNext]
  );

  return (
    <StoreContext.Provider
      value={{
        session,
        setMode,
        selectTrack,
        answerQuestion,
        goBack,
        reset,
        resolveNext,
        addContextSource,
        removeContextSource,
        setSynthesis,
        clearSynthesis,
        setAnalyzing,
        setAnalyzeError,
        setAgencyProfile,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
