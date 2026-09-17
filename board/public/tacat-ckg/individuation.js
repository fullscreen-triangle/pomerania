/* Figures for the individuation page.
   Fig 1: live minimum cut against the medium vertex.
   Fig 2: medium bias and the direction trichotomy.
   Fig 3: signature view vs cut-chain view of a transamination.
*/
import { el, clear, text, minCut, slider, toggles, clamp } from "./lib.js";

/* ------------------------------------------------------------------ fig 1 */
/* A small active-site fragment: three protein atoms, one water, the medium.
   The water's identity is min-cut(W, m). Sliders move two edge weights. */

const CUT_NODES = ["m", "W", "A", "B", "C"];
const CUT_POS = {
  m: { x: 130, y: 200, label: "medium", kind: "medium" },
  W: { x: 400, y: 200, label: "H₂O",    kind: "focus" },
  A: { x: 585, y: 108, label: "Thr",    kind: "host" },
  B: { x: 640, y: 218, label: "Asp",    kind: "host" },
  C: { x: 560, y: 312, label: "heme",   kind: "host" },
};

let mediumW = 1.0, hostW = 3.0;

function cutEdges() {
  return [
    ["m", "W", mediumW],
    ["m", "A", 0.9], ["m", "B", 0.9], ["m", "C", 0.6],
    ["W", "A", hostW], ["W", "B", hostW * 0.72], ["W", "C", hostW * 0.45],
    ["A", "B", 2.4], ["B", "C", 2.1], ["A", "C", 1.7],
  ];
}

const svg1 = document.getElementById("cut");

function drawCut() {
  clear(svg1);
  const edges = cutEdges();
  const res = minCut(CUT_NODES, edges, "W", "m"); // separate the water from the medium
  const inCut = new Set(res.cut.map(([u, v]) => [u, v].sort().join("|")));

  // host-side hold on the water, for the verdict
  const hostHold = hostW + hostW * 0.72 + hostW * 0.45;
  const structural = hostHold >= mediumW;

  const g = el("g");

  // edges
  for (const [u, v, w] of edges) {
    const key = [u, v].sort().join("|");
    const cut = inCut.has(key);
    g.appendChild(el("line", {
      x1: CUT_POS[u].x, y1: CUT_POS[u].y, x2: CUT_POS[v].x, y2: CUT_POS[v].y,
      stroke: cut ? "var(--bad)" : "var(--line)",
      "stroke-width": cut ? 2.4 : Math.max(0.8, Math.min(4, w * 0.7)),
      "stroke-dasharray": cut ? "6 4" : null,
      opacity: cut ? 0.95 : 0.55,
    }));
    const mx = (CUT_POS[u].x + CUT_POS[v].x) / 2;
    const my = (CUT_POS[u].y + CUT_POS[v].y) / 2;
    if (u === "m" && v === "W") {
      g.appendChild(text(mx, my - 9, `w = ${mediumW.toFixed(2)}`, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--medium)" }));
    } else if (u === "W" && v === "A") {
      g.appendChild(text(mx + 6, my - 8, `w = ${hostW.toFixed(2)}`, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--good)" }));
    }
  }

  // source-side shading
  const side = new Set(res.side);
  for (const n of CUT_NODES) {
    if (!side.has(n)) continue;
    g.appendChild(el("circle", {
      cx: CUT_POS[n].x, cy: CUT_POS[n].y, r: 34,
      fill: "rgba(110,168,254,0.10)", stroke: "none",
    }));
  }

  // nodes
  for (const n of CUT_NODES) {
    const p = CUT_POS[n];
    const fill = p.kind === "medium" ? "rgba(180,142,232,0.22)"
      : p.kind === "focus" ? "rgba(110,168,254,0.28)" : "rgba(255,255,255,0.05)";
    const stroke = p.kind === "medium" ? "var(--medium)"
      : p.kind === "focus" ? "var(--accent)" : "var(--ink-faint)";
    g.appendChild(el("circle", {
      cx: p.x, cy: p.y, r: p.kind === "host" ? 20 : 26,
      fill, stroke, "stroke-width": 1.8,
    }));
    g.appendChild(text(p.x, p.y + 4, p.label, "svg-label",
      { "text-anchor": "middle", fill: "var(--ink)" }));
  }

  // verdict panel
  const vx = 40, vy = 344;
  g.appendChild(el("rect", {
    x: vx, y: vy - 22, width: 680, height: 40, rx: 5,
    fill: structural ? "rgba(110,207,154,0.08)" : "rgba(240,168,96,0.08)",
    stroke: structural ? "var(--good)" : "var(--warm)", "stroke-width": 1,
  }));
  g.appendChild(text(vx + 14, vy + 3,
    `min-cut(H₂O, medium) = ${res.weight.toFixed(2)}   ·   held by host ${hostHold.toFixed(2)}  vs  held by solution ${mediumW.toFixed(2)}`,
    "svg-label-sm", { fill: "var(--ink-dim)" }));
  g.appendChild(text(vx + 666, vy + 3, structural ? "STRUCTURAL" : "BULK", "svg-label",
    { "text-anchor": "end", fill: structural ? "var(--good)" : "var(--warm)" }));

  g.appendChild(text(130, 252, "surroundings", "svg-label-sm",
    { "text-anchor": "middle", fill: "var(--medium)" }));
  g.appendChild(text(600, 372, "dashed red = the cut", "svg-label-sm",
    { "text-anchor": "middle", fill: "var(--bad)" }));

  svg1.appendChild(g);
}

slider("mw", (v) => { mediumW = v; drawCut(); });
slider("hw", (v) => { hostW = v; drawCut(); });
document.getElementById("reset")?.addEventListener("click", () => {
  document.getElementById("mw").value = "1.0";
  document.getElementById("hw").value = "3.0";
  document.getElementById("mw").dispatchEvent(new Event("input"));
  document.getElementById("hw").dispatchEvent(new Event("input"));
});

/* ------------------------------------------------------------------ fig 2 */
/* Medium bias: cost of individuating products minus reactants, against a floor. */

const svg2 = document.getElementById("dir");
const BETA = 0.35;               // floor, in display units
let logR = -4, logP = -4;

// individuation cost against an ambient pool: cheap where abundant.
const cost = (logC) => 1 + Math.log(1 + Math.pow(10, -logC) / 1e4) / Math.log(10) * 0.55;

function drawDir() {
  clear(svg2);
  const g = el("g");

  const cR = cost(logR), cP = cost(logP);
  const bias = cP - cR;

  const cx = 380, axisY = 150, halfW = 300;
  const scale = 90; // units per display unit

  // axis
  g.appendChild(el("line", { x1: cx - halfW, y1: axisY, x2: cx + halfW, y2: axisY,
    stroke: "var(--line)", "stroke-width": 1 }));

  // floor band
  g.appendChild(el("rect", {
    x: cx - BETA * scale, y: axisY - 44, width: BETA * scale * 2, height: 88,
    fill: "rgba(180,142,232,0.10)", stroke: "var(--medium)",
    "stroke-width": 1, "stroke-dasharray": "4 3",
  }));
  g.appendChild(text(cx, axisY - 54, "undirected  (|bias| ≤ floor)", "svg-label-sm",
    { "text-anchor": "middle", fill: "var(--medium)" }));

  // bias bar
  const w = clamp(bias * scale, -halfW + 10, halfW - 10);
  const dirColor = Math.abs(bias) <= BETA ? "var(--medium)"
    : bias > 0 ? "var(--good)" : "var(--warm)";
  g.appendChild(el("rect", {
    x: w >= 0 ? cx : cx + w, y: axisY - 16, width: Math.abs(w), height: 32,
    fill: dirColor, opacity: 0.55, rx: 2,
  }));

  // labels
  g.appendChild(text(cx - halfW, axisY + 34, "← reverse-irreversible", "svg-label-sm",
    { fill: "var(--warm)" }));
  g.appendChild(text(cx + halfW, axisY + 34, "forward-irreversible →", "svg-label-sm",
    { "text-anchor": "end", fill: "var(--good)" }));

  const verdict = Math.abs(bias) <= BETA
    ? "undirected in this medium"
    : bias > 0 ? "runs forward (products cost more to individuate)"
               : "runs in reverse (reactants cost more to individuate)";

  g.appendChild(text(cx, 44, `medium bias Δ = ${bias.toFixed(3)}`, "svg-label",
    { "text-anchor": "middle", fill: "var(--ink)" }));
  g.appendChild(text(cx, 66, verdict, "svg-label-sm",
    { "text-anchor": "middle", fill: dirColor }));

  g.appendChild(text(60, 222,
    `reactant pool 10^${logR.toFixed(1)} M  →  cost ${cR.toFixed(3)}`,
    "svg-label-sm", { fill: "var(--ink-faint)" }));
  g.appendChild(text(700, 222,
    `product pool 10^${logP.toFixed(1)} M  →  cost ${cP.toFixed(3)}`,
    "svg-label-sm", { "text-anchor": "end", fill: "var(--ink-faint)" }));

  svg2.appendChild(g);
}

slider("cr", (v) => { logR = v; drawDir(); }, (v) => `10^${v.toFixed(1)}`);
slider("cp", (v) => { logP = v; drawDir(); }, (v) => `10^${v.toFixed(1)}`);

function preset(r, p) {
  const a = document.getElementById("cr"), b = document.getElementById("cp");
  a.value = String(r); b.value = String(p);
  a.dispatchEvent(new Event("input")); b.dispatchEvent(new Event("input"));
}
document.getElementById("ecoli")?.addEventListener("click", () => preset(-2.2, -5.6));
document.getElementById("human")?.addEventListener("click", () => preset(-5.8, -2.4));

/* ------------------------------------------------------------------ fig 3 */
/* Signature view vs cut-chain view. PLP is visible only to the chain. */

const svg3 = document.getElementById("cofactor");

const PARTICIPANTS = [
  { id: "ala",  label: "L-alanine",      x: 120, y: 80,  both: true },
  { id: "akg",  label: "2-oxoglutarate", x: 120, y: 210, both: true, control: true },
  { id: "pyr",  label: "pyruvate",       x: 640, y: 80,  both: true },
  { id: "glu",  label: "L-glutamate",    x: 640, y: 210, both: true },
  { id: "plp",  label: "PLP",            x: 380, y: 145, both: false },
];

function drawCofactor(view) {
  clear(svg3);
  const g = el("g");
  const showChain = view === "chain" || view === "both";
  const showSig = view === "sig" || view === "both";

  if (showSig) {
    // net transformation: reactants -> products, PLP absent
    for (const [a, b] of [["ala", "pyr"], ["akg", "glu"]]) {
      const A = PARTICIPANTS.find((p) => p.id === a), B = PARTICIPANTS.find((p) => p.id === b);
      g.appendChild(el("line", {
        x1: A.x + 58, y1: A.y, x2: B.x - 58, y2: B.y,
        stroke: "var(--accent)", "stroke-width": 1.6, opacity: 0.75,
        "marker-end": "url(#arrow)",
      }));
    }
    g.appendChild(text(380, 44, "signature view — net transformation, 4 participants",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--accent)" }));
  }

  if (showChain) {
    // half-reactions through the carrier
    for (const [a, b] of [["ala", "plp"], ["plp", "pyr"], ["akg", "plp"], ["plp", "glu"]]) {
      const A = PARTICIPANTS.find((p) => p.id === a), B = PARTICIPANTS.find((p) => p.id === b);
      g.appendChild(el("line", {
        x1: A.x + (A.id === "plp" ? 34 : 58), y1: A.y,
        x2: B.x - (B.id === "plp" ? 34 : 58), y2: B.y,
        stroke: "var(--warm)", "stroke-width": 1.8, opacity: 0.85,
        "stroke-dasharray": "5 3",
      }));
    }
    g.appendChild(text(380, showSig ? 272 : 44,
      "cut-chain view — the halves connect through PLP and nothing else",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--warm)" }));
  }

  for (const p of PARTICIPANTS) {
    const visible = p.both || showChain;
    if (!visible) continue;
    const isCarrier = !p.both;
    g.appendChild(el("rect", {
      x: p.x - 58, y: p.y - 18, width: 116, height: 36, rx: 6,
      fill: isCarrier ? "rgba(240,168,96,0.14)"
        : p.control ? "rgba(110,207,154,0.10)" : "rgba(110,168,254,0.10)",
      stroke: isCarrier ? "var(--warm)" : p.control ? "var(--good)" : "var(--accent)",
      "stroke-width": 1.5,
    }));
    g.appendChild(text(p.x, p.y + 4, p.label, "svg-label",
      { "text-anchor": "middle", fill: "var(--ink)" }));
    if (p.control) {
      g.appendChild(text(p.x, p.y + 32, "agreement control", "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--good)" }));
    }
  }

  if (view === "both") {
    g.appendChild(el("rect", {
      x: 300, y: 100, width: 160, height: 90, rx: 8,
      fill: "none", stroke: "var(--bad)", "stroke-width": 1.4, "stroke-dasharray": "4 4",
    }));
    g.appendChild(text(380, 208, "the disagreement, isolated", "svg-label-sm",
      { "text-anchor": "middle", fill: "var(--bad)" }));
  }

  const defs = el("defs");
  const marker = el("marker", {
    id: "arrow", viewBox: "0 0 10 10", refX: 9, refY: 5,
    markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse",
  });
  marker.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--accent)" }));
  defs.appendChild(marker);
  svg3.appendChild(defs);
  svg3.appendChild(g);
}

toggles("[data-view]", (v) => drawCofactor(v));
