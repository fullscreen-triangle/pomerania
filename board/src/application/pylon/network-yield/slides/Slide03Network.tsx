import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// Illustrative instance (Def. 2.1-2.6): definitional diagram, not a proved
// numerical claim, so no validated data is needed here. Three queue nodes
// feed two execution slots; arrow weight/color encodes directional pressure
// P(n,e) (Def. 2.4) -- thicker/warmer arrows carry more target-ward pressure.
type QNode = { id: string; label: string; x: number; y: number };
type ESlot = { id: string; label: string; x: number; y: number };
type Flow = { from: string; to: string; pressure: number };

const queues: QNode[] = [
  { id: "n1", label: "n₁", x: 70, y: 60 },
  { id: "n2", label: "n₂", x: 70, y: 160 },
  { id: "n3", label: "n₃", x: 70, y: 260 },
];
const slots: ESlot[] = [
  { id: "e1", label: "e₁", x: 480, y: 100 },
  { id: "e2", label: "e₂", x: 480, y: 220 },
];
const flows: Flow[] = [
  { from: "n1", to: "e1", pressure: 7 },
  { from: "n2", to: "e1", pressure: 2 },
  { from: "n2", to: "e2", pressure: 5 },
  { from: "n3", to: "e2", pressure: 9 },
];

function drawNetwork(el: HTMLDivElement) {
  const w = 620,
    h = 320;
  const s = mountSvg(el, w, h);
  const qById = new Map(queues.map((q) => [q.id, q]));
  const eById = new Map(slots.map((e) => [e.id, e]));
  const maxP = Math.max(...flows.map((f) => f.pressure));

  s.append("defs")
    .append("marker")
    .attr("id", "arrow-net")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerWidth", 7)
    .attr("markerHeight", 7)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z")
    .attr("fill", C.ink3);

  flows.forEach((f) => {
    const a = qById.get(f.from)!;
    const b = eById.get(f.to)!;
    const t = f.pressure / maxP;
    const color = d3interp(t);
    s.append("line")
      .attr("x1", a.x + 22)
      .attr("y1", a.y)
      .attr("x2", b.x - 22)
      .attr("y2", b.y)
      .attr("stroke", color)
      .attr("stroke-width", 1.5 + t * 5)
      .attr("marker-end", "url(#arrow-net)")
      .attr("opacity", 0.9);
    s.append("text")
      .attr("x", (a.x + b.x) / 2)
      .attr("y", (a.y + b.y) / 2 - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", C.ink3)
      .text(`P=${f.pressure}`);
  });

  queues.forEach((q) => {
    s.append("rect")
      .attr("x", q.x - 20)
      .attr("y", q.y - 16)
      .attr("width", 40)
      .attr("height", 32)
      .attr("rx", 5)
      .attr("fill", C.panel)
      .attr("stroke", C.k1)
      .attr("stroke-width", 1.6);
    s.append("text")
      .attr("x", q.x)
      .attr("y", q.y + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", C.ink)
      .text(q.label);
  });

  slots.forEach((e) => {
    s.append("circle")
      .attr("cx", e.x)
      .attr("cy", e.y)
      .attr("r", 22)
      .attr("fill", C.panel)
      .attr("stroke", C.k3)
      .attr("stroke-width", 1.6);
    s.append("text")
      .attr("x", e.x)
      .attr("y", e.y + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", C.ink)
      .text(e.label);
  });

  s.append("text")
    .attr("x", 70)
    .attr("y", 300)
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("queue nodes N (buffers)");
  s.append("text")
    .attr("x", 480)
    .attr("y", 300)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("execution slots E (processors)");
}

function d3interp(t: number): string {
  // manual lerp between ink3 (low pressure) and k2 (high pressure), avoiding
  // an extra d3-scale-chromatic import for one two-stop gradient
  const a = { r: 0x7f, g: 0x95, b: 0xa6 }; // ink3
  const b = { r: 0xe0, g: 0x8b, b: 0x90 }; // k2
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

const Slide03Network: SlideDef = {
  title: "The computing network model",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Queues, slots, and target-ward pressure</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3 className="k1">Computing network</h3>
            <p>
              𝒢 = (N, E, c, ℓ, v̄): queue nodes N (buffers), execution slots E
              (processors), thread capacity c(e), expected duration ℓ(e), max
              throughput v̄(e) per slot.
            </p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k2">Task &amp; residual work</h3>
            <p>
              A task x = (o(x), τ(x), w(x)): origin node, completion target,
              work estimate. Residual r(x,e) = ρ(loc(x), τ(x)) — Euclidean
              distance from the partial result to the target.
            </p>
          </div>
          <div className={`defn ${step < 2 ? "dim" : ""}`} data-step={2}>
            <h3 className="k3">Directional pressure</h3>
            <p>
              P(n,e) = Σ over queued tasks of [r(x,e) − ρ(hd(e), τ(x))]⁺ — only
              tasks that would actually make progress toward e contribute.
            </p>
          </div>
          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>Network transport yield</b> (Def. 2.6): total target-ward
            progress divided by total resource consumption, τ₀ · c(e) ·
            g_u(v(e)) summed over slots, with g_u a strictly convex
            utilisation cost. Everything from here is stated in terms of this
            one ratio.
          </div>
        </div>
        <div>
          <D3Chart id="c-network" draw={drawNetwork} />
          <p className="cap">
            Illustrative instance — three queue nodes routing to two
            execution slots; arrow weight/color encodes directional pressure
            P(n,e). Definitional, not drawn from validated data.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide03Network;
