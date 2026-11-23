import { useEffect, useState } from 'react';
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
      <h1>Stage {stageNumber}</h1>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="stage-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        Menu
      </button>
      <nav id="stage-menu" aria-label="Stage menu" hidden={!menuOpen}>
        <button type="button" onClick={() => navigate('/')}>
          Back to main menu
        </button>
      </nav>
      {state.status === 'loading' && <p role="status">Loading stage…</p>}
      {state.status === 'not-found' && <p role="status">Stage not found.</p>}
      {state.status === 'error' && <p role="alert">Could not load the stage.</p>}
      {state.status === 'ready' && <StageBoard stage={state.stage} />}
    </main>
  );
}
