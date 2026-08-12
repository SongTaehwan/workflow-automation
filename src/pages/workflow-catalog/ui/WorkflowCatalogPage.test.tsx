import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { WorkflowCatalogPage } from '@/pages/workflow-catalog';

function renderCatalog() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <WorkflowCatalogPage />
    </MemoryRouter>
  );
}

describe('WorkflowCatalogPage', () => {
  it('Phase 1 항목의 제목·요약·상태를 표시한다', () => {
    const markup = renderCatalog();

    expect(markup).toContain('Phase 1 — Manager–Developer 단일 Task MVP');
    expect(markup).toContain(
      '한 요청 · 한 Developer Run · 한 Worktree/Branch · 한 PR · Human Merge'
    );
    expect(markup).toContain('현재 단계');
  });

  it('항목을 /workflows/phase-1 상세로 연결한다', () => {
    expect(renderCatalog()).toContain('href="/workflows/phase-1"');
  });

  it('목록에 항목을 하나만 노출한다', () => {
    expect(renderCatalog().match(/<li>/g)).toHaveLength(1);
  });
});
