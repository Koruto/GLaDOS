/**
 * After content height changes, scroll to stay at the bottom only if the user
 * was already pinned to the bottom before the change (so manual scroll-up is respected).
 */
const DEFAULT_THRESHOLD_PX = 140;

export type ScrollPinSnapshot = { sh: number; st: number };

export function commitScrollIfWasPinned(
  el: HTMLDivElement | null,
  prev: ScrollPinSnapshot,
  thresholdPx: number = DEFAULT_THRESHOLD_PX
): ScrollPinSnapshot {
  if (!el) return prev;
  const ch = el.clientHeight;
  const wasPinned =
    prev.sh > 0 && prev.sh - prev.st - ch <= thresholdPx;
  if (wasPinned) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
  return { sh: el.scrollHeight, st: el.scrollTop };
}
