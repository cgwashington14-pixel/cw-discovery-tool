import { Track } from './types';
import { SOLICITATIONS_QUESTIONS } from './questions/solicitations';
import { THIRD_PARTY_QUESTIONS } from './questions/third-party-review';
import { DRAFTING_QUESTIONS } from './questions/drafting-approvals';

export const TRACKS: Track[] = [
  {
    id: 'solicitations',
    title: 'Contract Solicitations',
    subtitle: 'RFP · RFQ · IFB · Bid Process',
    description:
      'Map how procurement needs flow from identification through solicitation, vendor selection, award, and final execution.',
    icon: 'FileSearch',
    accentColor: '#4F46E5',
    bgColor: '#EEF2FF',
    questions: SOLICITATIONS_QUESTIONS,
  },
  {
    id: 'third-party-review',
    title: 'Third-Party Contract Review',
    subtitle: 'Vendor Paper · Redlines · Negotiation',
    description:
      'Understand how incoming vendor contracts are received, reviewed for risk, negotiated, approved, and stored.',
    icon: 'GitMerge',
    accentColor: '#7C3AED',
    bgColor: '#F5F3FF',
    questions: THIRD_PARTY_QUESTIONS,
  },
  {
    id: 'drafting-approvals',
    title: 'Drafting & Approvals',
    subtitle: 'Templates · Redlines · Signature Chain',
    description:
      'Trace the lifecycle of agreements your agency authors — from first draft through internal approvals to executed agreement.',
    icon: 'PenLine',
    accentColor: '#0EA5E9',
    bgColor: '#F0F9FF',
    questions: DRAFTING_QUESTIONS,
  },
];

export function getTrack(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}
