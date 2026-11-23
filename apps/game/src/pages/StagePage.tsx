import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';
import type { StageDefinition, WorldDefinition } from '@state-maze/stages';
import { createGameState, movePlayer } from '@state-maze/game-core';
import type { Direction, GameState } from '@state-maze/game-core';
import StageBoard from '../components/StageBoard';
import { loadStage } from '../stages/loadStage';
import { loadWorld } from '../worlds/loadWorld';
import { getWorldTitle } from '../worlds/getWorldTitle';

type StageLoadState =
  | { status: 'loading' }
  | { status: 'ready'; stage: StageDefinition; world: WorldDefinition; game: GameState }
  | { status: 'not-found' }
  | { status: 'error' };

export default function StagePage() {
  const { stageId } = useParams<'stageId'>();
  if (!stageId) return <Navigate to="/" replace />;

  return <StageContent key={stageId} stageId={stageId} />;
}

function StageContent({ stageId }: { stageId: string }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [state, setState] = useState<StageLoadState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    async function loadContent() {
      const stage = await loadStage(stageId);
      if (!stage) return null;
      const world = await loadWorld(stage.worldId);
      return world ? { stage, world, game: createGameState(stage) } : null;
    }

    loadContent().then(
      (content) => {
        if (active) setState(content ? { status: 'ready', ...content } : { status: 'not-found' });
      },
      () => {
        if (active) setState({ status: 'error' });
      },
    );

    return () => { active = false; };
  }, [stageId]);

  const handleMove = useCallback((direction: Direction) => {
    setState((current) => current.status === 'ready'
      ? { ...current, game: movePlayer(current.game, direction) }
      : current);
  }, []);

  function restart() {
    setState((current) => current.status === 'ready'
      ? { ...current, game: createGameState(current.stage) }
      : current);
    setMenuOpen(false);
  }

  return (
    <main>
      <h1>
        {state.status === 'ready'
          ? t('stage.title', { number: state.stage.number })
          : t('stage.heading')}
      </h1>
      {state.status === 'ready' && (
        <p>{getWorldTitle(state.world, i18n.resolvedLanguage ?? 'en')}</p>
      )}
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="stage-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {t('navigation.menu')}
      </button>
      <nav id="stage-menu" aria-label={t('stage.menu')} hidden={!menuOpen}>
        {state.status === 'ready' && (
          <button type="button" onClick={restart}>{t('stage.restart')}</button>
        )}
        <button type="button" onClick={() => navigate('/')}>
          {t('navigation.backToMainMenu')}
        </button>
      </nav>
      {state.status === 'loading' && <p role="status">{t('stage.loading')}</p>}
      {state.status === 'not-found' && <p role="status">{t('stage.notFound')}</p>}
      {state.status === 'error' && <p role="alert">{t('stage.loadError')}</p>}
      {state.status === 'ready' && (
        <>
          <p id="stage-controls">{t('stage.controls')}</p>
          <StageBoard
            stageNumber={state.stage.number}
            game={state.game}
            onMove={handleMove}
            disabled={menuOpen}
          />
        </>
      )}
    </main>
  );
}
