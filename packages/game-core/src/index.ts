import type { Position, StageDefinition, Tile } from '@state-maze/stages';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameState = {
  readonly map: readonly (readonly Tile[])[];
  readonly player: Position;
  readonly completed: boolean;
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
    completed: false,
  };
}

export type MovePlan = {
  readonly state: GameState;
  /** Entered cells in travel order; the starting cell is excluded. */
  readonly path: readonly Position[];
};

export function movePlayer(state: GameState, direction: Direction): GameState {
  return planMove(state, direction).state;
}

export function planMove(state: GameState, direction: Direction): MovePlan {
  if (state.completed) return { state, path: [] };

  const offset = offsets[direction];
  let { row, column } = state.player;
  let map: Tile[][] | undefined;
  const path: Position[] = [];

  while (true) {
    const nextRow = row + offset.row;
    const nextColumn = column + offset.column;
    const tile = state.map[nextRow]?.[nextColumn];
    if (tile === undefined || tile === 2) break;

    map ??= state.map.map((tiles) => [...tiles]);
    map[nextRow][nextColumn] = tile === 0 ? 1 : 0;
    row = nextRow;
    column = nextColumn;
    path.push({ row, column });
  }

  if (!map) return { state, path };

  return {
    path,
    state: {
      map,
      player: { row, column },
      completed: map.every((tiles) => tiles.every((tile) => tile === 1 || tile === 2)),
    },
  };
}
