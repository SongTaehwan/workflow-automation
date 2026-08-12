import type { WorkflowStage } from './types';

const phase1: WorkflowStage = {
  slug: 'phase-1',
  title: 'Phase 1 — Manager–Developer 단일 Task Workflow',
  summary: '작성 위임',
  status: '현재 단계',
  detailLabel: '위임',
  headline:
    '사용자 요청 하나를 같은 Slack Thread 안에서 단일 Task Contract 와 단일 Pull Request 로 처리하는 운영 Workflow.',
  paths: [
    {
      kind: 'normal',
      title: '정상 처리 경로',
      description: '요청 접수부터 사용자의 Merge 판단까지의 기본 방향.',
      steps: [
        {
          role: 'user',
          title: '사용자',
          detail: '같은 Slack Thread 에 요구사항을 올린다.',
        },
        {
          role: 'thread',
          title: '같은 Slack Thread',
          detail: '요청·질문·보고가 모두 이 Thread 하나에서 오간다.',
        },
        {
          role: 'manager',
          title: 'workflow-manager',
          detail:
            '원문 요청 보존, Intake Gate, Task Contract·테스트·PR 정책 확정. READY 에서 한 번만 위임한다.',
        },
        {
          role: 'developer',
          title: 'workflow-developer',
          detail:
            'precondition 확인, 격리 worktree 와 branch 준비, 단일 실행 감독.',
        },
        {
          role: 'agent',
          title: 'Coding Agent CLI',
          detail:
            '허용 범위 안에서 구현·검증·commit·push·PR 생성을 수행한다. 자동 merge 는 하지 않는다.',
        },
        {
          role: 'artifact',
          title: 'GitHub PR',
          detail:
            'repository·base·head 와 검증 근거가 담긴 단일 Pull Request 가 만들어진다.',
        },
        {
          role: 'developer',
          title: 'workflow-developer 검증 결과',
          detail:
            '구현 내용과 직접 실행한 검증 근거를 구조화한 Result Contract 로 반환한다.',
        },
        {
          role: 'manager',
          title: 'workflow-manager 독립 검증',
          detail:
            'Contract 와 GitHub PR artifact 만 독립 검증한다. semantic code review 는 하지 않는다.',
        },
        {
          role: 'thread',
          title: '같은 Slack Thread — PR/Merge 요청',
          detail:
            'PR 링크·변경 요약·실행한 테스트·남은 blocker 를 같은 Thread 에 보고한다.',
        },
        {
          role: 'user',
          title: '사용자 — GitHub 검토 및 Merge 판단',
          detail: '최종 검토와 Merge 여부는 사용자가 GitHub 에서 직접 정한다.',
        },
      ],
      notes: [
        '완료 시점은 PR 을 만들고 사용자에게 검토·Merge 를 요청한 순간이다.',
      ],
    },
    {
      kind: 'clarification',
      title: '명확화 loop',
      description:
        'workflow-manager 가 같은 Slack Thread 안에서만 도는 확인 경로.',
      steps: [
        {
          role: 'manager',
          title: 'workflow-manager',
          detail: 'Intake Gate 에서 미결정 구현 사항을 찾는다.',
        },
        {
          role: 'thread',
          title: '같은 Slack Thread — 명확화 질문',
          detail: '미결정 사항만 질문으로 올린다.',
        },
        {
          role: 'user',
          title: '사용자 응답',
          detail: '필요한 결정을 같은 Thread 에 답한다.',
        },
        {
          role: 'manager',
          title: 'workflow-manager Intake Gate 재확인',
          detail: '남은 미결정 사항이 없어야 Contract 가 READY 가 된다.',
        },
      ],
      notes: [
        '미결정 구현 사항이 남아 있으면 workflow-developer 를 호출하지 않고 같은 Thread 에 머문다.',
        '모호한 항목을 추측으로 채워 Contract 를 확정하지 않는다.',
      ],
    },
    {
      kind: 'blocked',
      title: 'blocked / failed 경로',
      description: '차단·실패는 증적과 함께 같은 Slack Thread 로 올린다.',
      steps: [
        {
          role: 'developer',
          title: 'workflow-developer 또는 Coding Agent CLI 의 blocked/failed',
          detail: '어느 단계에서 멈췄는지 구분해 기록한다.',
        },
        {
          role: 'artifact',
          title: '증적 보존',
          detail:
            'branch·commit·PR·실행 기록과 구체적인 blocker 를 지우지 않고 남긴다.',
        },
        {
          role: 'manager',
          title: 'workflow-manager 투명 보고',
          detail:
            '실패 단계·원인·남은 증적·필요한 결정을 같은 Slack Thread 에 그대로 보고한다.',
        },
        {
          role: 'user',
          title: '사용자 결정 대기',
          detail: '다음 행동은 사용자의 결정을 받은 뒤에만 진행한다.',
        },
      ],
      notes: [
        '자동 재시도는 하지 않는다.',
        'terminal failure 나 timeout 에서도 partial artifact 를 보존하고 보고한다.',
      ],
    },
  ],
  sections: [
    {
      title: '단일 실행 경계',
      description: 'Phase 1 은 요청 하나에 아래 단위를 각각 하나만 허용한다.',
      items: [
        '단일 Task Contract',
        '단일 Developer Run',
        '단일 격리 Worktree 및 Branch',
        '단일 Coding Agent CLI 실행',
        '단일 Pull Request',
        '위험하거나 단일 PR 범위를 넘는 요청은 자동 분해하지 않고 사용자 결정으로 올린다.',
        '자동 merge, 자동 승인, 자동 PR review/fix loop 는 하지 않는다.',
        '리뷰 수정은 사용자의 명시적 결정에 따른 새 요청 또는 별도 승인 후속 Workflow 로 처리한다.',
      ],
    },
    {
      title: '실패 단계 구분',
      description: '차단·실패 보고는 아래 네 단계 중 어디인지 밝힌다.',
      items: [
        'implementation — 허용 범위 구현 중 중단',
        'test — 요구된 테스트 실패 또는 미실행',
        'push — branch push 실패',
        'pr — Pull Request 생성 실패',
      ],
    },
    {
      title: 'workflow-manager 책임',
      description: '요청 접수와 결과 검증을 맡되 저장소는 건드리지 않는다.',
      items: [
        '원래 요청 원문 보존',
        'Intake Gate 로 미결정 사항 해소',
        'Task Contract·테스트·PR 정책 확정',
        'READY 상태에서 한 번만 위임',
        'Developer 결과의 독립 Git·PR·테스트 검증',
        '같은 Slack Thread 로 결과 보고',
        '코드 수정·commit·push·PR 생성·merge·승인·semantic code review 는 하지 않는다.',
      ],
    },
    {
      title: 'workflow-developer 책임',
      description: '격리된 실행 환경에서 단일 Run 을 감독한다.',
      items: [
        'precondition 확인',
        '격리 worktree 와 branch 준비',
        'Coding Agent CLI 단일 실행 감독',
        '구조화된 Result Contract 반환',
        '구현과 직접 검증 근거에 기반한 PR 작성',
        '테스트가 실패하면 push 나 PR 을 만들지 않는다.',
      ],
    },
    {
      title: 'Coding Agent CLI 책임',
      description: '허용 범위 안에서 실제 변경을 만든다.',
      items: [
        '허용 경로 범위 구현',
        '요구된 검증 실행',
        'commit·push 및 GitHub PR 생성',
        '자동 merge 는 하지 않는다.',
      ],
    },
  ],
  evidenceChain: [
    {
      step: 'Task Contract',
      file: '00-task-contract.yaml',
      owner: 'workflow-manager',
      detail: '원문 요청·범위·수용 기준·테스트·PR 정책을 고정한다.',
    },
    {
      step: 'Manager → Developer handoff',
      file: '01-manager-to-developer.md',
      owner: 'workflow-manager',
      detail: 'READY 상태에서 한 번 넘기는 위임 지시.',
    },
    {
      step: 'Developer Result Contract',
      file: '03-developer-result.yaml',
      owner: 'workflow-developer',
      detail:
        'status·branch·실행한 테스트·PR URL·blocker 를 구조화해 돌려준다.',
    },
    {
      step: 'Manager verification',
      file: '04-manager-verification.md',
      owner: 'workflow-manager',
      detail: 'repository·base·head·테스트 증거를 독립 확인한 기록.',
    },
  ],
  evidenceNote:
    '이 네 기록은 handoff directory 의 감사 기록일 뿐, 코드 저장소 검증이나 GitHub PR 검증을 대체하지 않는다.',
};

/** 로컬 정적 stage catalog. Phase 2 이상은 항목을 추가해 확장한다. */
export const workflowStages: readonly WorkflowStage[] = [phase1];

export function findWorkflowStage(slug: string): WorkflowStage | undefined {
  return workflowStages.find((stage) => stage.slug === slug);
}

export function toWorkflowStagePath(slug: string): string {
  return `/workflows/${slug}`;
}
