import { useCallback, useEffect, useRef, useState } from 'react';
import { createGameState, planMove } from '@state-maze/game-core';
import type { Direction, GameState } from '@state-maze/game-core';
import type { Position, StageDefinition, Tile } from '@state-maze/stages';

const millisecondsPerTile = 110;

type View = {
  game: GameState | null;
  visualPosition: Position | null;
  isAnimating: boolean;
};

export function useAnimatedGame(stage: StageDefinition | null) {
  const [view, setView] = useState<View>({ game: null, visualPosition: null, isAnimating: false });
  const currentGame = useRef<GameState | null>(null);
  const frame = useRef<number | null>(null);
  const moving = useRef(false);

  const cancel = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    moving.current = false;
  }, []);

  const restart = useCallback(() => {
    cancel();
    const game = stage ? createGameState(stage) : null;
    currentGame.current = game;
    setView({ game, visualPosition: game?.player ?? null, isAnimating: false });
  }, [stage, cancel]);

  useEffect(() => {
    restart();
    return cancel;
  }, [restart, cancel]);

  const move = useCallback((direction: Direction) => {
    const initial = currentGame.current;
    if (!initial || moving.current) return;
    const plan = planMove(initial, direction);
    if (!plan.path.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      currentGame.current = plan.state;
      setView({ game: plan.state, visualPosition: plan.state.player, isAnimating: false });
      return;
    }

    moving.current = true;
    setView({ game: initial, visualPosition: initial.player, isAnimating: true });
    let started: number | null = null;
    let arrived = 0;
    let map = initial.map;
    const origin = initial.player;

    function tick(timestamp: number) {
      started ??= timestamp;
      const progress = Math.min((timestamp - started) / millisecondsPerTile, plan.path.length);
      const reached = Math.floor(progress);

      if (reached > arrived) {
        const updated: Tile[][] = map.map((row) => [...row]);
        for (let index = arrived; index < reached; index++) {
          const cell = plan.path[index];
          updated[cell.row][cell.column] = plan.state.map[cell.row][cell.column];
        }
        map = updated;
        arrived = reached;
      }

      if (reached === plan.path.length) {
        frame.current = null;
        moving.current = false;
        currentGame.current = plan.state;
        setView({ game: plan.state, visualPosition: plan.state.player, isAnimating: false });
        return;
      }

      const previous = reached === 0 ? origin : plan.path[reached - 1];
      const next = plan.path[reached];
      const fraction = progress - reached;
      setView({
        game: { map, player: previous, completed: false },
        visualPosition: {
          row: previous.row + (next.row - previous.row) * fraction,
          column: previous.column + (next.column - previous.column) * fraction,
        },
        isAnimating: true,
      });
      frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
  }, []);

  return { ...view, move, restart };
}
