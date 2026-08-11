import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import '@/app/theme/index.css';
import { ThemeProvider } from '@/shared/ui/theme-provider';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
