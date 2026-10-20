import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/permanent-marker/400.css';
import './styles/global.css';
import { AppRoutes } from './App';
import { DataProvider } from './data/DataProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </BrowserRouter>
  </StrictMode>,
);
