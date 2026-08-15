import { PhaseStatus, type Phase } from './types';

// ponytail: 정적 목업. 서버 연동이 생기면 entities/phase/api/ 로 옮긴다.
export const phases: Phase[] = [
  {
    id: 'phase-0',
    code: 'PHASE 0',
    title: '실행 기반 · Baseline Gate',
    summary:
      '역할별 실행 환경과 대상 저장소의 typecheck · lint · build baseline 을 확정한다.',
    status: PhaseStatus.COMPLETED,
    boundary: 'PHASE 0 BOUNDARY — 단일 저장소 · 실행 환경 구성만',
    updatedAt: '2026-08-08',
    steps: [
      {
        id: 'repo-baseline',
        name: '저장소 baseline',
        role: 'Maintainer',
        detail: 'typecheck · lint · build 통과 확인',
        status: PhaseStatus.COMPLETED,
      },
      {
        id: 'role-runtime',
        name: '역할별 런타임',
        role: 'Maintainer',
        detail: 'Manager · Developer 프로파일 분리',
        status: PhaseStatus.COMPLETED,
      },
      {
        id: 'worktree-path',
        name: '격리 Worktree 경로',
        role: 'Developer',
        detail: '원본 working tree 를 건드리지 않는 실행 경로',
        status: PhaseStatus.COMPLETED,
      },
    ],
    invariants: [
      '원본 working tree 는 어떤 단계에서도 수정하지 않는다',
      '베이스라인 검사에 실패한 저장소는 워크플로우 대상이 아니다',
      '역할별 실행 정책은 프로파일 파일 하나로만 정의한다',
    ],
    nextChecks: [
      '다음 Phase 의 Contract 생성 경로가 이 baseline 을 재사용하는지',
    ],
  },
  {
    id: 'phase-1',
    code: 'PHASE 1',
    title: 'Manager–Developer 단일 Task Workflow',
    summary:
      '요청 채널 진입 · 역할 분리 · 운영 계약 · baseline gate 완료. 첫 실제 Contract → PR 실행은 아직 미검증.',
    status: PhaseStatus.RUNNING,
    boundary:
      'PHASE 1 BOUNDARY — 단일 Task · 단일 Developer Run · 단일 Worktree/Branch · 단일 PR',
    updatedAt: '2026-08-10',
    steps: [
      {
        id: 'request-thread',
        name: '요청 대화 Thread',
        role: '사용자',
        detail: '메시지 채널 진입점 · 동일 Thread 상태 대화',
        status: PhaseStatus.COMPLETED,
      },
      {
        id: 'manager-intake',
        name: 'Manager Intake',
        role: 'Manager',
        detail: '명확화 · 범위 판정 · Task Contract 작성',
        status: PhaseStatus.COMPLETED,
      },
      {
        id: 'developer-run',
        name: 'Developer Run',
        role: 'Developer',
        detail: 'Contract 검증 · 격리 Worktree · 운영 검증',
        status: PhaseStatus.COMPLETED,
      },
      {
        id: 'coding-agent',
        name: '코딩 에이전트',
        role: 'Agent',
        detail: '구현 · Test · Commit · Push · PR 생성',
        status: PhaseStatus.RUNNING,
      },
      {
        id: 'github-pr',
        name: 'GitHub PR',
        role: '사용자',
        detail: 'base/head · repository 확인 후 사용자가 최종 Merge 판단',
        status: PhaseStatus.PENDING,
      },
      {
        id: 'result-report',
        name: '결과 보고',
        role: 'Manager',
        detail: '같은 Thread 로 PR · 변경 요약 · Test · Blocker 보고',
        status: PhaseStatus.PENDING,
      },
    ],
    invariants: [
      'Manager 는 열린 질문이 있으면 Developer 를 호출하지 않는다',
      'Developer 는 정해진 실행 시간 안에서 구현 도구를 한 번만 실행한다',
      '테스트 실패 · 미실행이면 PR 을 생성하지 않는다',
      '원본 working tree 가 아닌 격리 Worktree 를 사용한다',
      '자동 retry · 자동 merge 는 없다',
    ],
    nextChecks: [
      '요청 채널 요구사항 → Manager Intake / Contract 생성',
      'Manager → Developer handoff 와 Result Contract',
      '코드 구현 · 테스트 · commit · push · 실제 PR',
      'PR 의 repository/base/head/test 증거 확인',
      '동일 요청 Thread 의 완료 또는 차단 보고',
    ],
  },
  {
    id: 'phase-2',
    code: 'PHASE 2',
    title: '다중 Task 병렬 실행',
    summary:
      '하나의 요청을 여러 Task 로 쪼개 병렬 Worktree 에서 실행하고 결과를 하나의 보고로 합친다.',
    status: PhaseStatus.PENDING,
    boundary: 'PHASE 2 BOUNDARY — 다중 Task · 다중 Worktree · Task 당 단일 PR',
    updatedAt: '2026-08-12',
    steps: [
      {
        id: 'task-split',
        name: 'Task 분할',
        role: 'Manager',
        detail: '요청을 독립 실행 가능한 Task 로 분해',
        status: PhaseStatus.PENDING,
      },
      {
        id: 'parallel-run',
        name: '병렬 Developer Run',
        role: 'Developer',
        detail: 'Task 마다 별도 Worktree · Branch',
        status: PhaseStatus.PENDING,
      },
      {
        id: 'merge-report',
        name: '통합 보고',
        role: 'Manager',
        detail: 'Task 별 Result Contract 를 하나의 Thread 보고로 병합',
        status: PhaseStatus.PENDING,
      },
    ],
    invariants: [
      'Task 사이에 공유 Worktree 를 두지 않는다',
      '한 Task 의 실패가 다른 Task 의 PR 을 차단하지 않는다',
    ],
    nextChecks: [
      'Task 분할 기준의 판별식 정의',
      '병렬 실행 시 요청 Thread 의 보고 순서',
    ],
  },
];

export function findPhaseById(phaseId: string): Phase | undefined {
  return phases.find((phase) => phase.id === phaseId);
}
