/**
 * A small, faithful simulation of the causal-knowledge-graph runtime
 * (buhera/long-grass causal-knowledge-graph-runtime.tex) applied to a
 * concrete bioprocess: several culture plates, each running its own
 * subtask sequence (seed -> incubate -> read -> passage -> transfer),
 * contending for ONE shared instrument (a plate reader). There is no
 * pre-computed schedule: each plate's module is an autonomous agent that
 * reads the shared instrument's availability (a node value) and either
 * proceeds or queues, exactly as the paper's runtime has no scheduler —
 * only nodes, reads, and emits. The Gantt-chart data this file returns
 * IS the trajectory: the emergent set of nodes and when they executed,
 * not a plan authored in advance. Re-running with a different seed (or
 * different plate count/timing) produces a different trajectory, matching
 * the paper's own claim of structural, not incidental, non-determinism.
 */

export type NodeKind = "seed" | "incubate" | "read" | "passage" | "transfer";

export interface RuntimeNode {
  id: string;
  plate: string;
  kind: NodeKind;
  /** Cycle at which this node's chunk actually ran (emergent — not planned). */
  start: number;
  duration: number;
  /** Whether this node's chunk raised an anomaly (still runs to completion). */
  anomaly: boolean;
  /** True if this node had to queue for the shared instrument before running. */
  queued: boolean;
  queueWait: number;
  /** Causal edges: which prior node(s) this one's execution actually read from. */
  reads: string[];
}

export interface RuntimeResult {
  nodes: RuntimeNode[];
  plates: string[];
  totalCycles: number;
  instrumentUtilisation: number;
  queueEvents: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlateAgentState {
  plate: string;
  stepIdx: number;
  nextReadyAt: number;
  done: boolean;
  lastNodeId: string | null;
}

const SEQUENCE: NodeKind[] = ["seed", "incubate", "read", "passage", "incubate", "read", "transfer"];

/**
 * Runs the simulation to completion. The shared instrument ("reader") is
 * a single-slot resource: at most one plate's `read` chunk may execute
 * per cycle. A plate agent, on reaching a `read` step, checks the
 * instrument's occupancy value on the shared node for that cycle; if
 * occupied, it emits nothing this cycle and re-checks next cycle
 * (queueing), exactly the paper's read -> transform -> emit loop, with
 * no central scheduler deciding who goes first — contention is resolved
 * by whichever plate's agent happens to check an unoccupied instrument
 * first, seeded for reproducibility.
 */
export function runBioprocess(plateCount: number, seed = 7): RuntimeResult {
  const rng = mulberry32(seed);
  const plates = Array.from({ length: plateCount }, (_, i) => `Plate-${String.fromCharCode(65 + i)}`);
  const agents: PlateAgentState[] = plates.map((p) => ({
    plate: p,
    stepIdx: 0,
    nextReadyAt: Math.floor(rng() * 3), // stagger start times slightly, like real bench loading
    done: false,
    lastNodeId: null,
  }));

  const nodes: RuntimeNode[] = [];
  const durations: Record<NodeKind, number> = { seed: 2, incubate: 6, read: 1, passage: 3, transfer: 2 };

  let cycle = 0;
  let instrumentFreeAt = 0;
  let queueEvents = 0;
  const maxCycles = 200;

  while (agents.some((a) => !a.done) && cycle < maxCycles) {
    // Process agents in a rotating order each cycle (no fixed priority —
    // whoever's turn it is this cycle checks the instrument first),
    // matching "no global problem decomposition, no master plan."
    const order = agents
      .map((_, i) => i)
      .filter((i) => !agents[i].done)
      .sort(() => rng() - 0.5);

    for (const idx of order) {
      const agent = agents[idx];
      if (agent.done || agent.nextReadyAt > cycle) continue;
      const kind = SEQUENCE[agent.stepIdx];
      const dur = durations[kind];

      if (kind === "read") {
        if (instrumentFreeAt > cycle) {
          // instrument occupied this cycle — the agent reads that value,
          // decides to wait, and emits nothing; queueing is a consequence
          // of what was read, not a scheduler's decision.
          if (agent.nextReadyAt <= cycle) queueEvents++;
          agent.nextReadyAt = cycle + 1;
          continue;
        }
        instrumentFreeAt = cycle + dur;
      }

      const nodeId = `${agent.plate}-${kind}-${agent.stepIdx}`;
      const anomaly = rng() < 0.08;
      const reads = agent.lastNodeId ? [agent.lastNodeId] : [];
      const queued = kind === "read" && queueEvents > 0 && agent.nextReadyAt === cycle && cycle > 0;

      nodes.push({
        id: nodeId,
        plate: agent.plate,
        kind,
        start: cycle,
        duration: dur,
        anomaly,
        queued,
        queueWait: 0,
        reads,
      });

      agent.lastNodeId = nodeId;
      agent.nextReadyAt = cycle + dur;
      agent.stepIdx++;
      if (agent.stepIdx >= SEQUENCE.length) agent.done = true;
    }

    cycle++;
  }

  // back-fill queueWait for read nodes by comparing to the cycle the
  // agent first attempted (approximated from the previous node's end).
  for (const n of nodes) {
    if (n.kind !== "read") continue;
    const priorForPlate = nodes.filter((m) => m.plate === n.plate && m.start + m.duration <= n.start);
    const readyAt = priorForPlate.length ? Math.max(...priorForPlate.map((m) => m.start + m.duration)) : 0;
    n.queueWait = Math.max(0, n.start - readyAt);
    n.queued = n.queueWait > 0;
  }

  const totalCycles = Math.max(...nodes.map((n) => n.start + n.duration));
  const instrumentBusyCycles = nodes.filter((n) => n.kind === "read").reduce((s, n) => s + n.duration, 0);

  return {
    nodes,
    plates,
    totalCycles,
    instrumentUtilisation: instrumentBusyCycles / totalCycles,
    queueEvents: nodes.filter((n) => n.queued).length,
  };
}
