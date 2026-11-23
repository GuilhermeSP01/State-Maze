import type { Position } from '@state-maze/stages';
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
  visualPosition: Position;
  isAnimating: boolean;
  onMove: (direction: Direction) => void;
  disabled: boolean;
};

export default function StageBoard({
  stageNumber, game, visualPosition, isAnimating, onMove, disabled,
}: StageBoardProps) {
  const { t } = useTranslation();
  const inputHandlers = usePlayerControls(onMove, !disabled);

  return (
    <div
      className="stage-board"
      role="table"
      tabIndex={0}
      aria-busy={isAnimating}
      aria-label={t('board.label', { number: stageNumber })}
      aria-describedby="stage-controls"
      style={{
        gridTemplateColumns: `repeat(${game.map[0].length}, minmax(0, 1fr))`,
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
              />
            );
          })}
        </div>
      ))}
      <span
        className="stage-player"
        aria-hidden="true"
        style={{
          width: `${40 / game.map[0].length}%`,
          left: `${((visualPosition.column + 0.5) / game.map[0].length) * 100}%`,
          top: `${((visualPosition.row + 0.5) / game.map.length) * 100}%`,
        }}
      />
    </div>
  );
}
