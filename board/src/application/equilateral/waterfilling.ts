/**
 * Water-filling attention allocation, ported from
 * four-sided-triangle/equilateral/src/lib/waterfilling.ts. Gain profiles
 * follow gamma_i(a) = m_i * (1 - exp(-a/tau_i)); the value-maximising
 * allocation equalises marginal gain across every attended scene at a
 * single shadow price, found here by bisection.
 */

export interface Scene {
  id: string;
  label: string;
  m: number;
  tau: number;
}

export interface WaterFillResult {
  priceStar: number;
  allocations: number[];
  values: number[];
  totalValue: number;
}

function allocAtPrice(scene: Scene, price: number): number {
  const g0 = scene.m / scene.tau;
  if (g0 <= price) return 0;
  return -scene.tau * Math.log((price * scene.tau) / scene.m);
}

export function waterFill(scenes: Scene[], budget: number): WaterFillResult {
  if (scenes.length === 0) return { priceStar: 0, allocations: [], values: [], totalValue: 0 };
  let lo = 0;
  let hi = Math.max(...scenes.map((s) => s.m / s.tau));
  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2;
    const total = scenes.reduce((acc, s) => acc + allocAtPrice(s, mid), 0);
    if (total > budget) lo = mid;
    else hi = mid;
  }
  const priceStar = (lo + hi) / 2;
  const allocations = scenes.map((s) => Math.max(0, allocAtPrice(s, priceStar)));
  const values = scenes.map((s, i) => s.m * (1 - Math.exp(-allocations[i] / s.tau)));
  const totalValue = values.reduce((a, b) => a + b, 0);
  return { priceStar, allocations, values, totalValue };
}

export function gainCurve(scene: Scene, aMax: number, nPoints = 100): { a: number; gamma: number }[] {
  const pts: { a: number; gamma: number }[] = [];
  for (let i = 0; i <= nPoints; i++) {
    const a = (aMax * i) / nPoints;
    pts.push({ a, gamma: scene.m * (1 - Math.exp(-a / scene.tau)) });
  }
  return pts;
}
