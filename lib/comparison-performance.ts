// Browser Performance entries contain durations only, never document values.
// Keep only the most recent measurement; no server logging or network requests.
export function measureComparisonWork<T>(stage: "comparison" | "presentation", work: () => T): T {
  const start = performance.now();
  try { return work(); } finally {
    const name = `insurance.${stage}`;
    performance.clearMeasures(name);
    performance.measure(name, { start, duration: performance.now() - start });
  }
}
