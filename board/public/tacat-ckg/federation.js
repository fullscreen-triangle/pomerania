/* Figures for the federated querying page.
   Fig 23: script-across-backends vs a plan language.
   Fig 24: six verdicts collapsing under a rows-only interface.
   Fig 25: two translation routes, retention, and legitimate disagreement.
*/
import { el, clear, text, slider, toggles } from "./lib.js";

/* ----------------------------------------------------------------- fig 23 */

const BACKENDS = [
  { id: "rhea",     label: "reaction KB",  iface: "SPARQL",        x: 110 },
  { id: "uniprot",  label: "protein",      iface: "SPARQL + REST", x: 320 },
  { id: "reactome", label: "pathway",      iface: "flat-file REST",x: 530 },
  { id: "onto",     label: "ontology",     iface: "download",      x: 700 },
];

const svg23 = document.getElementById("seam");
let fedView = "script";

function drawSeam() {
  clear(svg23);
  const g = el("g");

  if (fedView === "script") {
    g.appendChild(text(380, 34, "a host program, four query languages, four seams",
      "svg-title", { "text-anchor": "middle" }));

    // host band
    g.appendChild(el("rect", { x: 60, y: 62, width: 640, height: 46, rx: 5,
      fill: "rgba(255,255,255,0.04)", stroke: "var(--ink-faint)", "stroke-width": 1.3 }));
    g.appendChild(text(380, 90, "host language — knows nothing about the data",
      "svg-label", { "text-anchor": "middle", fill: "var(--ink-dim)" }));

    BACKENDS.forEach((b) => {
      // the seam
      g.appendChild(el("line", { x1: b.x, y1: 108, x2: b.x, y2: 176,
        stroke: "var(--bad)", "stroke-width": 1.6, "stroke-dasharray": "4 4" }));
      g.appendChild(el("circle", { cx: b.x, cy: 142, r: 8,
        fill: "rgba(232,116,106,0.3)", stroke: "var(--bad)", "stroke-width": 1.4 }));
      g.appendChild(text(b.x + 14, 146, "seam", "svg-label-sm", { fill: "var(--bad)" }));

      g.appendChild(el("rect", { x: b.x - 72, y: 176, width: 144, height: 54, rx: 5,
        fill: "rgba(110,168,254,0.08)", stroke: "var(--accent)", "stroke-width": 1.2 }));
      g.appendChild(text(b.x, 198, b.label, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--ink)" }));
      g.appendChild(text(b.x, 216, b.iface, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--accent)" }));
    });

    const FAILS = [
      "interpolate an identifier into a string",
      "parse whatever comes back",
      "a failure with no typed representation",
      "an under-retrieval nobody notices",
    ];
    FAILS.forEach((f, i) => {
      g.appendChild(text(76, 268 + i * 20, `· ${f}`, "svg-label-sm",
        { fill: "var(--ink-faint)" }));
    });
    g.appendChild(text(76, 250, "what lives in each seam", "svg-title", { fill: "var(--bad)" }));

  } else {
    g.appendChild(text(380, 34, "one plan over result sets; each backend is a triple",
      "svg-title", { "text-anchor": "middle" }));

    g.appendChild(el("rect", { x: 60, y: 62, width: 640, height: 60, rx: 5,
      fill: "rgba(110,207,154,0.08)", stroke: "var(--good)", "stroke-width": 1.5 }));
    g.appendChild(text(380, 86, "plan language — terms denote result sets",
      "svg-label", { "text-anchor": "middle", fill: "var(--ink)" }));
    g.appendChild(text(380, 106, "queries are its leaves, and are never written by the user",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--good)" }));

    BACKENDS.forEach((b) => {
      g.appendChild(el("line", { x1: b.x, y1: 122, x2: b.x, y2: 176,
        stroke: "var(--good)", "stroke-width": 1.4, opacity: 0.7 }));

      g.appendChild(el("rect", { x: b.x - 76, y: 176, width: 152, height: 78, rx: 5,
        fill: "rgba(110,168,254,0.08)", stroke: "var(--accent)", "stroke-width": 1.2 }));
      g.appendChild(text(b.x, 196, b.label, "svg-label-sm",
        { "text-anchor": "middle", fill: "var(--ink)" }));
      ["endpoint", "capability set", "extraction fn"].forEach((r, i) => {
        g.appendChild(text(b.x, 214 + i * 14, r, "svg-label-sm",
          { "text-anchor": "middle", fill: "var(--accent)", "font-size": "9" }));
      });
    });

    g.appendChild(el("rect", { x: 60, y: 282, width: 640, height: 60, rx: 5,
      fill: "rgba(110,207,154,0.06)", stroke: "var(--good)" }));
    g.appendChild(text(78, 306,
      "lowering a step is total exactly on steps whose capabilities the source declares",
      "svg-label-sm", { fill: "var(--ink-dim)" }));
    g.appendChild(text(78, 326,
      "so compilability is decided statically — before any request is issued",
      "svg-label-sm", { fill: "var(--good)" }));
  }

  svg23.appendChild(g);
}

toggles("[data-fed]", (v) => { fedView = v; drawSeam(); });

/* ----------------------------------------------------------------- fig 24 */

const VERDICTS = [
  { k: "answered",     d: "the step ran and returned its set",              c: "var(--good)",   bucket: "rows" },
  { k: "empty",        d: "ran, and the answer is genuinely empty",         c: "var(--good)",   bucket: "no rows" },
  { k: "unsupported",  d: "the source cannot answer this shape at all",     c: "var(--bad)",    bucket: "no rows" },
  { k: "unreachable",  d: "the endpoint did not respond",                   c: "var(--bad)",    bucket: "no rows" },
  { k: "truncated",    d: "the source capped the result",                   c: "var(--warm)",   bucket: "rows" },
  { k: "starved",      d: "failed because an EARLIER step under-retrieved", c: "var(--medium)", bucket: "no rows" },
];

const svg24 = document.getElementById("verdicts");
let vMode = "six";

function drawVerdicts() {
  clear(svg24);
  const g = el("g");

  g.appendChild(text(380, 34,
    vMode === "six"
      ? "six distinguishable outcomes a plan executor can act on"
      : "what an interface returning rows alone can say",
    "svg-title", { "text-anchor": "middle" }));

  VERDICTS.forEach((v, i) => {
    const y = 66 + i * 40;
    const collapsed = vMode === "rows";
    const col = collapsed
      ? (v.bucket === "rows" ? "var(--accent)" : "var(--ink-faint)")
      : v.c;

    g.appendChild(el("rect", { x: 70, y, width: 300, height: 30, rx: 4,
      fill: "rgba(255,255,255,0.03)", stroke: col, "stroke-width": 1.3 }));
    g.appendChild(text(84, y + 20, v.k, "svg-label", { fill: col }));

    g.appendChild(el("path", {
      d: `M372,${y + 15} L${collapsed ? 470 : 470},${collapsed ? (v.bucket === "rows" ? 120 : 220) : y + 15}`,
      stroke: col, "stroke-width": 1.2, opacity: 0.6, fill: "none",
    }));

    if (!collapsed) {
      g.appendChild(el("rect", { x: 472, y, width: 218, height: 30, rx: 4,
        fill: "none", stroke: "var(--line)" }));
      g.appendChild(text(484, y + 20, v.d.slice(0, 34), "svg-label-sm",
        { fill: "var(--ink-faint)", "font-size": "9.5" }));
    }
  });

  if (vMode === "rows") {
    [["rows returned", 120, "var(--accent)", 2],
     ["no rows", 220, "var(--ink-faint)", 4]].forEach(([lbl, y, c, n]) => {
      g.appendChild(el("rect", { x: 472, y: y - 18, width: 218, height: 40, rx: 5,
        fill: "rgba(255,255,255,0.04)", stroke: c, "stroke-width": 1.5 }));
      g.appendChild(text(581, y + 2, `${lbl} — ${n} situations`, "svg-label",
        { "text-anchor": "middle", fill: c }));
    });
    g.appendChild(text(380, 320,
      "four different reasons for an empty result, and one bit to say them in",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--bad)" }));
  } else {
    g.appendChild(text(380, 320,
      "starved is reachable only in federation — a single database cannot produce it",
      "svg-label-sm", { "text-anchor": "middle", fill: "var(--medium)" }));
  }

  svg24.appendChild(g);
}

toggles("[data-verdict]", (v) => { vMode = v; drawVerdicts(); });

/* ----------------------------------------------------------------- fig 25 */

const svg25 = document.getElementById("routes");
let coverage = 0.82, routeShow = "both";

function drawRoutes() {
  clear(svg25);
  const g = el("g");

  const N0 = 1000;
  const NS = [
    { id: "chem",  label: "chemical id",  x: 90,  y: 190 },
    { id: "prot",  label: "protein",      x: 300, y: 100 },
    { id: "rxn",   label: "reaction",     x: 300, y: 280 },
    { id: "gene",  label: "gene",         x: 510, y: 190 },
    { id: "path",  label: "pathway",      x: 690, y: 190 },
  ];
  const pos = Object.fromEntries(NS.map((n) => [n.id, n]));

  // two routes with different hop counts -> different retention
  const routeA = ["chem", "prot", "gene", "path"];
  const routeB = ["chem", "rxn", "gene", "path"];
  const covA = coverage, covB = coverage * 0.97;   // maps differ per namespace pair

  const retA = Math.pow(covA, routeA.length - 1);
  const retB = Math.pow(covB, routeB.length - 1);

  // non-confluence: the surviving sets only partially agree
  const overlap = Math.min(retA, retB) * (0.72 + 0.25 * coverage);

  function drawRoute(route, col, ret, show) {
    if (!show) return;
    for (let i = 0; i < route.length - 1; i++) {
      const A = pos[route[i]], B = pos[route[i + 1]];
      g.appendChild(el("line", {
        x1: A.x, y1: A.y, x2: B.x, y2: B.y,
        stroke: col, "stroke-width": 2.2, opacity: 0.8,
        "marker-end": "url(#fr)",
      }));
    }
  }

  drawRoute(routeA, "var(--accent)", retA, routeShow !== "b");
  drawRoute(routeB, "var(--warm)",   retB, routeShow !== "a");

  NS.forEach((n) => {
    g.appendChild(el("circle", { cx: n.x, cy: n.y, r: 30,
      fill: "rgba(255,255,255,0.05)", stroke: "var(--ink-faint)", "stroke-width": 1.4 }));
    g.appendChild(text(n.x, n.y + 4, n.label, "svg-label-sm",
      { "text-anchor": "middle", fill: "var(--ink)" }));
  });

  // retention bars
  const bx = 90, bw = 600, by = 300;
  [["route A  chem → protein → gene → pathway", retA, "var(--accent)", 0],
   ["route B  chem → reaction → gene → pathway", retB, "var(--warm)", 26]].forEach(
    ([lbl, ret, col, dy], i) => {
      const show = routeShow === "both" || (routeShow === "a" ? i === 0 : i === 1);
      if (!show) return;
      g.appendChild(el("rect", { x: bx, y: by + dy, width: bw, height: 18, rx: 3,
        fill: "none", stroke: "var(--line)" }));
      g.appendChild(el("rect", { x: bx, y: by + dy, width: bw * ret, height: 18, rx: 3,
        fill: col, opacity: 0.45 }));
      g.appendChild(text(bx + 8, by + dy + 13,
        `${lbl} — ${Math.round(N0 * ret)} of ${N0} survive`, "svg-label-sm",
        { fill: "#fff", "font-size": "9.5" }));
    });

  if (routeShow === "both") {
    g.appendChild(el("rect", { x: 90, y: 352, width: 600, height: 22, rx: 3,
      fill: "rgba(232,116,106,0.08)", stroke: "var(--bad)", "stroke-width": 1 }));
    g.appendChild(text(98, 367,
      `the two routes agree on ~${Math.round(N0 * overlap)} — neither is wrong, and the difference is the route`,
      "svg-label-sm", { fill: "var(--bad)" }));
  }

  g.appendChild(text(380, 34,
    "retention multiplies along a route; the maps are non-confluent",
    "svg-title", { "text-anchor": "middle" }));

  const defs = el("defs");
  const m = el("marker", { id: "fr", viewBox: "0 0 10 10", refX: 32, refY: 5,
    markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" });
  m.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", fill: "var(--ink-faint)" }));
  defs.appendChild(m);
  svg25.appendChild(defs);
  svg25.appendChild(g);
}

slider("cov", (v) => { coverage = v; drawRoutes(); }, (v) => `${(v * 100).toFixed(0)}%`);
toggles("[data-route]", (v) => { routeShow = v; drawRoutes(); });
