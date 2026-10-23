import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initAnalytics } from '@/lib/analytics';
import { initMonitoring } from '@/lib/monitoring';
import { markPrerendered } from '@/lib/hydration';
import '@/styles/globals.css';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Pre-rendered pages (scripts/ssg.mjs) arrive with their HTML in place: React takes it over rather
// than drawing the page again. Client-only pages (the admin, database posts) start empty.
if (container.hasChildNodes()) {
  markPrerendered();
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}

// Analytics and error reporting load only after the page has settled (and only if configured).
const startIntegrations = () => { initAnalytics(); initMonitoring(); };
if (typeof requestIdleCallback !== 'undefined') requestIdleCallback(startIntegrations, { timeout: 4000 });
else setTimeout(startIntegrations, 2000);
