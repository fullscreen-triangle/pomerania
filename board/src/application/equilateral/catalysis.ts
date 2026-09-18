/**
 * Catalytic composition, ported from
 * four-sided-triangle/equilateral/src/lib/catalysis.ts.
 */

export function compositePower(powers: number[]): number {
  let residual = 1;
  for (const p of powers) residual *= 1 - p;
  return 1 - residual;
}

export function repeatedCurve(power: number, maxReps: number): number[] {
  const curve: number[] = [];
  for (let k = 0; k <= maxReps; k++) curve.push(1 - Math.pow(1 - power, k));
  return curve;
}
