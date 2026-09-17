/* Figures for the S-entropy page.
   Fig 21: a bounded receiver, its reachable set, and the persistent residue.
   Fig 22: catalytic powers composing multiplicatively against a floor.
*/
import { el, clear, text, slider, toggles, mulberry, clamp } from "./lib.js";

/* ----------------------------------------------------------------- fig 21 */

const svg21 = document.getElementById("receiver");
let capacity = 18, view = "residue";

function drawReceiver() {
  clear(svg21);
  const g = el("g");
  const rnd = mulberry(31337);

  const cols = 30, rows = 12, total = cols * rows;
  const size = 18, gap = 4;
  const x0 = 60, y0 = 74;

  // deterministic reachable set: a scattered but stable selection
  const order = [];
  for (let i = 0; i < total; i++) order.push(i);
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const reachable = new Set(order.slice(0, Math.min(capacity, total)));

  for (let i = 0; i < total; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const isReach = reachable.has(i);
    const show = view === "reach" ? isReach : true;
    if (!show) continue;

    const fill = isReach ? "rgba(110,168,254,0.42)"
      : view === "residue" ? "rgba(240,168,96,0.09)" : "transparent";
    const stroke = isReach ? "var(--accent)" : "var(--line-soft)";

    g.appendChild(el("rect", {
      x: x0 + c * (size + gap), y: y0 + r * (size + gap),
      width: size, height: size, rx: 2.5,
      fill, stroke, "stroke-width": isReach ? 1.3 : 0.8,
    }));
  }

  const residue = total - reachable.size;
  const frac = residue / total;

  g.appendChild(text(380, 40,
    view === "residue"
      ? "blue = internally representable · faint = the residue"
      : "only what this receiver can internally represent",
    "svg-title", { "text-anchor": "middle" }));

  // readout
  const by = 300;
  g.appendChild(el("rect", { x: 60, y: by - 22, width: 640, height: 44, rx: 5,
    fill: "var(--bg-sunken)", stroke: "var(--line)" }));
  g.appendChild(text(78, by - 2,
    `capacity ${reachable.size} of ${total} · residue ${residue} (${(frac * 100).toFixed(1)}%)`,
    "svg-label", { fill: "var(--ink-dim)" }));
  g.appendChild(text(78, by + 15,
    residue === 0
      ? "capacity meets the space — but the theorem concerns the case where it cannot"
      : "the residue is not a shrinking remainder: in the infinite case it keeps the cardinality of the whole",
    "svg-label-sm", { fill: residue === 0 ? "var(--good)" : "var(--warm)" }));

  svg21.appendChild(g);
}

slider("cap", (v) => { capacity = v; drawReceiver(); }, (v) => v.toFixed(0));
toggles("[data-view]", (v) => { view = v; drawReceiver(); });

/* ----------------------------------------------------------------- fig 22 */

const svg22 = document.getElementById("cascade");
let kappas = [0.5, 0.4, 0.3], floorVal = 8;

function drawCascade() {
  clear(svg22);
  const g = el("g");

  const S0 = 100;                     // starting distance to truth
  const above = (s) => Math.max(0, s - floorVal);

  // simulate the stages
  const stages = [{ label: "start", s: S0 }];
  let s = S0;
  kappas.forEach((k, i) => {
    s = floorVal + above(s) * (1 - k);
    stages.push({ label: `κ${i + 1} = ${k.toFixed(2)}`, s });
  });

  // closed form
  const composite = 1 - kappas.reduce((acc, k) => acc * (1 - k), 1);
  const predicted = floorVal + above(S0) * (1 - composite);

  const x0 = 90, w = 560, y0 = 78, rowH = 54;

  // floor line
  const X = (v) => x0 + (v / 100) * w;
  g.appendChild(el("line", {
    x1: X(floorVal), y1: y0 - 18, x2: X(floorVal), y2: y0 + rowH * stages.length,
    stroke: "var(--medium)", "stroke-width": 1.6, "stroke-dasharray": "5 4",
  }));
  g.appendChild(text(X(floorVal), y0 - 26, "floor", "svg-label-sm",
    { "text-anchor": "middle", fill: "var(--medium)" }));

  stages.forEach((st, i) => {
    const y = y0 + i * rowH;
    g.appendChild(text(x0 - 14, y + 16, st.label, "svg-label-sm",
      { "text-anchor": "end", fill: i === 0 ? "var(--ink-faint)" : "var(--good)" }));

    g.appendChild(el("rect", { x: x0, y, width: w, height: 24, rx: 3,
      fill: "none", stroke: "var(--line)" }));

    // floor portion
    g.appendChild(el("rect", { x: x0, y, width: X(floorVal) - x0, height: 24, rx: 3,
      fill: "var(--medium)", opacity: 0.28 }));
    // above-floor portion
    g.appendChild(el("rect", {
      x: X(floorVal), y, width: Math.max(0, X(st.s) - X(floorVal)), height: 24,
      fill: i === stages.length - 1 ? "var(--good)" : "var(--accent)", opacity: 0.45,
    }));

    g.appendChild(text(x0 + w + 12, y + 16, st.s.toFixed(2), "svg-label-sm",
      { fill: "var(--ink-dim)" }));
  });

  // verdict
  const vy = y0 + rowH * stages.length + 18;
  const agree = Math.abs(predicted - stages[stages.length - 1].s) < 1e-9;
  g.appendChild(el("rect", { x: 90, y: vy, width: 560, height: 54, rx: 5,
    fill: agree ? "rgba(110,207,154,0.07)" : "rgba(232,116,106,0.08)",
    stroke: agree ? "var(--good)" : "var(--bad)", "stroke-width": 1 }));
  g.appendChild(text(106, vy + 22,
    `composite κ = 1 − ${kappas.map((k) => `(1−${k.toFixed(2)})`).join("")} = ${composite.toFixed(4)}`,
    "svg-label", { fill: "var(--warm)" }));
  g.appendChild(text(106, vy + 41,
    agree
      ? `closed form predicts ${predicted.toFixed(6)} · simulated stages give ${stages[stages.length - 1].s.toFixed(6)} — they agree`
      : `closed form ${predicted.toFixed(6)} vs simulated ${stages[stages.length - 1].s.toFixed(6)}`,
    "svg-label-sm", { fill: agree ? "var(--good)" : "var(--bad)" }));

  g.appendChild(text(380, 40,
    "each stage removes a fraction of what remains above the floor",
    "svg-title", { "text-anchor": "middle" }));

  svg22.appendChild(g);
}

slider("k1", (v) => { kappas[0] = v; drawCascade(); }, (v) => v.toFixed(2));
slider("k2", (v) => { kappas[1] = v; drawCascade(); }, (v) => v.toFixed(2));
slider("k3", (v) => { kappas[2] = v; drawCascade(); }, (v) => v.toFixed(2));
slider("fl", (v) => { floorVal = v; drawCascade(); }, (v) => v.toFixed(0));
