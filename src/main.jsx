import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';
import { NetworkProvider } from './context/NetworkContext';
import { AuthProvider } from './context/AuthContext';

// Register Service Worker for offline PWA capabilities
if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
      },
      (err) => {
        console.warn('[PWA] ServiceWorker registration failed:', err);
      }
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <NetworkProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </NetworkProvider>
    </LanguageProvider>
  </React.StrictMode>
);
