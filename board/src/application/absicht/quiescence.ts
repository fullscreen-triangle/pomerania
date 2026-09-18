/**
 * The four-column quiescence relaxation, in this paper's own
 * "opaque pair" framing (central + provoked columns; Quiescence Theorem;
 * Route-Audit Theorem). Structurally the same construction as
 * four-sided-triangle/equilateral's relaxation.ts, since both papers
 * build it from the same primitives — reimplemented here independently
 * to keep this deck's engine self-contained.
 */

export function crossDemand(v1: number[], v2: number[]): number {
  let sum = 0;
  for (let i = 0; i < v1.length; i++) sum += (v1[i] - v2[i]) ** 2;
  return Math.sqrt(sum);
}

export interface RelaxationStep {
  round: number;
  central: number;
  provoked: number;
  maxResidual: number;
}

export interface RelaxationResult {
  steps: RelaxationStep[];
  quiescent: boolean;
  finalCentral: number;
  finalProvoked: number;
}

export function relax(
  a0: number[],
  b0: number[],
  pa0: number[],
  pb0: number[],
  tolerance: number,
  maxRounds = 60,
  freezeProvoked = false
): RelaxationResult {
  let a = [...a0];
  let b = [...b0];
  let pa = [...pa0];
  let pb = [...pb0];
  const steps: RelaxationStep[] = [];
  let quiescent = false;

  for (let round = 0; round < maxRounds; round++) {
    const dCentral = crossDemand(a, b);
    const dProvoked = crossDemand(pa, pb);
    const maxResidual = Math.max(dCentral, dProvoked);
    steps.push({ round, central: dCentral, provoked: dProvoked, maxResidual });
    if (maxResidual < tolerance) {
      quiescent = true;
      break;
    }
    const step = 0.3;
    const aNew = a.map((x, i) => x + step * (b[i] - x));
    const bNew = b.map((y, i) => y + step * (a[i] - y));
    a = aNew;
    b = bNew;
    if (!freezeProvoked) {
      const paNew = pa.map((x, i) => x + step * (pb[i] - x));
      const pbNew = pb.map((y, i) => y + step * (pa[i] - y));
      pa = paNew;
      pb = pbNew;
    }
  }

  const last = steps[steps.length - 1];
  return { steps, quiescent, finalCentral: last.central, finalProvoked: last.provoked };
}

/** Verification-floor bound: floor(R_AB) <= floor(A) + floor(B) + eta_AB. */
export function verificationFloorBound(floorA: number, floorB: number, disagreementRate: number): number {
  return floorA + floorB + disagreementRate;
}
