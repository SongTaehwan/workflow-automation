import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { WORKFLOW_STAGES } from '@/entities/workflow-stage';

export default function WorkflowListPage() {
  return (
    <main className="min-h-svh px-6 py-10 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Workflow 단계
          </h1>
          <p className="text-sm text-muted-foreground">
            단계를 선택하면 해당 단계의 흐름과 운영 원칙을 볼 수 있습니다.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {WORKFLOW_STAGES.map((stage) => (
            <li key={stage.id}>
              <Link
                to={`/workflows/${stage.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-border p-5 transition-colors hover:border-foreground/30 hover:bg-accent"
              >
                <span className="flex flex-col gap-2">
                  <span className="text-xs text-emerald-500">
                    ● {stage.status}
                  </span>
                  <span className="text-base font-medium">{stage.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {stage.summary}
                  </span>
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
