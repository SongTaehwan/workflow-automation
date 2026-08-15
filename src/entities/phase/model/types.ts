export const PhaseStatus = {
  COMPLETED: 'completed',
  RUNNING: 'running',
  PENDING: 'pending',
} as const;

export type PhaseStatus = (typeof PhaseStatus)[keyof typeof PhaseStatus];

export type PhaseStep = {
  id: string;
  name: string;
  role: string;
  detail: string;
  status: PhaseStatus;
};

export type Phase = {
  id: string;
  code: string;
  title: string;
  summary: string;
  status: PhaseStatus;
  boundary: string;
  updatedAt: string;
  steps: PhaseStep[];
  invariants: string[];
  nextChecks: string[];
};
