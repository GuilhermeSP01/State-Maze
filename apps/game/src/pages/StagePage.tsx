import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';

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

  return (
    <main>
      <h1>Fase {stageNumber}</h1>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-controls="stage-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        Menu
      </button>
      <nav id="stage-menu" aria-label="Menu da fase" hidden={!menuOpen}>
        <button type="button" onClick={() => navigate('/')}>
          Voltar para a tela inicial
        </button>
      </nav>
    </main>
  );
}
