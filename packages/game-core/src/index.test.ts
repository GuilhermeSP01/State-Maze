import { describe, expect, it } from 'vitest';
import type { Position, StageDefinition, Tile } from '@state-maze/stages';
import { createGameState, movePlayer } from './index';
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
    const initial = createGameState(stage([[2, 1, 0, 0, 2]], { row: 0, column: 1 }));
    const right = movePlayer(initial, 'right');
    const left = movePlayer(right, 'left');
    expect(left.map).toEqual([[2, 0, 0, 1, 2]]);
    expect(left.player).toEqual({ row: 0, column: 1 });
    expect(right.map).toEqual([[2, 1, 1, 1, 2]]);
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
