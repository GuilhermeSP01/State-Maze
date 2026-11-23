import { Capacitor } from '@capacitor/core';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Elemento #app ausente.');

app.innerHTML = `
  <main class="welcome">
    <span class="eyebrow">UM NOVO CAMINHO</span>
    <div class="maze-mark" aria-hidden="true">S<span>M</span></div>
    <h1>State Maze</h1>
    <p>Todo caminho começa com um primeiro passo.</p>
    <div class="status"><span aria-hidden="true"></span>Em desenvolvimento</div>
    <footer>Vite + Capacitor · <span id="platform"></span></footer>
  </main>
`;
const platform = document.querySelector<HTMLSpanElement>('#platform');
if (platform) platform.textContent = Capacitor.getPlatform();
