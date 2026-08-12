import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { WorkflowPhase1Page } from '@/pages/workflow-phase-1';

function renderDetail() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <WorkflowPhase1Page />
    </MemoryRouter>
  );
}

describe('WorkflowPhase1Page', () => {
  it('정상 · 명확화 · blocked 세 흐름을 모두 그린다', () => {
    const markup = renderDetail();

    expect(markup).toContain('정상 흐름');
    expect(markup).toContain('명확화 loop — 같은 Slack Thread');
    expect(markup).toContain('blocked / failed 경로');
    expect(markup).toContain('같은 Thread 에 투명 보고');
  });

  it('단일 경계와 역할 책임을 표시한다', () => {
    const markup = renderDetail();

    expect(markup).toContain('Task Contract');
    expect(markup).toContain('Developer Run');
    expect(markup).toContain('Worktree · Branch');
    expect(markup).toContain('Coding Agent CLI 실행');
    expect(markup).toContain('Pull Request');
    expect(markup).toContain('workflow-manager');
    expect(markup).toContain('workflow-developer');
  });

  it('handoff 기록 파일명을 표시한다', () => {
    const markup = renderDetail();

    expect(markup).toContain('00-task-contract.yaml');
    expect(markup).toContain('01-manager-to-developer.md');
    expect(markup).toContain('03-developer-result.yaml');
    expect(markup).toContain('04-manager-verification.md');
  });

  it('자동 재시도·자동 Merge 금지와 사용자 최종 판단을 표시한다', () => {
    const markup = renderDetail();

    expect(markup).toContain('자동 재시도하지 않는다');
    expect(markup).toContain('자동 Merge · PR 승인 금지');
    expect(markup).toContain('최종 판단은 사용자');
  });

  it('목록으로 돌아가는 제어를 제공한다', () => {
    const markup = renderDetail();

    expect(markup).toContain('href="/"');
    expect(markup).toContain('Workflow 목록으로');
  });
});
