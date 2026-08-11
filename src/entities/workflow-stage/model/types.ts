export type WorkflowStage = {
  /** URL 세그먼트로 그대로 쓰인다 (`/workflows/<id>`). */
  id: string;
  name: string;
  summary: string;
  status: string;
};
