import type { WorkflowDetail } from './types';

/** Phase 1 상세 화면이 그리는 정적 데이터. 런타임 외부 의존 없이 여기서만 온다. */
export const phase1Detail: WorkflowDetail = {
  tracks: [
    {
      title: '정상 흐름',
      description:
        '요청 하나가 PR 하나로 끝나는 기본 경로. 모든 대화는 최초 요청이 올라온 같은 Slack Thread 에서 이어진다.',
      tone: 'normal',
      steps: [
        {
          actor: 'user',
          title: '사용자 요청',
          details: ['요구사항 전달', '@mention 으로 Thread 시작'],
        },
        {
          actor: 'slack',
          title: '같은 Slack Thread',
          details: ['Root Message 고정', '질문·보고·결과를 한 Thread 에 유지'],
        },
        {
          actor: 'manager',
          title: 'workflow-manager',
          details: [
            'Intake Gate 판정',
            '범위·수용 기준 확정',
            'Task Contract 작성',
          ],
        },
        {
          actor: 'developer',
          title: 'workflow-developer',
          details: [
            'Contract 사전 검증',
            '격리 worktree · branch 생성',
            'Run 감시와 결과 검증',
          ],
        },
        {
          actor: 'agent',
          title: 'Coding Agent CLI',
          details: [
            '구현 · 테스트 · 커밋',
            'push 후 PR 생성',
            '실행은 정확히 1회',
          ],
        },
        {
          actor: 'github',
          title: 'GitHub PR',
          details: ['PR 존재 · base/head 확인', '테스트 증적 첨부'],
        },
        {
          actor: 'developer',
          title: 'Developer 검증 결과',
          details: [
            'status · branch · commit',
            'PR URL · 테스트 결과 · blocker',
            '주장보다 Git/PR 실증 우선',
          ],
        },
        {
          actor: 'manager',
          title: 'Manager 독립 검증',
          details: [
            'Contract · Git · PR · 테스트 증적만 확인',
            'semantic code review 는 하지 않는다',
          ],
        },
        {
          actor: 'slack',
          title: '같은 Slack Thread 보고',
          details: ['변경 요약 · PR 링크 · 테스트 결과', 'Merge 검토 요청'],
        },
        {
          actor: 'user',
          title: '사용자의 GitHub 검토 · Merge 판단',
          details: ['PR 을 직접 검토', 'Merge 여부는 사람이 결정'],
        },
      ],
      rule: 'Phase 1 의 종료점은 PR 생성과 Merge 요청이다. Merge 와 다음 Task 실행은 자동화하지 않는다.',
    },
    {
      title: '명확화 loop — 같은 Slack Thread',
      description:
        'Intake Gate 를 통과하지 못하면 Developer 를 호출하지 않고 같은 Thread 에서 되묻는다.',
      tone: 'clarify',
      steps: [
        {
          actor: 'manager',
          title: 'Manager 질문',
          details: [
            '미결정 사항만 좁혀서 질문',
            '같은 Thread 에 그대로 남긴다',
          ],
        },
        {
          actor: 'user',
          title: '사용자 응답',
          details: ['범위 · 수용 기준 확정', '추가 제약 전달'],
        },
        {
          actor: 'manager',
          title: 'Intake Gate 재확인',
          details: [
            '통과하면 Task Contract 작성으로 복귀',
            '미결정이 남으면 다시 질문',
          ],
        },
      ],
      rule: '미결정 사항이 남아 있는 동안 Developer 를 호출하지 않는다.',
    },
    {
      title: 'blocked / failed 경로',
      description:
        '어느 단계에서 멈추든 남은 증적을 보존한 채 같은 Thread 에 투명하게 보고하고 사용자의 결정을 기다린다.',
      tone: 'blocked',
      steps: [
        {
          actor: 'developer',
          title: '실패 · 차단 감지',
          details: ['멈춘 단계 식별 (구현 · 테스트 · push · PR)', '원인 기록'],
        },
        {
          actor: 'github',
          title: '증적 보존',
          details: [
            'worktree · branch · commit 유지',
            '생성된 PR 과 blocker 보존',
          ],
        },
        {
          actor: 'slack',
          title: '같은 Thread 에 투명 보고',
          details: [
            '단계 · 원인 · branch/commit/PR',
            '필요한 결정을 명시해 전달',
          ],
        },
        {
          actor: 'user',
          title: '사용자 결정 대기',
          details: ['재요청 여부는 사용자가 판단', '워크플로는 여기서 멈춘다'],
        },
      ],
      rule: '자동 재시도하지 않는다. 실패한 Run 을 워크플로가 스스로 다시 돌리지 않는다.',
    },
  ],
  boundaries: [
    {
      label: 'Task Contract',
      count: '1',
      description: '승인된 Contract 하나가 이번 Run 의 유일한 근거다.',
    },
    {
      label: 'Developer Run',
      count: '1',
      description: 'workflow-developer 는 Contract 당 정확히 한 번 실행한다.',
    },
    {
      label: 'Worktree · Branch',
      count: '1',
      description:
        '격리 worktree 와 전용 branch 한 쌍. base worktree 는 건드리지 않는다.',
    },
    {
      label: 'Coding Agent CLI 실행',
      count: '1',
      description:
        'CLI 호출도 한 번뿐이며, 벤더는 Contract 와 저장소 문서를 따른다.',
    },
    {
      label: 'Pull Request',
      count: '1',
      description: '한 Run 의 결과는 main 을 향한 PR 하나로만 나온다.',
    },
  ],
  roles: [
    {
      actor: 'manager',
      name: 'workflow-manager',
      responsibilities: [
        'Intake Gate 로 요청의 명확성과 범위를 판정한다',
        'Task Contract 를 작성하고 승인 상태를 관리한다',
        'Contract · Git · PR · 테스트 증적만 독립 검증한다',
        '고위험이거나 단일 PR 범위를 넘는 요청은 사용자 결정으로 올린다',
      ],
    },
    {
      actor: 'developer',
      name: 'workflow-developer',
      responsibilities: [
        'Contract 를 사전 점검하고 실행 가능성을 확인한다',
        '격리 worktree 와 branch 를 만들어 base 를 보호한다',
        'Coding Agent 실행을 감시하고 결과를 검증한다',
        'Developer Result Contract 로 증적을 보고한다',
      ],
    },
    {
      actor: 'agent',
      name: 'Coding Agent CLI',
      responsibilities: [
        'Contract 의 허용 경로 안에서만 구현한다',
        '지정된 테스트 명령을 그대로 실행한다',
        '커밋 · push 후 PR 을 생성한다',
        'PR 승인과 merge 는 수행하지 않는다',
      ],
    },
  ],
  auditTrail: [
    {
      stage: 'Task Contract',
      file: '00-task-contract.yaml',
      description: '원문 요청 · 범위 · 수용 기준 · 허용 경로 · 테스트 명령',
    },
    {
      stage: 'Manager → Developer handoff',
      file: '01-manager-to-developer.md',
      description: '승인된 Contract 를 근거로 한 실행 지시와 제약',
    },
    {
      stage: 'Developer Result Contract',
      file: '03-developer-result.yaml',
      description: 'status · branch · commit · 테스트 결과 · PR · blocker',
    },
    {
      stage: 'Manager verification',
      file: '04-manager-verification.md',
      description: '보고된 증적을 Git · PR 실제 상태와 대조한 기록',
    },
  ],
  principles: [
    {
      title: '자동 재시도 금지',
      description:
        '실패하면 증적을 남기고 멈춘다. Retry · Crash Recovery 는 Phase 1 범위 밖이다.',
    },
    {
      title: '자동 Merge · PR 승인 금지',
      description:
        '워크플로는 PR 생성까지만 한다. 승인과 Merge 는 사용자만 수행한다.',
    },
    {
      title: '고위험 · 다중 PR 요청은 escalate',
      description:
        '단일 PR 범위를 넘는 요청을 자동으로 쪼개지 않는다. 분해 여부를 사용자 결정으로 올린다.',
    },
    {
      title: '최종 판단은 사용자',
      description:
        'PR 생성 후 사용자가 GitHub 에서 검토하고 Merge 여부를 직접 결정한다.',
    },
  ],
};
