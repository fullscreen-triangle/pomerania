/* Figures for the path opacity page.
   Fig 10: four routes between fixed endpoints; endpoint vs interior check.
   Fig 11: physical and virtual decompositions of one coordinate.
*/
import { el, clear, text, line, slider, toggles, mulberry } from "./lib.js";

/* ----------------------------------------------------------------- fig 10 */

const IN = { x: 90, y: 180, label: "input" };
const OUT = { x: 670, y: 180, label: "output" };

const ROUTES = [
  { name: "direct",            pts: [[260, 180], [400, 180], [540, 180]], physical: [true, true, true] },
  { name: "via a high state",  pts: [[260, 88],  [400, 62],  [540, 96]],  physical: [true, true, true] },
  { name: "via a low state",   pts: [[260, 268], [400, 300], [540, 262]], physical: [true, true, true] },
  { name: "through an impossible state",
    pts: [[260, 140], [400, 24],  [540, 224]], physical: [true, false, true] },
];

let routeIx = 0, obsMode = "endpoint";
const svg10 = document.getElementById("routes");

function drawRoutes() {
  clear(svg10);
  const g = el("g");

  // admissible band
  g.appendChild(el("rect", {
    x: 60, y: 60, width: 640, height: 240,
    fill: "rgba(110,168,254,0.04)", stroke: "var(--accent-dim)",
    "stroke-width": 1, "stroke-dasharray": "5 4",
  }));
  g.appendChild(text(70, 54, "physically realisable region", "svg-label-sm",
    { fill: "var(--accent-dim)" }));

  ROUTES.forEach((r, i) => {
    const active = i === routeIx;
    const pts = [[IN.x, IN.y], ...r.pts, [OUT.x, OUT.y]];
    const d = pts.map(([x, y], k) => `${k ? "L" : "M"}${x},${y}`).join("");
    g.appendChild(el("path", {
      d, fill: "none",
      stroke: active ? (r.physical.includes(false) ? "var(--warm)" : "var(--accent)") : "var(--line)",
      "stroke-width": active ? 2.4 : 1.1,
      opacity: active ? 0.95 : 0.28,
      "stroke-dasharray": r.physical.includes(false) ? "7 4" : null,
    }));

    if (active) {
      r.pts.forEach(([x, y], k) => {
        const ok = r.physical[k];
        g.appendChild(el("circle", {
          cx: x, cy: y, r: 11,
          fill: ok ? "rgba(110,168,254,0.25)" : "rgba(240,168,96,0.28)",
          stroke: ok ? "var(--accent)" : "var(--warm)", "stroke-width": 1.8,
        }));
        if (!ok) {
          g.appendChild(text(x, y - 20, "not realisable", "svg-label-sm",
            { "text-anchor": "middle", fill: "var(--warm)" }));
        }
      });
    }
  });

  for (const p of [IN, OUT]) {
    g.appendChild(el("circle", { cx: p.x, cy: p.y, r: 22,
      fill: "rgba(110,207,154,0.18)", stroke: "var(--good)", "stroke-width": 2 }));
    g.appendChild(text(p.x, p.y + 4, p.label, "svg-label",
      { "text-anchor": "middle", fill: "var(--ink)" }));
  }

  // verdict panel — identical under endpoint check, differing under interior
  const r = ROUTES[routeIx];
  const endpointInvariant = "(input, output, budget) → admissible";
  const interiorSig = r.pts.map(([x, y]) => `${Math.round(x)}:${Math.round(y)}`).join("  ");

  const same = obsMode === "endpoint";
  g.appendChild(el("rect", {
    x: 60, y: 314, width: 640, height: 40, rx: 5,
    fill: same ? "rgba(110,207,154,0.08)" : "rgba(240,168,96,0.08)",
    stroke: same ? "var(--good)" : "var(--warm)", "stroke-width": 1,
  }));
  g.appendChild(text(76, 338,
    same
      ? `what the check sees:  ${endpointInvariant}   —   identical for all four routes`
      : `what the check sees:  interior  ${interiorSig}   —   different for every route`,
    "svg-label-sm", { fill: same ? "var(--good)" : "var(--warm)" }));

  g.appendChild(text(380, 34, `route ${routeIx + 1} of 4 — ${r.name}`, "svg-title",
    { "text-anchor": "middle" }));

  svg10.appendChild(g);
}

slider("route", (v) => { routeIx = v; drawRoutes(); }, (v) => `${v + 1} / 4`);
toggles("[data-obs]", (v) => { obsMode = v; drawRoutes(); });

/* ----------------------------------------------------------------- fig 11 */

const svg11 = document.getElementById("virtual");
let dispersion = 2, seed = 20260828;

function drawVirtual() {
  clear(svg11);
  const g = el("g");
  const rnd = mulberry(seed);

  const x0 = 90, w = 580, y0 = 78, rowH = 40, rows = 5;
  const lo = -1.6, hi = 2.6;
  const X = (v) => x0 + ((v - lo) / (hi - lo)) * w;

  // admissible band [0,1]
  g.appendChild(el("rect", {
    x: X(0), y: y0 - 18, width: X(1) - X(0), height: rowH * rows + 8,
    fill: "rgba(110,168,254,0.07)", stroke: "var(--accent-dim)",
    "stroke-width": 1, "stroke-dasharray": "4 3",
  }));
  g.appendChild(text((X(0) + X(1)) / 2, y0 - 26, "admissible range [0, 1]", "svg-label-sm",
    { "text-anchor": "middle", fill: "var(--accent-dim)" }));

  let virtualCount = 0;
  for (let i = 0; i < rows; i++) {
    const y = y0 + i * rowH;
    const target = 0.28 + i * 0.11;

    // three components with mean == target
    const a = target + (rnd() - 0.5) * dispersion;
    const b = target + (rnd() - 0.5) * dispersion;
    const c = 3 * target - a - b;
    const comps = [a, b, c];
    const isVirtual = comps.some((v) => v < 0 || v > 1);
    if (isVirtual) virtualCount++;

    g.appendChild(el("line", { x1: x0, y1: y, x2: x0 + w, y2: y,
      stroke: "var(--line-soft)", "stroke-width": 1 }));

    comps.forEach((v) => {
      const outside = v < 0 || v > 1;
      g.appendChild(el("circle", {
        cx: X(v), cy: y, r: 6,
        fill: outside ? "rgba(240,168,96,0.35)" : "rgba(110,168,254,0.3)",
        stroke: outside ? "var(--warm)" : "var(--accent)", "stroke-width": 1.5,
      }));
    });

    // the mean
    g.appendChild(el("rect", { x: X(target) - 5, y: y - 5, width: 10, height: 10,
      fill: "var(--good)", transform: `rotate(45 ${X(target)} ${y})` }));

    g.appendChild(text(x0 - 14, y + 4, isVirtual ? "virtual" : "physical", "svg-label-sm",
      { "text-anchor": "end", fill: isVirtual ? "var(--warm)" : "var(--accent)" }));
  }

  g.appendChild(text(x0 + w + 10, y0 + rowH * rows - 20, "◆ = mean", "svg-label-sm",
    { fill: "var(--good)" }));

  g.appendChild(el("rect", { x: 90, y: 288, width: 580, height: 38, rx: 5,
    fill: "var(--bg-sunken)", stroke: "var(--line)" }));
  g.appendChild(text(106, 312,
    `${virtualCount} of ${rows} decompositions leave the admissible range — every mean is unchanged`,
    "svg-label-sm", { fill: "var(--ink-dim)" }));

  g.appendChild(text(380, 40,
    "one coordinate, decomposed three ways at increasing dispersion",
    "svg-title", { "text-anchor": "middle" }));

  svg11.appendChild(g);
}

slider("disp", (v) => { dispersion = v; drawVirtual(); }, (v) => v.toFixed(1));
document.getElementById("reseed")?.addEventListener("click", () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  drawVirtual();
});
