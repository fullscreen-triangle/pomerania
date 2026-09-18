import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { MEDIUM, addClaim, addContact, claims, floorOfGraph, newGraph, separationCost } from "../graph";

function buildDemo() {
  const g = newGraph();
  addClaim(g, "doc_A", 3);
  addClaim(g, "doc_B", 2.5);
  addClaim(g, "record_C", 4);
  addContact(g, "doc_A", "doc_B", 1.5);
  addContact(g, "doc_B", "record_C", 1.2);
  return g;
}

function drawFloor(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 320;
  const s = mountSvg(el, w, h);
  const g = buildDemo();
  const cs = claims(g);
  const nodePos = new Map<string, { x: number; y: number }>();
  nodePos.set(MEDIUM, { x: w / 2, y: 60 });
  const spread = 480;
  cs.forEach((c, i) => nodePos.set(c, { x: w / 2 - spread / 2 + (spread * i) / (cs.length - 1 || 1), y: 240 }));

  const edges: [string, string, number][] = [];
  for (const [u, es] of g.adj) for (const [v, weight] of es) if (u < v) edges.push([u, v, weight]);

  s.selectAll(".e")
    .data(edges)
    .join("line")
    .attr("class", "e")
    .attr("x1", (d) => nodePos.get(d[0])!.x)
    .attr("y1", (d) => nodePos.get(d[0])!.y)
    .attr("x2", (d) => nodePos.get(d[1])!.x)
    .attr("y2", (d) => nodePos.get(d[1])!.y)
    .attr("stroke", C.line)
    .attr("stroke-width", (d) => 1 + d[2] * 0.6);
  s.selectAll(".wl")
    .data(edges)
    .join("text")
    .attr("class", "wl")
    .attr("x", (d) => (nodePos.get(d[0])!.x + nodePos.get(d[1])!.x) / 2)
    .attr("y", (d) => (nodePos.get(d[0])!.y + nodePos.get(d[1])!.y) / 2 - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", C.ink3)
    .text((d) => d[2].toFixed(1));

  s.selectAll(".n")
    .data([MEDIUM, ...cs])
    .join("circle")
    .attr("class", "n")
    .attr("cx", (d) => nodePos.get(d)!.x)
    .attr("cy", (d) => nodePos.get(d)!.y)
    .attr("r", (d) => (d === MEDIUM ? 20 : 14))
    .attr("fill", (d) => (d === MEDIUM ? C.k4 : C.panel))
    .attr("stroke", C.k1)
    .attr("stroke-width", 2);
  s.selectAll(".lbl")
    .data([MEDIUM, ...cs])
    .join("text")
    .attr("class", "lbl")
    .attr("x", (d) => nodePos.get(d)!.x)
    .attr("y", (d) => nodePos.get(d)!.y - 24)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", C.ink2)
    .text((d) => (d === MEDIUM ? "medium" : d));

  const floor = floorOfGraph(g);
  const readout = scope.querySelector<HTMLElement>("#floor-readout");
  if (readout) {
    const rows = cs.map((c) => `${c}: σ = ${separationCost(g, c).toFixed(2)}`).join("<br>");
    readout.innerHTML = `${rows}<br><br>β (graph floor) = <b style="color:${C.good}">${floor.toFixed(2)}</b>`;
  }
}

const Slide02Floor: SlideDef = {
  title: "The resolution floor",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>No retrieval is free — every result costs a minimum cut</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Contact graph, medium</h3>
            <p>
              A finite weighted graph with one distinguished vertex, the
              medium, adjacent to every claim. The medium stands for
              everything not yet individuated — the rest of an
              inexhaustible corpus, database, or model.
            </p>
          </div>
          <div className="defn" data-step={1}>
            <h3>Separation cost σ(v)</h3>
            <p>
              The minimum cut separating a claim v from the medium — exact
              max-flow, computed below, not estimated.
            </p>
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Floor theorem.</b> β = min over all claims of σ(v) is
            strictly positive, because the medium is never exhausted by any
            finite retrieval. No result is a point; every result is a
            bounded region.
          </div>
        </div>
        <div>
          <D3Chart id="c-floor-eq" draw={drawFloor} />
          <div className="controls">
            <div id="floor-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide02Floor;
