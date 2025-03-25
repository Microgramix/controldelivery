import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Cria e adiciona dinamicamente a meta tag viewport para dispositivos móveis e PWAs
const metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
document.head.appendChild(metaViewport);

// Detecta se o dispositivo possui capacidade de toque e adiciona classe ao body
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.body.classList.add('touch-device');
} else {
  document.body.classList.add('no-touch-device');
}

// Criação do root da aplicação com hydration
const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Registro do Service Worker para PWA (em produção)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado: ', registration);
      })
      .catch(error => {
        console.log('Falha ao registrar Service Worker: ', error);
      });
  });
}
