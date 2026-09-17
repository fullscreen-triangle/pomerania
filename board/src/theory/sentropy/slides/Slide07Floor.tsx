import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

type Node = { id: number; x: number; y: number };
type Edge = [number, number, number];

const nodes: Node[] = [
  { id: 0, x: 120, y: 90 },
  { id: 1, x: 250, y: 60 },
  { id: 2, x: 190, y: 190 },
  { id: 3, x: 400, y: 110 },
  { id: 4, x: 500, y: 210 },
  { id: 5, x: 360, y: 250 },
];
const edges: Edge[] = [
  [0, 1, 3],
  [0, 2, 4],
  [1, 2, 5],
  [2, 5, 2],
  [1, 3, 6],
  [3, 4, 4],
  [4, 5, 3],
  [3, 5, 5],
];
const beta = d3.min(edges, (e) => e[2])!;

function drawFloor(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 320;
  const s = mountSvg(el, w, h);

  s.selectAll(".edge")
    .data(edges)
    .join("line")
    .attr("class", "edge")
    .attr("x1", (d) => nodes[d[0]].x)
    .attr("y1", (d) => nodes[d[0]].y)
    .attr("x2", (d) => nodes[d[1]].x)
    .attr("y2", (d) => nodes[d[1]].y)
    .attr("stroke", C.line)
    .attr("stroke-width", 1.5);
  s.selectAll(".wlab")
    .data(edges)
    .join("text")
    .attr("class", "wlab")
    .attr("x", (d) => (nodes[d[0]].x + nodes[d[1]].x) / 2)
    .attr("y", (d) => (nodes[d[0]].y + nodes[d[1]].y) / 2 - 5)
    .text((d) => String(d[2]))
    .attr("font-size", 11)
    .attr("fill", C.ink3)
    .attr("text-anchor", "middle");
  s.selectAll(".node")
    .data(nodes)
    .join("circle")
    .attr("class", "node")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 13)
    .attr("fill", C.k1);

  function draw(cutAt: number) {
    const A = new Set(nodes.filter((n) => n.id < cutAt).map((n) => n.id));
    let cost = 0;
    s.selectAll(".edge")
      .attr("stroke", (d) => {
        const e = d as Edge;
        const crossing = A.has(e[0]) !== A.has(e[1]);
        if (crossing) cost += e[2];
        return crossing ? C.bad : C.line;
      })
      .attr("stroke-width", (d) => {
        const e = d as Edge;
        return A.has(e[0]) !== A.has(e[1]) ? Math.max(2, e[2] * 0.9) : 1.5;
      });
    s.selectAll(".node").attr("fill", (d) => (A.has((d as Node).id) ? C.k1 : C.k3));
    const valid = A.size > 0 && A.size < nodes.length;
    const readout = scope.querySelector<HTMLElement>("#floor-readout");
    if (readout)
      readout.innerHTML = valid
        ? `cut cost = <b style="color:${cost <= beta ? C.good : C.ink}">${cost}</b>` +
          `&nbsp;&nbsp;·&nbsp;&nbsp;floor β = ${beta}` +
          `<br>${cost >= beta ? "above the floor ✓" : "impossible"}`
        : `no separation — one side is empty<br><span style="color:${C.ink3}">a part must have a complement</span>`;
  }

  const sl = scope.querySelector<HTMLInputElement>("#floor-slider");
  const set = () => draw(Math.round((Number(sl?.value ?? 50) / 100) * nodes.length));
  if (sl) {
    sl.oninput = set;
    sl.value = "50";
  }
  set();
}

const Slide07Floor: SlideDef = {
  title: "The floor",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>One fact: telling things apart is never free</h2>
      <div className="two-col">
        <div>
          <p>
            Model anything you like as a <b>graph</b>: positions, and
            weighted contacts between them. The weight is what it{" "}
            <em>costs</em> to tell two positions apart.
          </p>

          <p className="hl" data-step={0}>
            To separate a part <span className="m">A</span> from the rest,
            you must cut every edge crossing the boundary.
          </p>

          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Drag the slider to try to make a separation cheap. You cannot
            get below the smallest edge weight — because a connected graph
            always has at least one crossing edge.
          </p>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Floor theorem.</b> Every separation costs at least{" "}
            <span className="m">β &gt; 0</span>.
            <div className="sub">
              No distinction is free. There is no sequence of ever-cheaper
              distinctions tending to nothing.
            </div>
          </div>

          <p className={`aside ${step < 3 ? "dim" : ""}`} data-step={3}>
            This is the <em>only</em> input. Everything after this slide is
            derived.
          </p>
        </div>
        <div>
          <D3Chart id="c-floor" draw={drawFloor} />
          <div className="controls">
            <label>
              Try to separate:{" "}
              <input type="range" id="floor-slider" min={0} max={100} defaultValue={50} />
            </label>
            <div id="floor-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide07Floor;
