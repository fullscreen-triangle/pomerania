/**
 * The character invariant χ — a repo's conserved sense/goal — a faithful
 * TypeScript port of the browser engine documented in the Repo-Federation
 * Tracker design (thrust/src/lib/repo-lens/chi.ts). Runs entirely
 * client-side: symbol extraction (regex line-scan, standing in for
 * `purpose index`) → file/section block graph (containment + reference
 * proximity) → χ = Stoer–Wagner global min-cut of the largest connected
 * component.
 */

export const BETA = 1.0;

export interface Sym {
  name: string;
  kind: string;
  file: string;
  line: number;
  snippet: string;
}

export interface Character {
  chi: number;
  blocks: number;
  fragments: number;
  coreBlocks: number;
  cutSide: string[];
  salient: { file: string; weight: number }[];
}

const MODIFIERS =
  "(?:pub |async |unsafe |export |default |public |private |protected |static |final |abstract |const )*";
const CODE_PATTERNS: { kind: string; re: RegExp }[] = [
  { kind: "fn", re: new RegExp(`^\\s*${MODIFIERS}fn\\s+([A-Za-z_][A-Za-z0-9_]*)`) },
  { kind: "func", re: new RegExp(`^\\s*${MODIFIERS}func(?:tion)?\\s+([A-Za-z_][A-Za-z0-9_]*)`) },
  { kind: "def", re: new RegExp(`^\\s*${MODIFIERS}def\\s+([A-Za-z_][A-Za-z0-9_]*)`) },
  { kind: "struct", re: new RegExp(`^\\s*${MODIFIERS}struct\\s+([A-Za-z_][A-Za-z0-9_]*)`) },
  { kind: "class", re: new RegExp(`^\\s*${MODIFIERS}class\\s+([A-Za-z_][A-Za-z0-9_]*)`) },
];

/** Extract symbols from a small set of in-browser sample "files" (no real
 * repo fetch here — the live tool walks GitHub or the local filesystem;
 * this demo walks a fixed illustrative fixture so the algorithm is real
 * while the input is reproducible without a token). */
export function extractSymbols(path: string, text: string): Sym[] {
  const out: Sym[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 400) continue;
    for (const { kind, re } of CODE_PATTERNS) {
      const m = line.match(re);
      if (m) {
        out.push({ name: m[1], kind, file: path, line: i + 1, snippet: line.trim() });
        break;
      }
    }
  }
  return out;
}

class BlockGraph {
  labels: string[];
  w: number[][];

  constructor(labels: string[], w: number[][]) {
    this.labels = labels;
    this.w = w;
  }

  components(): number[][] {
    const n = this.labels.length;
    const seen = new Array<boolean>(n).fill(false);
    const comps: number[][] = [];
    for (let start = 0; start < n; start++) {
      if (seen[start]) continue;
      const stack = [start];
      seen[start] = true;
      const comp: number[] = [];
      while (stack.length) {
        const v = stack.pop()!;
        comp.push(v);
        for (let u = 0; u < n; u++) {
          if (!seen[u] && this.w[v][u] > 0) {
            seen[u] = true;
            stack.push(u);
          }
        }
      }
      comps.push(comp);
    }
    comps.sort((a, b) => b.length - a.length);
    return comps;
  }

  largestComponentSubgraph(): BlockGraph {
    const comps = this.components();
    const core = comps[0] ?? [];
    const labels = core.map((i) => this.labels[i]);
    const k = core.length;
    const w = Array.from({ length: k }, () => new Array<number>(k).fill(0));
    for (let ni = 0; ni < k; ni++)
      for (let nj = 0; nj < k; nj++) w[ni][nj] = this.w[core[ni]][core[nj]];
    return new BlockGraph(labels, w);
  }

  topByDegree(k: number): { file: string; weight: number }[] {
    const ds = this.labels.map((file, i) => ({ file, weight: this.w[i].reduce((s, x) => s + x, 0) }));
    ds.sort((a, b) => b.weight - a.weight || (a.file < b.file ? -1 : 1));
    return ds.slice(0, k);
  }

  /** Stoer–Wagner global minimum cut. Deterministic, O(V^3). */
  stoerWagnerMinCut(): [number, number[]] {
    const n = this.labels.length;
    const w = this.w.map((row) => row.slice());
    const groups: number[][] = Array.from({ length: n }, (_, i) => [i]);
    let alive = Array.from({ length: n }, (_, i) => i);
    let bestCut = Infinity;
    let bestSide: number[] = [];

    while (alive.length > 1) {
      const m = alive.length;
      const added = new Array<boolean>(m).fill(false);
      const weights = new Array<number>(m).fill(0);
      const order: number[] = [];
      for (let step = 0; step < m; step++) {
        let sel = -1;
        let best = -Infinity;
        for (let i = 0; i < m; i++) {
          if (!added[i] && weights[i] > best) {
            best = weights[i];
            sel = i;
          }
        }
        added[sel] = true;
        order.push(sel);
        for (let i = 0; i < m; i++) if (!added[i]) weights[i] += w[alive[sel]][alive[i]];
      }
      const tLocal = order[m - 1];
      const sLocal = order[m - 2];
      const cutOfPhase = weights[tLocal];
      const t = alive[tLocal];
      const s = alive[sLocal];
      if (cutOfPhase < bestCut) {
        bestCut = cutOfPhase;
        bestSide = groups[t].slice();
      }
      groups[s] = groups[s].concat(groups[t]);
      groups[t] = [];
      for (const x of alive) {
        if (x !== s && x !== t) {
          w[s][x] += w[t][x];
          w[x][s] += w[x][t];
        }
      }
      alive = alive.filter((x) => x !== t);
    }

    let side = bestSide;
    if (side.length * 2 > n) {
      const inSide = new Set(side);
      side = Array.from({ length: n }, (_, i) => i).filter((i) => !inSide.has(i));
    }
    side.sort((a, b) => a - b);
    return [bestCut, side];
  }

  character(): Character {
    const n = this.labels.length;
    if (n < 2) {
      return {
        chi: BETA,
        blocks: n,
        fragments: 1,
        coreBlocks: n,
        cutSide: this.labels.slice(),
        salient: this.topByDegree(8),
      };
    }
    const [chi, side] = this.stoerWagnerMinCut();
    return {
      chi,
      blocks: n,
      fragments: 1,
      coreBlocks: n,
      cutSide: side.map((i) => this.labels[i]),
      salient: this.topByDegree(8),
    };
  }
}

function addEdge(w: number[][], i: number, j: number, delta: number) {
  w[i][j] += delta;
  w[j][i] += delta;
}

function buildGraph(symbols: Sym[]): BlockGraph {
  const labelOf = new Map<string, number>();
  const labels: string[] = [];
  const namesIn: string[][] = [];
  const snippetsIn: string[] = [];

  for (const s of symbols) {
    let id = labelOf.get(s.file);
    if (id === undefined) {
      id = labels.length;
      labelOf.set(s.file, id);
      labels.push(s.file);
      namesIn.push([]);
      snippetsIn.push("");
    }
    namesIn[id].push(s.name);
    snippetsIn[id] += s.snippet.toLowerCase() + "\n";
  }

  const n = labels.length;
  const w = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  const comps = labels.map((f) => f.split(/[/\\]/));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let shared = 0;
      const a = comps[i],
        b = comps[j];
      const lim = Math.min(a.length, b.length);
      while (shared < lim && a[shared] === b[shared]) shared++;
      if (shared > 0) addEdge(w, i, j, BETA * shared);
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      let refs = 0;
      for (const name of namesIn[i]) {
        if (name.length >= 4 && snippetsIn[j].includes(name.toLowerCase())) refs++;
      }
      if (refs > 0) addEdge(w, i, j, BETA * refs);
    }
  }

  return new BlockGraph(labels, w);
}

export function computeCharacter(symbols: Sym[]): Character {
  const graph = buildGraph(symbols);
  const fragments = graph.components().length;
  const salient = graph.topByDegree(8);
  const core = graph.largestComponentSubgraph();
  const character = core.character();
  character.blocks = graph.labels.length;
  character.fragments = fragments;
  character.coreBlocks = core.labels.length;
  character.salient = salient;
  return character;
}
