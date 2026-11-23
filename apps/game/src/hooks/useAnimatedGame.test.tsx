// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { StageDefinition } from '@state-maze/stages';
import tutorialStage from '../../../../packages/stages/maps/e48f718a-6381-455c-9434-cdf69d72ba46.json';
import firstStage from '../../../../packages/stages/maps/88d74bf2-d913-4fbd-8244-8a0234d6318c.json';
import { useAnimatedGame } from './useAnimatedGame';

const stage = tutorialStage as StageDefinition;
let session: ReturnType<typeof useAnimatedGame>;
let root: Root;
let container: HTMLDivElement;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let timestamp: number;

function Harness({ enabled, definition }: { enabled: boolean; definition: StageDefinition }) {
  session = useAnimatedGame(definition, enabled);
  return null;
}

async function render(enabled = true, definition = stage) {
  await act(() => root.render(<Harness enabled={enabled} definition={definition} />));
}

async function advance(milliseconds: number) {
  await act(() => {
    timestamp += milliseconds;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(timestamp));
  });
}

async function finishMove() {
  await advance(0);
  await advance(1000);
}

beforeEach(async () => {
  frames = new Map();
  nextFrame = 0;
  timestamp = 0;
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => { frames.delete(id); });
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await render();
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('animated movement buffer', () => {
  it('executes a buffered direction after the current move finishes', async () => {
    await act(() => { session.move('right'); session.move('down'); });
    await finishMove();
    expect(session.game?.player).toEqual({ row: 1, column: 5 });
    expect(session.isAnimating).toBe(true);
    await finishMove();
    expect(session.game?.player).toEqual({ row: 3, column: 5 });
    expect(session.isAnimating).toBe(false);
  });

  it('keeps only the latest requested direction', async () => {
    await act(() => {
      session.move('right');
      session.move('down');
      session.move('left');
    });
    await finishMove();
    await finishMove();
    expect(session.game?.player).toEqual({ row: 1, column: 1 });
    expect(session.isAnimating).toBe(false);
    expect(frames.size).toBe(0);
  });

  it('discards a buffered move blocked at the destination', async () => {
    await act(() => { session.move('right'); session.move('up'); });
    await finishMove();
    expect(session.game?.player).toEqual({ row: 1, column: 5 });
    expect(session.isAnimating).toBe(false);
    expect(frames.size).toBe(0);
  });

  it('clears buffered input when the menu opens and ignores input while open', async () => {
    await act(() => { session.move('right'); session.move('down'); });
    await render(false);
    await act(() => session.move('left'));
    await finishMove();
    await render(true);
    await finishMove();
    expect(session.game?.player).toEqual({ row: 1, column: 5 });
    expect(session.isAnimating).toBe(false);
  });

  it('cancels the animation and buffered direction on restart', async () => {
    await act(() => { session.move('right'); session.move('down'); });
    await advance(0);
    await advance(150);
    await act(() => session.restart());
    await finishMove();
    expect(session.game?.map).toEqual(stage.map);
    expect(session.game?.player).toEqual(stage.playerStart);
    expect(session.isAnimating).toBe(false);
    expect(frames.size).toBe(0);
  });

  it('discards buffered input when the completed move wins the stage', async () => {
    await render(true, firstStage as StageDefinition);
    await act(() => { session.move('right'); session.move('left'); });
    await advance(0);
    await advance(110);
    expect(session.game?.completed).toBe(false);
    await advance(110);
    expect(session.game?.completed).toBe(true);
    expect(session.game?.player).toEqual({ row: 1, column: 3 });
    expect(session.isAnimating).toBe(false);
    expect(frames.size).toBe(0);
  });

  it('clears animation and buffered input when changing stages', async () => {
    await act(() => { session.move('right'); session.move('down'); });
    await render(true, firstStage as StageDefinition);
    await finishMove();
    expect(session.game?.map).toEqual(firstStage.map);
    expect(session.game?.player).toEqual(firstStage.playerStart);
    expect(frames.size).toBe(0);
  });

  it('updates instantly with reduced motion without scheduling animation frames', async () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    await act(() => session.move('right'));
    expect(session.game?.player).toEqual({ row: 1, column: 5 });
    expect(session.isAnimating).toBe(false);
    expect(frames.size).toBe(0);
  });
});
