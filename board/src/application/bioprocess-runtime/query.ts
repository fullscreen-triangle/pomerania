/**
 * A small runnable-cell interface over the runtime simulation. There is
 * no DSL in the source paper — the runtime is described formally, not
 * as a scripting surface — so this cell exposes the same real simulation
 * (runtime.ts) through a tiny protocol-declaration syntax, letting a
 * viewer set up a run and read back its actual trajectory as text.
 */

import type { CellLine } from "../../deck/DslCell";
import { runBioprocess } from "./runtime";

export function runQuery(source: string): CellLine[] {
  const lines: CellLine[] = [];

  const plateM = source.match(/plates\s+(\d+)/);
  const seedM = source.match(/seed\s+(\d+)/);
  const reportM = /report/.test(source);
  const traceM = source.match(/trace\s+(\S+)/);

  if (!plateM) return [{ kind: "error", text: 'parse error: expected "plates N" to declare the run' }];

  const plateCount = parseInt(plateM[1], 10);
  const seed = seedM ? parseInt(seedM[1], 10) : 7;

  if (plateCount < 1 || plateCount > 12) {
    return [{ kind: "error", text: "runtime error: plates must be between 1 and 12" }];
  }

  const result = runBioprocess(plateCount, seed);
  lines.push({ kind: "info", text: `running: ${plateCount} plates, seed ${seed}` });
  lines.push({ kind: "metric", text: `total cycles: ${result.totalCycles}` });
  lines.push({ kind: "metric", text: `nodes executed: ${result.nodes.length}` });
  lines.push({
    kind: result.queueEvents > 0 ? "warn" : "success",
    text: `queue events on shared instrument: ${result.queueEvents}`,
  });
  lines.push({ kind: "metric", text: `instrument utilisation: ${(result.instrumentUtilisation * 100).toFixed(1)}%` });

  const anomalies = result.nodes.filter((n) => n.anomaly);
  if (anomalies.length > 0) {
    lines.push({ kind: "warn", text: `${anomalies.length} anomalies recorded (run continued to completion):` });
    for (const a of anomalies) lines.push({ kind: "warn", text: `  ${a.plate} · ${a.kind} at cycle ${a.start}` });
  } else {
    lines.push({ kind: "success", text: "no anomalies this run" });
  }

  if (traceM) {
    const plate = traceM[1];
    const plateNodes = result.nodes.filter((n) => n.plate === plate).sort((a, b) => a.start - b.start);
    if (plateNodes.length === 0) {
      lines.push({ kind: "error", text: `runtime error: no plate named "${plate}" (have: ${result.plates.join(", ")})` });
    } else {
      lines.push({ kind: "info", text: `trace for ${plate}:` });
      for (const n of plateNodes) {
        lines.push({
          kind: n.anomaly ? "warn" : "info",
          text: `  [${n.start}-${n.start + n.duration}] ${n.kind}${n.queued ? ` (queued ${n.queueWait})` : ""}${n.anomaly ? " ⚠" : ""}`,
        });
      }
    }
  }

  if (reportM) {
    lines.push({ kind: "info", text: "--- report ---" });
    lines.push({ kind: "info", text: "this is the runtime's only output: no exit code, only a record of what was emitted." });
  }

  return lines;
}
