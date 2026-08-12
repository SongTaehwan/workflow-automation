import { ArrowLeft, Ban, FileText, GitBranch, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  PHASE_1_DETAIL_PATH,
  phase1Detail,
  workflowCatalog,
} from '@/entities/workflow';

import { ActorTag } from '../_components/ActorTag';
import { FlowTrackSection } from '../_components/FlowTrackSection';
import { SectionCard } from '../_components/SectionCard';

const CATALOG_PATH = '/';

export default function WorkflowPhase1Page() {
  const entry = workflowCatalog.find(
    (candidate) => candidate.detailPath === PHASE_1_DETAIL_PATH
  );

  return (
    <main className="min-h-svh bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Link
          to={CATALOG_PATH}
          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Workflow 목록으로
        </Link>

        <header className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
            {entry?.status ?? '현재 단계'}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            {entry?.title ?? 'Phase 1'}
          </h1>
          <p className="text-sm text-muted-foreground">{entry?.summary}</p>
        </header>

        {phase1Detail.tracks.map((track) => (
          <FlowTrackSection key={track.title} track={track} />
        ))}

        <SectionCard
          title="단일 경계 — Phase 1 이 허용하는 수량"
          description="아래 다섯 가지는 한 요청당 정확히 하나뿐이다. 이 경계를 넘는 요청은 자동으로 쪼개지 않는다."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {phase1Detail.boundaries.map((boundary) => (
              <li
                key={boundary.label}
                className="flex flex-col gap-2 rounded-lg border border-amber-500/40 bg-background p-4"
              >
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-xl font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                    {boundary.count}
                  </span>
                  <span className="text-sm font-semibold">
                    {boundary.label}
                  </span>
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {boundary.description}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="역할과 책임"
          description="세 주체의 책임은 겹치지 않는다. Manager 는 판정과 검증, Developer 는 격리와 감시, Coding Agent 는 구현만 맡는다."
        >
          <ul className="grid gap-3 lg:grid-cols-3">
            {phase1Detail.roles.map((role) => (
              <li
                key={role.name}
                className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4"
              >
                <ActorTag actor={role.actor} />
                <span className="font-mono text-sm font-semibold">
                  {role.name}
                </span>
                <ul className="flex flex-col gap-1.5">
                  {role.responsibilities.map((responsibility) => (
                    <li
                      key={responsibility}
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      · {responsibility}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="감사 증적과 handoff 기록"
          description="Task Contract 부터 Manager 검증까지 각 단계는 파일로 남는다. 결과 주장보다 이 기록과 Git·PR 실제 상태가 우선한다."
        >
          <ol className="flex flex-col gap-3">
            {phase1Detail.auditTrail.map((record, index) => (
              <li
                key={record.file}
                className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1 rounded-lg border border-border bg-background p-4"
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      {record.stage}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      <FileText className="size-3" aria-hidden="true" />
                      {record.file}
                    </span>
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {record.description}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          title="자동화하지 않는 것"
          description="Phase 1 은 PR 생성에서 멈춘다. 그 뒤 판단은 전부 사람에게 남긴다."
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {phase1Detail.principles.map((principle) => (
              <li
                key={principle.title}
                className="flex flex-col gap-2 rounded-lg border border-dashed border-rose-500/40 bg-background p-4"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Ban
                    className="size-3.5 shrink-0 text-rose-500"
                    aria-hidden="true"
                  />
                  {principle.title}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {principle.description}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <footer className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <GitBranch
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            Developer 와 Coding Agent 는 격리 worktree 와 전용 branch 에서만
            작업하며 base worktree 를 수정하지 않는다.
          </p>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            Manager 는 semantic code review 를 하지 않고 Contract · Git · PR ·
            테스트 증적만 검증한다. 최종 Merge 판단은 사용자가 GitHub 에서 직접
            내린다.
          </p>
          <Link
            to={CATALOG_PATH}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Workflow 목록으로
          </Link>
        </footer>
      </div>
    </main>
  );
}
