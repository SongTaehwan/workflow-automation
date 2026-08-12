import { ArrowRight, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';

import { workflowCatalog } from '@/entities/workflow';

export default function WorkflowCatalogPage() {
  return (
    <main className="min-h-svh bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Workflow Explorer
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            운영 중인 Workflow 단계
          </h1>
          <p className="text-sm text-muted-foreground">
            현재 운영·검증된 단계를 골라 흐름과 경계를 확인한다.
          </p>
        </header>

        <ul className="flex flex-col gap-4">
          {workflowCatalog.map((entry) => (
            <li key={entry.id}>
              <Link
                to={entry.detailPath}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                  <CircleDot className="size-3" aria-hidden="true" />
                  {entry.status}
                </span>
                <span className="text-lg font-semibold tracking-tight">
                  {entry.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {entry.summary}
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                  {entry.detailPath}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
