import { createBrowserRouter } from 'react-router-dom';

import { WorkflowDetailPage } from '@/pages/workflow-detail';
import { WorkflowListPage } from '@/pages/workflow-list';

export const router = createBrowserRouter([
  { path: '/', element: <WorkflowListPage /> },
  { path: '/workflows/:stageId', element: <WorkflowDetailPage /> },
]);
