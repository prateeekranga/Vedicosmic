import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
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
const signal = () => { (window as any).__PRERENDER_READY__ = true; };
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(signal, { timeout: 2000 });
} else {
  setTimeout(signal, 200);
}

