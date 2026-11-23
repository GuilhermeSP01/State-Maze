import { useNavigate } from 'react-router';
import { availableStageNumbers } from '../stages/loadStage';

export default function MainMenuPage() {
  const navigate = useNavigate();

  return (
    <main>
      <h1>State Maze</h1>
      <nav aria-label="Fases">
        {availableStageNumbers.map((stageNumber) => (
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
