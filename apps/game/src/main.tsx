import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Elemento #app ausente.');

createRoot(app).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
