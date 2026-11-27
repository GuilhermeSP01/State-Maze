// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import i18n, { i18nReady } from '../i18n';

let container: HTMLDivElement;
let root: Root;

function element<T extends HTMLElement>(selector: string): T {
  const match = container.querySelector<T>(selector);
  if (!match) throw new Error(`Missing element: ${selector}`);
  return match;
}

async function click(selector: string) {
  await act(() => element(selector).click());
  await act(() => vi.dynamicImportSettled());
}

async function play(...keys: string[]) {
  await act(() => {
    const focused = document.activeElement;
    for (const key of keys) {
      focused?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    }
  });
}

beforeEach(async () => {
  await i18nReady;
  await i18n.changeLanguage('pt-BR');
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(() => root.render(<MemoryRouter><App /></MemoryRouter>));
  await act(() => vi.dynamicImportSettled());
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('stage navigation', () => {
  it('advances on demand, disables the action on the last stage and restores catalog focus', async () => {
    await click('.catalog-stage');
    expect(element('#stage-goal').textContent).toBe('Deixe todas as casas amarelas.');
    expect(document.activeElement).toBe(element('.stage-board'));

    await play('ArrowRight');
    expect(document.activeElement).toBe(element('#completion-title'));
    expect(element('h1').textContent).toBe('Fase 1');
    expect(element<HTMLButtonElement>('.next-stage').disabled).toBe(false);

    await click('.next-stage');
    expect(element('h1').textContent).toBe('Fase 2');
    expect(document.activeElement).toBe(element('.stage-board'));
    await play('ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft');

    await click('.next-stage');
    expect(element('h1').textContent).toBe('Fase 3');
    await play('ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowDown');
    expect(element<HTMLButtonElement>('.next-stage').disabled).toBe(true);

    await click('.completion-actions a');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Fase 3');
  });

  it('blocks board commands during pause and returns focus after closing or restarting', async () => {
    await click('.catalog-stage');
    await click('.pause-button');
    const dialog = element<HTMLDialogElement>('dialog');
    expect(dialog.open).toBe(true);
    expect(document.activeElement?.textContent).toBe('Retomar');

    await play('ArrowRight');
    expect(container.querySelector('.stage-completion')).toBeNull();

    await act(() => dialog.dispatchEvent(new Event('cancel', { cancelable: true })));
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(element('.pause-button'));

    await play('ArrowRight');
    expect(container.querySelector('.stage-completion')).toBeNull();

    await click('.pause-button');
    await click('dialog button:nth-of-type(2)');
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(element('.stage-board'));
    await play('ArrowRight');
    expect(container.querySelector('.stage-completion')).not.toBeNull();

    await click('.completion-actions button:last-child');
    expect(container.querySelector('.stage-completion')).toBeNull();
    expect(document.activeElement).toBe(element('.stage-board'));
  });
});

it('moves as soon as a swipe is recognized and consumes it once', async () => {
  await click('.catalog-stage:nth-of-type(2)');
  const board = element('.stage-board');
  const player = () => element('[aria-label$=", jogador"]');
  const start = player();
  const destination = element('.stage-board-row:nth-child(4) .stage-tile:nth-child(2)');
  const swipe = (type: string, clientX: number, clientY: number) => act(() => {
    board.dispatchEvent(new PointerEvent(type, {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      clientX,
      clientY,
      bubbles: true,
    }));
  });

  await swipe('pointerdown', 0, 0);
  await swipe('pointermove', 0, 23);
  expect(player()).toBe(start);
  await swipe('pointermove', 24, 24);
  expect(player()).toBe(start);
  await swipe('pointermove', 0, 24);
  expect(player()).toBe(destination);

  await swipe('pointermove', 80, 24);
  await swipe('pointerup', 80, 24);
  expect(player()).toBe(destination);

  await swipe('pointerdown', 0, 0);
  await swipe('pointercancel', 0, 0);
  await swipe('pointerup', 24, 0);
  expect(player()).toBe(destination);

  await swipe('pointerdown', 0, 0);
  await swipe('pointerup', 24, 0);
  expect(player()).toBe(element('.stage-board-row:nth-child(4) .stage-tile:nth-child(4)'));
});
