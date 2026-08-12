import { ArrowDown, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { findWorkflowStage } from '@/entities/workflow-stage';

import { WorkflowPathFlow } from '../_components/WorkflowPathFlow';

function BackToListLink() {
  return (
    <Link
      to="/"
      className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-cyan-500/60 hover:text-cyan-300"
    >
      <ArrowLeft className="size-4" />
      목록으로 돌아가기
    </Link>
  );
}

export default function WorkflowDetailPage() {
  const { stageSlug } = useParams();
  const stage = stageSlug ? findWorkflowStage(stageSlug) : undefined;

  if (!stage) {
    return (
      <div className="min-h-svh bg-slate-950 px-6 py-10 text-slate-100">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <BackToListLink />
          <p className="text-sm text-slate-400">
            해당 Workflow 단계를 찾을 수 없다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <BackToListLink />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="size-2.5 rounded-full bg-emerald-400" />
              <h1 className="text-xl font-semibold tracking-tight">
                {stage.title}
              </h1>
            </div>
            <p className="ml-6 text-sm text-slate-400">{stage.headline}</p>
            <div className="ml-6 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-300">
                요약 · {stage.summary}
              </span>
              <span className="rounded-full border border-emerald-500/50 px-2 py-0.5 text-emerald-300">
                상태 · {stage.status}
              </span>
              <span className="rounded-full border border-cyan-500/50 px-2 py-0.5 text-cyan-300">
                상세 경로 · {stage.detailLabel}
              </span>
            </div>
          </div>
        </header>

        {stage.paths.map((path) => (
          <WorkflowPathFlow key={path.kind} path={path} />
        ))}

        <div className="grid gap-4 sm:grid-cols-2">
          {stage.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <h2 className="text-sm font-semibold text-slate-100">
                {section.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {section.description}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="text-xs leading-relaxed text-slate-400"
                  >
                    · {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="rounded-xl border border-violet-500/40 bg-slate-900/50 p-5">
          <h2 className="text-base font-semibold text-violet-300">감사 기록</h2>
          <p className="mt-1 text-xs text-slate-400">
            handoff directory 에 남는 증적 흐름.
          </p>
          <ol className="mt-4 flex flex-col gap-3">
            {stage.evidenceChain.map((link, index) => (
              <li key={link.file} className="flex flex-col">
                {index > 0 && (
                  <div className="flex w-6 justify-center py-1" aria-hidden>
                    <ArrowDown className="size-4 text-violet-400" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">
                      {link.step}
                    </span>
                    <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-violet-200">
                      {link.file}
                    </code>
                    <span className="text-[11px] text-slate-500">
                      {link.owner}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{link.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-slate-800 pt-4 text-xs text-amber-300">
            {stage.evidenceNote}
          </p>
        </section>
      </div>
    </div>
  );
}
