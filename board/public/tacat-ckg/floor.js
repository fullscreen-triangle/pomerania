/* Figures for the floor page.
   Fig 4: quantisation cells vs a true separation (plate reader).
   Fig 5: dimensional penalty, bits per axis.
   Fig 6: saturation and non-monotonicity of the decision gap.
   Fig 7: three fault models against n sources.
*/
import { el, clear, text, line, frame, slider, toggles, clamp, mulberry } from "./lib.js";

/* ------------------------------------------------------------------ fig 4 */

const svg4 = document.getElementById("quant");
let decimals = 3, sep = 0.006;

function drawQuant() {
  clear(svg4);
  const g = el("g");

  const D = 4.0;
  const step = Math.pow(10, -decimals);
  const N = Math.round(D / step) + 1;
  const cell = D / (N - 1);

  // zoom window around the two samples
  const a = 1.2000, b = 1.2000 + sep;
  const win = Math.max(cell * 6, sep * 3.2);
  const lo = a - win / 2, hi = a + win / 2 + sep;

  const x0 = 60, y0 = 90, w = 640, h = 90;
  const X = (v) => x0 + ((v - lo) / (hi - lo)) * w;

  // cells
  const first = Math.floor(lo / cell) * cell;
  for (let c = first; c <= hi + cell; c += cell) {
    const px = X(c);
    if (px < x0 - 2 || px > x0 + w + 2) continue;
    g.appendChild(line(px, y0, px, y0 + h, { stroke: "var(--line)" }));
  }
  const codeA = Math.round(a / cell), codeB = Math.round(b / cell);
  const same = codeA === codeB;

  // shade the two occupied codes
  for (const [code, col] of [[codeA, "var(--accent)"], [codeB, same ? "var(--accent)" : "var(--good)"]]) {
    const left = X((code - 0.5) * cell), right = X((code + 0.5) * cell);
    g.appendChild(el("rect", {
      x: left, y: y0, width: Math.max(1, right - left), height: h,
      fill: col, opacity: 0.10,
    }));
  }

  // samples
  for (const [v, label, col] of [[a, "variant A", "var(--accent)"], [b, "variant B", same ? "var(--bad)" : "var(--good)"]]) {
    g.appendChild(el("line", { x1: X(v), y1: y0 - 14, x2: X(v), y2: y0 + h + 10,
      stroke: col, "stroke-width": 2 }));
    g.appendChild(el("circle", { cx: X(v), cy: y0 - 18, r: 5, fill: col }));
    g.appendChild(text(X(v), y0 - 28, label, "svg-label-sm",
      { "text-anchor": "middle", fill: col }));
  }

  g.appendChild(text(x0, y0 + h + 34, `cell width = ${cell.toFixed(5)} OD`, "svg-label-sm",
    { fill: "var(--ink-faint)" }));
  g.appendChild(text(x0 + w, y0 + h + 34, `N = ${N} codes over [0, 4]`, "svg-label-sm",
    { "text-anchor": "end", fill: "var(--ink-faint)" }));

  // verdict
  g.appendChild(el("rect", {
    x: 60, y: 232, width: 640, height: 46, rx: 5,
    fill: same ? "rgba(232,116,106,0.08)" : "rgba(110,207,154,0.08)",
    stroke: same ? "var(--bad)" : "var(--good)", "stroke-width": 1,
  }));
  g.appendChild(text(76, 254,
    same ? `both variants read as code ${codeA} — the ordering is the quantiser's`
         : `codes ${codeA} and ${codeB} — the ordering is the samples'`,
    "svg-label", { fill: same ? "var(--bad)" : "var(--good)" }));
  g.appendChild(text(76, 271,
    `true separation ${sep.toFixed(4)} OD  ·  ${(sep / cell).toFixed(2)} × cell width`,
    "svg-label-sm", { fill: "var(--ink-faint)" }));

  g.appendChild(text(380, 44, "optical density, zoomed to the two samples", "svg-title",
    { "text-anchor": "middle" }));

  svg4.appendChild(g);
}

slider("dp", (v) => { decimals = v; drawQuant(); }, (v) => v.toFixed(0));
slider("sep", (v) => { sep = v; drawQuant(); }, (v) => v.toFixed(4));

/* ------------------------------------------------------------------ fig 5 */

const svg5 = document.getElementById("dim");
let channels = 5, bitsPer = 8;

function drawDim() {
  clear(svg5);
  const g = el("g");

  // The instructive comparison: a designer given a FIXED state budget (the total
  // number of distinguishable states the monitor can carry) discovers that the
  // linear resolution along any one axis falls as N^(1/d). Holding the budget
  // fixed while adding channels is the situation that actually arises.
  const totalBits = channels * bitsPer;
  const N = Math.pow(2, totalBits);

  const budgetBits = 40;                       // a fixed 2^40-state monitor
  const budgetN = Math.pow(2, budgetBits);
  const perAxis = Math.pow(budgetN, 1 / channels);
  const bitsAxis = Math.log2(perAxis);

  // bar: total states (log) vs per-axis resolution
  const x0 = 70, w = 380, y0 = 70, barH = 34;

  g.appendChild(text(x0, y0 - 16,
    `your monitor: ${channels} channels × ${bitsPer} bits`, "svg-title"));
  g.appendChild(el("rect", { x: x0, y: y0, width: w, height: barH, rx: 3,
    fill: "rgba(110,168,254,0.18)", stroke: "var(--accent)", "stroke-width": 1 }));
  g.appendChild(text(x0 + 12, y0 + 23,
    `2^${totalBits}  ≈  ${N.toExponential(2)} states`, "svg-label", { fill: "var(--accent)" }));

  g.appendChild(text(x0, y0 + 96,
    `a fixed 2^${budgetBits}-state budget, split over ${channels} axes`, "svg-title"));
  const frac = bitsAxis / budgetBits;
  g.appendChild(el("rect", { x: x0, y: y0 + 112, width: w, height: barH, rx: 3,
    fill: "none", stroke: "var(--line)", "stroke-width": 1 }));
  g.appendChild(el("rect", { x: x0, y: y0 + 112, width: w * frac, height: barH, rx: 3,
    fill: "rgba(240,168,96,0.28)", stroke: "var(--warm)", "stroke-width": 1 }));
  g.appendChild(text(x0 + 12, y0 + 135,
    `${bitsAxis.toFixed(3)} bits  ≈  ${Math.round(perAxis)} levels`, "svg-label",
    { fill: "var(--warm)" }));

  // readout panel
  const px = 500;
  g.appendChild(el("rect", { x: px, y: 60, width: 210, height: 180, rx: 6,
    fill: "var(--bg-sunken)", stroke: "var(--line)" }));
  const rows = [
    ["channels d", String(channels)],
    ["state budget", `2^${budgetBits}`],
    ["N^(1/d)", `${perAxis < 1e6 ? Math.round(perAxis) : perAxis.toExponential(1)}`],
    ["bits / axis", bitsAxis.toFixed(3)],
    ["—", ""],
    ["your states", N.toExponential(2)],
  ];
  rows.forEach(([k, v], i) => {
    g.appendChild(text(px + 14, 88 + i * 26, k, "svg-label-sm", { fill: "var(--ink-faint)" }));
    g.appendChild(text(px + 196, 88 + i * 26, v, "svg-label",
      { "text-anchor": "end", fill: "var(--ink)" }));
  });

  g.appendChild(text(70, 268,
    `at d = ${channels}, a 2^${budgetBits}-state monitor gives only ${bitsAxis.toFixed(1)} bits along any one observable`,
    "svg-label-sm", { fill: "var(--ink-faint)" }));

  svg5.appendChild(g);
}

slider("ch", (v) => { channels = v; drawDim(); }, (v) => v.toFixed(0));
slider("bits", (v) => { bitsPer = v; drawDim(); }, (v) => v.toFixed(0));

/* ------------------------------------------------------------------ fig 6 */

const svg6 = document.getElementById("sat");
let theta = 0.3719;

/* Worst-case gap for a threshold decision at theta with N uniform cells on [0,1].
   A cell straddling theta forces one action across states wanting both, and the
   loss is 1 there; if every boundary aligns with theta the gap is 0. */
function gapFor(N, th) {
  const w = 1 / N;
  for (let i = 1; i < N; i++) {
    if (Math.abs(i * w - th) < 1e-9) return 0;
  }
  return 1;
}

function drawSat() {
  clear(svg6);
  const Ns = [2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 128];
  const g = el("g");

  const x0 = 70, y0 = 60, w = 620, h = 190;
  const barW = w / Ns.length - 10;

  g.appendChild(line(x0, y0 + h, x0 + w, y0 + h, { class: "svg-axis" }));
  g.appendChild(line(x0, y0, x0, y0 + h, { class: "svg-axis" }));
  g.appendChild(text(x0 - 10, y0 + 6, "1.0", "svg-label-sm", { "text-anchor": "end" }));
  g.appendChild(text(x0 - 10, y0 + h + 4, "0", "svg-label-sm", { "text-anchor": "end" }));

  let anyZero = false;
  Ns.forEach((N, i) => {
    const gap = gapFor(N, theta);
    if (gap === 0) anyZero = true;
    const bx = x0 + i * (w / Ns.length) + 5;
    const bh = gap * h;
    g.appendChild(el("rect", {
      x: bx, y: y0 + h - bh, width: barW, height: Math.max(bh, 1.5), rx: 2,
      fill: gap === 0 ? "var(--good)" : "var(--bad)", opacity: 0.55,
      stroke: gap === 0 ? "var(--good)" : "var(--bad)", "stroke-width": 1,
    }));
    g.appendChild(text(bx + barW / 2, y0 + h + 16, String(N), "svg-label-sm",
      { "text-anchor": "middle" }));
  });

  g.appendChild(text(x0 + w / 2, y0 + h + 38, "monitor cells N", "svg-title",
    { "text-anchor": "middle" }));
  g.appendChild(text(0, 0, "worst-case gap", "svg-title", {
    "text-anchor": "middle", transform: `translate(${x0 - 44},${y0 + h / 2}) rotate(-90)`
  }));

  g.appendChild(el("rect", {
    x: 70, y: 282, width: 620, height: 40, rx: 5,
    fill: anyZero ? "rgba(110,207,154,0.08)" : "rgba(232,116,106,0.08)",
    stroke: anyZero ? "var(--good)" : "var(--bad)", "stroke-width": 1,
  }));
  g.appendChild(text(86, 306,
    anyZero
      ? `θ = ${theta.toFixed(4)} — some N aligns; past that point extra cells buy nothing`
      : `θ = ${theta.toFixed(4)} — no N shown aligns; the gap is 1.0 at every resolution`,
    "svg-label", { fill: anyZero ? "var(--good)" : "var(--bad)" }));

  g.appendChild(text(380, 40,
    "threshold decision: gap 0 only when a cell boundary lands on θ",
    "svg-title", { "text-anchor": "middle" }));

  svg6.appendChild(g);
}

slider("theta", (v) => { theta = v; drawSat(); }, (v) => v.toFixed(4));
document.getElementById("aligned")?.addEventListener("click", () => {
  const s = document.getElementById("theta");
  s.value = String(1 / 3); s.dispatchEvent(new Event("input"));
});
document.getElementById("mis")?.addEventListener("click", () => {
  const s = document.getElementById("theta");
  s.value = "0.3719"; s.dispatchEvent(new Event("input"));
});

/* ------------------------------------------------------------------ fig 7 */

const svg7 = document.getElementById("byz");
let nSrc = 3, fault = "crash";

function drawByz() {
  clear(svg7);
  const g = el("g");
  const rnd = mulberry(20260828);

  const TRUE = 5.00;
  const readings = [];
  for (let i = 0; i < nSrc; i++) {
    const honest = TRUE + (rnd() - 0.5) * 0.06;
    readings.push({ id: i, v: honest, faulty: false });
  }
  // one faulty source
  const f = readings[nSrc - 1];
  f.faulty = true;
  if (fault === "crash") f.v = null;
  else if (fault === "naive") f.v = TRUE + 3.4;
  else f.v = TRUE + 0.42;               // drift: close enough to cluster

  const x0 = 80, w = 600, y = 132;
  const lo = TRUE - 0.9, hi = TRUE + 3.9;
  const X = (v) => x0 + ((v - lo) / (hi - lo)) * w;

  g.appendChild(line(x0, y, x0 + w, y, { class: "svg-axis" }));
  g.appendChild(el("line", { x1: X(TRUE), y1: y - 58, x2: X(TRUE), y2: y + 20,
    stroke: "var(--good)", "stroke-width": 1.5, "stroke-dasharray": "4 3" }));
  g.appendChild(text(X(TRUE), y - 66, "true value", "svg-label-sm",
    { "text-anchor": "middle", fill: "var(--good)" }));

  const live = readings.filter((r) => r.v !== null);
  // majority: cluster within a tolerance, pick largest cluster's mean
  const tol = 0.25;
  let best = { size: 0, mean: NaN };
  for (const r of live) {
    const cl = live.filter((o) => Math.abs(o.v - r.v) <= tol);
    if (cl.length > best.size) best = { size: cl.length, mean: cl.reduce((s, o) => s + o.v, 0) / cl.length };
  }
  const recovered = Number.isFinite(best.mean) && Math.abs(best.mean - TRUE) <= 0.15
    && best.size > live.length / 2;

  readings.forEach((r, i) => {
    const yy = y - 40 + i * 28;
    if (r.v === null) {
      g.appendChild(el("circle", { cx: x0 - 34, cy: yy, r: 9,
        fill: "none", stroke: "var(--ink-faint)", "stroke-width": 1.5,
        "stroke-dasharray": "3 2" }));
      g.appendChild(text(x0 - 20, yy + 4, `source ${i + 1} — silent`, "svg-label-sm",
        { fill: "var(--ink-faint)" }));
      return;
    }
    g.appendChild(el("circle", {
      cx: X(r.v), cy: yy, r: 9,
      fill: r.faulty ? "rgba(232,116,106,0.35)" : "rgba(110,168,254,0.30)",
      stroke: r.faulty ? "var(--bad)" : "var(--accent)", "stroke-width": 1.6,
    }));
    g.appendChild(text(X(r.v), yy - 14, `s${i + 1}`, "svg-label-sm",
      { "text-anchor": "middle", fill: r.faulty ? "var(--bad)" : "var(--ink-faint)" }));
  });

  // cluster band
  if (Number.isFinite(best.mean)) {
    g.appendChild(el("rect", {
      x: X(best.mean - tol), y: y - 56, width: X(best.mean + tol) - X(best.mean - tol),
      height: 96, fill: "rgba(255,255,255,0.04)", stroke: "var(--line)",
      "stroke-dasharray": "3 3",
    }));
  }

  const names = { crash: "a dead instrument", naive: "an obviously wrong instrument",
                  adaptive: "a drifting (miscalibrated) instrument" };

  g.appendChild(el("rect", {
    x: 80, y: 246, width: 600, height: 62, rx: 5,
    fill: recovered ? "rgba(110,207,154,0.08)" : "rgba(232,116,106,0.08)",
    stroke: recovered ? "var(--good)" : "var(--bad)", "stroke-width": 1,
  }));
  g.appendChild(text(96, 270,
    `${nSrc} sources against ${names[fault]}`, "svg-label",
    { fill: "var(--ink-dim)" }));
  g.appendChild(text(96, 292,
    recovered
      ? `majority recovers ${best.mean.toFixed(3)} — the truth survives`
      : `majority names ${Number.isFinite(best.mean) ? best.mean.toFixed(3) : "nothing"} — the truth is lost`,
    "svg-label", { fill: recovered ? "var(--good)" : "var(--bad)" }));

  g.appendChild(text(380, 40,
    "a drifting source clusters with an honest one; a dead one does not",
    "svg-title", { "text-anchor": "middle" }));

  svg7.appendChild(g);
}

slider("n", (v) => { nSrc = v; drawByz(); }, (v) => v.toFixed(0));
toggles("[data-fault]", (v) => { fault = v; drawByz(); });
