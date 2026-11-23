import type { StageDefinition } from '@state-maze/stages';
import { useTranslation } from 'react-i18next';
import './StageBoard.css';

const tileLabels = {
  0: 'board.floorOff',
  1: 'board.floorOn',
  2: 'board.wall',
} as const;

export default function StageBoard({ stage }: { stage: StageDefinition }) {
  const { t } = useTranslation();
  return (
    <div
      className="stage-board"
      role="table"
      aria-label={t('board.label', { number: stage.id })}
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
                aria-label={t(tileLabels[tile], { context: hasPlayer ? 'player' : undefined })}
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
