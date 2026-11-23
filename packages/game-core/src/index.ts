import type { Position, StageDefinition, Tile } from '@state-maze/stages';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameState = {
  readonly map: readonly (readonly Tile[])[];
  readonly player: Position;
};

const offsets: Record<Direction, Position> = {
  up: { row: -1, column: 0 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
  right: { row: 0, column: 1 },
};

export function createGameState(stage: StageDefinition): GameState {
  return {
    map: stage.map.map((row) => [...row]),
    player: { ...stage.playerStart },
  };
}

export function movePlayer(state: GameState, direction: Direction): GameState {
  const offset = offsets[direction];
  let { row, column } = state.player;
  let map: Tile[][] | undefined;

  while (true) {
    const nextRow = row + offset.row;
    const nextColumn = column + offset.column;
    const tile = state.map[nextRow]?.[nextColumn];
    if (tile === undefined || tile === 2) break;

    map ??= state.map.map((tiles) => [...tiles]);
    map[nextRow][nextColumn] = tile === 0 ? 1 : 0;
    row = nextRow;
    column = nextColumn;
  }

  return map ? { map, player: { row, column } } : state;
}
