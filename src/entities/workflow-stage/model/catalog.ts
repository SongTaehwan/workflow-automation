import type { WorkflowStage } from './types';

/** 로컬 정적 catalog. 다음 단계는 이 배열에 항목을 추가한다. */
export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'phase-1',
    name: 'Phase 1 — Manager–Developer 단일 Task MVP',
    summary:
      '한 요청 · 한 Developer Run · 한 Worktree/Branch · 한 PR · Human Merge',
    status: '현재 단계',
  },
];

export function findWorkflowStage(
  stageId: string | undefined
): WorkflowStage | undefined {
  return WORKFLOW_STAGES.find((stage) => stage.id === stageId);
}
