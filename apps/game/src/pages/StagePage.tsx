import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import type { StageDefinition, WorldDefinition } from '@state-maze/stages';
import { useAnimatedGame } from '../hooks/useAnimatedGame';
import type { LightingOptions } from '../components/BoardLighting';
import StageBoard from '../components/StageBoard';
import { getWorldStages, listStages, loadStage } from '../stages/loadStage';
import { loadWorld } from '../worlds/loadWorld';
import { getWorldTitle } from '../worlds/getWorldTitle';

type StageLoadState =
  | { status: 'loading' }
  | { status: 'ready'; stage: StageDefinition; world: WorldDefinition; nextStageId: string | null }
  | { status: 'not-found' }
  | { status: 'error' };

export default function StagePage() {
  const { stageId } = useParams<'stageId'>();
  if (!stageId) return <Navigate to="/" replace />;

  return <StageContent key={stageId} stageId={stageId} />;
}

const lightingKey = 'state-maze.lighting';

function loadLighting(): LightingOptions {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(lightingKey) ?? '{}');
  } catch {
    // Storage can be unavailable in a restricted webview.
  }
  return { penumbra: saved?.penumbra !== false, bloom: saved?.bloom !== false };
}

function StageContent({ stageId }: { stageId: string }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [lighting, setLighting] = useState(loadLighting);
  function changeLighting(option: keyof LightingOptions, enabled: boolean) {
    const updated = { ...lighting, [option]: enabled };
    setLighting(updated);
    try {
      localStorage.setItem(lightingKey, JSON.stringify(updated));
    } catch {
      // The choice still applies to the current stage.
    }
  }

  const [paused, setPaused] = useState(false);
  const [state, setState] = useState<StageLoadState>({ status: 'loading' });
  const boardRef = useRef<HTMLDivElement>(null);
  const pauseButtonRef = useRef<HTMLButtonElement>(null);
  const resumeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const completionRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      const stage = await loadStage(stageId);
      if (!stage) return null;
      const [world, stages] = await Promise.all([loadWorld(stage.worldId), listStages()]);
      if (!world) return null;
      const worldStages = getWorldStages(stages, world.id);
      const stageIndex = worldStages.findIndex(({ id }) => id === stage.id);
      const nextStageId = worldStages[stageIndex + 1]?.id ?? null;
      return { stage, world, nextStageId };
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

  const { game, visualPosition, isAnimating, reaction, move, restart: restartGame } = useAnimatedGame(
    state.status === 'ready' ? state.stage : null,
    !paused,
  );
  const boardReady = game !== null && visualPosition !== null;
  const completed = game?.completed ?? false;

  useEffect(() => {
    if (boardReady) boardRef.current?.focus({ preventScroll: true });
  }, [boardReady]);

  useEffect(() => {
    if (completed && !paused) completionRef.current?.focus();
  }, [completed, paused]);

  function pause() {
    dialogRef.current?.showModal();
    resumeButtonRef.current?.focus();
    setPaused(true);
  }

  function closePause() {
    dialogRef.current?.close();
    setPaused(false);
  }

  function resume() {
    closePause();
    if (!completed) pauseButtonRef.current?.focus();
  }

  function restart() {
    restartGame();
    if (paused) closePause();
    boardRef.current?.focus();
  }

  function goToNextStage() {
    if (state.status === 'ready' && state.nextStageId) navigate(`/stage/${state.nextStageId}`);
  }

  const catalogLink = <Link className="game-control" to="/" state={{ returnStageId: stageId }}>
    {t('navigation.backToStages')}
  </Link>;

  if (state.status !== 'ready') {
    return (
      <main className="stage-page">
        <h1>{t('stage.heading')}</h1>
        {state.status === 'loading' && <p role="status">{t('stage.loading')}</p>}
        {state.status === 'not-found' && <p role="status">{t('stage.notFound')}</p>}
        {state.status === 'error' && <p role="alert">{t('stage.loadError')}</p>}
        {catalogLink}
      </main>
    );
  }

  return (
    <main className="stage-page">
      <header className="stage-header">
        <div>
          <p className="stage-world">{getWorldTitle(state.world, i18n.resolvedLanguage ?? 'en')}</p>
          <h1>{t('stage.title', { number: state.stage.number })}</h1>
        </div>
        {!completed && boardReady && (
          <button
            ref={pauseButtonRef}
            className="pause-button"
            type="button"
            aria-label={t('stage.pause')}
            aria-haspopup="dialog"
            onClick={pause}
          >
            <span className="pause-icon" aria-hidden="true" />
          </button>
        )}
      </header>
      {game && visualPosition && (
        <>
          <p id="stage-goal" className="stage-goal">
            <span className="stage-goal-swatch" aria-hidden="true" />
            {t('stage.goal')}
          </p>
          <StageBoard
            ref={boardRef}
            stageNumber={state.stage.number}
            game={game}
            visualPosition={visualPosition}
            isAnimating={isAnimating}
            reaction={reaction}
            onMove={move}
            lighting={lighting}
            disabled={paused || completed}
          />
          {completed ? (
            <section className="stage-completion" aria-labelledby="completion-title">
              <h2 id="completion-title" ref={completionRef} tabIndex={-1}>{t('stage.completed')}</h2>
              <div className="completion-actions">
                <button
                  type="button"
                  className="game-control game-control-primary next-stage"
                  disabled={!state.nextStageId}
                  onClick={goToNextStage}
                >
                  {t('stage.next')}
                </button>
                {catalogLink}
                <button type="button" className="game-control" onClick={restart}>{t('stage.replay')}</button>
              </div>
            </section>
          ) : (
            <div id="stage-controls" className="stage-controls">
              <p>{t('stage.controls')}</p>
              {state.stage.number === 1 && <p>{t('stage.toggleHint')}</p>}
            </div>
          )}
        </>
      )}
      <dialog
        ref={dialogRef}
        className="pause-dialog"
        aria-labelledby="pause-title"
        onCancel={(event) => {
          event.preventDefault();
          resume();
        }}
      >
        <h2 id="pause-title">{t('stage.paused')}</h2>
        <button ref={resumeButtonRef} type="button" className="game-control game-control-primary" onClick={resume}>
          {t('stage.resume')}
        </button>
        <button type="button" className="game-control" onClick={restart}>{t('stage.restart')}</button>
        <fieldset className="lighting-options">
          <legend>{t('stage.lighting')}</legend>
          {(['penumbra', 'bloom'] as const).map(option => (
            <label key={option}>
              <input type="checkbox" checked={lighting[option]}
                onChange={event => changeLighting(option, event.target.checked)} />
              {t(`stage.${option}`)}
            </label>
          ))}
        </fieldset>
        {catalogLink}
      </dialog>
    </main>
  );
}
