import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { applyInitialTheme } from './lib/theme';
import { trackException } from './lib/analytics';

applyInitialTheme();

// Global error reporting (non-blocking)
window.addEventListener('error', (e) => {
  trackException(e.message, true);
});
window.addEventListener('unhandledrejection', (e) => {
  const reason = (e.reason instanceof Error ? e.reason.message : String(e.reason)) || 'unknown';
  trackException('Promise: ' + reason, false);
});

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
