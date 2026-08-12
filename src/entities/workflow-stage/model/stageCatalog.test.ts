import { describe, expect, it } from 'vitest';

import {
  findWorkflowStage,
  toWorkflowStagePath,
  workflowStages,
} from '@/entities/workflow-stage';

describe('workflowStages', () => {
  it('목록에 Phase 1 항목 하나만 담는다', () => {
    expect(workflowStages).toHaveLength(1);
    expect(workflowStages.at(0)?.title).toBe(
      'Phase 1 — Manager–Developer 단일 Task Workflow'
    );
  });

  it('목록 항목이 요약·상태·상세 경로 표시를 갖는다', () => {
    const stage = workflowStages.at(0);

    expect(stage?.summary).toBe('작성 위임');
    expect(stage?.status).toBe('현재 단계');
    expect(stage?.detailLabel).toBe('위임');
  });

  it('정상·명확화·차단 경로를 각각 갖는다', () => {
    const kinds = workflowStages.at(0)?.paths.map((path) => path.kind);

    expect(kinds).toEqual(['normal', 'clarification', 'blocked']);
  });

  it('증적 체인을 네 개의 handoff 기록으로 갖는다', () => {
    const files = workflowStages.at(0)?.evidenceChain.map((link) => link.file);

    expect(files).toEqual([
      '00-task-contract.yaml',
      '01-manager-to-developer.md',
      '03-developer-result.yaml',
      '04-manager-verification.md',
    ]);
  });
});

describe('findWorkflowStage', () => {
  it('slug 로 stage 를 찾는다', () => {
    expect(findWorkflowStage('phase-1')?.slug).toBe('phase-1');
  });

  it('없는 slug 는 undefined 를 준다', () => {
    expect(findWorkflowStage('phase-2')).toBeUndefined();
  });
});

describe('toWorkflowStagePath', () => {
  it('상세 경로를 만든다', () => {
    expect(toWorkflowStagePath('phase-1')).toBe('/workflows/phase-1');
  });
});
