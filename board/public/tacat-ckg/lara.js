/* Figures for the LARA page.
   Fig 15: five separate layers vs one object read five ways.
   Fig 16: a catalytic cycle carrying facts from several modules.
*/
import { el, clear, text, toggles } from "./lib.js";

/* ----------------------------------------------------------------- fig 15 */

const LAYERS = [
  { id: "onto",  label: "ontology model",   reading: "node identity + chunk bag" },
  { id: "reas",  label: "reasoner",         reading: "federation dispatch" },
  { id: "query", label: "query access",     reading: "walk the produced graph" },
  { id: "sched", label: "scheduler",        reading: "the trajectory" },
  { id: "prov",  label: "provenance store", reading: "the edges themselves" },
];

const svg15 = document.getElementById("layers");
let mode = "separate";

function drawLayers() {
  clear(svg15);
  const g = el("g");

  if (mode === "separate") {
    g.appendChild(text(380, 38,
      "five systems, each holding its own copy — the arrows are synchronisation work",
      "svg-title", { "text-anchor": "middle" }));

    const boxW = 132, boxH = 74, gap = 24;
    const totalW = LAYERS.length * boxW + (LAYERS.length - 1) * gap;
    const x0 = (760 - totalW) / 2;
    const y = 130;

    LAYERS.forEach((L, i) => {
      const x = x0 + i * (boxW + gap);
      g.appendChild(el("rect", {
        x, y, width: boxW, height: boxH, rx: 6,
        fill: "rgba(255,255,255,0.04)", stroke: "var(--ink-faint)", "stroke-width": 1.4,
      }));
      g.appendChild(text(x + boxW / 2, y + 32, L.label, "svg-label",
        { "text-anchor": "middle", fill: "var(--ink)" }));
      g.appendChild(text(x + boxW / 2, y + 52, "own representation", "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--ink-faint)" }));

      if (i < LAYERS.length - 1) {
        const ax = x + boxW, bx = x + boxW + gap;
        g.appendChild(el("path", {
          d: `M${ax + 3},${y + boxH / 2 - 8} Q${(ax + bx) / 2},${y - 18} ${bx - 3},${y + boxH / 2 - 8}`,
          fill: "none", stroke: "var(--bad)", "stroke-width": 1.4, "stroke-dasharray": "4 3",
        }));
        g.appendChild(el("path", {
          d: `M${bx - 3},${y + boxH / 2 + 8} Q${(ax + bx) / 2},${y + boxH + 18} ${ax + 3},${y + boxH / 2 + 8}`,
          fill: "none", stroke: "var(--bad)", "stroke-width": 1.4, "stroke-dasharray": "4 3",
        }));
      }
    });

    g.appendChild(text(380, 268,
      "every dashed pair is a place a change has to be carried across by hand",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--bad)" }));

    g.appendChild(el("rect", { x: 90, y: 306, width: 580, height: 74, rx: 6,
      fill: "rgba(232,116,106,0.06)", stroke: "var(--bad)", "stroke-width": 1 }));
    g.appendChild(text(110, 332,
      "the ontology says one thing, the scheduler assumed another, the provenance",
      "svg-label-sm", { fill: "var(--ink-dim)" }));
    g.appendChild(text(110, 352,
      "store recorded a third — and none of them is wrong, they are just out of step.",
      "svg-label-sm", { fill: "var(--ink-dim)" }));
    g.appendChild(text(110, 372,
      "Keeping them aligned is the work that never appears in a paper.",
      "svg-label-sm", { fill: "var(--ink-faint)" }));

  } else {
    g.appendChild(text(380, 38,
      "one graph; each layer is a reading of it",
      "svg-title", { "text-anchor": "middle" }));

    const cx = 380, cy = 214, R = 118;

    // the object
    g.appendChild(el("circle", { cx, cy, r: R * 0.52,
      fill: "rgba(110,168,254,0.14)", stroke: "var(--accent)", "stroke-width": 2 }));
    g.appendChild(text(cx, cy - 4, "the graph", "svg-label",
      { "text-anchor": "middle", fill: "var(--ink)" }));
    g.appendChild(text(cx, cy + 15, "nodes · values · edges", "svg-label-sm",
      { "text-anchor": "middle", fill: "var(--accent)" }));

    LAYERS.forEach((L, i) => {
      const a = (-Math.PI / 2) + (i / LAYERS.length) * Math.PI * 2;
      const lx = cx + Math.cos(a) * R * 1.62;
      const ly = cy + Math.sin(a) * R * 1.18;

      g.appendChild(el("line", {
        x1: cx + Math.cos(a) * R * 0.55, y1: cy + Math.sin(a) * R * 0.55,
        x2: lx - Math.cos(a) * 46, y2: ly - Math.sin(a) * 20,
        stroke: "var(--accent-dim)", "stroke-width": 1.4, opacity: 0.75,
      }));

      const w = 150, h = 44;
      g.appendChild(el("rect", {
        x: lx - w / 2, y: ly - h / 2, width: w, height: h, rx: 6,
        fill: "rgba(110,207,154,0.08)", stroke: "var(--good)", "stroke-width": 1.3,
      }));
      g.appendChild(text(lx, ly - 3, L.label, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--ink)" }));
      g.appendChild(text(lx, ly + 13, L.reading, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--good)" }));
    });

    g.appendChild(el("rect", { x: 130, y: 372, width: 500, height: 34, rx: 5,
      fill: "rgba(110,207,154,0.06)", stroke: "var(--good)", "stroke-width": 1 }));
    g.appendChild(text(380, 394,
      "nothing to synchronise, because there is nothing to synchronise between",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--good)" }));
  }

  svg15.appendChild(g);
}

toggles("[data-mode]", (v) => { mode = v; drawLayers(); });

/* ----------------------------------------------------------------- fig 16 */

const STATES = [
  { id: "resting",  label: "resting",        facts: [
      { m: "cytochrome", t: "closed orbit ΣΔM" },
      { m: "cytochrome", t: "EPR g-tensor" } ] },
  { id: "bound",    label: "substrate-bound", facts: [
      { m: "cytochrome", t: "spin shift, Soret 417→392 nm" } ] },
  { id: "reduction", label: "reduction",     facts: [
      { m: "cytochrome", t: "ET chain, λ 0.85 eV" },
      { m: "sbs",        t: "redox circuit R, V" } ] },
  { id: "oxy",      label: "oxy-ferrous",    facts: [
      { m: "cytochrome", t: "O₂ binding" } ] },
  { id: "peroxo",   label: "peroxo",         facts: [
      { m: "cytochrome", t: "protonation step" } ] },
  { id: "compound-i", label: "Compound I",   facts: [
      { m: "cytochrome",    t: "Fe=O chemistry ΔM ln2" },
      { m: "cytochrome",    t: "Raman 795→758 cm⁻¹" },
      { m: "shapeshifter",  t: "MS acquisition" } ] },
  { id: "release",  label: "product release", facts: [
      { m: "cytochrome", t: "participant/carrier cut" } ] },
];

const MOD_COLOR = {
  cytochrome: "var(--accent)",
  sbs: "var(--good)",
  shapeshifter: "var(--warm)",
};

const svg16 = document.getElementById("cycle");
let modFilter = "all";

function drawCycle() {
  clear(svg16);
  const g = el("g");
  const cx = 380, cy = 208, R = 132;

  g.appendChild(text(380, 34,
    "the catalytic cycle as a graph; bands are facts contributed by modules",
    "svg-title", { "text-anchor": "middle" }));

  // ring
  STATES.forEach((s, i) => {
    const a = (-Math.PI / 2) + (i / STATES.length) * Math.PI * 2;
    const b = (-Math.PI / 2) + ((i + 1) / STATES.length) * Math.PI * 2;
    g.appendChild(el("path", {
      d: `M${cx + Math.cos(a) * R},${cy + Math.sin(a) * R} A${R},${R} 0 0 1 ${cx + Math.cos(b) * R},${cy + Math.sin(b) * R}`,
      fill: "none", stroke: "var(--line)", "stroke-width": 1.4,
    }));
  });

  let shown = 0, total = 0;

  STATES.forEach((s, i) => {
    const a = (-Math.PI / 2) + (i / STATES.length) * Math.PI * 2;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;

    const visible = s.facts.filter((f) => modFilter === "all" || f.m === modFilter);
    total += s.facts.length;
    shown += visible.length;

    const r = 20 + visible.length * 3.5;
    g.appendChild(el("circle", {
      cx: x, cy: y, r,
      fill: visible.length ? "rgba(110,168,254,0.14)" : "rgba(255,255,255,0.03)",
      stroke: visible.length ? "var(--accent)" : "var(--line)",
      "stroke-width": visible.length ? 1.8 : 1,
    }));

    // fact bands
    visible.forEach((f, k) => {
      const bandR = r + 5 + k * 5;
      g.appendChild(el("circle", {
        cx: x, cy: y, r: bandR, fill: "none",
        stroke: MOD_COLOR[f.m], "stroke-width": 2.2, opacity: 0.8,
        "stroke-dasharray": `${bandR * 1.1} ${bandR * 6.28}`,
        transform: `rotate(${k * 40} ${x} ${y})`,
      }));
    });

    const lx = cx + Math.cos(a) * (R + 74);
    const ly = cy + Math.sin(a) * (R + 60);
    g.appendChild(text(lx, ly, s.label, "svg-label-sm", {
      "text-anchor": Math.cos(a) > 0.25 ? "start" : Math.cos(a) < -0.25 ? "end" : "middle",
      fill: visible.length ? "var(--ink)" : "var(--ink-faint)",
    }));
    if (visible.length > 1) {
      g.appendChild(text(lx, ly + 14, `${visible.length} facts`, "svg-label-sm", {
        "text-anchor": Math.cos(a) > 0.25 ? "start" : Math.cos(a) < -0.25 ? "end" : "middle",
        fill: "var(--accent)",
      }));
    }
  });

  // legend
  const lgx = 40, lgy = 356;
  Object.entries(MOD_COLOR).forEach(([m, c], i) => {
    g.appendChild(el("line", { x1: lgx + i * 190, y1: lgy, x2: lgx + i * 190 + 22, y2: lgy,
      stroke: c, "stroke-width": 3 }));
    g.appendChild(text(lgx + i * 190 + 30, lgy + 4, m, "svg-label-sm", { fill: c }));
  });

  g.appendChild(el("rect", { x: 40, y: 378, width: 680, height: 30, rx: 4,
    fill: "var(--bg-sunken)", stroke: "var(--line)" }));
  g.appendChild(text(56, 398,
    modFilter === "all"
      ? `${total} facts across ${STATES.length} states from three modules — Compound I alone carries three`
      : `${shown} of ${total} facts come from ${modFilter} alone — no module covers the cycle`,
    "svg-label-sm", { fill: "var(--ink-dim)" }));

  svg16.appendChild(g);
}

toggles("[data-mod]", (v) => { modFilter = v; drawCycle(); });
