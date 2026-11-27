import type { Ref } from 'react';
import type { Position } from '@state-maze/stages';
import type { Direction, GameState } from '@state-maze/game-core';
import { useTranslation } from 'react-i18next';
import type { PlayerReaction } from '../hooks/useAnimatedGame';
import { usePlayerControls } from '../hooks/usePlayerControls';
import BoardLighting, { type LightingOptions } from './BoardLighting';
import './StageBoard.css';

const tileLabels = {
  0: 'board.floorOff',
  1: 'board.floorOn',
  2: 'board.wall',
} as const;

type StageBoardProps = {
  ref: Ref<HTMLDivElement>;
  stageNumber: number;
  game: GameState;
  visualPosition: Position;
  isAnimating: boolean;
  reaction: PlayerReaction;
  onMove: (direction: Direction) => void;
  disabled: boolean;
  lighting: LightingOptions;
};

export default function StageBoard({
  ref, stageNumber, game, visualPosition, isAnimating, reaction, onMove, disabled, lighting,
}: StageBoardProps) {
  const { t } = useTranslation();
  const inputHandlers = usePlayerControls(onMove, !disabled);

  return (
    <div
      ref={ref}
      className="stage-board"
      role="table"
      tabIndex={disabled ? -1 : 0}
      aria-busy={isAnimating}
      aria-label={t('board.label', { number: stageNumber })}
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
      <BoardLighting map={game.map} options={lighting} />
      <span
        className="stage-player"
        aria-hidden="true"
        style={{
          width: `${50 / game.map[0].length}%`,
          left: `${((visualPosition.column + 0.5) / game.map[0].length) * 100}%`,
          top: `${((visualPosition.row + 0.5) / game.map.length) * 100}%`,
        }}
      >
        <span
          key={reaction.sequence}
          className="player-body"
          data-phase={reaction.phase}
          data-direction={reaction.direction}
          data-lit={game.map[game.player.row][game.player.column] === 1}
        >
          <span className="player-eyes" data-gaze={reaction.gaze} />
        </span>
      </span>
    </div>
  );
}
