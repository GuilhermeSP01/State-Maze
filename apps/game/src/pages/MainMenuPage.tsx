import { useNavigate } from 'react-router';

export default function MainMenuPage() {
  const navigate = useNavigate();

  return (
    <main>
      <h1>State Maze</h1>
      <nav aria-label="Fases">
        {[1, 2, 3, 4, 5].map((stageNumber) => (
          <button
            key={stageNumber}
            type="button"
            aria-label={`Fase ${stageNumber}`}
            onClick={() => navigate(`/stage/${stageNumber}`)}
          >
            {stageNumber}
          </button>
        ))}
      </nav>
    </main>
  );
}
