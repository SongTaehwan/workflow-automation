import { ArrowDown } from 'lucide-react';

import type { WorkflowPath, WorkflowRole } from '@/entities/workflow-stage';
import { cn } from '@/shared/lib/utils';

const ROLE_LABEL: Record<WorkflowRole, string> = {
  user: '사용자',
  thread: 'Slack Thread',
  manager: 'workflow-manager',
  developer: 'workflow-developer',
  agent: 'Coding Agent CLI',
  artifact: '산출물',
};

const ROLE_BADGE: Record<WorkflowRole, string> = {
  user: 'border-slate-500/60 bg-slate-500/10 text-slate-300',
  thread: 'border-orange-500/60 bg-orange-500/10 text-orange-300',
  manager: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
  developer: 'border-sky-500/60 bg-sky-500/10 text-sky-300',
  agent: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300',
  artifact: 'border-violet-500/60 bg-violet-500/10 text-violet-300',
};

const PATH_STYLE: Record<
  WorkflowPath['kind'],
  { container: string; accent: string; arrow: string; label: string }
> = {
  normal: {
    container: 'border-cyan-500/40',
    accent: 'text-cyan-300',
    arrow: 'text-cyan-400',
    label: '정상 흐름 · 실선',
  },
  clarification: {
    container: 'border-dashed border-orange-500/60',
    accent: 'text-orange-300',
    arrow: 'text-orange-400',
    label: '명확화 loop · 점선',
  },
  blocked: {
    container: 'border-dashed border-rose-500/60',
    accent: 'text-rose-300',
    arrow: 'text-rose-400',
    label: '차단·실패 경로 · 점선',
  },
};

export function WorkflowPathFlow({ path }: { path: WorkflowPath }) {
  const style = PATH_STYLE[path.kind];

  return (
    <section
      className={cn('rounded-xl border bg-slate-900/50 p-5', style.container)}
    >
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className={cn('text-base font-semibold', style.accent)}>
            {path.title}
          </h2>
          <span className="text-[11px] text-slate-500">{style.label}</span>
        </div>
        <p className="text-xs text-slate-400">{path.description}</p>
      </header>

      <ol className="mt-5 flex flex-col">
        {path.steps.map((step, index) => (
          <li key={step.title} className="flex flex-col">
            {index > 0 && (
              <div className="flex w-6 justify-center py-1" aria-hidden>
                <ArrowDown className={cn('size-4', style.arrow)} />
              </div>
            )}
            <div className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-[11px] text-slate-400">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px]',
                      ROLE_BADGE[step.role]
                    )}
                  >
                    {ROLE_LABEL[step.role]}
                  </span>
                  <h3 className="text-sm font-medium text-slate-100">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">
                  {step.detail}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <ul className="mt-5 flex flex-col gap-1.5 border-t border-slate-800 pt-4">
        {path.notes.map((note) => (
          <li key={note} className={cn('text-xs', style.accent)}>
            {note}
          </li>
        ))}
      </ul>
    </section>
  );
}
