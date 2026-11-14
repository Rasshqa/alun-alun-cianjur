import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    if ('caches' in window) {
      for (const stale of ['tiles-v1', 'tiles-v2', 'tiles-v3', 'shell-v6', 'shell-v7', 'shell-v8']) {
        void caches.delete(stale).catch(() => {});
      }
    }
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          void reg.update().catch(() => {});
        })
        .catch(() => {});
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }
}
