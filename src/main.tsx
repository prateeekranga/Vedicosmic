import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initAnalytics } from '@/lib/analytics';
import { initMonitoring } from '@/lib/monitoring';
import '@/styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Signal the prerender script that React has mounted and painted.
// Falls back to setTimeout for environments without requestIdleCallback.
const signal = () => { (window as unknown as { __PRERENDER_READY__?: boolean }).__PRERENDER_READY__ = true; };
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(signal, { timeout: 2000 });
} else {
  setTimeout(signal, 200);
}

// Analytics and error reporting load only after the page has settled (and only if configured).
const startIntegrations = () => { initAnalytics(); initMonitoring(); };
if (typeof requestIdleCallback !== 'undefined') requestIdleCallback(startIntegrations, { timeout: 4000 });
else setTimeout(startIntegrations, 2000);

