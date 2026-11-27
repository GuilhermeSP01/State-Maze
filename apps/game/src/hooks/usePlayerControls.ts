import { useEffect, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, PointerEvent } from 'react';
import type { Direction } from '@state-maze/game-core';

const keyDirections: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

const minimumSwipeDistance = 24;

type SwipeStart = { pointerId: number; x: number; y: number };
type BoardInputHandlers = Pick<HTMLAttributes<HTMLDivElement>,
  'onKeyDown' | 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel' | 'onLostPointerCapture'>;

export function usePlayerControls(
  onMove: (direction: Direction) => void,
  enabled: boolean,
): BoardInputHandlers {
  const swipeStart = useRef<SwipeStart | null>(null);

  useEffect(() => {
    swipeStart.current = null;
  }, [enabled]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const direction = keyDirections[event.key];
    if (!enabled || !direction || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    if (!event.repeat) onMove(direction);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || !event.isPrimary || event.button !== 0) return;
    swipeStart.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
  }

  function handleSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    if (!enabled || !start || start.pointerId !== event.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < minimumSwipeDistance) return;
    if (Math.abs(dx) === Math.abs(dy)) return;

    swipeStart.current = null;
    onMove(Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up'));
  }

  function clearSwipe(event: PointerEvent<HTMLDivElement>) {
    if (swipeStart.current?.pointerId === event.pointerId) swipeStart.current = null;
  }

  return {
    onKeyDown: handleKeyDown,
    onPointerDown: handlePointerDown,
    onPointerMove: handleSwipe,
    onPointerUp: (event) => {
      handleSwipe(event);
      clearSwipe(event);
    },
    onPointerCancel: clearSwipe,
    onLostPointerCapture: clearSwipe,
  };
}
