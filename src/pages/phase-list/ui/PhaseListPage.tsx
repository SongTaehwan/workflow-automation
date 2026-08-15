import { Link } from 'react-router-dom';

import {
  PhaseStatus,
  PhaseStatusBadge,
  listedPhases,
  phaseStatusTone,
} from '@/entities/phase';
import { GridBackdrop } from '@/shared/ui/grid-backdrop';

const legendOrder = [
  PhaseStatus.COMPLETED,
  PhaseStatus.RUNNING,
  PhaseStatus.PENDING,
];

export default function PhaseListPage() {
  return (
    <GridBackdrop>
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-4">
          <span className="size-3 animate-pulse rounded-full bg-emerald-400" />
          <h1 className="text-2xl tracking-tight">Workflow Phase</h1>
        </div>
        <p className="ml-7 text-sm leading-relaxed text-slate-400">
          Manager–Developer 워크플로우의 단계별 구현 상태 · 정적 목업 데이터
        </p>
      </header>

      <ul className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-4">
        {listedPhases.map((phase) => {
          const tone = phaseStatusTone[phase.status];

          return (
            <li key={phase.id}>
              <Link
                to={`/phases/${phase.id}`}
                className={`block h-full rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:bg-slate-900 ${tone.hoverBorder}`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`size-2 rounded-full ${tone.dot}`} />
                  <span className="text-[0.6875rem] font-bold tracking-widest text-slate-400">
                    {phase.code}
                  </span>
                </div>
                <h2 className="mb-2 text-sm font-semibold">{phase.title}</h2>
                <p className="mb-4 text-xs leading-relaxed text-slate-400">
                  {phase.summary}
                </p>
                <div className="mb-4 flex flex-wrap gap-2 text-[0.6875rem] text-slate-500">
                  <span>STEP {phase.steps.length}</span>
                  <span>·</span>
                  <span>불변 조건 {phase.invariants.length}</span>
                  <span>·</span>
                  <span>{phase.updatedAt}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <PhaseStatusBadge status={phase.status} />
                  <span className="text-xs text-cyan-400">상세 보기 →</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.6875rem] text-slate-500">
        {legendOrder.map((status) => (
          <span key={status} className="flex items-center gap-2">
            <span
              className={`size-2.5 rounded-sm ${phaseStatusTone[status].dot}`}
            />
            {phaseStatusTone[status].label}
          </span>
        ))}
      </footer>
    </GridBackdrop>
  );
}
