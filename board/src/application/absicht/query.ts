/**
 * A small runnable-cell language over the paper's own primitives — there
 * is no DSL in the source implementation (absicht/web is a static chart
 * skin; the real algorithms live in a Python validation script), so this
 * is a thin interpreter standing in for the paper's own vocabulary:
 * declare receivers with a floor and a per-invocation cost, federate
 * them, and route a fixed budget across them by the exact knapsack rule
 * of the Cascade Theorem. Every "route" answer is a real DP/greedy
 * computation, not a canned value.
 */

import type { CellLine } from "../../deck/DslCell";
import { federationFloor, multiplicativeFloor } from "./federation";
import { floorToValue, knapsackExact, knapsackGreedy } from "./knapsack";

interface Receiver {
  name: string;
  floor: number;
  cost: number;
}

export function runQuery(source: string): CellLine[] {
  const lines: CellLine[] = [];
  const receivers: Receiver[] = [];

  const stmts = source
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("#"));

  if (stmts.length === 0) return [{ kind: "warn", text: "empty program — nothing to run" }];

  for (const stmt of stmts) {
    const receiverM = stmt.match(/^receiver\s+(\S+)\s+floor\s+([\d.]+)\s+cost\s+([\d.]+)$/);
    const federateM = stmt.match(/^federate$/);
    const routeM = stmt.match(/^route\s+budget\s+([\d.]+)$/);

    if (receiverM) {
      const [, name, floor, cost] = receiverM;
      receivers.push({ name, floor: parseFloat(floor), cost: parseFloat(cost) });
      lines.push({ kind: "info", text: `receiver ${name} declared: floor=${floor}, cost=${cost}` });
    } else if (federateM) {
      if (receivers.length === 0) {
        lines.push({ kind: "error", text: "runtime error: no receivers declared yet" });
        continue;
      }
      const floors = receivers.map((r) => r.floor);
      const fed = federationFloor(floors);
      const mult = multiplicativeFloor(floors);
      lines.push({
        kind: "metric",
        text: `federation floor = min(${floors.join(", ")}) = ${fed.toFixed(3)}  (union construction, Federation Theorem)`,
      });
      lines.push({ kind: "metric", text: `multiplicative floor (independent failure) = ${mult.toFixed(3)}` });
    } else if (routeM) {
      const [, budget] = routeM;
      const b = parseFloat(budget);
      if (receivers.length === 0) {
        lines.push({ kind: "error", text: "runtime error: no receivers declared yet" });
        continue;
      }
      const values = receivers.map((r) => floorToValue(r.floor));
      const costs = receivers.map((r) => r.cost);
      const exact = knapsackExact(values, costs, b);
      const greedy = knapsackGreedy(values, costs, b);
      const ratio = exact.value > 0 ? greedy.value / exact.value : 1;
      lines.push({ kind: "info", text: `routing ${receivers.length} receiver(s) under budget ${b}` });
      lines.push({
        kind: "metric",
        text: `exact (DP):    {${receivers.filter((_, i) => exact.selected[i]).map((r) => r.name).join(", ")}}  value=${exact.value.toFixed(3)}`,
      });
      lines.push({
        kind: "metric",
        text: `greedy:        {${receivers.filter((_, i) => greedy.selected[i]).map((r) => r.name).join(", ")}}  value=${greedy.value.toFixed(3)}`,
      });
      const worstBound = 1 - 1 / Math.E;
      lines.push({
        kind: ratio >= worstBound - 1e-9 ? "success" : "warn",
        text: `greedy/exact ratio = ${ratio.toFixed(4)}  (worst-case guarantee 1-1/e = ${worstBound.toFixed(4)})`,
      });
    } else {
      lines.push({
        kind: "error",
        text: `parse error: unrecognised statement "${stmt}" (expected receiver/federate/route)`,
      });
    }
  }

  return lines;
}
