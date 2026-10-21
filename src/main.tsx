import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource-variable/archivo/wdth.css';
import './styles/global.css';
import { AppRoutes } from './App';
import { LaunchGate } from './components/LaunchGate';
import { DataProvider } from './data/DataProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <LaunchGate>
          <AppRoutes />
        </LaunchGate>
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
);
