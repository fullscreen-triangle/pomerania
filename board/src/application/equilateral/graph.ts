/**
 * Contact graphs and exact minimum cut, mirroring the manuscript's
 * Definition (contact graph; the medium) and Definition (separation
 * cost). A faithful port of the live implementation at
 * four-sided-triangle/equilateral/src/lib/graph.ts. Every "search,"
 * "content," "meaning," and "receiver" computation here reduces to a
 * minimum cut on a finite weighted graph, computed exactly via
 * Edmonds-Karp (BFS-augmenting-path max-flow), never approximated.
 */

export const MEDIUM = "__medium__";

export interface ContactGraph {
  adj: Map<string, Map<string, number>>;
}

export function newGraph(): ContactGraph {
  const g: ContactGraph = { adj: new Map() };
  g.adj.set(MEDIUM, new Map());
  return g;
}

function ensureNode(g: ContactGraph, id: string) {
  if (!g.adj.has(id)) g.adj.set(id, new Map());
}

export function addClaim(g: ContactGraph, id: string, mediumWeight: number) {
  ensureNode(g, id);
  addContact(g, MEDIUM, id, mediumWeight);
}

export function addContact(g: ContactGraph, u: string, v: string, weight: number) {
  ensureNode(g, u);
  ensureNode(g, v);
  const existingUV = g.adj.get(u)!.get(v) ?? 0;
  g.adj.get(u)!.set(v, existingUV + weight);
  const existingVU = g.adj.get(v)!.get(u) ?? 0;
  g.adj.get(v)!.set(u, existingVU + weight);
}

export function nodes(g: ContactGraph): string[] {
  return Array.from(g.adj.keys());
}

export function claims(g: ContactGraph): string[] {
  return nodes(g).filter((n) => n !== MEDIUM);
}

export function minCut(
  g: ContactGraph,
  source: string,
  sink: string
): { value: number; sourceSide: Set<string> } {
  if (source === sink) return { value: 0, sourceSide: new Set([source]) };

  const residual = new Map<string, Map<string, number>>();
  for (const [u, edges] of g.adj) residual.set(u, new Map(edges));

  const nodeList = nodes(g);
  if (!residual.has(source) || !residual.has(sink)) {
    return { value: 0, sourceSide: new Set(nodeList) };
  }

  let flow = 0;

  function bfsPath(): string[] | null {
    const prev = new Map<string, string>();
    const visited = new Set<string>([source]);
    const queue: string[] = [source];
    while (queue.length > 0) {
      const u = queue.shift()!;
      if (u === sink) break;
      const edges = residual.get(u);
      if (!edges) continue;
      for (const [v, cap] of edges) {
        if (cap > 1e-12 && !visited.has(v)) {
          visited.add(v);
          prev.set(v, u);
          queue.push(v);
        }
      }
    }
    if (!visited.has(sink)) return null;
    const path: string[] = [sink];
    let cur = sink;
    while (cur !== source) {
      const p = prev.get(cur)!;
      path.push(p);
      cur = p;
    }
    path.reverse();
    return path;
  }

  for (;;) {
    const path = bfsPath();
    if (!path) break;
    let bottleneck = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const cap = residual.get(path[i])!.get(path[i + 1])!;
      bottleneck = Math.min(bottleneck, cap);
    }
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      residual.get(a)!.set(b, residual.get(a)!.get(b)! - bottleneck);
      const back = residual.get(b)!.get(a) ?? 0;
      residual.get(b)!.set(a, back + bottleneck);
    }
    flow += bottleneck;
  }

  const sourceSide = new Set<string>([source]);
  const queue2: string[] = [source];
  while (queue2.length > 0) {
    const u = queue2.shift()!;
    const edges = residual.get(u);
    if (!edges) continue;
    for (const [v, cap] of edges) {
      if (cap > 1e-12 && !sourceSide.has(v)) {
        sourceSide.add(v);
        queue2.push(v);
      }
    }
  }

  return { value: flow, sourceSide };
}

export function separationCost(g: ContactGraph, v: string): number {
  return minCut(g, v, MEDIUM).value;
}

export function alignment(g: ContactGraph, x: string, target: string): number {
  if (x === target) return separationCost(g, x);
  return minCut(g, x, target).value;
}

export function floorOfGraph(g: ContactGraph): number {
  const cs = claims(g);
  if (cs.length === 0) return 0;
  return Math.min(...cs.map((c) => separationCost(g, c)));
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomContactGraph(
  nClaims: number,
  seed: number,
  opts?: { minW?: number; maxW?: number; density?: number }
): ContactGraph {
  const minW = opts?.minW ?? 1.0;
  const maxW = opts?.maxW ?? 5.0;
  const density = opts?.density ?? 0.35;
  const rng = mulberry32(seed);
  const g = newGraph();
  const names = Array.from({ length: nClaims }, (_, i) => `c${i}`);
  for (const c of names) addClaim(g, c, minW + rng() * (maxW - minW));
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (rng() < density) addContact(g, names[i], names[j], minW + rng() * (maxW - minW));
    }
  }
  return g;
}
