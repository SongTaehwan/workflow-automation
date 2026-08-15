import { PhaseStatus } from '../model/types';

/** 참고 다이어그램의 상태 범례 색 — 완료 emerald · 실행 cyan · 대기 amber. */
export const phaseStatusTone: Record<
  PhaseStatus,
  {
    label: string;
    dot: string;
    badge: string;
    leftBorder: string;
    hoverBorder: string;
  }
> = {
  [PhaseStatus.COMPLETED]: {
    label: '구성 또는 검증 완료',
    dot: 'bg-emerald-400',
    badge: 'border-emerald-400/60 bg-emerald-900/40 text-emerald-300',
    leftBorder: 'border-l-emerald-400/60',
    hoverBorder: 'hover:border-emerald-400/60',
  },
  [PhaseStatus.RUNNING]: {
    label: '실제 실행 대상',
    dot: 'bg-cyan-400',
    badge: 'border-cyan-400/60 bg-cyan-950/50 text-cyan-300',
    leftBorder: 'border-l-cyan-400/60',
    hoverBorder: 'hover:border-cyan-400/60',
  },
  [PhaseStatus.PENDING]: {
    label: '첫 실제 Run 대기',
    dot: 'bg-amber-400',
    badge: 'border-amber-400/60 bg-amber-900/30 text-amber-300',
    leftBorder: 'border-l-amber-400/60',
    hoverBorder: 'hover:border-amber-400/60',
  },
};

export function PhaseStatusBadge({ status }: { status: PhaseStatus }) {
  const tone = phaseStatusTone[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.6875rem] font-semibold ${tone.badge}`}
    >
      <span className={`size-2 rounded-full ${tone.dot}`} />
      {tone.label}
    </span>
  );
}
