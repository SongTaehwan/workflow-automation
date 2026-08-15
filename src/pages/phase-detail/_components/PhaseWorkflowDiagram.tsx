import {
  PhaseStatus,
  phaseStatusTone,
  type Phase,
  type PhaseStep,
} from '@/entities/phase';

// 3열 서펜타인 배치 — 행 끝에서 아래로 꺾어 다음 행을 반대 방향으로 잇는다.
const COLUMNS = 3;
const NODE_WIDTH = 292;
const NODE_HEIGHT = 128;
const GAP_X = 64;
const GAP_Y = 64;
const CONTENT_LEFT = 44;
const CONTENT_TOP = 82;
const BOUNDARY_INSET = 16;
const BOTTOM_PADDING = 40;
// 화살촉이 노드에 닿지 않게 남기는 여백
const ARROW_GAP = 10;

const legendOrder = [
  PhaseStatus.COMPLETED,
  PhaseStatus.RUNNING,
  PhaseStatus.PENDING,
];

type PlacedStep = {
  step: PhaseStep;
  order: number;
  left: number;
  top: number;
};

function placeSteps(steps: PhaseStep[]): PlacedStep[] {
  return steps.map((step, index) => {
    const row = Math.floor(index / COLUMNS);
    const inRow = index % COLUMNS;
    const column = row % 2 === 0 ? inRow : COLUMNS - 1 - inRow;

    return {
      step,
      order: index + 1,
      left: CONTENT_LEFT + column * (NODE_WIDTH + GAP_X),
      top: CONTENT_TOP + row * (NODE_HEIGHT + GAP_Y),
    };
  });
}

function flowPath(source: PlacedStep, target: PlacedStep): string {
  if (source.top === target.top) {
    const centerY = source.top + NODE_HEIGHT / 2;
    const goesRight = target.left > source.left;
    const startX = goesRight ? source.left + NODE_WIDTH : source.left;
    const endX = goesRight
      ? target.left - ARROW_GAP
      : target.left + NODE_WIDTH + ARROW_GAP;

    return `M ${startX} ${centerY} H ${endX}`;
  }

  const centerX = source.left + NODE_WIDTH / 2;

  return `M ${centerX} ${source.top + NODE_HEIGHT} V ${target.top - ARROW_GAP}`;
}

function markerId(status: PhaseStatus): string {
  return `phase-flow-arrow-${status}`;
}

/** Phase 의 step 을 노드·화살표·경계로 그리는 workflow 구조 다이어그램. */
export function PhaseWorkflowDiagram({ phase }: { phase: Phase }) {
  const placed = placeSteps(phase.steps);
  const rowCount = Math.ceil(phase.steps.length / COLUMNS);
  const columnCount = Math.min(phase.steps.length, COLUMNS);
  const width =
    CONTENT_LEFT * 2 + columnCount * NODE_WIDTH + (columnCount - 1) * GAP_X;
  const height =
    CONTENT_TOP +
    rowCount * NODE_HEIGHT +
    (rowCount - 1) * GAP_Y +
    BOTTOM_PADDING;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ minWidth: width }}
          className="block w-full"
          role="img"
          aria-label={`${phase.code} workflow 구조 다이어그램 — step ${phase.steps.length}개의 역할·상태·흐름`}
        >
          <defs>
            {legendOrder.map((status) => (
              <marker
                key={status}
                id={markerId(status)}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path
                  d="M0 0 L10 5 L0 10z"
                  className={phaseStatusTone[status].flowFill}
                />
              </marker>
            ))}
          </defs>

          <rect
            x={BOUNDARY_INSET}
            y={BOUNDARY_INSET}
            width={width - BOUNDARY_INSET * 2}
            height={height - BOUNDARY_INSET * 2}
            rx="12"
            strokeWidth="1.2"
            strokeDasharray="8 4"
            className="fill-amber-400/5 stroke-amber-400/70"
          />
          <text
            x={CONTENT_LEFT}
            y={BOUNDARY_INSET + 34}
            className="fill-amber-400 text-[0.6875rem] font-bold"
          >
            {phase.boundary}
          </text>

          {placed.map((source, index) => {
            const target = placed[index + 1];

            if (!target) return null;

            return (
              <path
                key={`flow-${source.step.id}`}
                d={flowPath(source, target)}
                fill="none"
                strokeWidth="2"
                className={phaseStatusTone[target.step.status].flowStroke}
                markerEnd={`url(#${markerId(target.step.status)})`}
              />
            );
          })}

          {placed.map(({ step, order, left, top }) => {
            const tone = phaseStatusTone[step.status];

            return (
              <foreignObject
                key={step.id}
                x={left}
                y={top}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
              >
                <div
                  className={`flex h-full flex-col gap-2 rounded-lg border border-l-2 border-slate-800 bg-slate-950/90 px-4 py-3 ${tone.leftBorder}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.625rem] text-slate-600">
                      {String(order).padStart(2, '0')}
                    </span>
                    {/* 역할은 자유 문자열이라 색이 아니라 칩 라벨로 구분한다 */}
                    <span className="rounded border border-slate-700 px-2 py-0.5 text-[0.625rem] text-slate-400">
                      {step.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 shrink-0 rounded-full ${tone.dot}`}
                    />
                    <span className="text-xs font-semibold text-slate-50">
                      {step.name}
                    </span>
                  </div>
                  <p className="text-[0.6875rem] leading-snug text-slate-400">
                    {step.detail}
                  </p>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>

      <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.6875rem] text-slate-500">
        {legendOrder.map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span
              className={`size-2.5 rounded-sm ${phaseStatusTone[status].dot}`}
            />
            {phaseStatusTone[status].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
