import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

type Node = { id: number; x: number; y: number };
type Edge = [number, number, number];

const nodes: Node[] = [
  { id: 0, x: 130, y: 80 },
  { id: 1, x: 80, y: 190 },
  { id: 2, x: 200, y: 150 },
  { id: 3, x: 400, y: 150 },
  { id: 4, x: 520, y: 80 },
  { id: 5, x: 470, y: 190 },
];
const edges: Edge[] = [
  [0, 1, 10],
  [0, 2, 10],
  [1, 2, 10],
  [3, 4, 10],
  [3, 5, 10],
  [4, 5, 10],
  [2, 3, 1],
];

function cutCost(A: Set<number>) {
  return d3.sum(
    edges.filter((e) => A.has(e[0]) !== A.has(e[1])),
    (e) => e[2]
  );
}

function drawRegional(el: HTMLDivElement) {
  const w = 620,
    h = 300;
  const s = mountSvg(el, w, h);

  function highlight(A: Set<number>, label: string) {
    const cost = cutCost(A);
    s.selectAll(".edge")
      .attr("stroke", (d) => {
        const e = d as Edge;
        return A.has(e[0]) !== A.has(e[1]) ? C.bad : C.line;
      })
      .attr("stroke-width", (d) => {
        const e = d as Edge;
        return A.has(e[0]) !== A.has(e[1]) ? 3.5 : 1.5;
      });
    s.selectAll(".node").attr("fill", (d) => (A.has((d as Node).id) ? C.k2 : C.k1));
    const best = cost === 1;
    s.select(".verdict-txt").remove();
    s.append("text")
      .attr("class", "verdict-txt")
      .attr("x", 300)
      .attr("y", 275)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("fill", best ? C.good : C.ink2)
      .text(`${label}: cut costs ${cost}${best ? "  ← cheapest" : ""}`);
  }

  s.selectAll(".edge")
    .data(edges)
    .join("line")
    .attr("class", "edge")
    .attr("x1", (d) => nodes[d[0]].x)
    .attr("y1", (d) => nodes[d[0]].y)
    .attr("x2", (d) => nodes[d[1]].x)
    .attr("y2", (d) => nodes[d[1]].y)
    .attr("stroke", C.line)
    .attr("stroke-width", 1.5)
    .style("cursor", "pointer")
    .on("click", (_e, d) => {
      if (d[2] === 1) highlight(new Set([0, 1, 2]), "the bridge (region vs region)");
    });
  s.selectAll(".wlab")
    .data(edges)
    .join("text")
    .attr("class", "wlab")
    .attr("x", (d) => (nodes[d[0]].x + nodes[d[1]].x) / 2)
    .attr("y", (d) => (nodes[d[0]].y + nodes[d[1]].y) / 2 - 6)
    .text((d) => String(d[2]))
    .attr("font-size", 11)
    .attr("fill", (d) => (d[2] === 1 ? C.k2 : C.ink3))
    .attr("text-anchor", "middle");
  s.selectAll(".node")
    .data(nodes)
    .join("circle")
    .attr("class", "node")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 15)
    .attr("fill", C.k1)
    .on("click", (_e, d) => highlight(new Set([d.id]), `isolating one node`));
  s.append("text")
    .attr("x", 300)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", 12.5)
    .attr("fill", C.ink3)
    .text("click a node, then click the thin bridge edge");
  highlight(new Set([0, 1, 2]), "the bridge (region vs region)");
}

const Slide08Regional: SlideDef = {
  title: "Distinctions have extent",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>A distinction is never at a point</h2>
      <div className="two-col">
        <div>
          <p>
            The cheapest way to cut this graph is <b>not</b> to isolate any
            single position. It is to split it into two regions.
          </p>

          <p data-step={0}>
            Click any single node: watch what it costs to cut it out alone.
            Then click the <b>bridge</b>.
          </p>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Consequence.</b> Individuation is a property of a{" "}
            <em>pair of regions</em> — what something is, and what it is
            not.
            <div className="sub">
              There is no "the distinction at <span className="m">v</span>".
              Ask instead what <span className="m">A</span> is being
              distinguished <em>from</em>.
            </div>
          </div>

          <p className={`aside ${step < 2 ? "dim" : ""}`} data-step={2}>
            This is why every quantity below comes in two-sided form: drawn{" "}
            <em>versus</em> not drawn.
          </p>
        </div>
        <div>
          <D3Chart id="c-regional" draw={drawRegional} />
          <p className="cap">Click nodes or the bridge edge. Cheapest cut wins.</p>
        </div>
      </div>
    </>
  ),
};

export default Slide08Regional;
