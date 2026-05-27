import { DocuSignSolution } from './types';

export const SOLUTIONS: DocuSignSolution[] = [
  {
    id: 'maestro',
    product: 'DocuSign Maestro',
    category: 'workflow',
    tagline: 'No-Code Workflow Automation',
    description:
      'Build multi-step approval workflows visually — no dev required. Route agreements with conditional logic, parallel approvals, and automated notifications. 32+ pre-built templates and 47+ extension apps.',
    painPoints: ['email-tracking', 'manual-routing', 'approval-bottleneck', 'no-visibility', 'long-cycle'],
    features: [
      'Drag-and-drop workflow builder',
      'Conditional branching & parallel approvals',
      'Real-time status dashboard',
      'Automated deadline reminders',
      'Audit trail for compliance',
    ],
    impact: { stat: '70%', metric: 'faster agreement processing' },
    accentColor: '#4F46E5',
  },
  {
    id: 'navigator',
    product: 'DocuSign Navigator',
    category: 'repository',
    tagline: 'AI-Powered Agreement Intelligence',
    description:
      'Transforms static contract files into structured, searchable data using the Iris AI engine. Auto-categorizes 25+ agreement types, surfaces key obligations, and makes your entire repository instantly searchable — no more hunting through shared drives.',
    painPoints: ['static-storage', 'cant-find-contracts', 'missing-renewals', 'no-visibility'],
    features: [
      'AI extraction of key terms & dates',
      'Fuzzy-match search across all agreements',
      'Renewal & obligation alerts',
      'Cross-document clause analysis',
      '25+ pre-defined agreement categories',
    ],
    impact: { stat: '80%', metric: 'reduction in time spent finding agreements' },
    accentColor: '#7C3AED',
  },
  {
    id: 'clm',
    product: 'DocuSign CLM',
    category: 'authoring',
    tagline: 'Contract Lifecycle Management',
    description:
      'Centrally manage templates, clause libraries, and the full negotiation workflow — from intake to executed agreement. Version control, redlining, and approval routing all in one place.',
    painPoints: ['no-templates', 'scattered-templates', 'version-control', 'long-cycle'],
    features: [
      'Centralized template & clause library',
      'Controlled redline workspace',
      'Version history & comparison',
      'Intake forms with automated routing',
      'Post-signature obligation tracking',
    ],
    impact: { stat: '50%', metric: 'faster contract creation using templates' },
    accentColor: '#0EA5E9',
  },
  {
    id: 'playbooks',
    product: 'IAM Playbooks',
    category: 'risk',
    tagline: 'Automated Risk & Compliance Rules',
    description:
      'Write rules once, apply them to every agreement. Flag unlimited liability clauses, missing indemnification language, auto-renewal traps, and any other risk trigger — automatically. No attorney needed for the first pass.',
    painPoints: ['manual-risk-review', 'no-risk-process', 'compliance-gaps', 'deadline-pressure'],
    features: [
      'Custom clause risk rules',
      'Auto-flagging on upload or send',
      'Fallback / pre-approved clause suggestions',
      'Risk scoring per agreement',
      'Compliance gap reporting',
    ],
    impact: { stat: '40%', metric: 'reduction in legal review time' },
    accentColor: '#F59E0B',
  },
  {
    id: 'app-center',
    product: 'DocuSign App Center',
    category: 'integration',
    tagline: 'Pre-Built System Integrations',
    description:
      'Connect DocuSign to your existing back-office stack — finance, HR, ERP — with pre-built connectors. No custom development required. ServiceNow integration alone drove a 62% cycle-time reduction for federal agencies.',
    painPoints: ['system-silos', 'manual-routing', 'email-tracking'],
    features: [
      'Salesforce, ServiceNow, SAP connectors',
      'Government ERP integrations',
      'FedRAMP Moderate authorized',
      'Webhook & API extensions',
      'No-code connector configuration',
    ],
    impact: { stat: '62%', metric: 'cycle-time reduction via ServiceNow integration' },
    accentColor: '#10B981',
  },
];

export const PAIN_POINT_LABELS: Record<string, string> = {
  'email-tracking': 'Tracking via email threads',
  'no-templates': 'No standard templates',
  'scattered-templates': 'Templates scattered across drives',
  'manual-routing': 'Manual document routing',
  'approval-bottleneck': 'Approval bottlenecks & delays',
  'no-visibility': 'No real-time visibility into status',
  'static-storage': 'Agreements stored as static files',
  'missing-renewals': 'Missing renewal / expiration dates',
  'no-risk-process': 'No formal risk review process',
  'version-control': 'Version control / redline chaos',
  'system-silos': 'Disconnected back-office systems',
  'manual-risk-review': 'Manual clause-by-clause risk review',
  'long-cycle': 'Long approval cycle times',
  'compliance-gaps': 'Compliance / regulatory gaps',
  'cant-find-contracts': 'Cannot quickly find past agreements',
  'deadline-pressure': 'Grant or compliance deadlines',
};

export const IMPACT_STATS = [
  { stat: '70%', label: 'faster agreement processing with Maestro workflows' },
  { stat: '80%', label: 'less time spent searching agreements with Navigator AI' },
  { stat: '50%', label: 'faster drafting with CLM template libraries' },
  { stat: '36%', label: 'average efficiency gain from AI-embedded processes' },
  { stat: '29%', label: 'labor cost savings with end-to-end AI management' },
  { stat: '62%', label: 'cycle-time reduction via ServiceNow integration' },
];
