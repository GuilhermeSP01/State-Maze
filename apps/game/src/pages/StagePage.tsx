import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import type { StageDefinition } from '@state-maze/stages';
import StageBoard from '../components/StageBoard';
import { loadStage } from '../stages/loadStage';

type StageLoadState =
  | { status: 'loading' }
  | { status: 'ready'; stage: StageDefinition }
  | { status: 'not-found' }
  | { status: 'error' };

export default function StagePage() {
  const { stageNumber } = useParams<'stageNumber'>();
  const number = Number(stageNumber);

  if (!stageNumber || !/^[1-9]\d*$/.test(stageNumber) || !Number.isSafeInteger(number)) {
    return <Navigate to="/" replace />;
  }

  return <StageContent key={number} stageNumber={number} />;
}

function StageContent({ stageNumber }: { stageNumber: number }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [state, setState] = useState<StageLoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    loadStage(stageNumber).then(
      (stage) => {
        if (active) setState(stage ? { status: 'ready', stage } : { status: 'not-found' });
      },
      () => {
        if (active) setState({ status: 'error' });
      },
    );

    return () => { active = false; };
  }, [stageNumber]);

  return (
    <main>
      <h1>{t('stage.title', { number: stageNumber })}</h1>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="stage-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {t('navigation.menu')}
      </button>
      <nav id="stage-menu" aria-label={t('stage.menu')} hidden={!menuOpen}>
        <button type="button" onClick={() => navigate('/')}>
          {t('navigation.backToMainMenu')}
        </button>
      </nav>
      {state.status === 'loading' && <p role="status">{t('stage.loading')}</p>}
      {state.status === 'not-found' && <p role="status">{t('stage.notFound')}</p>}
      {state.status === 'error' && <p role="alert">{t('stage.loadError')}</p>}
      {state.status === 'ready' && <StageBoard stage={state.stage} />}
    </main>
  );
}
