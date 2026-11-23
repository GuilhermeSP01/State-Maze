import type { StageDefinition } from '@state-maze/stages';
import './StageBoard.css';

const tileLabels = {
  0: 'Piso em estado 0',
  1: 'Piso em estado 1',
  2: 'Parede',
};

export default function StageBoard({ stage }: { stage: StageDefinition }) {
  return (
    <div
      className="stage-board"
      role="table"
      aria-label={`Mapa da fase ${stage.id}`}
      style={{ gridTemplateColumns: `repeat(${stage.map[0].length}, minmax(0, 1fr))` }}
    >
      {stage.map.map((row, rowIndex) => (
        <div className="stage-board-row" role="row" key={rowIndex}>
          {row.map((tile, columnIndex) => {
            const hasPlayer = stage.playerStart.row === rowIndex
              && stage.playerStart.column === columnIndex;

            return (
              <div
                className="stage-tile"
                data-tile={tile}
                role="cell"
                aria-label={`${tileLabels[tile]}${hasPlayer ? ', jogador' : ''}`}
                key={columnIndex}
              >
                {hasPlayer && <span className="stage-player" aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
