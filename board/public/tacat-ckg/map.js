/* The dependency map on the overview page. Hoverable, clickable, deterministic. */
import { el, clear, text } from "./lib.js";

const IDEAS = [
  { id: "sent",   x: 380, y: 340, r: 30, label: "S-entropy",         href: "s-entropy.html",
    note: "Distance to truth from a stated observer. Where the floor should be derived." },
  { id: "floor",  x: 380, y: 240, r: 32, label: "the floor",        href: "floor.html",
    note: "Separation costs something. Everything above needs this to be well posed." },
  { id: "indiv",  x: 150, y: 178, r: 32, label: "individuation",    href: "individuation.html",
    note: "A part is the complement of what it is not. Identity is a minimum cut." },
  { id: "prop",   x: 380, y: 150, r: 32, label: "propagation",      href: "propagation.html",
    note: "The graph is the fixed point of a map the system already defines." },
  { id: "opac",   x: 610, y: 178, r: 32, label: "path opacity",     href: "opacity.html",
    note: "Only endpoints are checked, so the interior is free." },
  { id: "lang",   x: 200, y: 58,  r: 32, label: "languages",        href: "languages.html",
    note: "Four surface syntaxes over one semantics; a converter that refuses." },
  { id: "runt",   x: 560, y: 58,  r: 34, label: "runtime",          href: "runtime.html",
    note: "Nodes carry code. Edges exist because a value propagated." },
];

const INSTANCES = [
  { id: "solv",  x: 62,  y: 96,  label: "solvent role",     to: "indiv", href: "individuation.html#solvent" },
  { id: "dir",   x: 76,  y: 268, label: "reaction direction", to: "indiv", href: "individuation.html#direction" },
  { id: "cof",   x: 210, y: 84,  label: "cofactor split",    to: "indiv", href: "individuation.html#cofactor" },
  { id: "instr", x: 210, y: 300, label: "instrument bound",  to: "floor", href: "floor.html#instrument" },
  { id: "trip",  x: 552, y: 300, label: "triplicate → four", to: "floor", href: "floor.html#triplicate" },
  { id: "circ",  x: 380, y: 200, label: "circuit → graph",   to: "prop",  href: "propagation.html#circuit" },
  { id: "virt",  x: 690, y: 152, label: "virtual states",    to: "opac",  href: "opacity.html#virtual" },
  { id: "mech",  x: 700, y: 282, label: "mechanism blind",   to: "opac",  href: "opacity.html#mechanism" },
  { id: "prov",  x: 70,  y: 40,  label: "73.4% supplied",    to: "lang",  href: "languages.html#federation" },
  { id: "cut",   x: 330, y: 16,  label: "one verb: cut",     to: "lang",  href: "languages.html#honjo" },
  { id: "katal", x: 640, y: 348, label: "catalyst algebra",  to: "sent",  href: "s-entropy.html#catalyst" },
  { id: "resid", x: 132, y: 348, label: "residue persists",  to: "sent",  href: "s-entropy.html#residue" },
];

const EDGES = [
  ["floor", "indiv"], ["floor", "prop"], ["floor", "opac"],
  ["indiv", "prop"], ["prop", "opac"], ["prop", "runt"], ["opac", "runt"],
  ["indiv", "lang"], ["lang", "runt"], ["sent", "floor"],
];

const svg = document.getElementById("map");
const byId = Object.fromEntries(IDEAS.map((n) => [n.id, n]));

function render() {
  clear(svg);

  // structural edges
  const gE = el("g");
  for (const [a, b] of EDGES) {
    const A = byId[a], B = byId[b];
    gE.appendChild(el("line", {
      x1: A.x, y1: A.y, x2: B.x, y2: B.y,
      stroke: "var(--accent-dim)", "stroke-width": 1.4, opacity: 0.5,
    }));
  }
  // instance tethers
  for (const s of INSTANCES) {
    const T = byId[s.to];
    gE.appendChild(el("line", {
      x1: s.x, y1: s.y, x2: T.x, y2: T.y,
      stroke: "var(--warm)", "stroke-width": 1, opacity: 0.28,
      "stroke-dasharray": "3 3",
    }));
  }
  svg.appendChild(gE);

  const tip = el("g", { opacity: 0 });
  const tipBg = el("rect", {
    rx: 4, fill: "var(--bg-sunken)", stroke: "var(--line)", "stroke-width": 1,
  });
  const tipTx = text(0, 0, "", "svg-label-sm");
  tip.appendChild(tipBg); tip.appendChild(tipTx);

  function showTip(x, y, str) {
    tipTx.textContent = str;
    tipTx.setAttribute("x", x + 10);
    tipTx.setAttribute("y", y - 8);
    const len = str.length * 5.4 + 16;
    tipBg.setAttribute("x", x + 4);
    tipBg.setAttribute("y", y - 21);
    tipBg.setAttribute("width", len);
    tipBg.setAttribute("height", 18);
    tip.setAttribute("opacity", 1);
  }

  // instance chips
  for (const s of INSTANCES) {
    const a = el("a", { href: s.href });
    const w = s.label.length * 6.1 + 16;
    a.appendChild(el("rect", {
      x: s.x - w / 2, y: s.y - 11, width: w, height: 22, rx: 11,
      fill: "rgba(240,168,96,0.09)", stroke: "var(--warm)",
      "stroke-width": 1, opacity: 0.75,
    }));
    a.appendChild(text(s.x, s.y + 4, s.label, "svg-label-sm", {
      "text-anchor": "middle", fill: "var(--warm)",
    }));
    a.style.cursor = "pointer";
    svg.appendChild(a);
  }

  // idea nodes
  for (const n of IDEAS) {
    const a = el("a", { href: n.href });
    const c = el("circle", {
      cx: n.x, cy: n.y, r: n.r,
      fill: "rgba(110,168,254,0.12)", stroke: "var(--accent)", "stroke-width": 1.6,
    });
    a.appendChild(c);
    a.appendChild(text(n.x, n.y + 4, n.label, "svg-label", {
      "text-anchor": "middle", fill: "var(--ink)",
    }));
    a.style.cursor = "pointer";
    a.addEventListener("mouseenter", () => {
      c.setAttribute("fill", "rgba(110,168,254,0.28)");
      showTip(n.x + n.r, n.y, n.note);
    });
    a.addEventListener("mouseleave", () => {
      c.setAttribute("fill", "rgba(110,168,254,0.12)");
      tip.setAttribute("opacity", 0);
    });
    svg.appendChild(a);
  }

  svg.appendChild(tip);
}

render();
