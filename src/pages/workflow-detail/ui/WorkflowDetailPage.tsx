import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { findWorkflowStage } from '@/entities/workflow-stage';

import { PhaseOneFlowDiagram } from '../_components/PhaseOneFlowDiagram';

const PHASE_ONE_ID = 'phase-1';

const OPERATING_NOTES: { title: string; items: string[] }[] = [
  {
    title: 'Manager Intake Gate',
    items: [
      '요구사항이 모호하면 Developer 를 호출하지 않는다.',
      '원문·범위·수용 기준·미결정 사항을 Task Contract 에 남긴다.',
      '단일 PR 범위를 넘거나 고위험이면 사용자 결정으로 올린다.',
    ],
  },
  {
    title: 'Developer / Codex 책임 경계',
    items: [
      'Developer 는 사전 점검·격리 Worktree·Process 감시·결과 검증을 소유한다.',
      'Codex 는 한 번만 실행하며 구현·테스트·PR 생성을 수행한다.',
      '성공 주장보다 Git, Test, 실제 PR 상태를 우선한다.',
    ],
  },
  {
    title: '명시적 비자동화',
    items: [
      '자동 Retry, Crash Recovery, 다중 Task 분해는 Phase 1 범위 밖이다.',
      '자동 Merge 는 금지한다. Merge 판단은 사용자가 GitHub 에서 직접 한다.',
      '실패하면 남은 Artifact 와 Blocker 를 같은 Slack Thread 에 보고한다.',
    ],
  },
];

const BACK_LINK_CLASS =
  'inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100';

export default function WorkflowDetailPage() {
  const { stageId } = useParams();
  const stage = findWorkflowStage(stageId);

  if (!stage) {
    return (
      <main className="min-h-svh bg-slate-950 px-6 py-12 text-slate-200">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4">
          <h1 className="text-xl font-semibold">
            존재하지 않는 Workflow 단계입니다.
          </h1>
          <Link to="/" className={BACK_LINK_CLASS}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            단계 목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-slate-950 px-6 py-10 text-slate-200 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <Link to="/" className={`${BACK_LINK_CLASS} self-start`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>단계 목록으로 돌아가기</span>
        </Link>

        <header className="flex flex-col gap-2">
          <p className="text-xs tracking-wide text-emerald-400">
            ● {stage.status}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            {stage.name}
          </h1>
          <p className="text-sm text-slate-400">{stage.summary}</p>
        </header>

        {stage.id === PHASE_ONE_ID ? (
          <PhaseOneFlowDiagram />
        ) : (
          <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
            이 단계의 흐름도는 아직 준비되지 않았습니다.
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {OPERATING_NOTES.map((note) => (
            <article
              key={note.title}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-5"
            >
              <h2 className="mb-3 text-sm font-semibold text-slate-100">
                {note.title}
              </h2>
              <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed text-slate-400">
                {note.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <p className="text-xs text-slate-500">
          Phase 1 의 종료점은 PR 생성과 Merge 요청이다. Merge 와 다음 Task
          실행은 자동화하지 않는다.
        </p>
      </div>
    </main>
  );
}
