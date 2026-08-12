import { ArrowDown, CircleDot, RotateCcw, TriangleAlert } from 'lucide-react';
import { Fragment } from 'react';

import type { FlowTone, FlowTrack } from '@/entities/workflow';
import { cn } from '@/shared/lib/utils';

import { ActorTag, actorEdgeClass } from './ActorTag';

import type { LucideIcon } from 'lucide-react';

// 정상 경로는 실선, 명확화 loop 와 실패 경로는 점선으로 구분한다.
const TONE_STYLE: Record<
  FlowTone,
  {
    badge: string;
    label: string;
    line: string;
    icon: string;
    frame: string;
    Icon: LucideIcon;
  }
> = {
  normal: {
    badge:
      'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    label: '실선 · 정상 진행',
    line: 'border-emerald-500/60',
    icon: 'text-emerald-500',
    frame: 'border-border',
    Icon: CircleDot,
  },
  clarify: {
    badge:
      'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    label: '점선 · 같은 Thread 되돌이',
    line: 'border-amber-500/70 border-dashed',
    icon: 'text-amber-500',
    frame: 'border-amber-500/40 border-dashed',
    Icon: RotateCcw,
  },
  blocked: {
    badge: 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    label: '점선 · 중단 후 보고',
    line: 'border-rose-500/70 border-dashed',
    icon: 'text-rose-500',
    frame: 'border-rose-500/40 border-dashed',
    Icon: TriangleAlert,
  },
};

export function FlowTrackSection({ track }: { track: FlowTrack }) {
  const tone = TONE_STYLE[track.tone];
  const ToneIcon = tone.Icon;

  return (
    <section className={cn('rounded-xl border bg-card p-6', tone.frame)}>
      <div className="flex flex-col gap-2">
        <span
          className={cn(
            'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px]',
            tone.badge
          )}
        >
          <ToneIcon className="size-3" aria-hidden="true" />
          {tone.label}
        </span>
        <h2 className="text-base font-semibold tracking-tight">
          {track.title}
        </h2>
        <p className="text-sm text-muted-foreground">{track.description}</p>
      </div>

      <ol className="mt-5 flex flex-col">
        {track.steps.map((step, index) => (
          <Fragment key={step.title}>
            {index > 0 ? (
              <li aria-hidden="true" className="flex flex-col items-start pl-7">
                <span className={cn('h-4 border-l-2', tone.line)} />
                <ArrowDown className={cn('-ml-1.5 size-3.5', tone.icon)} />
              </li>
            ) : null}
            <li
              className={cn(
                'grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2 rounded-lg border border-l-4 border-border bg-background p-4',
                actorEdgeClass(step.actor)
              )}
            >
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-2">
                <ActorTag actor={step.actor} />
                <span className="text-sm font-semibold">{step.title}</span>
                <ul className="flex flex-col gap-1">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      · {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </Fragment>
        ))}
      </ol>

      <p
        className={cn(
          'mt-5 flex items-start gap-2 rounded-lg border px-4 py-3 text-xs leading-relaxed',
          tone.frame
        )}
      >
        <ToneIcon
          className={cn('mt-0.5 size-3.5 shrink-0', tone.icon)}
          aria-hidden="true"
        />
        {track.rule}
      </p>
    </section>
  );
}
