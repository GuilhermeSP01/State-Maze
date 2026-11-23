import type { Direction, GameState } from '@state-maze/game-core';
import { useTranslation } from 'react-i18next';
import { usePlayerControls } from '../hooks/usePlayerControls';
import './StageBoard.css';

const tileLabels = {
  0: 'board.floorOff',
  1: 'board.floorOn',
  2: 'board.wall',
} as const;

type StageBoardProps = {
  stageNumber: number;
  game: GameState;
  onMove: (direction: Direction) => void;
  disabled: boolean;
};

export default function StageBoard({ stageNumber, game, onMove, disabled }: StageBoardProps) {
  const { t } = useTranslation();
  const inputHandlers = usePlayerControls(onMove, !disabled);

  return (
    <div
      className="stage-board"
      role="table"
      tabIndex={0}
      aria-label={t('board.label', { number: stageNumber })}
      aria-describedby="stage-controls"
      style={{
        gridTemplateColumns: `repeat(${game.map[0].length}, minmax(0, 1fr))`,
        touchAction: disabled ? 'auto' : 'none',
      }}
      {...inputHandlers}
    >
      {game.map.map((row, rowIndex) => (
        <div className="stage-board-row" role="row" key={rowIndex}>
          {row.map((tile, columnIndex) => {
            const hasPlayer = game.player.row === rowIndex && game.player.column === columnIndex;

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
