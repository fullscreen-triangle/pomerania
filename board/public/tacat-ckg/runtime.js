/* Figures for the runtime page.
   Fig 12: emergent trajectory — edges appear as values propagate; errors are values.
   Fig 13: protocol fingerprints stable under measurement spread.
   Fig 14: hierarchical addresses and blast radius.
*/
import { el, clear, text, slider, mulberry, clamp } from "./lib.js";

/* ----------------------------------------------------------------- fig 12 */

const NODES = [
  { id: "prep",    label: "prepare",   x: 110, y: 210, tau: "prep" },
  { id: "measure", label: "measure",   x: 260, y: 120, tau: "measure" },
  { id: "circuit", label: "circuit",   x: 260, y: 300, tau: "circuit" },
  { id: "derive",  label: "derive",    x: 410, y: 210, tau: "derive" },
  { id: "spectra", label: "spectra",   x: 560, y: 120, tau: "spectra" },
  { id: "anomaly", label: "anomaly",   x: 560, y: 300, tau: "anomaly" },
  { id: "report",  label: "report",    x: 690, y: 210, tau: "report" },
];

const CANDIDATE = [
  ["prep", "measure"], ["prep", "circuit"],
  ["measure", "derive"], ["circuit", "derive"],
  ["derive", "spectra"], ["derive", "anomaly"],
  ["spectra", "report"], ["anomaly", "report"],
];

let seedR = 20260828, anomalyRate = 0.15, stepIx = 0, timer = null;
const svg12 = document.getElementById("run");

function trajectory() {
  const rnd = mulberry(seedR);
  const order = ["prep", "measure", "circuit", "derive", "spectra", "anomaly", "report"];
  const state = {};              // id -> {visited, error}
  const edges = [];
  for (const id of order) {
    const incoming = CANDIDATE.filter(([, v]) => v === id);
    const ready = incoming.length === 0 || incoming.some(([u]) => state[u]?.visited);
    if (!ready) continue;
    const errored = rnd() < anomalyRate;
    state[id] = { visited: true, error: errored };
    for (const [u, v] of incoming) {
      if (state[u]?.visited) edges.push([u, v, state[u].error]);
    }
  }
  return { order, state, edges };
}

function drawRun() {
  clear(svg12);
  const { order, state, edges } = trajectory();
  const visibleCount = clamp(stepIx, 0, order.length);
  const shown = new Set(order.slice(0, visibleCount));
  const g = el("g");

  // candidate edges, faint — the catalogue
  for (const [u, v] of CANDIDATE) {
    const A = NODES.find((n) => n.id === u), B = NODES.find((n) => n.id === v);
    g.appendChild(el("line", {
      x1: A.x, y1: A.y, x2: B.x, y2: B.y,
      stroke: "var(--line)", "stroke-width": 1, opacity: 0.35,
      "stroke-dasharray": "3 4",
    }));
  }

  // realised edges
  for (const [u, v, errored] of edges) {
    if (!shown.has(u) || !shown.has(v)) continue;
    const A = NODES.find((n) => n.id === u), B = NODES.find((n) => n.id === v);
    g.appendChild(el("line", {
      x1: A.x, y1: A.y, x2: B.x, y2: B.y,
      stroke: errored ? "var(--bad)" : "var(--accent)",
      "stroke-width": 2.2, opacity: 0.9, "marker-end": "url(#rr)",
    }));
  }

  for (const n of NODES) {
    const st = state[n.id];
    const on = shown.has(n.id) && st?.visited;
    const err = on && st.error;
    g.appendChild(el("circle", {
      cx: n.x, cy: n.y, r: 28,
      fill: !on ? "rgba(255,255,255,0.03)"
        : err ? "rgba(232,116,106,0.22)" : "rgba(110,168,254,0.22)",
      stroke: !on ? "var(--line)" : err ? "var(--bad)" : "var(--accent)",
      "stroke-width": on ? 2 : 1,
    }));
    g.appendChild(text(n.x, n.y + 4, n.label, "svg-label",
      { "text-anchor": "middle", fill: on ? "var(--ink)" : "var(--ink-faint)" }));
    if (err) {
      g.appendChild(text(n.x, n.y + 44, "error → value", "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--bad)" }));
    }
  }

  const errs = order.slice(0, visibleCount).filter((id) => state[id]?.error).length;
  g.appendChild(el("rect", { x: 60, y: 356, width: 640, height: 46, rx: 5,
    fill: "var(--bg-sunken)", stroke: "var(--line)" }));
  g.appendChild(text(76, 378,
    `nodes reached ${visibleCount} / ${order.length}   ·   edges realised ${edges.filter(([u, v]) => shown.has(u) && shown.has(v)).length} of ${CANDIDATE.length} candidates   ·   errors ${errs}`,
    "svg-label-sm", { fill: "var(--ink-dim)" }));
  g.appendChild(text(76, 395,
    visibleCount === order.length
      ? "run complete — no verdict issued; every node was executed"
      : "dashed = catalogue (what could be computed) · solid = trajectory (what was)",
    "svg-label-sm", { fill: "var(--ink-faint)" }));

  g.appendChild(text(380, 40,
    "an edge exists because a value propagated along it",
    "svg-title", { "text-anchor": "middle" }));

  const defs = el("defs");
  const m = el("marker", { id: "rr", viewBox: "0 0 10 10", refX: 30, refY: 5,
    markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" });
  m.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--accent)" }));
  defs.appendChild(m);
  svg12.appendChild(defs);
  svg12.appendChild(g);
}

document.getElementById("step")?.addEventListener("click", () => {
  stepIx = Math.min(stepIx + 1, NODES.length); drawRun();
});
document.getElementById("play")?.addEventListener("click", () => {
  if (timer) { clearInterval(timer); timer = null; return; }
  stepIx = 0; drawRun();
  timer = setInterval(() => {
    stepIx++;
    if (stepIx > NODES.length) { clearInterval(timer); timer = null; return; }
    drawRun();
  }, 520);
});
document.getElementById("rerun")?.addEventListener("click", () => {
  seedR = (seedR * 1103515245 + 12345) & 0x7fffffff;
  stepIx = NODES.length; drawRun();
});
slider("anom", (v) => { anomalyRate = v; drawRun(); }, (v) => v.toFixed(2));

/* ----------------------------------------------------------------- fig 13 */

const SETUPS = [
  { name: "assay",     base: 105.0, fp: "f973f03676c81dcd" },
  { name: "titration", base: 52.0,  fp: "0880dc848696b60b" },
  { name: "gel",       base: 232.5, fp: "b5b72e720e5ea04b" },
];
let spread = 4, protoEdit = 0;
const svg13 = document.getElementById("fingerprint");

function drawFp() {
  clear(svg13);
  const g = el("g");
  const rnd = mulberry(4242);

  const x0 = 200, w = 420;
  SETUPS.forEach((s, i) => {
    const y = 80 + i * 66;
    const rel = spread / 100;

    g.appendChild(text(x0 - 16, y + 4, s.name, "svg-label",
      { "text-anchor": "end", fill: "var(--ink-dim)" }));

    g.appendChild(el("line", { x1: x0, y1: y, x2: x0 + w, y2: y,
      stroke: "var(--line)", "stroke-width": 1 }));

    for (let k = 0; k < 34; k++) {
      const off = (rnd() - 0.5) * 2 * rel;
      const px = x0 + w / 2 + off * w * 1.6;
      g.appendChild(el("circle", { cx: clamp(px, x0 + 4, x0 + w - 4), cy: y, r: 3.2,
        fill: "var(--accent)", opacity: 0.5 }));
    }

    const fp = protoEdit ? s.fp.slice(0, 12) + (protoEdit * 7 % 10) + "a" + (protoEdit % 10) : s.fp;
    g.appendChild(el("rect", { x: x0 + w + 16, y: y - 12, width: 130, height: 24, rx: 3,
      fill: "rgba(110,207,154,0.10)", stroke: "var(--good)", "stroke-width": 1 }));
    g.appendChild(text(x0 + w + 24, y + 4, fp, "svg-label-sm", { fill: "var(--good)" }));
  });

  g.appendChild(text(380, 40,
    "600 runs per setup — values scatter, the protocol fingerprint does not",
    "svg-title", { "text-anchor": "middle" }));

  g.appendChild(el("rect", { x: 60, y: 254, width: 640, height: 34, rx: 5,
    fill: "var(--bg-sunken)", stroke: "var(--line)" }));
  g.appendChild(text(76, 276,
    protoEdit
      ? "the protocol was edited — every fingerprint changed, though the values need not have"
      : "the fingerprint hashes subtask identity, chunk names and edits — never the values",
    "svg-label-sm", { fill: protoEdit ? "var(--warm)" : "var(--ink-dim)" }));

  svg13.appendChild(g);
}

slider("spread", (v) => { spread = v; drawFp(); }, (v) => `±${v.toFixed(1)}%`);
document.getElementById("editproto")?.addEventListener("click", () => {
  protoEdit = (protoEdit + 1) % 4; drawFp();
});

/* ----------------------------------------------------------------- fig 14 */

const svg14 = document.getElementById("address");
let editDepth = 2, branch = 3;
const D = 4;

function drawAddr() {
  clear(svg14);
  const g = el("g");

  const levels = D + 1;
  const topY = 66, botY = 250;
  const rowY = (d) => topY + (d / D) * (botY - topY);

  // choose the highlighted subtree: always the leftmost-but-one branch
  const chosen = [];
  for (let d = 1; d <= editDepth; d++) chosen.push(d === 1 ? 1 : 0);

  function draw(d, x, w, path) {
    const y = rowY(d);
    const inSubtree = path.length >= editDepth &&
      chosen.every((c, i) => path[i] === c);
    const isEditNode = path.length === editDepth &&
      chosen.every((c, i) => path[i] === c);

    if (d < D) {
      const kids = branch;
      for (let k = 0; k < kids; k++) {
        const cw = w / kids;
        const cx = x - w / 2 + cw * (k + 0.5);
        const cy = rowY(d + 1);
        const childPath = [...path, k];
        const childIn = childPath.length >= editDepth &&
          chosen.every((c, i) => childPath[i] === c);
        g.appendChild(el("line", {
          x1: x, y1: y, x2: cx, y2: cy,
          stroke: childIn ? "var(--warm)" : "var(--line)",
          "stroke-width": childIn ? 1.6 : 0.8,
          opacity: childIn ? 0.9 : 0.4,
        }));
        draw(d + 1, cx, cw, childPath);
      }
    }

    const r = d === D ? 4 : 6;
    g.appendChild(el("circle", {
      cx: x, cy: y, r,
      fill: isEditNode ? "var(--warm)"
        : inSubtree ? "rgba(240,168,96,0.5)" : "rgba(255,255,255,0.08)",
      stroke: isEditNode ? "var(--warm)" : inSubtree ? "var(--warm)" : "var(--line)",
      "stroke-width": isEditNode ? 2.5 : 1,
    }));
  }

  draw(0, 380, 620, []);

  for (let d = 0; d <= D; d++) {
    g.appendChild(text(24, rowY(d) + 4, `depth ${d}`, "svg-label-sm",
      { fill: d === editDepth ? "var(--warm)" : "var(--ink-faint)" }));
  }

  const affected = Math.pow(branch, D - editDepth);
  const total = Math.pow(branch, D);

  g.appendChild(el("rect", { x: 60, y: 278, width: 640, height: 48, rx: 5,
    fill: "rgba(240,168,96,0.07)", stroke: "var(--warm)", "stroke-width": 1 }));
  g.appendChild(text(78, 300,
    `edit at depth ${editDepth} of ${D}, branching ${branch}  →  affects b^(D−k) = ${branch}^${D - editDepth} = ${affected} leaves of ${total}`,
    "svg-label", { fill: "var(--warm)" }));
  g.appendChild(text(78, 318,
    editDepth === 1 ? "shallow: importing or replacing a whole standard setup"
      : editDepth === D ? "deep: surgical control of a single step"
      : "intermediate: one stage of the protocol, its steps untouched",
    "svg-label-sm", { fill: "var(--ink-faint)" }));

  g.appendChild(text(380, 40,
    "one addressable object; the depth you edit at is the resolution you work at",
    "svg-title", { "text-anchor": "middle" }));

  svg14.appendChild(g);
}

slider("depth", (v) => { editDepth = v; drawAddr(); }, (v) => v.toFixed(0));
slider("branch", (v) => { branch = v; drawAddr(); }, (v) => v.toFixed(0));
