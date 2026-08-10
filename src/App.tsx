import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  GitPullRequest,
  ShieldCheck,
  Workflow,
} from "lucide-react"

import type { FlowStep, WorkflowStage } from "@/data/workflows"
import { workflowStages } from "@/data/workflows"

function CatalogScreen() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_42%),radial-gradient(circle_at_top_right,rgba(52,211,153,0.1),transparent_40%)]" />
      <div className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 py-10 sm:px-8 sm:py-16 lg:px-12">
        <header className="max-w-3xl border-b border-slate-800 pb-10">
          <div className="mb-5 flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">
            <Workflow aria-hidden="true" className="size-4" />
            Workflow explorer
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            개발 Workflow
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            단계별 실행 흐름과 운영 경계를 확인합니다. 현재 검증된 단계부터
            하나씩 공개됩니다.
          </p>
        </header>

        <section
          aria-labelledby="workflow-list-title"
          className="flex-1 py-10 sm:py-14"
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-slate-500">STAGE CATALOG</p>
              <h2
                id="workflow-list-title"
                className="mt-2 text-lg font-semibold text-white"
              >
                Workflow 단계
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-500">
              {workflowStages.length} stage
            </span>
          </div>

          <div className="grid gap-4">
            {workflowStages.map((stage) => (
              <a
                key={stage.id}
                href={stage.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/10 transition hover:border-cyan-400/50 hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none sm:p-7"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 to-emerald-400 opacity-70" />
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-semibold tracking-[0.16em] text-cyan-300">
                        {stage.phase}
                      </span>
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                        <span aria-hidden="true" className="mr-1.5">
                          ●
                        </span>
                        {stage.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                      {stage.name}
                    </h3>
                    <p className="mt-2 font-mono text-xs leading-6 text-slate-400 sm:text-sm">
                      {stage.summary}
                    </p>
                  </div>
                  <span className="flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl border border-slate-700 px-4 text-sm font-medium text-slate-200 transition group-hover:border-cyan-400/40 group-hover:text-cyan-200 sm:self-auto">
                    흐름 보기
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-900 pt-5 font-mono text-xs text-slate-600">
          로컬 정적 catalog · Phase 1
        </footer>
      </div>
    </main>
  )
}

function FlowNode({ step, index }: { step: FlowStep; index: number }) {
  return (
    <li
      className="flow-node"
      data-connector={step.connector}
      data-tone={step.tone}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="flow-step-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flow-role-dot" aria-hidden="true" />
      </div>
      <p className="font-mono text-[0.65rem] font-semibold tracking-wide text-slate-400">
        {step.actor}
      </p>
      <h3 className="mt-1.5 text-sm leading-5 font-semibold text-slate-100">
        {step.title}
      </h3>
      <ul className="mt-3 space-y-1.5 text-xs leading-5 text-slate-400">
        {step.details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
    </li>
  )
}

function DetailScreen({ stage }: { stage: WorkflowStage }) {
  return (
    <main className="min-h-svh bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-[92rem] px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <a
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-400 transition hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Workflow 목록
        </a>

        <header className="mt-6 flex flex-col gap-6 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.16em] text-emerald-300">
              <span aria-hidden="true">●</span>
              {stage.phase} · {stage.status}
            </div>
            <h1 className="max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              {stage.name}
            </h1>
            <p className="mt-3 font-mono text-xs leading-6 text-slate-400 sm:text-sm">
              {stage.summary}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200 lg:self-auto">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Human Merge only
          </div>
        </header>

        <section aria-labelledby="flow-title" className="mt-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs text-slate-500">
                STATIC WORKFLOW MAP
              </p>
              <h2
                id="flow-title"
                className="mt-2 text-xl font-semibold text-white"
              >
                Phase 1 실행 흐름
              </h2>
            </div>
            <div
              aria-label="연결선 범례"
              className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.68rem] text-slate-400"
            >
              <span className="flex items-center gap-2">
                <i className="h-0.5 w-6 bg-cyan-400" />
                정상 경로
              </span>
              <span className="flex items-center gap-2">
                <i className="h-0.5 w-6 bg-emerald-400" />
                개발 handoff
              </span>
              <span className="flex items-center gap-2">
                <i className="h-0.5 w-6 border-t border-dashed border-orange-400" />
                명확화
              </span>
              <span className="flex items-center gap-2">
                <i className="h-0.5 w-6 border-t border-dashed border-rose-400" />
                실패 / 차단
              </span>
            </div>
          </div>

          <div className="flow-canvas rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-5 lg:p-7">
            <div className="phase-boundary rounded-xl border border-dashed border-amber-400/60 p-4 sm:p-6">
              <div className="mb-7 flex flex-col gap-4 border-b border-amber-300/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <p className="font-mono text-xs font-semibold tracking-[0.12em] text-amber-300">
                  PHASE 1 BOUNDARY
                </p>
                <ul
                  className="flex flex-wrap gap-2"
                  aria-label="Phase 1 허용 범위"
                >
                  {stage.boundary.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[0.68rem] font-medium text-amber-100"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="overflow-x-auto pb-2">
                <ol className="flow-grid" aria-label="Phase 1 정상 실행 순서">
                  {stage.steps.map((step, index) => (
                    <FlowNode
                      key={`${step.actor}-${step.title}`}
                      step={step}
                      index={index}
                    />
                  ))}
                </ol>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <aside
                  className="rounded-xl border border-dashed border-orange-400/50 bg-orange-400/5 p-4 sm:p-5"
                  aria-labelledby="clarification-title"
                >
                  <div className="flex items-center gap-2 text-orange-300">
                    <ArrowRight aria-hidden="true" className="size-4" />
                    <h3
                      id="clarification-title"
                      className="text-sm font-semibold"
                    >
                      명확화 loop · 같은 Slack Thread
                    </h3>
                  </div>
                  <ol className="mt-4 flex flex-col gap-2 font-mono text-xs text-orange-100/80 sm:flex-row sm:items-center">
                    <li>Manager 질문</li>
                    <li aria-hidden="true">→</li>
                    <li>사용자 응답</li>
                    <li aria-hidden="true">→</li>
                    <li>Intake Gate 재검토</li>
                  </ol>
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    미결정 사항만 사용자에게 되돌리고, 범위가 명확해질 때까지
                    Developer를 호출하지 않습니다.
                  </p>
                </aside>

                <aside
                  className="rounded-xl border border-dashed border-rose-400/50 bg-rose-400/5 p-4 sm:p-5"
                  aria-labelledby="failure-title"
                >
                  <div className="flex items-center gap-2 text-rose-300">
                    <AlertTriangle aria-hidden="true" className="size-4" />
                    <h3 id="failure-title" className="text-sm font-semibold">
                      blocked / failed 보고 경로
                    </h3>
                  </div>
                  <ol className="mt-4 flex flex-col gap-2 font-mono text-xs text-rose-100/80 sm:flex-row sm:items-center">
                    <li>Developer / Codex</li>
                    <li aria-hidden="true">→</li>
                    <li>Manager 검증</li>
                    <li aria-hidden="true">→</li>
                    <li>같은 Slack Thread</li>
                  </ol>
                  <p className="mt-3 text-xs leading-5 text-slate-400">
                    실패 단계·원인·branch/commit/PR 상태와 필요한 사용자 결정을
                    숨김없이 보고합니다.
                  </p>
                </aside>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm leading-6 text-amber-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <GitPullRequest
                    aria-hidden="true"
                    className="size-4 shrink-0"
                  />
                  종료점: PR 생성 및 같은 Thread의 Merge 요청
                </div>
                <p className="text-xs text-amber-200/70">
                  자동 Merge 금지 · 사용자가 GitHub에서 최종 판단
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="principles-title" className="py-10 sm:py-12">
          <p className="font-mono text-xs text-slate-500">
            OPERATING PRINCIPLES
          </p>
          <h2
            id="principles-title"
            className="mt-2 text-xl font-semibold text-white"
          >
            운영 원칙
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {stage.principles.map((principle, index) => (
              <article
                key={principle.title}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <span className="font-mono text-[0.65rem] text-slate-600">
                  0{index + 1}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-slate-100">
                  {principle.title}
                </h3>
                <ul className="mt-4 space-y-2 text-xs leading-5 text-slate-400">
                  {principle.items.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export function App() {
  const stage = workflowStages.find(
    ({ href }) => href === window.location.pathname
  )

  return stage ? <DetailScreen stage={stage} /> : <CatalogScreen />
}

export default App
