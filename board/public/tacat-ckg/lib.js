/* ============================================================================
   Shared interaction machinery.

   Everything here is deliberately dependency-free and small. The figures are
   not decoration: each one computes the quantity the prose names, so that
   moving a control moves the number, and a reader who distrusts a claim can
   push on it directly.
   ========================================================================= */

export const SVGNS = "http://www.w3.org/2000/svg";

export function el(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    n.setAttribute(k, String(v));
  }
  for (const k of kids) {
    if (k == null) continue;
    n.appendChild(typeof k === "string" ? document.createTextNode(k) : k);
  }
  return n;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export const lerp = (a, b, t) => a + (b - a) * t;

/** Deterministic PRNG so every reader sees the same figure. */
export function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Wire a range input to a callback, keeping its <output> in sync. */
export function slider(id, fn, fmt = (v) => v.toFixed(2)) {
  const input = document.getElementById(id);
  if (!input) return () => {};
  const out = document.querySelector(`output[for="${id}"]`);
  const push = () => {
    const v = parseFloat(input.value);
    if (out) out.textContent = fmt(v);
    fn(v);
  };
  input.addEventListener("input", push);
  push();
  return push;
}

/** Toggle button group; calls fn with the pressed button's data-value. */
export function toggles(selector, fn) {
  const btns = [...document.querySelectorAll(selector)];
  btns.forEach((b) =>
    b.addEventListener("click", () => {
      btns.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
      fn(b.dataset.value, b);
    })
  );
  const on = btns.find((b) => b.getAttribute("aria-pressed") === "true") || btns[0];
  if (on) fn(on.dataset.value, on);
}

/** Make an SVG element draggable in user units. onMove receives (x, y). */
export function draggable(node, svg, onMove) {
  node.classList.add("draggable");
  let active = false;
  const pt = svg.createSVGPoint();
  const toUser = (evt) => {
    const src = evt.touches ? evt.touches[0] : evt;
    pt.x = src.clientX; pt.y = src.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  const down = (e) => { active = true; e.preventDefault(); };
  const move = (e) => { if (!active) return; const p = toUser(e); onMove(p.x, p.y); e.preventDefault(); };
  const up = () => { active = false; };
  node.addEventListener("mousedown", down);
  node.addEventListener("touchstart", down, { passive: false });
  window.addEventListener("mousemove", move);
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("mouseup", up);
  window.addEventListener("touchend", up);
}

/* ---------------------------------------------------------------- graphs */

/**
 * Exact minimum s-t cut by brute force over source-side subsets.
 * Graphs in these figures are tiny (n <= 14), so exhaustive is both fast and
 * beyond doubt — which matters more here than asymptotics.
 *
 * @param {string[]} nodes
 * @param {Array<[string,string,number]>} edges  undirected, weighted
 * @param {string} s  source (kept on the source side)
 * @param {string} t  sink   (kept on the sink side)
 * @returns {{weight:number, cut:Array, side:string[]}}
 */
export function minCut(nodes, edges, s, t) {
  const free = nodes.filter((n) => n !== s && n !== t);
  let best = { weight: Infinity, cut: [], side: [s] };
  for (let mask = 0; mask < (1 << free.length); mask++) {
    const side = new Set([s]);
    free.forEach((n, i) => { if (mask & (1 << i)) side.add(n); });
    let w = 0;
    const cut = [];
    for (const [u, v, wt] of edges) {
      const a = side.has(u), b = side.has(v);
      if (a !== b) { w += wt; cut.push([u, v, wt]); }
    }
    if (w < best.weight) best = { weight: w, cut, side: [...side] };
  }
  return best;
}

/** Force-directed layout, run to a fixed iteration count for determinism. */
export function layout(nodes, edges, w, h, iters = 320, seed = 7) {
  const rnd = mulberry(seed);
  const pos = {};
  nodes.forEach((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2;
    pos[n] = { x: w / 2 + Math.cos(a) * w * 0.28 + (rnd() - 0.5) * 8,
               y: h / 2 + Math.sin(a) * h * 0.28 + (rnd() - 0.5) * 8 };
  });
  const adj = new Map(nodes.map((n) => [n, []]));
  edges.forEach(([u, v]) => { adj.get(u)?.push(v); adj.get(v)?.push(u); });

  for (let it = 0; it < iters; it++) {
    const k = 0.06;
    for (const a of nodes) for (const b of nodes) {
      if (a === b) continue;
      const dx = pos[a].x - pos[b].x, dy = pos[a].y - pos[b].y;
      const d2 = Math.max(36, dx * dx + dy * dy);
      const f = 900 / d2;
      pos[a].x += dx * f * k; pos[a].y += dy * f * k;
    }
    for (const [u, v] of edges) {
      const dx = pos[v].x - pos[u].x, dy = pos[v].y - pos[u].y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const f = (d - 90) * 0.012;
      pos[u].x += dx / d * f * 10; pos[u].y += dy / d * f * 10;
      pos[v].x -= dx / d * f * 10; pos[v].y -= dy / d * f * 10;
    }
    for (const n of nodes) {
      pos[n].x = clamp(pos[n].x, 30, w - 30);
      pos[n].y = clamp(pos[n].y, 30, h - 30);
    }
  }
  return pos;
}

/* ------------------------------------------------------------- svg sugar */

export function line(x1, y1, x2, y2, attrs = {}) {
  return el("line", { x1, y1, x2, y2, stroke: "var(--line)", "stroke-width": 1, ...attrs });
}

export function text(x, y, str, cls = "svg-label", attrs = {}) {
  return el("text", { x, y, class: cls, ...attrs }, str);
}

export function circle(cx, cy, r, attrs = {}) {
  return el("circle", { cx, cy, r, ...attrs });
}

/** A labelled axis frame with optional gridlines. Returns scale functions. */
export function frame(svg, box, xDomain, yDomain, opts = {}) {
  const { xTicks = 5, yTicks = 4, xLabel = "", yLabel = "", fmtX = (v) => String(v), fmtY = (v) => String(v) } = opts;
  const [x0, y0, w, h] = box;
  const X = (v) => x0 + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * w;
  const Y = (v) => y0 + h - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * h;

  const g = el("g");
  for (let i = 0; i <= yTicks; i++) {
    const v = lerp(yDomain[0], yDomain[1], i / yTicks);
    g.appendChild(line(x0, Y(v), x0 + w, Y(v), { class: "svg-grid" }));
    g.appendChild(text(x0 - 8, Y(v) + 3.5, fmtY(v), "svg-label-sm", { "text-anchor": "end" }));
  }
  for (let i = 0; i <= xTicks; i++) {
    const v = lerp(xDomain[0], xDomain[1], i / xTicks);
    g.appendChild(text(X(v), y0 + h + 16, fmtX(v), "svg-label-sm", { "text-anchor": "middle" }));
  }
  g.appendChild(line(x0, y0 + h, x0 + w, y0 + h, { class: "svg-axis" }));
  g.appendChild(line(x0, y0, x0, y0 + h, { class: "svg-axis" }));
  if (xLabel) g.appendChild(text(x0 + w / 2, y0 + h + 34, xLabel, "svg-title", { "text-anchor": "middle" }));
  if (yLabel) g.appendChild(text(0, 0, yLabel, "svg-title", {
    "text-anchor": "middle", transform: `translate(${x0 - 42},${y0 + h / 2}) rotate(-90)`
  }));
  svg.appendChild(g);
  return { X, Y };
}

/** Build a <path> d-string from [x,y] points. */
export function polyline(pts, X, Y) {
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(2)},${Y(y).toFixed(2)}`).join("");
}
