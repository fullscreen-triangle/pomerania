/**
 * Cascade allocation as a 0-1 knapsack, ported faithfully from the
 * validation suite's own Python (absicht/docs/research-domain-specific-models/
 * validation/run_validation.py: knapsack_exact, knapsack_greedy). Minimising
 * a federation's floor under a budget is exactly maximising
 * sum(a_i * v_i) with v_i = log(omega/(omega - floor_i)), subject to
 * sum(a_i * cost_i) <= budget — solved exactly by DP on a discretised
 * budget axis, and near-exactly by the value-density greedy rule.
 */

export interface KnapsackResult {
  value: number;
  selected: boolean[];
}

export function knapsackExact(
  values: number[],
  costs: number[],
  budget: number,
  granularity = 200
): KnapsackResult {
  const scale = granularity / budget;
  const costsI = costs.map((c) => Math.max(1, Math.round(c * scale)));
  const cap = granularity;
  const k = values.length;
  let dp = new Array<number>(cap + 1).fill(0);
  const choice: boolean[][] = Array.from({ length: k }, () => new Array<boolean>(cap + 1).fill(false));

  for (let i = 0; i < k; i++) {
    const c = costsI[i];
    const v = values[i];
    const newDp = dp.slice();
    if (c <= cap) {
      for (let cap_ = c; cap_ <= cap; cap_++) {
        const cand = dp[cap_ - c] + v;
        if (cand > newDp[cap_]) {
          newDp[cap_] = cand;
          choice[i][cap_] = true;
        }
      }
    }
    dp = newDp;
  }

  const sel = new Array<boolean>(k).fill(false);
  let rem = cap;
  for (let i = k - 1; i >= 0; i--) {
    if (choice[i][rem]) {
      sel[i] = true;
      rem -= costsI[i];
    }
  }
  return { value: dp[cap], selected: sel };
}

export function knapsackGreedy(values: number[], costs: number[], budget: number): KnapsackResult {
  const k = values.length;
  const density = values.map((v, i) => v / costs[i]);
  const order = Array.from({ length: k }, (_, i) => i).sort((a, b) => density[b] - density[a]);
  let rem = budget;
  const sel = new Array<boolean>(k).fill(false);
  let total = 0;
  for (const i of order) {
    if (costs[i] <= rem) {
      sel[i] = true;
      rem -= costs[i];
      total += values[i];
    }
  }
  return { value: total, selected: sel };
}

export function floorToValue(floor: number, omega = 1.0): number {
  return Math.log(omega / (omega - floor));
}
