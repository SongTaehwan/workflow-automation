import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { toWorkflowStagePath, workflowStages } from '@/entities/workflow-stage';

export default function WorkflowListPage() {
  return (
    <div className="min-h-svh bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <h1 className="text-xl font-semibold tracking-tight">
              Workflow 단계
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            운영·검증된 Workflow 단계를 골라 상세 흐름을 확인한다.
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {workflowStages.map((stage) => (
            <li key={stage.slug}>
              <Link
                to={toWorkflowStagePath(stage.slug)}
                className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-cyan-500/60 hover:bg-slate-900"
              >
                <div className="flex min-w-0 flex-col gap-3">
                  <h2 className="text-base font-semibold">{stage.title}</h2>
                  <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                    <div className="flex gap-2">
                      <dt className="text-slate-500">요약</dt>
                      <dd className="text-slate-300">{stage.summary}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-slate-500">상태</dt>
                      <dd className="text-emerald-300">{stage.status}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-slate-500">상세 경로</dt>
                      <dd className="text-cyan-300">{stage.detailLabel}</dd>
                    </div>
                  </dl>
                </div>
                <ChevronRight className="ml-auto size-5 shrink-0 text-slate-500" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
