import { describe, expect, it } from 'vitest';

import { WORKFLOW_STAGES, findWorkflowStage } from './catalog';

describe('workflow stage catalog', () => {
  it('Phase 1 항목 하나만 담는다', () => {
    expect(WORKFLOW_STAGES).toHaveLength(1);
    expect(WORKFLOW_STAGES[0]).toMatchObject({
      id: 'phase-1',
      status: '현재 단계',
    });
  });

  it('id 로 단계를 찾고, 없으면 undefined 를 준다', () => {
    expect(findWorkflowStage('phase-1')?.name).toContain('Phase 1');
    expect(findWorkflowStage('phase-2')).toBeUndefined();
    expect(findWorkflowStage(undefined)).toBeUndefined();
  });
});
