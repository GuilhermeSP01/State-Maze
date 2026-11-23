import type { StageDefinition } from '@state-maze/stages';
import './StageBoard.css';

const tileLabels = {
  0: 'Floor in state 0',
  1: 'Floor in state 1',
  2: 'Wall',
};

export default function StageBoard({ stage }: { stage: StageDefinition }) {
  return (
    <div
      className="stage-board"
      role="table"
      aria-label={`Stage ${stage.id} map`}
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
                aria-label={`${tileLabels[tile]}${hasPlayer ? ', player' : ''}`}
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
