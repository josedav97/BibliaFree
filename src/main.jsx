import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL + 'service-worker.js';
    console.log('[App] Registering SW at:', swPath);
    navigator.serviceWorker
      .register(swPath, { scope: import.meta.env.BASE_URL })
      .then((reg) => {
        console.log('[App] SW registered. Scope:', reg.scope);
        reg.addEventListener('updatefound', () => {
          console.log('[App] SW update found');
        });
      })
      .catch((err) => {
        console.warn('[App] SW registration failed:', err.message);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
