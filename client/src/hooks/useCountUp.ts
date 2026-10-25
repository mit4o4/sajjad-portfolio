import { useEffect, useState } from "react";

const DEFAULT_DURATION_MS = 1400;

/**
 * Counts from 0 to `target` once `active` becomes true.
 * Returns the final value immediately when motion is reduced, so the number is always correct at rest.
 */
export function useCountUp(
  target: number,
  active: boolean,
  durationMs = DEFAULT_DURATION_MS
): number {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!active || reduceMotion || target <= 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 4))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, durationMs, reduceMotion]);

  return value;
}
