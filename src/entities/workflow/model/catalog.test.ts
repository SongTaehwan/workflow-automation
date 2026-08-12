import { describe, expect, it } from 'vitest';

import {
  PHASE_1_DETAIL_PATH,
  phase1Detail,
  workflowCatalog,
} from '@/entities/workflow';

describe('workflowCatalog', () => {
  it('Phase 1 항목 하나만 노출한다', () => {
    expect(workflowCatalog).toHaveLength(1);
  });

  it('Phase 1 항목의 표시 문구와 상세 경로가 고정돼 있다', () => {
    expect(workflowCatalog[0]).toEqual({
      id: 'phase-1',
      title: 'Phase 1 — Manager–Developer 단일 Task MVP',
      summary:
        '한 요청 · 한 Developer Run · 한 Worktree/Branch · 한 PR · Human Merge',
      status: '현재 단계',
      detailPath: PHASE_1_DETAIL_PATH,
    });
  });

  it('상세 경로는 /workflows/phase-1 이다', () => {
    expect(PHASE_1_DETAIL_PATH).toBe('/workflows/phase-1');
  });
});

describe('phase1Detail', () => {
  // 정상·명확화·차단 세 흐름이 모두 있어야 상세 화면이 세 경로를 그린다
  it('정상 · 명확화 · blocked 세 흐름을 모두 담는다', () => {
    expect(phase1Detail.tracks.map((track) => track.tone)).toEqual([
      'normal',
      'clarify',
      'blocked',
    ]);
  });

  it('단일 경계를 모두 1 로 표시한다', () => {
    expect(phase1Detail.boundaries).toHaveLength(5);
    expect(
      phase1Detail.boundaries.every((boundary) => boundary.count === '1')
    ).toBe(true);
  });

  it('handoff 기록 네 건을 담는다', () => {
    expect(phase1Detail.auditTrail.map((record) => record.file)).toEqual([
      '00-task-contract.yaml',
      '01-manager-to-developer.md',
      '03-developer-result.yaml',
      '04-manager-verification.md',
    ]);
  });
});
