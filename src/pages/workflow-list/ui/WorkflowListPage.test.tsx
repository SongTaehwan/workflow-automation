import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import WorkflowListPage from './WorkflowListPage';

function renderListPage() {
  return renderToString(
    <MemoryRouter initialEntries={['/']}>
      <WorkflowListPage />
    </MemoryRouter>
  );
}

describe('WorkflowListPage', () => {
  it('목록 항목을 하나만 렌더한다', () => {
    expect(renderListPage().match(/<li/g)).toHaveLength(1);
  });

  it('Phase 1 항목의 제목·요약·상태·상세 경로 표시를 보여준다', () => {
    const html = renderListPage();

    expect(html).toContain('Phase 1 — Manager–Developer 단일 Task Workflow');
    expect(html).toContain('작성 위임');
    expect(html).toContain('현재 단계');
    expect(html).toContain('위임');
  });

  it('항목이 상세 화면으로 이동하는 링크다', () => {
    expect(renderListPage()).toContain('href="/workflows/phase-1"');
  });
});
