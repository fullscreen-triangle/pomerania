/**
 * Federated receivers, ported from
 * four-sided-triangle/equilateral/src/lib/federation.ts. A receiver's
 * candidate projection is a ball of fixed radius (its floor) around each
 * query in a discretised 1D outcome space; federation takes the union of
 * candidate sets, which can only lower the realised floor.
 */

export function makeProjection(radius: number, outcomeSize: number) {
  return (x: number): Set<number> => {
    const cands = new Set<number>();
    for (const off of [radius, -radius]) {
      const j = x + off;
      if (j >= 0 && j < outcomeSize) cands.add(j);
    }
    if (cands.size === 0) cands.add(x);
    return cands;
  };
}

export function realisedFloor(radii: number[], outcomeSize: number): number {
  const projections = radii.map((r) => makeProjection(r, outcomeSize));
  let worst = 0;
  for (let x = 0; x < outcomeSize; x++) {
    const cands = new Set<number>();
    for (const pi of projections) for (const c of pi(x)) cands.add(c);
    let best = Infinity;
    for (const c of cands) best = Math.min(best, Math.abs(x - c));
    worst = Math.max(worst, best);
  }
  return worst;
}
