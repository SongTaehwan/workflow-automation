// Phase 1 흐름도. 노드·연결선을 데이터로 두고 SVG 로 그린다.
// 좌표는 1340x650 뷰박스 기준 고정값이며, 컨테이너 너비에 맞춰 스케일된다.

type NodeTone = 'human' | 'slack' | 'agent' | 'codex' | 'github' | 'failure';

type EdgeTone = 'normal' | 'handoff' | 'clarify' | 'failure' | 'report';

type FlowNode = {
  id: string;
  tone: NodeTone;
  posX: number;
  posY: number;
  width: number;
  height: number;
  eyebrow?: string;
  title: string;
  lines?: string[];
  /** 강조 문구. 노드 본문 아래에 노란색으로 붙는다. */
  warnings?: string[];
};

type FlowEdge = {
  id: string;
  tone: EdgeTone;
  path: string;
  label?: string;
  labelX?: number;
  labelY?: number;
};

const NODE_TONE: Record<NodeTone, { stroke: string; fill: string }> = {
  human: { stroke: '#94a3b8', fill: 'rgba(30,41,59,.5)' },
  slack: { stroke: '#fb923c', fill: 'rgba(251,146,60,.18)' },
  agent: { stroke: '#34d399', fill: 'rgba(6,78,59,.4)' },
  codex: { stroke: '#22d3ee', fill: 'rgba(8,51,68,.4)' },
  github: { stroke: '#a78bfa', fill: 'rgba(76,29,149,.4)' },
  failure: { stroke: '#fb7185', fill: 'rgba(136,19,55,.4)' },
};

const EDGE_TONE: Record<EdgeTone, { stroke: string; dashed: boolean }> = {
  normal: { stroke: '#22d3ee', dashed: false },
  handoff: { stroke: '#34d399', dashed: false },
  report: { stroke: '#94a3b8', dashed: false },
  clarify: { stroke: '#fb923c', dashed: true },
  failure: { stroke: '#fb7185', dashed: true },
};

const NODES: FlowNode[] = [
  {
    id: 'user',
    tone: 'human',
    posX: 72,
    posY: 130,
    width: 166,
    height: 112,
    title: '사용자',
    lines: ['요구사항 전달', '질문 응답 · Merge 판단'],
  },
  {
    id: 'slack-thread',
    tone: 'slack',
    posX: 315,
    posY: 130,
    width: 168,
    height: 112,
    title: 'Slack Thread',
    lines: ['@mention Root Message', '질문·결과 대화 유지'],
  },
  {
    id: 'manager',
    tone: 'agent',
    posX: 552,
    posY: 116,
    width: 163,
    height: 140,
    title: 'workflow-manager',
    lines: [
      'Intake Gate',
      '명확화 · 범위 판정',
      'Task Contract 작성',
      'PR 최소 검증',
    ],
  },
  {
    id: 'developer',
    tone: 'agent',
    posX: 785,
    posY: 116,
    width: 167,
    height: 140,
    title: 'workflow-developer',
    lines: [
      'Contract 검증',
      '독립 Worktree/Branch',
      'Process 감시 · 결과 검증',
      '단일 Codex Run만 허용',
    ],
  },
  {
    id: 'codex',
    tone: 'codex',
    posX: 1022,
    posY: 130,
    width: 186,
    height: 112,
    title: 'Codex CLI',
    lines: ['구현 · Test · Commit', 'Push · GitHub PR 생성'],
  },
  {
    id: 'github-pr',
    tone: 'github',
    posX: 1015,
    posY: 355,
    width: 200,
    height: 120,
    title: 'GitHub PR',
    lines: ['PR 존재 · base/head 확인', 'test evidence · 사용자 검토'],
    warnings: ['자동 Merge 금지'],
  },
  {
    id: 'developer-result',
    tone: 'human',
    posX: 723,
    posY: 355,
    width: 170,
    height: 120,
    eyebrow: 'workflow-developer',
    title: '검증 결과',
    lines: ['status · branch · tests', 'PR URL · blocker', 'diff/PR 실증 우선'],
  },
  {
    id: 'manager-verify',
    tone: 'agent',
    posX: 491,
    posY: 355,
    width: 159,
    height: 120,
    title: 'Manager 검증',
    lines: ['PR·대상 repo·branch', '보고된 Test 결과', '완료/차단 메시지 작성'],
  },
  {
    id: 'slack-report',
    tone: 'slack',
    posX: 254,
    posY: 355,
    width: 165,
    height: 120,
    title: '같은 Slack Thread',
    lines: [
      'PR · 변경 요약 · Test',
      'Merge 요청 또는 Blocker',
      '자동 재시도 없음',
    ],
  },
  {
    id: 'user-merge',
    tone: 'human',
    posX: 300,
    posY: 527,
    width: 208,
    height: 75,
    title: '사용자: GitHub에서 검토',
    warnings: ['직접 Merge 여부 결정'],
  },
  {
    id: 'failure-report',
    tone: 'failure',
    posX: 876,
    posY: 535,
    width: 244,
    height: 67,
    title: '실패/차단 시 투명하게 보고',
    lines: ['단계 · 원인 · branch/commit/PR · 필요한 결정'],
  },
];

const EDGES: FlowEdge[] = [
  { id: 'user-to-slack', tone: 'normal', path: 'M 238 186 H 315' },
  { id: 'slack-to-manager', tone: 'normal', path: 'M 483 186 H 552' },
  { id: 'manager-to-developer', tone: 'handoff', path: 'M 715 186 H 785' },
  { id: 'developer-to-codex', tone: 'handoff', path: 'M 952 186 H 1022' },
  { id: 'codex-to-pr', tone: 'normal', path: 'M 1115 242 V 355' },
  { id: 'pr-to-result', tone: 'normal', path: 'M 1015 415 H 893' },
  { id: 'result-to-manager', tone: 'report', path: 'M 723 415 H 650' },
  { id: 'manager-to-slack', tone: 'report', path: 'M 491 415 H 419' },
  {
    id: 'slack-to-user-merge',
    tone: 'normal',
    path: 'M 254 415 H 202 V 527 H 300',
  },
  {
    id: 'clarification-loop',
    tone: 'clarify',
    path: 'M 399 242 V 286 H 178 V 242',
    label: '미결정 사항만 같은 Thread에서 질문',
    labelX: 205,
    labelY: 276,
  },
  {
    id: 'failure-route',
    tone: 'failure',
    path: 'M 846 242 V 535 H 876',
    label: 'blocked / failed',
    labelX: 858,
    labelY: 525,
  },
];

const LEGEND: { tone: EdgeTone; label: string }[] = [
  { tone: 'normal', label: '정상 경로' },
  { tone: 'handoff', label: '개발 handoff' },
  { tone: 'report', label: '결과 보고' },
  { tone: 'clarify', label: '명확화 loop' },
  { tone: 'failure', label: 'blocked / failed 경로' },
];

function FlowNodeShape({ node }: { node: FlowNode }) {
  const tone = NODE_TONE[node.tone];
  const textX = node.posX + 20;
  const titleY = node.posY + (node.eyebrow ? 51 : 36);
  const bodyY = node.posY + (node.eyebrow ? 75 : 60);
  const body = [
    ...(node.lines ?? []).map((text) => ({ text, warning: false })),
    ...(node.warnings ?? []).map((text) => ({ text, warning: true })),
  ];

  return (
    <g>
      <rect
        x={node.posX}
        y={node.posY}
        width={node.width}
        height={node.height}
        rx={8}
        fill="#0f172a"
      />
      <rect
        x={node.posX}
        y={node.posY}
        width={node.width}
        height={node.height}
        rx={8}
        fill={tone.fill}
        stroke={tone.stroke}
        strokeWidth={1.5}
      />
      {node.eyebrow ? (
        <text
          x={textX}
          y={node.posY + 31}
          fill="#cbd5e1"
          fontSize={10}
          fontWeight={700}
        >
          {node.eyebrow}
        </text>
      ) : null}
      <text x={textX} y={titleY} fill="#e2e8f0" fontSize={14} fontWeight={700}>
        {node.title}
      </text>
      {body.map((line, index) => (
        <text
          key={line.text}
          x={textX}
          y={bodyY + index * 18}
          fill={line.warning ? '#fbbf24' : '#94a3b8'}
          fontSize={10}
        >
          {line.text}
        </text>
      ))}
    </g>
  );
}

export function PhaseOneFlowDiagram() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60">
      <svg
        viewBox="0 0 1340 650"
        role="img"
        aria-label="사용자에서 Slack Thread, workflow-manager, workflow-developer, Codex CLI, GitHub PR 을 거쳐 사용자의 Merge 판단으로 끝나는 Phase 1 workflow. 명확화 loop 와 blocked/failed 보고 경로를 포함한다."
        className="block h-auto w-full"
      >
        <defs>
          <pattern
            id="phase-one-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#1e293b"
              strokeWidth={0.5}
            />
          </pattern>
          {Object.entries(EDGE_TONE).map(([tone, style]) => (
            <marker
              key={tone}
              id={`phase-one-arrow-${tone}`}
              viewBox="0 0 10 10"
              refX={9}
              refY={5}
              markerWidth={6}
              markerHeight={6}
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={style.stroke} />
            </marker>
          ))}
        </defs>

        <rect width={1340} height={650} fill="#020617" />
        <rect width={1340} height={650} fill="url(#phase-one-grid)" />

        <rect
          x={42}
          y={44}
          width={1256}
          height={590}
          rx={14}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={1.2}
          strokeDasharray="8 5"
        />
        <text x={66} y={75} fill="#fbbf24" fontSize={12} fontWeight={700}>
          PHASE 1 BOUNDARY — 단일 Task · 단일 Developer Run · 단일
          Worktree/Branch · 단일 PR
        </text>

        {/* 연결선은 노드 뒤에 깔린다 */}
        {EDGES.map((edge) => {
          const style = EDGE_TONE[edge.tone];

          return (
            <g key={edge.id}>
              <path
                d={edge.path}
                fill="none"
                stroke={style.stroke}
                strokeWidth={style.dashed ? 1.8 : 2}
                strokeDasharray={style.dashed ? '6 5' : undefined}
                markerEnd={`url(#phase-one-arrow-${edge.tone})`}
              />
              {edge.label ? (
                <text
                  x={edge.labelX}
                  y={edge.labelY}
                  fill={style.stroke}
                  fontSize={10}
                >
                  {edge.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {NODES.map((node) => (
          <FlowNodeShape key={node.id} node={node} />
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-800 px-5 py-4 text-xs text-slate-400">
        {LEGEND.map((item) => (
          <span key={item.tone} className="flex items-center gap-2">
            <svg
              viewBox="0 0 48 4"
              aria-hidden="true"
              className="h-1 w-12 shrink-0"
            >
              <line
                x1={0}
                y1={2}
                x2={48}
                y2={2}
                stroke={EDGE_TONE[item.tone].stroke}
                strokeWidth={2}
                strokeDasharray={
                  EDGE_TONE[item.tone].dashed ? '6 5' : undefined
                }
              />
            </svg>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
