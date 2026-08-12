import type { WorkflowCatalogEntry } from './types';

export const PHASE_1_DETAIL_PATH = '/workflows/phase-1';

/** 로컬 정적 catalog. 단계가 늘어나면 항목을 추가한다. */
export const workflowCatalog: WorkflowCatalogEntry[] = [
  {
    id: 'phase-1',
    title: 'Phase 1 — Manager–Developer 단일 Task MVP',
    summary:
      '한 요청 · 한 Developer Run · 한 Worktree/Branch · 한 PR · Human Merge',
    status: '현재 단계',
    detailPath: PHASE_1_DETAIL_PATH,
  },
];
