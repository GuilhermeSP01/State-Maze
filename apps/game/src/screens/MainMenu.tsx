type MainMenuProps = {
  onSelectLevel: (levelNumber: number) => void;
};

export default function MainMenu({ onSelectLevel }: MainMenuProps) {
  return (
    <main>
      <h1>State Maze</h1>
      <nav aria-label="Fases">
        {[1, 2, 3, 4, 5].map((levelNumber) => (
          <button
            key={levelNumber}
            type="button"
            aria-label={`Fase ${levelNumber}`}
            onClick={() => onSelectLevel(levelNumber)}
          >
            {levelNumber}
          </button>
        ))}
      </nav>
    </main>
  );
}
