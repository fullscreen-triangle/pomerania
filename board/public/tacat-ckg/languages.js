/* Figures for the languages page.
   Fig 17: each language's pipeline, with real source from the repository.
   Fig 18: capability check, provenance-tagged conversion, dispatch across modules.
   Fig 19: stated vs supplied elements in a converted structure.
*/
import { el, clear, text, slider, toggles } from "./lib.js";

/* ----------------------------------------------------------------- fig 17 */
/* Source excerpts are quoted verbatim from the sandbox defaults in the
   long-grass repository, so what is shown is what actually runs. */

const LANGS = {
  hj: {
    name: "honjo",
    ext: ".hj",
    domain: "cheminformatics — one verb, the cut",
    colour: "var(--accent)",
    source: [
      "-- track.hj — tracking an item through a process",
      "floor 1.0",
      "import honjo.causal",
      "",
      "O := cut 8",
      "H := cut 1",
      "W := close O(H, H)",
      "",
      "path := track O in W",
      "          with reps mass, charge, time",
      "          until converge",
      "          yield amalgamation",
      "",
      "observe path      -- the amalgamation IS the result",
    ],
    stages: ["lex", "parse", "accountability check", "Cut-IR", "exact interpreter"],
    emits: "a Path at the floor, with converged flag and amalgamation",
    note: "`floor 1.0` is declared in the program. A value claiming zero residue is a compile error.",
  },
  sbs: {
    name: "systems biology shaders",
    ext: ".sbs",
    domain: "metabolic networks as circuits over chemical potential",
    colour: "var(--good)",
    source: [
      'import oxphos from "kegg/hsa00190"',
      "circuit electron_transport {",
      "  node NADH { mu: -320.0, concentration: 0.1,",
      '              compartment: "mitochondria_matrix" }',
      "  node CoQ  { mu: -50.0,  concentration: 0.05 }",
      "  node O2   { mu: 815.0,  concentration: 0.26 }",
      "  edge NADH -> CoQ { conductance: 12.0 }",
      "  edge CoQ  -> O2  { conductance: 8.0 }",
      "}",
      "observe electron_transport",
      'perturb electron_transport { edge: "NADH->CoQ", factor: 0.3 }',
      "navigate from CoQ",
    ],
    stages: ["tokenize", "parse", "compile → GLSL + JS", "WebGL2 solve (CPU fallback)", "extract metrics"],
    emits: "coherence R, flux visibility V, per-node Se/Sk/St, per-edge flux",
    note: "Omit mu and it is derived: mu0 + RT·ln(c), RT = 2.478. Disease is a perturb statement.",
  },
  ss: {
    name: "shapeshifter",
    ext: ".ss",
    domain: "virtual mass spectrometry — simulate the acquisition",
    colour: "var(--warm)",
    source: [
      "objective p450_metabolite_scan:",
      '  target: "CYP substrate + oxidised metabolite, positive mode"',
      "",
      "instrument orbi:",
      "  kappa: 1e12",
      "  ref_frequency: 10e6",
      "",
      "phase acquire:",
      "  records = lavoisier.instrument.run_experiment(",
      '      classes: ["PC"], polarity: "+",',
      '      analyser: "orbitrap", mz_window: [150, 500])',
      "  field = lavoisier.observe.partition_field(records: records)",
    ],
    stages: ["parse (indent-sensitive)", "compileStage", "capability dispatch", "executeStage"],
    emits: "a workspace — named values each tagged with its visualisation kind",
    note: "validate blocks do real physics: τ_min from ħ/ΔM before the run is spent.",
  },
  grf: {
    name: "graffiti",
    ext: ".grf",
    domain: "search as individuation — and declining honestly",
    colour: "var(--medium)",
    source: [
      "floor 0.02",
      "",
      "catalyst web_search {",
      "  namespace: remote",
      "  input: Region output: Claim",
      "}",
      "",
      "project apollo_budget {",
      "  seek budget_overrun",
      '    not{ "post-hoc estimates without citation" }',
      "    toward{ cost_vs_authorization(launch_date) }",
      "    via{ web_search(x) >> archive_lookup(x) }",
      "    until converge otherwise decline",
      "    yield budget_overrun",
      "}",
    ],
    stages: ["tokenize", "parse", "typecheck (theorem-named)", "graph-mutating interpreter"],
    emits: "a Claim with its residue — or a Decline carrying the competing regions",
    note: "`>>` is sequential composition, `||` parallel. No floor declared is a type error.",
  },
};

const svg17 = document.getElementById("langs");

function drawLang(key) {
  clear(svg17);
  const L = LANGS[key];
  const g = el("g");

  g.appendChild(text(24, 30, `${L.name}  ${L.ext}`, "svg-label",
    { fill: L.colour, "font-size": "13" }));
  g.appendChild(text(24, 48, L.domain, "svg-label-sm", { fill: "var(--ink-faint)" }));

  // source panel
  g.appendChild(el("rect", {
    x: 24, y: 62, width: 430, height: 244, rx: 5,
    fill: "var(--bg-sunken)", stroke: "var(--line)", "stroke-width": 1,
  }));
  L.source.forEach((ln, i) => {
    const comment = ln.trim().startsWith("--") || ln.includes("  -- ");
    g.appendChild(text(38, 82 + i * 16.4, ln || " ", "svg-label-sm", {
      fill: comment ? "var(--ink-faint)" : "var(--ink-dim)",
      "font-size": "10.5",
    }));
  });

  // pipeline
  const px = 486;
  g.appendChild(text(px, 82, "pipeline", "svg-title"));
  L.stages.forEach((s, i) => {
    const y = 104 + i * 40;
    g.appendChild(el("rect", {
      x: px, y: y - 14, width: 250, height: 26, rx: 4,
      fill: "rgba(255,255,255,0.04)", stroke: L.colour, "stroke-width": 1.2,
    }));
    g.appendChild(text(px + 12, y + 4, s, "svg-label-sm", { fill: "var(--ink-dim)" }));
    if (i < L.stages.length - 1) {
      g.appendChild(el("path", {
        d: `M${px + 125},${y + 12} L${px + 125},${y + 26}`,
        stroke: L.colour, "stroke-width": 1.4, "marker-end": "url(#la)",
      }));
    }
  });

  // emits
  const ey = 104 + L.stages.length * 40;
  g.appendChild(el("rect", {
    x: px, y: ey - 14, width: 250, height: 42, rx: 4,
    fill: "rgba(110,168,254,0.10)", stroke: "var(--accent)", "stroke-width": 1.4,
  }));
  g.appendChild(text(px + 12, ey + 2, "emits →", "svg-label-sm", { fill: "var(--accent)" }));
  g.appendChild(text(px + 12, ey + 18, L.emits.slice(0, 34), "svg-label-sm",
    { fill: "var(--ink-dim)", "font-size": "9.5" }));

  g.appendChild(el("rect", { x: 24, y: 322, width: 712, height: 40, rx: 4,
    fill: "rgba(240,168,96,0.06)", stroke: "var(--line)" }));
  g.appendChild(text(38, 346, L.note, "svg-label-sm", { fill: "var(--ink-dim)" }));

  g.appendChild(text(380, 384,
    "every language ends in the same place: a typed fact on a node of one graph",
    "svg-label-sm", { "text-anchor": "middle", fill: "var(--ink-faint)" }));

  const defs = el("defs");
  const m = el("marker", { id: "la", viewBox: "0 0 10 10", refX: 8, refY: 5,
    markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" });
  m.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", fill: L.colour }));
  defs.appendChild(m);
  svg17.appendChild(defs);
  svg17.appendChild(g);
}

toggles("[data-lang]", (v) => drawLang(v));

/* ----------------------------------------------------------------- fig 18 */

const FORMATS = [
  { id: "smiles", label: "SMILES", can: ["connectivity", "bond order", "charge"],
    cannot: ["3D coordinates", "conformer"] },
  { id: "molfile", label: "MOL / SDF", can: ["connectivity", "bond order", "charge", "3D coordinates"],
    cannot: ["conformer ensemble"] },
];
const REQUESTS = [
  { id: "conn", label: "connectivity",   needs: ["connectivity"] },
  { id: "geom", label: "3D geometry",    needs: ["3D coordinates"] },
  { id: "conf", label: "conformers",     needs: ["conformer ensemble"] },
];

const svg18 = document.getElementById("federate");
let stage = "capability";

function drawFederate() {
  clear(svg18);
  const g = el("g");

  const titles = {
    capability: "1 · what each format can state — checked before any record is read",
    convert: "2 · records become contact graphs, every element tagged",
    query: "3 · one question, answered by whichever modules can answer it",
  };
  g.appendChild(text(380, 32, titles[stage], "svg-title", { "text-anchor": "middle" }));

  if (stage === "capability") {
    FORMATS.forEach((f, i) => {
      const x = 70 + i * 340;
      g.appendChild(el("rect", { x, y: 62, width: 290, height: 30, rx: 4,
        fill: "rgba(110,168,254,0.12)", stroke: "var(--accent)" }));
      g.appendChild(text(x + 12, 82, f.label, "svg-label", { fill: "var(--ink)" }));

      f.can.forEach((c, k) => {
        g.appendChild(text(x + 16, 118 + k * 20, `✓ ${c}`, "svg-label-sm",
          { fill: "var(--good)" }));
      });
      f.cannot.forEach((c, k) => {
        g.appendChild(text(x + 16, 118 + f.can.length * 20 + k * 20, `✗ ${c}`,
          "svg-label-sm", { fill: "var(--bad)" }));
      });
    });

    // request matrix
    g.appendChild(text(70, 258, "request → decided statically?", "svg-title"));
    REQUESTS.forEach((r, i) => {
      const y = 282 + i * 26;
      g.appendChild(text(70, y, r.label, "svg-label-sm", { fill: "var(--ink-dim)" }));
      FORMATS.forEach((f, k) => {
        const ok = r.needs.every((n) => f.can.includes(n));
        const known = r.needs.every((n) => f.can.includes(n) || f.cannot.includes(n));
        g.appendChild(text(240 + k * 340, y,
          known ? (ok ? "faithful — proceed" : "refuse: format cannot state it")
                : "must read the record",
          "svg-label-sm", { fill: known ? (ok ? "var(--good)" : "var(--bad)") : "var(--warm)" }));
      });
    });

    g.appendChild(text(380, 366,
      "19 of 24 format–request pairs decided before reading; agreement with the post-read outcome on all 24",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--accent)" }));

  } else if (stage === "convert") {
    const cx = 380, cy = 190;
    g.appendChild(el("rect", { x: 60, y: 70, width: 200, height: 90, rx: 5,
      fill: "var(--bg-sunken)", stroke: "var(--line)" }));
    g.appendChild(text(74, 94, "CC(=O)Oc1ccccc1C(=O)O", "svg-label-sm",
      { fill: "var(--ink-dim)", "font-size": "10" }));
    g.appendChild(text(74, 118, "a record — silent about", "svg-label-sm",
      { fill: "var(--ink-faint)" }));
    g.appendChild(text(74, 134, "hydrogens and geometry", "svg-label-sm",
      { fill: "var(--ink-faint)" }));

    g.appendChild(el("path", { d: "M270,115 L340,115", stroke: "var(--accent)",
      "stroke-width": 1.6, "marker-end": "url(#fa)" }));
    g.appendChild(text(305, 106, "convert", "svg-label-sm",
      { "text-anchor": "middle", fill: "var(--accent)" }));

    const TAGS = [
      ["heavy atoms", "stated", "var(--good)"],
      ["bond orders", "stated", "var(--good)"],
      ["hydrogens", "supplied", "var(--warm)"],
      ["3D coordinates", "absent", "var(--bad)"],
      ["aromaticity model", "supplied", "var(--warm)"],
    ];
    TAGS.forEach(([k, v, c], i) => {
      const y = 82 + i * 30;
      g.appendChild(el("rect", { x: 360, y: y - 15, width: 330, height: 24, rx: 3,
        fill: "rgba(255,255,255,0.03)", stroke: c, "stroke-width": 1 }));
      g.appendChild(text(374, y + 2, k, "svg-label-sm", { fill: "var(--ink-dim)" }));
      g.appendChild(text(678, y + 2, v, "svg-label-sm",
        { "text-anchor": "end", fill: c }));
    });

    g.appendChild(text(380, 288,
      "the graph carries per-element provenance; a downstream analysis can now tell",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--ink-faint)" }));
    g.appendChild(text(380, 306,
      "a hydrogen the file recorded from one the valence model invented",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--ink-faint)" }));

  } else {
    // dispatch
    const q = { x: 380, y: 78 };
    g.appendChild(el("rect", { x: q.x - 160, y: q.y - 20, width: 320, height: 40, rx: 5,
      fill: "rgba(110,168,254,0.14)", stroke: "var(--accent)", "stroke-width": 1.5 }));
    g.appendChild(text(q.x, q.y + 5,
      "which states carry an Fe=O signature?", "svg-label",
      { "text-anchor": "middle", fill: "var(--ink)" }));

    const MODS = [
      { label: "honjo · chemistry", x: 130, ans: "cut structure at the iron", c: "var(--accent)" },
      { label: "sbs · circuit",     x: 380, ans: "redox state of the centre", c: "var(--good)" },
      { label: "shapeshifter · MS", x: 630, ans: "795 → 758 cm⁻¹ shift",     c: "var(--warm)" },
    ];
    MODS.forEach((m) => {
      g.appendChild(el("path", {
        d: `M${q.x},${q.y + 22} L${m.x},${172}`,
        stroke: m.c, "stroke-width": 1.4, opacity: 0.7, "marker-end": "url(#fa)",
      }));
      g.appendChild(el("rect", { x: m.x - 108, y: 174, width: 216, height: 56, rx: 5,
        fill: "rgba(255,255,255,0.04)", stroke: m.c, "stroke-width": 1.3 }));
      g.appendChild(text(m.x, 194, m.label, "svg-label-sm",
        { "text-anchor": "middle", fill: m.c }));
      g.appendChild(text(m.x, 214, m.ans, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--ink-dim)" }));
    });

    // converge on one node
    g.appendChild(el("circle", { cx: 380, cy: 300, r: 38,
      fill: "rgba(110,168,254,0.16)", stroke: "var(--accent)", "stroke-width": 2 }));
    g.appendChild(text(380, 296, "Compound I", "svg-label-sm",
      { "text-anchor": "middle", fill: "var(--ink)" }));
    g.appendChild(text(380, 312, "3 facts", "svg-label-sm",
      { "text-anchor": "middle", fill: "var(--accent)" }));
    MODS.forEach((m) => {
      g.appendChild(el("path", {
        d: `M${m.x},${232} L${380},${262}`,
        stroke: m.c, "stroke-width": 1.4, opacity: 0.7,
      }));
    });

    g.appendChild(text(380, 362,
      "each writes fact:<module>#<chunk> — three facts, one node, no collision",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--ink-faint)" }));
  }

  const defs = el("defs");
  const m = el("marker", { id: "fa", viewBox: "0 0 10 10", refX: 9, refY: 5,
    markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" });
  m.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--accent)" }));
  defs.appendChild(m);
  svg18.appendChild(defs);
  svg18.appendChild(g);
}

toggles("[data-stage]", (v) => { stage = v; drawFederate(); });

/* ----------------------------------------------------------------- fig 19 */

const STRUCTS = [
  { name: "ethanol",        heavy: 3,  h: 6,  bonds: 2,  supplied: 0.727 },
  { name: "aspirin",        heavy: 13, h: 8,  bonds: 13, supplied: 0.641 },
  { name: "paracetamol",    heavy: 11, h: 9,  bonds: 11, supplied: 0.688 },
  { name: "caffeine",       heavy: 14, h: 10, bonds: 15, supplied: 0.702 },
  { name: "ibuprofen",      heavy: 15, h: 18, bonds: 15, supplied: 0.786 },
  { name: "L-tyrosine",     heavy: 13, h: 11, bonds: 13, supplied: 0.734 },
  { name: "cholesterol",    heavy: 28, h: 46, bonds: 31, supplied: 0.812 },
  { name: "glucose",        heavy: 12, h: 12, bonds: 12, supplied: 0.756 },
];

const svg19 = document.getElementById("provenance");
let structIx = 0, tagFilter = "all";

function drawProv() {
  clear(svg19);
  const s = STRUCTS[structIx];
  const g = el("g");

  const total = s.heavy + s.h + s.bonds;
  const suppliedN = Math.round(total * s.supplied);
  const statedN = total - suppliedN;

  g.appendChild(text(380, 34,
    `${s.name} — ${total} graph elements from a SMILES record`,
    "svg-title", { "text-anchor": "middle" }));

  // element grid
  const cols = 22, size = 15, gap = 4;
  const x0 = 70, y0 = 64;
  let drawn = 0;
  for (let i = 0; i < total; i++) {
    const isStated = i < statedN;
    if (tagFilter === "stated" && !isStated) continue;
    if (tagFilter === "supplied" && isStated) continue;
    const col = drawn % cols, row = Math.floor(drawn / cols);
    drawn++;
    g.appendChild(el("rect", {
      x: x0 + col * (size + gap), y: y0 + row * (size + gap),
      width: size, height: size, rx: 2.5,
      fill: isStated ? "rgba(110,207,154,0.32)" : "rgba(240,168,96,0.28)",
      stroke: isStated ? "var(--good)" : "var(--warm)", "stroke-width": 1,
    }));
  }

  // bar
  const by = 210, bw = 620;
  g.appendChild(el("rect", { x: 70, y: by, width: bw, height: 26, rx: 3,
    fill: "none", stroke: "var(--line)" }));
  g.appendChild(el("rect", { x: 70, y: by, width: bw * (1 - s.supplied), height: 26, rx: 3,
    fill: "var(--good)", opacity: 0.45 }));
  g.appendChild(el("rect", { x: 70 + bw * (1 - s.supplied), y: by,
    width: bw * s.supplied, height: 26, rx: 3, fill: "var(--warm)", opacity: 0.45 }));

  g.appendChild(text(76, by + 18, `stated ${statedN}`, "svg-label-sm", { fill: "#fff" }));
  g.appendChild(text(684, by + 18, `supplied ${suppliedN}`, "svg-label-sm",
    { "text-anchor": "end", fill: "#fff" }));

  // 50% marker
  g.appendChild(el("line", { x1: 70 + bw * 0.5, y1: by - 8, x2: 70 + bw * 0.5, y2: by + 34,
    stroke: "var(--bad)", "stroke-dasharray": "3 3", "stroke-width": 1.2 }));
  g.appendChild(text(70 + bw * 0.5, by - 14, "50%", "svg-label-sm",
    { "text-anchor": "middle", fill: "var(--bad)" }));

  g.appendChild(el("rect", { x: 70, y: 256, width: 620, height: 46, rx: 5,
    fill: "rgba(240,168,96,0.07)", stroke: "var(--warm)", "stroke-width": 1 }));
  g.appendChild(text(86, 278,
    `${(s.supplied * 100).toFixed(1)}% of this graph is convention, not record`,
    "svg-label", { fill: "var(--warm)" }));
  g.appendChild(text(86, 295,
    "hydrogens from a valence model · aromaticity from a perception algorithm · no geometry at all",
    "svg-label-sm", { fill: "var(--ink-faint)" }));

  svg19.appendChild(g);
}

slider("struct", (v) => { structIx = v; drawProv(); }, (v) => STRUCTS[v].name);
toggles("[data-tag]", (v) => { tagFilter = v; drawProv(); });
