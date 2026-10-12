import { afterEach, expect, it, vi } from 'vitest';
import { createPlaybackTimer } from './useVisualizer.js';

afterEach(() => vi.useRealTimers());

it('keeps only one pending playback timer and cancels paused or reset work', () => {
  vi.useFakeTimers();
  const timer = createPlaybackTimer();
  const advance = vi.fn();
  timer.schedule(advance, 800);
  timer.schedule(advance, 400);
  expect(vi.getTimerCount()).toBe(1);
  vi.advanceTimersByTime(400);
  expect(advance).toHaveBeenCalledTimes(1);
  timer.schedule(advance, 400);
  timer.cancel();
  vi.runAllTimers();
  expect(advance).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});
