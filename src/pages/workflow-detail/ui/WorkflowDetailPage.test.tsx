import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import WorkflowDetailPage from './WorkflowDetailPage';

function renderDetailPage(pathname: string) {
  return renderToString(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/workflows/:stageSlug" element={<WorkflowDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WorkflowDetailPage', () => {
  it('목록으로 돌아가는 링크를 제공한다', () => {
    const html = renderDetailPage('/workflows/phase-1');

    expect(html).toContain('href="/"');
    expect(html).toContain('목록으로 돌아가기');
  });

  it('정상·명확화·차단 경로를 모두 보여준다', () => {
    const html = renderDetailPage('/workflows/phase-1');

    expect(html).toContain('정상 처리 경로');
    expect(html).toContain('명확화 loop');
    expect(html).toContain('blocked / failed 경로');
  });

  it('단일 실행 경계와 감사 기록 파일명을 보여준다', () => {
    const html = renderDetailPage('/workflows/phase-1');

    expect(html).toContain('단일 Task Contract');
    expect(html).toContain('단일 Pull Request');
    expect(html).toContain('00-task-contract.yaml');
    expect(html).toContain('01-manager-to-developer.md');
    expect(html).toContain('03-developer-result.yaml');
    expect(html).toContain('04-manager-verification.md');
  });

  it('없는 단계는 안내 문구와 목록 링크만 보여준다', () => {
    const html = renderDetailPage('/workflows/phase-2');

    expect(html).toContain('해당 Workflow 단계를 찾을 수 없다.');
    expect(html).toContain('href="/"');
  });
});
