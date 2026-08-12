/** catalog 항목의 진행 상태. 항목이 늘어나면 여기에 값을 추가한다. */
export type WorkflowStatus = '현재 단계' | '예정';

export type WorkflowCatalogEntry = {
  id: string;
  title: string;
  summary: string;
  status: WorkflowStatus;
  detailPath: string;
};

/** 흐름에 등장하는 주체. 상세 화면에서 색으로 구분한다. */
export type FlowActor =
  'user' | 'slack' | 'manager' | 'developer' | 'agent' | 'github';

export type FlowStep = {
  actor: FlowActor;
  title: string;
  details: string[];
};

/** 흐름 성격. normal 은 실선, clarify·blocked 는 점선으로 표시한다. */
export type FlowTone = 'normal' | 'clarify' | 'blocked';

export type FlowTrack = {
  title: string;
  description: string;
  tone: FlowTone;
  steps: FlowStep[];
  rule: string;
};

export type WorkflowBoundary = {
  label: string;
  count: string;
  description: string;
};

export type WorkflowRole = {
  actor: FlowActor;
  name: string;
  responsibilities: string[];
};

export type AuditRecord = {
  stage: string;
  file: string;
  description: string;
};

export type WorkflowPrinciple = {
  title: string;
  description: string;
};

export type WorkflowDetail = {
  tracks: FlowTrack[];
  boundaries: WorkflowBoundary[];
  roles: WorkflowRole[];
  auditTrail: AuditRecord[];
  principles: WorkflowPrinciple[];
};
