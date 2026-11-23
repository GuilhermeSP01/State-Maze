import { useState } from 'react';

type LevelScreenProps = {
  levelNumber: number;
  onBackToMenu: () => void;
};

export default function LevelScreen({ levelNumber, onBackToMenu }: LevelScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <h1>Fase {levelNumber}</h1>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="level-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        Menu
      </button>
      <nav id="level-menu" aria-label="Menu da fase" hidden={!menuOpen}>
        <button type="button" onClick={onBackToMenu}>
          Voltar para a tela inicial
        </button>
      </nav>
    </main>
  );
}
