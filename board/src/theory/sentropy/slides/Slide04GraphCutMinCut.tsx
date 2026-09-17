import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

type Node = { id: number; x: number; y: number };
type Edge = [number, number, number];

const nodes: Node[] = [
  { id: 0, x: 130, y: 90 },
  { id: 1, x: 250, y: 60 },
  { id: 2, x: 190, y: 185 },
  { id: 3, x: 400, y: 105 },
  { id: 4, x: 505, y: 190 },
  { id: 5, x: 355, y: 240 },
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

function cost(A: Set<number>) {
  return d3.sum(
    edges.filter((e) => A.has(e[0]) !== A.has(e[1])),
    (e) => e[2]
  );
}

function minCut() {
  let best: { c: number; A: Set<number> | null } = { c: Infinity, A: null };
  for (let mask = 1; mask < 63; mask++) {
    const A = new Set<number>();
    for (let i = 0; i < 6; i++) if (mask & (1 << i)) A.add(i);
    const c = cost(A);
    if (c < best.c) best = { c, A };
  }
  return best;
}

function drawDefs(el: HTMLDivElement, scope: HTMLElement) {
  const s = mountSvg(el, 620, 310);

  function render(A: Set<number> | null, label: string) {
    s.selectAll(".edge")
      .attr("stroke", (d) => {
        const e = d as Edge;
        return A && A.has(e[0]) !== A.has(e[1]) ? C.k2 : C.line;
      })
      .attr("stroke-width", (d) => {
        const e = d as Edge;
        return A && A.has(e[0]) !== A.has(e[1]) ? 3.4 : 1.6;
      });
    s.selectAll(".node")
      .attr("fill", (d) => (A && A.has((d as Node).id) ? C.k1 : C.panel))
      .attr("stroke", C.k1)
      .attr("stroke-width", 2);
    const readout = scope.querySelector<HTMLElement>("#defs-readout");
    if (readout) readout.innerHTML = label;
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
    .attr("stroke-width", 1.6);
  s.selectAll(".wl")
    .data(edges)
    .join("text")
    .attr("class", "wl")
    .attr("x", (d) => (nodes[d[0]].x + nodes[d[1]].x) / 2)
    .attr("y", (d) => (nodes[d[0]].y + nodes[d[1]].y) / 2 - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", C.ink3)
    .text((d) => String(d[2]));
  s.selectAll(".node")
    .data(nodes)
    .join("circle")
    .attr("class", "node")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 14)
    .attr("fill", C.panel)
    .attr("stroke", C.k1)
    .attr("stroke-width", 2);

  const defaultLabel =
    "6 vertices · 8 weighted edges<br>" +
    `<span style='color:${C.ink3}'>the weight is what it costs to separate</span>`;
  render(null, defaultLabel);

  const stepBtn = scope.querySelector<HTMLButtonElement>("#defs-step");
  const minBtn = scope.querySelector<HTMLButtonElement>("#defs-min");
  const resetBtn = scope.querySelector<HTMLButtonElement>("#defs-reset");

  if (stepBtn)
    stepBtn.onclick = () => {
      const A = new Set([0, 1, 2]);
      render(
        A,
        `cut of {0,1,2} = the ${
          edges.filter((e) => A.has(e[0]) !== A.has(e[1])).length
        } red edges<br>cost = <b>${cost(A)}</b>`
      );
    };
  if (minBtn)
    minBtn.onclick = () => {
      const b = minCut();
      render(
        b.A,
        `minimum over all 62 splittings<br>cheapest cost = <b style="color:${C.good}">${b.c}</b> <span style="color:${C.ink3}">— and it is never 0</span>`
      );
    };
  if (resetBtn) resetBtn.onclick = () => render(null, defaultLabel);
}

const Slide04GraphCutMinCut: SlideDef = {
  title: "Graph, cut, minimum cut",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>The three words we need</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>
              A <span className="k1">graph</span>
            </h3>
            <p>
              Dots and lines. The dots (<b>vertices</b>) are positions —
              states, people, tasks, whatever you are modelling. A line (
              <b>edge</b>) between two dots means they are{" "}
              <em>in contact</em>: adjacent, confusable, connected.
            </p>
          </div>

          <div className="defn" data-step={1}>
            <h3>
              A <span className="k2">weight</span>
            </h3>
            <p>
              Each edge carries a positive number: what it <em>costs</em> to
              tell those two positions apart. Bigger weight, harder to
              separate.
            </p>
          </div>

          <div className="defn" data-step={2}>
            <h3>
              A <span className="k3">cut</span>
            </h3>
            <p>
              Split the dots into two groups. The cut is the set of edges
              running between the groups. Its <b>cost</b> is the sum of
              their weights — what you pay to sever that distinction.
            </p>
          </div>

          <div className="defn" data-step={3}>
            <h3>
              The <span className="k4">minimum cut</span>
            </h3>
            <p>
              Over every possible way of splitting, the cheapest one. This
              is the <em>easiest genuine distinction</em> the structure
              admits.
            </p>
          </div>

          <p className={`aside ${step < 4 ? "dim" : ""}`} data-step={4}>
            Click the buttons to build one up. The numbers on the right are
            computed, not illustrated.
          </p>
        </div>
        <div>
          <D3Chart id="c-defs" draw={drawDefs} />
          <div className="controls">
            <button id="defs-step">Show cut of the highlighted group</button>
            <button id="defs-min">Find the minimum cut</button>
            <button id="defs-reset">Reset</button>
            <div id="defs-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide04GraphCutMinCut;
