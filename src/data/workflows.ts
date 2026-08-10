export type FlowTone =
  "user" | "slack" | "manager" | "developer" | "codex" | "github"

export interface FlowStep {
  actor: string
  title: string
  details: string[]
  tone: FlowTone
  connector: "normal" | "handoff" | "review"
}

export interface WorkflowStage {
  id: string
  href: string
  phase: string
  name: string
  summary: string
  status: string
  boundary: string[]
  steps: FlowStep[]
  principles: Array<{
    title: string
    items: string[]
  }>
}

export const workflowStages: WorkflowStage[] = [
  {
    id: "phase-1",
    href: "/workflows/phase-1",
    phase: "PHASE 1",
    name: "Phase 1 — Manager–Developer 단일 Task MVP",
    summary:
      "한 요청 · 한 Developer Run · 한 Worktree/Branch · 한 PR · Human Merge",
    status: "현재 단계",
    boundary: [
      "단일 Task",
      "단일 Developer Run",
      "단일 Worktree/Branch",
      "단일 PR",
    ],
    steps: [
      {
        actor: "사용자",
        title: "요구사항 전달",
        details: ["질문 응답", "최종 Merge 판단"],
        tone: "user",
        connector: "normal",
      },
      {
        actor: "Slack Thread",
        title: "Root Message",
        details: ["@mention으로 시작", "질문·결과 대화 유지"],
        tone: "slack",
        connector: "normal",
      },
      {
        actor: "workflow-manager",
        title: "Intake Gate",
        details: ["명확화·범위 판정", "Task Contract 작성"],
        tone: "manager",
        connector: "handoff",
      },
      {
        actor: "workflow-developer",
        title: "격리·실행 관리",
        details: ["Contract 검증", "Worktree·Process 감시"],
        tone: "developer",
        connector: "handoff",
      },
      {
        actor: "Codex CLI",
        title: "단일 Run",
        details: ["구현·Test·Commit", "Push·PR 생성"],
        tone: "codex",
        connector: "handoff",
      },
      {
        actor: "GitHub PR",
        title: "검토 가능한 결과",
        details: ["base·head·test evidence", "자동 Merge 금지"],
        tone: "github",
        connector: "normal",
      },
      {
        actor: "workflow-developer",
        title: "검증 결과",
        details: ["status·branch·tests", "PR URL·blocker"],
        tone: "developer",
        connector: "review",
      },
      {
        actor: "Manager 검증",
        title: "증거 확인",
        details: ["PR·repo·branch", "보고된 Test 결과"],
        tone: "manager",
        connector: "review",
      },
      {
        actor: "같은 Slack Thread",
        title: "PR / Merge 요청",
        details: ["변경 요약·Test", "Merge 요청 또는 Blocker"],
        tone: "slack",
        connector: "normal",
      },
      {
        actor: "사용자",
        title: "GitHub 검토 및 Merge 판단",
        details: ["직접 변경 검토", "직접 Merge 여부 결정"],
        tone: "user",
        connector: "review",
      },
    ],
    principles: [
      {
        title: "Manager의 Intake Gate",
        items: [
          "요구사항이 모호하면 Developer를 호출하지 않는다.",
          "원문·범위·수용 기준·미결정 사항을 Contract에 남긴다.",
          "단일 PR 범위를 넘거나 고위험이면 사용자 결정으로 올린다.",
        ],
      },
      {
        title: "Developer / Codex 책임 경계",
        items: [
          "Developer는 사전 점검·격리·감시·결과 검증을 소유한다.",
          "Codex는 한 번만 실행하며 구현·테스트·PR 생성을 수행한다.",
          "성공 주장보다 Git·Test·실제 PR 상태를 우선한다.",
        ],
      },
      {
        title: "Phase 1에서 자동화하지 않음",
        items: [
          "자동 Retry와 Crash Recovery",
          "다중 Task 분해와 다음 Task 실행",
          "자동 Merge — 최종 판단은 사용자에게 있다.",
        ],
      },
    ],
  },
]
