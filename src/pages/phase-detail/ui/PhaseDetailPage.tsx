import { Link, useParams } from 'react-router-dom';

import {
  PhaseStatus,
  PhaseStatusBadge,
  findPhaseById,
  phaseStatusTone,
} from '@/entities/phase';
import { GridBackdrop } from '@/shared/ui/grid-backdrop';

function BackLink() {
  return (
    <Link
      to="/phases"
      className="text-xs text-slate-400 transition-colors hover:text-cyan-400"
    >
      ← Phase 목록
    </Link>
  );
}

export default function PhaseDetailPage() {
  const { phaseId } = useParams();
  const phase = phaseId ? findPhaseById(phaseId) : undefined;

  if (!phase) {
    return (
      <GridBackdrop>
        <BackLink />
        <div className="mt-6 rounded-xl border border-rose-400/60 bg-rose-950/40 p-6">
          <h1 className="mb-2 text-sm font-semibold text-rose-200">
            Phase 를 찾을 수 없습니다
          </h1>
          <p className="text-xs text-rose-300/80">
            요청한 id: {phaseId ?? '(없음)'}
          </p>
        </div>
      </GridBackdrop>
    );
  }

  return (
    <GridBackdrop>
      <BackLink />

      <header className="mt-4 mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-4">
          {phase.status === PhaseStatus.RUNNING && (
            <span className="size-3 animate-pulse rounded-full bg-emerald-400" />
          )}
          <h1 className="text-2xl tracking-tight">
            <span className="text-slate-500">{phase.code} — </span>
            {phase.title}
          </h1>
          <PhaseStatusBadge status={phase.status} />
        </div>
        <p className="text-sm leading-relaxed text-slate-400">
          {phase.summary}
        </p>
      </header>

      <p className="mb-6 rounded-lg border border-dashed border-amber-400/70 bg-amber-400/[0.035] px-4 py-3 text-[0.6875rem] font-bold text-amber-400">
        {phase.boundary}
      </p>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-sm font-semibold">실행 경로</h2>
        <ol className="flex flex-col gap-3">
          {phase.steps.map((step, index) => {
            const tone = phaseStatusTone[step.status];

            return (
              <li
                key={step.id}
                className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-l-2 border-slate-800 bg-slate-950/60 px-4 py-3 ${tone.leftBorder}`}
              >
                <span className="text-[0.6875rem] text-slate-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={`size-2 rounded-full ${tone.dot}`} />
                <span className="text-xs font-semibold">{step.name}</span>
                <span className="rounded border border-slate-700 px-2 py-0.5 text-[0.625rem] text-slate-400">
                  {step.role}
                </span>
                <span className="text-[0.6875rem] text-slate-400">
                  {step.detail}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-4">
        <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-400" />
            <h2 className="text-sm font-semibold">운영 불변 조건</h2>
          </div>
          <ul className="text-xs leading-relaxed text-slate-400">
            {phase.invariants.map((invariant) => (
              <li key={invariant} className="mb-1.5">
                • {invariant}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400" />
            <h2 className="text-sm font-semibold">다음 검증 범위</h2>
          </div>
          <ul className="text-xs leading-relaxed text-slate-400">
            {phase.nextChecks.map((check) => (
              <li key={check} className="mb-1.5">
                • {check}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <footer className="mt-6 text-center text-[0.6875rem] text-slate-600">
        {phase.code} implementation status · {phase.updatedAt} · 정적 목업
        데이터
      </footer>
    </GridBackdrop>
  );
}
