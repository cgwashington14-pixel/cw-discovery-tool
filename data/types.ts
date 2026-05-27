export type TrackId = 'solicitations' | 'third-party-review' | 'drafting-approvals';

export type AnswerType = 'single' | 'multi' | 'scale' | 'text';

export type PainPointId =
  | 'email-tracking'
  | 'no-templates'
  | 'scattered-templates'
  | 'manual-routing'
  | 'approval-bottleneck'
  | 'no-visibility'
  | 'static-storage'
  | 'missing-renewals'
  | 'no-risk-process'
  | 'version-control'
  | 'system-silos'
  | 'manual-risk-review'
  | 'long-cycle'
  | 'compliance-gaps'
  | 'cant-find-contracts'
  | 'deadline-pressure';

export interface Option {
  id: string;
  label: string;
  description?: string;
  painPoints?: PainPointId[];
  solutions?: string[];
  nextQuestion?: string;
  workflowStep?: Partial<WorkflowStep>;
}

export interface Question {
  id: string;
  step: number;
  category: 'intake' | 'process' | 'approvals' | 'storage' | 'pain-points' | 'risk';
  question: string;
  subtext?: string;
  type: AnswerType;
  options?: Option[];
  scaleLabels?: [string, string];
  next?: string | ((answers: Record<string, string | string[]>) => string);
  insight?: string;
  docusignTip?: string;
}

export interface Track {
  id: TrackId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
  bgColor: string;
  questions: Question[];
}

export interface WorkflowStep {
  id: string;
  label: string;
  owner?: string;
  duration?: string;
  status: 'current' | 'pain-point' | 'opportunity' | 'automated';
  docusignProduct?: string;
  note?: string;
}

export interface DocuSignSolution {
  id: string;
  product: string;
  category: 'workflow' | 'repository' | 'authoring' | 'risk' | 'integration' | 'analytics';
  tagline: string;
  description: string;
  painPoints: PainPointId[];
  features: string[];
  impact: { metric: string; stat: string };
  accentColor: string;
}

export interface DiscoverySession {
  track: TrackId | null;
  currentQuestionId: string | null;
  answers: Record<string, string | string[]>;
  history: string[];
  workflowSteps: WorkflowStep[];
  identifiedPainPoints: PainPointId[];
  identifiedSolutions: string[];
}

export interface SummaryData {
  track: Track;
  answers: Record<string, string | string[]>;
  painPoints: PainPointId[];
  solutions: DocuSignSolution[];
  workflowSteps: WorkflowStep[];
}
