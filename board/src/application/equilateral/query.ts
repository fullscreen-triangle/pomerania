/**
 * A small runnable-cell language over the contact-graph primitives
 * (graph.ts), standing in for the paper's own formalism ("individuation,
 * not lookup"). There is no DSL in the source implementation — Equilateral
 * exposes its algorithms as direct TypeScript calls from sliders — so this
 * is a thin interpreter over the same real functions, letting a viewer
 * build a small contact graph and query it: register claims and contacts,
 * then ask for a claim's separation cost, alignment to another claim, or
 * the graph's floor. Every answer is a live min-cut, not a canned value.
 */

import type { CellLine } from "../../deck/DslCell";
import { addClaim, addContact, alignment, claims, floorOfGraph, newGraph, separationCost, type ContactGraph } from "./graph";

export function runQuery(source: string): CellLine[] {
  const lines: CellLine[] = [];
  let g: ContactGraph = newGraph();

  const stmts = source
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("#"));

  if (stmts.length === 0) return [{ kind: "warn", text: "empty program — nothing to run" }];

  for (const stmt of stmts) {
    const claimM = stmt.match(/^claim\s+(\S+)\s+([\d.]+)$/);
    const contactM = stmt.match(/^contact\s+(\S+)\s+(\S+)\s+([\d.]+)$/);
    const sepM = stmt.match(/^separation\s+(\S+)$/);
    const alignM = stmt.match(/^alignment\s+(\S+)\s+(\S+)$/);
    const floorM = stmt.match(/^floor$/);
    const listM = stmt.match(/^claims$/);

    if (claimM) {
      const [, id, w] = claimM;
      addClaim(g, id, parseFloat(w));
      lines.push({ kind: "info", text: `claim ${id} added, medium-weight ${w}` });
    } else if (contactM) {
      const [, u, v, w] = contactM;
      addContact(g, u, v, parseFloat(w));
      lines.push({ kind: "info", text: `contact ${u} — ${v} added, weight ${w}` });
    } else if (sepM) {
      const [, v] = sepM;
      if (!g.adj.has(v)) {
        lines.push({ kind: "error", text: `runtime error: no claim "${v}" in this graph` });
        continue;
      }
      const s = separationCost(g, v);
      lines.push({ kind: "metric", text: `separation(${v}) = ${s.toFixed(3)}  (min-cut against the medium)` });
    } else if (alignM) {
      const [, x, target] = alignM;
      if (!g.adj.has(x) || !g.adj.has(target)) {
        lines.push({ kind: "error", text: `runtime error: unknown claim in alignment(${x}, ${target})` });
        continue;
      }
      const a = alignment(g, x, target);
      lines.push({ kind: "metric", text: `alignment(${x}, ${target}) = ${a.toFixed(3)}  (min-cut between them)` });
    } else if (floorM) {
      const f = floorOfGraph(g);
      lines.push({ kind: "metric", text: `floor(graph) = ${f.toFixed(3)}  (worst-case separation over all claims)` });
    } else if (listM) {
      const cs = claims(g);
      lines.push({ kind: "info", text: cs.length ? cs.join(", ") : "(no claims yet)" });
    } else {
      lines.push({
        kind: "error",
        text: `parse error: unrecognised statement "${stmt}" (expected claim/contact/separation/alignment/floor/claims)`,
      });
    }
  }

  return lines;
}
