import { Capacitor } from '@capacitor/core';

export default function App() {
  return (
    <main className="welcome">
      <span className="eyebrow">UM NOVO CAMINHO</span>
      <div className="maze-mark" aria-hidden="true">S<span>M</span></div>
      <h1>State Maze</h1>
      <p>Todo caminho começa com um primeiro passo.</p>
      <div className="status"><span aria-hidden="true" />Em desenvolvimento</div>
      <footer>Vite + Capacitor · <span id="platform">{Capacitor.getPlatform()}</span></footer>
    </main>
  );
}
