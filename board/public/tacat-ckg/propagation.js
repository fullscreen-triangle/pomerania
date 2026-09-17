/* Figures for the propagation page.
   Fig 8: a small network read as potentials / fluxes / recovered graph.
   Fig 9: coordinate degeneracy across four pathways.
*/
import { el, clear, text, line, slider, toggles } from "./lib.js";

/* ------------------------------------------------------------------ fig 8 */
/* Six-species chain with a branch — glycolysis-shaped, deliberately small so
   every number on screen can be checked by hand. */

const SPECIES = [
  { id: "glc", label: "glucose",  x: 90,  y: 200, mu0: -917.2, c: 5.0e-3 },
  { id: "g6p", label: "G6P",      x: 235, y: 130, mu0: -1318.0, c: 8.3e-5 },
  { id: "f6p", label: "F6P",      x: 380, y: 130, mu0: -1315.7, c: 2.2e-5 },
  { id: "fbp", label: "FBP",      x: 525, y: 130, mu0: -2202.0, c: 3.1e-5 },
  { id: "dhap", label: "DHAP",    x: 660, y: 200, mu0: -1296.3, c: 1.4e-4 },
  { id: "g3p", label: "GAP",      x: 525, y: 285, mu0: -1288.6, c: 1.9e-5 },
];

const RXN = [
  ["glc", "g6p", 1.0], ["g6p", "f6p", 0.7], ["f6p", "fbp", 1.4],
  ["fbp", "dhap", 0.9], ["fbp", "g3p", 0.9], ["dhap", "g3p", 1.2],
];

const RT = 2.577; // kJ/mol at 310 K
let poolScale = 0, kScale = 1, layer = "flux";

function solve() {
  const mu = {}, conc = {};
  for (const s of SPECIES) {
    const c = s.c * Math.pow(10, s.id === "glc" ? poolScale : 0);
    conc[s.id] = c;
    mu[s.id] = s.mu0 + RT * Math.log(c);
  }
  const flux = RXN.map(([u, v, k]) => {
    const G = (k * kScale * conc[u]) / RT;
    const J = G * (mu[u] - mu[v]);
    return { u, v, G, J };
  });
  const maxAbs = Math.max(...flux.map((f) => Math.abs(f.J)), 1e-12);
  const floor = maxAbs * 0.08;           // contact floor: prune weak edges
  return { mu, conc, flux, maxAbs, floor };
}

const svg8 = document.getElementById("circuit");
const byId = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

function drawCircuit() {
  clear(svg8);
  const { mu, conc, flux, maxAbs, floor } = solve();
  const g = el("g");

  const muVals = Object.values(mu);
  const muLo = Math.min(...muVals), muHi = Math.max(...muVals);

  for (const f of flux) {
    const A = byId[f.u], B = byId[f.v];
    const strong = Math.abs(f.J) >= floor;
    if (layer === "graph" && !strong) continue;

    const width = layer === "flux"
      ? Math.max(0.8, Math.min(9, (Math.abs(f.J) / maxAbs) * 9))
      : layer === "graph" ? 2.2 : 1.2;

    const col = layer === "graph" ? "var(--accent)"
      : f.J >= 0 ? "var(--good)" : "var(--warm)";

    g.appendChild(el("line", {
      x1: A.x, y1: A.y, x2: B.x, y2: B.y,
      stroke: col, "stroke-width": width, opacity: strong ? 0.85 : 0.22,
      "marker-end": layer === "graph" ? "url(#ar)" : null,
    }));

    if (layer === "flux") {
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      g.appendChild(text(mx, my - 7, `J ${f.J.toFixed(2)}`, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--ink-faint)" }));
    }
  }

  for (const s of SPECIES) {
    let fill = "rgba(255,255,255,0.05)", stroke = "var(--ink-faint)";
    if (layer === "potential") {
      const t = (mu[s.id] - muLo) / Math.max(1e-9, muHi - muLo);
      fill = `rgba(110,168,254,${(0.10 + t * 0.42).toFixed(3)})`;
      stroke = "var(--accent)";
    }
    g.appendChild(el("circle", { cx: s.x, cy: s.y, r: 27, fill, stroke, "stroke-width": 1.6 }));
    g.appendChild(text(s.x, s.y + 4, s.label, "svg-label",
      { "text-anchor": "middle", fill: "var(--ink)" }));
    if (layer === "potential") {
      g.appendChild(text(s.x, s.y + 42, `μ ${mu[s.id].toFixed(0)}`, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--accent)" }));
    }
  }

  const captions = {
    potential: "node voltages — chemical potentials μ = μ° + RT ln c",
    flux: "branch currents — J = G(μᵢ − μⱼ), width ∝ |J|",
    graph: "the causal graph those fluxes induce, pruned at the contact floor",
  };
  g.appendChild(text(380, 36, captions[layer], "svg-title", { "text-anchor": "middle" }));

  const kept = flux.filter((f) => Math.abs(f.J) >= floor).length;
  g.appendChild(el("rect", { x: 60, y: 336, width: 640, height: 40, rx: 5,
    fill: "var(--bg-sunken)", stroke: "var(--line)" }));
  g.appendChild(text(76, 361,
    `contact floor ${floor.toFixed(3)}  ·  ${kept} of ${flux.length} edges survive  ·  glucose pool ×10^${poolScale.toFixed(2)}  ·  kcat ×${kScale.toFixed(2)}`,
    "svg-label-sm", { fill: "var(--ink-dim)" }));

  const defs = el("defs");
  const m = el("marker", { id: "ar", viewBox: "0 0 10 10", refX: 28, refY: 5,
    markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" });
  m.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--accent)" }));
  defs.appendChild(m);
  svg8.appendChild(defs);
  svg8.appendChild(g);
}

slider("c0", (v) => { poolScale = v; drawCircuit(); }, (v) => `10^${v.toFixed(2)}`);
slider("k1", (v) => { kScale = v; drawCircuit(); }, (v) => `×${v.toFixed(2)}`);
toggles("[data-layer]", (v) => { layer = v; drawCircuit(); });

/* ------------------------------------------------------------------ fig 9 */
/* Measured degeneracy. Numbers are the reported validation output. */

const PATHWAYS = {
  glycolysis: { r2: [0.9894, 0.4820, 0.5133], dom: 41.67,     n: 10, reducible: [] },
  tca:        { r2: [0.3110, 0.2884, 0.4013], dom: 1.4667,    n: 9,  reducible: [] },
  egfr:       { r2: [0.4471, 0.3902, 0.5218], dom: 2.25,      n: 9,  reducible: [] },
  oxphos:     { r2: [0.9999999999, 0.9999999999, 0.6104], dom: 18333.33, n: 8,
                reducible: ["S_k", "S_t"] },
};
const AXES = ["S_k  (throughput)", "S_t  (capacity)", "S_e  (potential)"];

const svg9 = document.getElementById("degen");

function drawDegen(which) {
  clear(svg9);
  const p = PATHWAYS[which];
  const g = el("g");

  const x0 = 210, y0 = 74, w = 420, rowH = 46;

  g.appendChild(text(380, 40,
    "how well each axis is predicted by the other two", "svg-title",
    { "text-anchor": "middle" }));

  AXES.forEach((name, i) => {
    const y = y0 + i * rowH;
    const r2 = p.r2[i];
    const bad = r2 > 0.99;

    g.appendChild(text(x0 - 16, y + 15, name, "svg-label",
      { "text-anchor": "end", fill: bad ? "var(--bad)" : "var(--ink-dim)" }));

    g.appendChild(el("rect", { x: x0, y, width: w, height: 22, rx: 3,
      fill: "none", stroke: "var(--line)" }));
    g.appendChild(el("rect", { x: x0, y, width: w * r2, height: 22, rx: 3,
      fill: bad ? "var(--bad)" : "var(--accent)", opacity: 0.45 }));
    g.appendChild(text(x0 + w + 12, y + 15,
      bad ? r2.toFixed(10) : r2.toFixed(4), "svg-label-sm",
      { fill: bad ? "var(--bad)" : "var(--ink-faint)" }));
  });

  // threshold marker
  g.appendChild(el("line", { x1: x0 + w * 0.99, y1: y0 - 8, x2: x0 + w * 0.99, y2: y0 + rowH * 3 - 12,
    stroke: "var(--warm)", "stroke-dasharray": "3 3", "stroke-width": 1 }));
  g.appendChild(text(x0 + w * 0.99, y0 - 14, "R² = 0.99", "svg-label-sm",
    { "text-anchor": "middle", fill: "var(--warm)" }));

  const degenerate = p.reducible.length > 0;
  g.appendChild(el("rect", { x: 60, y: 232, width: 640, height: 66, rx: 5,
    fill: degenerate ? "rgba(232,116,106,0.08)" : "rgba(110,207,154,0.07)",
    stroke: degenerate ? "var(--bad)" : "var(--good)", "stroke-width": 1 }));
  g.appendChild(text(78, 256,
    degenerate
      ? `${p.reducible.join(" and ")} are recoverable from the others — the address collapses`
      : "no axis is a function of the other two — the address carries three dimensions",
    "svg-label", { fill: degenerate ? "var(--bad)" : "var(--good)" }));
  g.appendChild(text(78, 279,
    `${p.n} species  ·  concentration dominance ratio ${p.dom.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      + (degenerate ? "  ·  water at bulk concentration carries the extremum" : ""),
    "svg-label-sm", { fill: "var(--ink-faint)" }));

  svg9.appendChild(g);
}

toggles("[data-path]", (v) => drawDegen(v));
