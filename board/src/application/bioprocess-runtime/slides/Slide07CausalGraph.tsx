import * as d3 from "d3";
import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { runBioprocess } from "../runtime";

function drawCausalGraph(el: HTMLDivElement, scope: HTMLElement) {
  const w = 680,
    h = 420;
  const s = mountSvg(el, w, h);

  const result = runBioprocess(4, 11);
  const nodes = result.nodes.map((n) => ({ ...n }));
  const links = nodes.flatMap((n) => n.reads.map((r) => ({ source: r, target: n.id })));

  const sim = d3
    .forceSimulation(nodes as unknown as d3.SimulationNodeDatum[])
    .force(
      "link",
      d3
        .forceLink(links as unknown as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
        .id((d: unknown) => (d as { id: string }).id)
        .distance(38)
        .strength(0.5)
    )
    .force("charge", d3.forceManyBody().strength(-60))
    .force("center", d3.forceCenter(w / 2, h / 2))
    .force(
      "y",
      d3.forceY((d) => {
        const idx = result.plates.indexOf((d as { plate: string }).plate);
        return 60 + idx * (320 / Math.max(1, result.plates.length - 1));
      }).strength(0.3)
    )
    .stop();
  for (let i = 0; i < 200; i++) sim.tick();

  const nodeById = new Map(nodes.map((n) => [n.id, n as unknown as { x: number; y: number }]));

  s.selectAll(".e")
    .data(links)
    .join("line")
    .attr("class", "e")
    .attr("x1", (d) => nodeById.get(d.source as unknown as string)?.x ?? 0)
    .attr("y1", (d) => nodeById.get(d.source as unknown as string)?.y ?? 0)
    .attr("x2", (d) => nodeById.get(d.target as unknown as string)?.x ?? 0)
    .attr("y2", (d) => nodeById.get(d.target as unknown as string)?.y ?? 0)
    .attr("stroke", C.ink3)
    .attr("stroke-width", 1)
    .attr("opacity", 0.5);

  s.selectAll(".n")
    .data(nodes)
    .join("circle")
    .attr("class", "n")
    .attr("cx", (d) => (d as unknown as { x: number }).x)
    .attr("cy", (d) => (d as unknown as { y: number }).y)
    .attr("r", (d) => (d.kind === "read" ? 8 : 5))
    .attr("fill", (d) => (d.kind === "read" ? C.k1 : d.anomaly ? C.bad : C.panel))
    .attr("stroke", C.ink2)
    .attr("stroke-width", 1);

  result.plates.forEach((plate, i) => {
    s.append("text")
      .attr("x", 10)
      .attr("y", 60 + i * (320 / Math.max(1, result.plates.length - 1)) + 4)
      .attr("font-size", 10.5)
      .attr("fill", C.ink3)
      .text(plate);
  });

  const readout = scope.querySelector<HTMLElement>("#causal-readout");
  if (readout)
    readout.innerHTML =
      `${nodes.length} nodes, ${links.length} causal edges induced by this run<br>` +
      `<span style="color:${C.ink3}">large blue nodes = reads on the shared instrument — the only point where different plates' chains actually touch. Every edge exists because a value emitted at one node was read at the next; none were declared in advance.</span>`;
}

const Slide07CausalGraph: SlideDef = {
  title: "The causal edge graph",
  maxStep: 0,
  render: () => (
    <>
      <h2>Edges are records of what happened, not a declared dependency graph</h2>
      <p>
        The same run as the Gantt chart, seen as a graph: each plate's
        chain runs mostly independently (mostly vertical), and the shared
        reader nodes (large, blue) are the only places different plates'
        trajectories actually interact. Nothing here was laid out by a
        scheduler — the edge u→v exists exactly because, in this run, a
        value emitted at u was read by the module that then emitted at v.
      </p>
      <D3Chart id="c-causal" draw={drawCausalGraph} />
      <div className="controls">
        <div id="causal-readout" className="readout" />
      </div>
    </>
  ),
};

export default Slide07CausalGraph;
