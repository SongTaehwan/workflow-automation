/** 흐름 노드를 소유하는 주체. 상세 화면의 역할별 시각 구분 기준이다. */
export type WorkflowRole =
  'user' | 'thread' | 'manager' | 'developer' | 'agent' | 'artifact';

/** 경로 종류. 정상 / 명확화 loop / 차단·실패로 선과 색을 나눈다. */
export type WorkflowPathKind = 'normal' | 'clarification' | 'blocked';

export interface WorkflowStep {
  role: WorkflowRole;
  title: string;
  detail: string;
}

export interface WorkflowPath {
  kind: WorkflowPathKind;
  title: string;
  description: string;
  steps: WorkflowStep[];
  notes: string[];
}

export interface WorkflowSection {
  title: string;
  description: string;
  items: string[];
}

export interface WorkflowEvidenceLink {
  step: string;
  file: string;
  owner: string;
  detail: string;
}

export interface WorkflowStage {
  /** 상세 경로 세그먼트. `/workflows/<slug>` 로 쓰인다. */
  slug: string;
  title: string;
  summary: string;
  status: string;
  detailLabel: string;
  headline: string;
  paths: WorkflowPath[];
  sections: WorkflowSection[];
  evidenceChain: WorkflowEvidenceLink[];
  evidenceNote: string;
}
