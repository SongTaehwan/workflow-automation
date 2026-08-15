import { describe, expect, it } from 'vitest';

import { findPhaseById, phases } from './phases';

describe('phases 목업 데이터', () => {
  it('id 가 중복되지 않는다', () => {
    const ids = phases.map((phase) => phase.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 Phase 가 하나 이상의 step 을 가진다', () => {
    expect(phases.every((phase) => phase.steps.length > 0)).toBe(true);
  });
});

describe('findPhaseById', () => {
  it('id 가 일치하는 Phase 를 찾는다', () => {
    expect(findPhaseById('phase-1')?.code).toBe('PHASE 1');
  });

  // 상세 화면이 404 를 판별하는 근거
  it('없는 id 면 undefined 를 돌려준다', () => {
    expect(findPhaseById('phase-none')).toBeUndefined();
  });
});
