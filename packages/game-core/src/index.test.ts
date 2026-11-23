import { describe, expect, it } from 'vitest';
import type { Position, StageDefinition, Tile } from '@state-maze/stages';
import { createGameState, movePlayer, planMove } from './index';
import type { Direction } from './index';

function stage(map: Tile[][], playerStart: Position): StageDefinition {
  return {
    schemaVersion: 2,
    id: '88d74bf2-d913-4fbd-8244-8a0234d6318c',
    worldId: '2af1c8bc-7332-4a4b-b74f-24f53be7fd3f',
    number: 1,
    map,
    playerStart,
  };
}

describe('sliding movement', () => {
  it('creates an independent map and player position for each attempt', () => {
    const definition = stage([[1, 0, 0]], { row: 0, column: 0 });
    const first = createGameState(definition);
    const second = createGameState(definition);
    expect(first.map).toEqual(definition.map);
    expect(first.map[0]).not.toBe(definition.map[0]);
    expect(first.map[0]).not.toBe(second.map[0]);
    expect(first.player).not.toBe(definition.playerStart);
  });

  it('slides to the wall, toggles entered tiles, and preserves the origin', () => {
    const definition = stage([[2, 1, 0, 1, 2, 0]], { row: 0, column: 1 });
    const initial = createGameState(definition);
    Object.freeze(initial.map[0]);
    Object.freeze(initial.player);
    const result = movePlayer(initial, 'right');
    expect(result.player).toEqual({ row: 0, column: 3 });
    expect(result.map).toEqual([[2, 1, 1, 0, 2, 0]]);
    expect(initial.map).toEqual([[2, 1, 0, 1, 2, 0]]);
    expect(definition.map).toEqual(initial.map);
  });

  it('toggles visited floors again on the return path', () => {
    const initial = createGameState(stage([[2, 1, 0, 0, 2], [2, 2, 2, 2, 0]], { row: 0, column: 1 }));
    const right = movePlayer(initial, 'right');
    const left = movePlayer(right, 'left');
    expect(left.map).toEqual([[2, 0, 0, 1, 2], [2, 2, 2, 2, 0]]);
    expect(left.player).toEqual({ row: 0, column: 1 });
    expect(right.map).toEqual([[2, 1, 1, 1, 2], [2, 2, 2, 2, 0]]);
  });

  it.each<[Direction, Position]>([
    ['up', { row: 0, column: 1 }],
    ['down', { row: 2, column: 1 }],
    ['left', { row: 1, column: 0 }],
    ['right', { row: 1, column: 2 }],
  ])('stops at map boundaries when moving %s', (direction, destination) => {
    const initial = createGameState(stage(
      [[0, 0, 0], [0, 0, 0], [0, 0, 0]], { row: 1, column: 1 },
    ));
    const result = movePlayer(initial, direction);
    expect(result.player).toEqual(destination);
    expect(result.map[destination.row][destination.column]).toBe(1);
    expect(result.map[1][1]).toBe(0);
  });

  it('does nothing when a wall or map boundary is adjacent', () => {
    const initial = createGameState(stage([[1, 2]], { row: 0, column: 0 }));
    for (const direction of ['up', 'down', 'left', 'right'] as const) {
      expect(movePlayer(initial, direction)).toBe(initial);
    }
  });
});

describe('stage completion', () => {
  it('completes the first corridor after the full slide and blocks later moves', () => {
    const initial = createGameState(stage([[2, 1, 0, 0, 2]], { row: 0, column: 1 }));
    const result = movePlayer(initial, 'right');
    expect(result.map).toEqual([[2, 1, 1, 1, 2]]);
    expect(result.player).toEqual({ row: 0, column: 3 });
    expect(result.completed).toBe(true);
    expect(initial.completed).toBe(false);
    expect(movePlayer(result, 'left')).toBe(result);
  });

  it('does not finish at an intermediate winning position during a slide', () => {
    const initial = createGameState(stage([[2, 1, 0, 1, 2]], { row: 0, column: 1 }));
    const result = movePlayer(initial, 'right');
    expect(result.map).toEqual([[2, 1, 1, 0, 2]]);
    expect(result.player).toEqual({ row: 0, column: 3 });
    expect(result.completed).toBe(false);
  });

  it('requires the unchanged starting tile to be on as well', () => {
    const initial = createGameState(stage([[2, 0, 0, 2]], { row: 0, column: 1 }));
    expect(movePlayer(initial, 'right').completed).toBe(false);
  });

  it('does not check victory on load or on a blocked command', () => {
    const initial = createGameState(stage([[2, 1, 2]], { row: 0, column: 1 }));
    expect(initial.completed).toBe(false);
    expect(movePlayer(initial, 'right')).toBe(initial);
  });

  it('starts a fresh attempt from the original definition after completion', () => {
    const definition = stage([[1, 0, 0]], { row: 0, column: 0 });
    const completed = movePlayer(createGameState(definition), 'right');
    const restarted = createGameState(definition);
    expect(completed.completed).toBe(true);
    expect(restarted.completed).toBe(false);
    expect(restarted.map).toEqual([[1, 0, 0]]);
    expect(restarted.player).toEqual({ row: 0, column: 0 });
  });
});

describe('movement paths', () => {
  it.each<[Direction, Position[]]>([
    ['up', [{ row: 1, column: 2 }, { row: 0, column: 2 }]],
    ['down', [{ row: 3, column: 2 }, { row: 4, column: 2 }]],
    ['left', [{ row: 2, column: 1 }, { row: 2, column: 0 }]],
    ['right', [{ row: 2, column: 3 }, { row: 2, column: 4 }]],
  ])('lists each entered cell in order when moving %s', (direction, path) => {
    const initial = createGameState(stage(
      Array.from({ length: 5 }, () => [0, 0, 0, 0, 0]), { row: 2, column: 2 },
    ));
    const plan = planMove(initial, direction);
    expect(plan.path).toEqual(path);
    expect(plan.state.player).toEqual(path.at(-1));
    expect(initial.map.every((row) => row.every((tile) => tile === 0))).toBe(true);
  });

  it('excludes the wall and every cell behind it', () => {
    const initial = createGameState(stage([[1, 0, 2, 0]], { row: 0, column: 0 }));
    expect(planMove(initial, 'right').path).toEqual([{ row: 0, column: 1 }]);
  });

  it('returns an empty path for blocked moves and completed stages', () => {
    const initial = createGameState(stage([[1, 0, 0]], { row: 0, column: 0 }));
    expect(planMove(initial, 'left')).toEqual({ state: initial, path: [] });
    const completed = movePlayer(initial, 'right');
    expect(planMove(completed, 'left')).toEqual({ state: completed, path: [] });
  });
});
