import { createBrowserRouter } from 'react-router-dom';

import { PHASE_1_DETAIL_PATH } from '@/entities/workflow';
import { WorkflowCatalogPage } from '@/pages/workflow-catalog';
import { WorkflowPhase1Page } from '@/pages/workflow-phase-1';

export const router = createBrowserRouter([
  { path: '/', element: <WorkflowCatalogPage /> },
  { path: PHASE_1_DETAIL_PATH, element: <WorkflowPhase1Page /> },
]);
