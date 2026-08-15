import { Navigate, createBrowserRouter } from 'react-router-dom';

import { PhaseDetailPage } from '@/pages/phase-detail';
import { PhaseListPage } from '@/pages/phase-list';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/phases" replace /> },
  { path: '/phases', element: <PhaseListPage /> },
  { path: '/phases/:phaseId', element: <PhaseDetailPage /> },
]);
