/**
 * A real, small implementation of the Kuramoto ensemble dynamics and the
 * holonomy computation described in the wind-tunnel paper — driving both the
 * live D3 charts and the runnable DSL cells. Nothing here is a fabricated
 * number: every value is an actual simulation output for the parameters the
 * viewer chose.
 */

export interface KuramotoUnit {
  omega: number; // natural frequency
  theta: number; // current phase
}

export interface KuramotoResult {
  rEns: number[]; // order parameter over time
  finalTheta: number[];
  t: number[];
}

/** Simulate Kuramoto dynamics on a fully-connected graph (mean-field). */
export function simulateKuramoto(
  n: number,
  K: number,
  sigmaOmega: number,
  steps = 400,
  dt = 0.05,
  seed = 7
): KuramotoResult {
  const rnd = mulberry32(seed);
  const gauss = () => {
    // Box–Muller
    const u1 = Math.max(rnd(), 1e-9);
    const u2 = rnd();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
  const units: KuramotoUnit[] = Array.from({ length: n }, () => ({
    omega: gauss() * sigmaOmega,
    theta: rnd() * 2 * Math.PI,
  }));

  const rEns: number[] = [];
  const t: number[] = [];
  for (let s = 0; s < steps; s++) {
    // order parameter at this step
    let sumCos = 0;
    let sumSin = 0;
    for (const u of units) {
      sumCos += Math.cos(u.theta);
      sumSin += Math.sin(u.theta);
    }
    const R = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n;
    rEns.push(R);
    t.push(s * dt);

    // Kuramoto update (fully connected, deg = n-1 -> mean-field K/n)
    const newTheta = units.map((u) => {
      let coupling = 0;
      for (const v of units) coupling += Math.sin(v.theta - u.theta);
      return u.theta + dt * (u.omega + (K / n) * coupling);
    });
    units.forEach((u, i) => (u.theta = newTheta[i]));
  }

  return { rEns, finalTheta: units.map((u) => u.theta), t };
}

export function criticalCoupling(sigmaOmega: number): number {
  return (2 * sigmaOmega) / Math.PI;
}

export type Regime = "Turbulent" | "Aperture-dominated" | "Hierarchical cascade" | "Coherent" | "Phase-locked";

export function classifyRegime(rEns: number): Regime {
  if (rEns < 0.3) return "Turbulent";
  if (rEns < 0.5) return "Aperture-dominated";
  if (rEns < 0.8) return "Hierarchical cascade";
  if (rEns < 0.95) return "Coherent";
  return "Phase-locked";
}

/** Stateless holonomy: hol(c, x) = |sum of per-edge drifts| around a cycle. */
export function statelessHolonomy(perEdgeDrift: number, cycleLength: number): number {
  return Math.abs(perEdgeDrift * cycleLength);
}

/** A tiny PRNG so simulations are deterministic and reproducible per seed. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
