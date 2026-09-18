/**
 * Typed access to the paper's own validation suite output
 * (validation.json, copied verbatim from absicht/web/public/data — the
 * real numbers reported in the manuscript's Experiments 1-9, produced by
 * run_validation.py). Used to drive charts from real recorded trial data
 * rather than re-deriving or approximating it in the browser.
 */

import raw from "./validation.json";

export interface Exp1 {
  ratios: number[];
  mean: number;
  ci_lo: number;
  ci_hi: number;
}
export interface Exp2 {
  by_radius: Record<string, number[]>;
}
export interface Exp3 {
  N: number[];
  empirical: number[];
  theoretical: number[];
}
export interface ExpBandSeries {
  sizes?: number[];
  budgets?: number[];
  etas?: number[];
  mean: number[];
  lo: number[];
  hi: number[];
  bound?: number;
  min_observed?: number[];
}
export interface Exp6 {
  sizes: number[];
  certified_mean: number[];
  certified_lo: number[];
  certified_hi: number[];
  baseline_mean: number[];
}
export interface Exp7 {
  convergent: number[];
  nonconvergent: number[];
}
export interface Exp8 {
  central: number[];
  provoked: number[];
  ctrl_central: number[];
  ctrl_provoked: number[];
  detect_audit: number;
  detect_central: number;
}

export interface ValidationData {
  exp1: Exp1;
  exp2: Exp2;
  exp3: Exp3;
  exp4: ExpBandSeries;
  exp5: ExpBandSeries;
  exp6: Exp6;
  exp7: Exp7;
  exp8: Exp8;
  exp9: ExpBandSeries;
}

export const validation = raw as unknown as ValidationData;
