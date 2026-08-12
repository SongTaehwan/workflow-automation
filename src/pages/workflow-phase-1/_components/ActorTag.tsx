import type { FlowActor } from '@/entities/workflow';
import { cn } from '@/shared/lib/utils';

// 주체별 색 한 벌. Tailwind 는 클래스 문자열을 정적으로 읽으므로 전체 클래스를 적는다.
const ACTOR_STYLE: Record<
  FlowActor,
  { label: string; tag: string; edge: string }
> = {
  user: {
    label: '사용자',
    tag: 'border-slate-400/50 bg-slate-400/10 text-slate-600 dark:text-slate-300',
    edge: 'border-l-slate-400',
  },
  slack: {
    label: 'Slack Thread',
    tag: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    edge: 'border-l-amber-500',
  },
  manager: {
    label: 'Manager',
    tag: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    edge: 'border-l-emerald-500',
  },
  developer: {
    label: 'Developer',
    tag: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    edge: 'border-l-cyan-500',
  },
  agent: {
    label: 'Coding Agent',
    tag: 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
    edge: 'border-l-fuchsia-500',
  },
  github: {
    label: 'GitHub',
    tag: 'border-violet-500/50 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    edge: 'border-l-violet-500',
  },
};

export function actorEdgeClass(actor: FlowActor) {
  return ACTOR_STYLE[actor].edge;
}

export function ActorTag({
  actor,
  className,
}: {
  actor: FlowActor;
  className?: string;
}) {
  const style = ACTOR_STYLE[actor];

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-[11px]',
        style.tag,
        className
      )}
    >
      {style.label}
    </span>
  );
}
