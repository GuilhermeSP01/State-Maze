import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import { availableStageNumbers } from '../stages/loadStage';

export default function MainMenuPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main>
      <h1>State Maze</h1>
      <LanguageSelector />
      <nav aria-label={t('stage.list')}>
        {availableStageNumbers.map((stageNumber) => (
          <button
            key={stageNumber}
            type="button"
            aria-label={t('stage.title', { number: stageNumber })}
            onClick={() => navigate(`/stage/${stageNumber}`)}
          >
            {stageNumber}
          </button>
        ))}
      </nav>
    </main>
  );
}
