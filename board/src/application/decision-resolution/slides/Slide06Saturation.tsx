import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

// Gantt-style timeline: one row per cardinality N, bar coloured by
// whether the uniform monitor at that N achieves zero gap for a
// 3-action objective (aligned iff 3 | N) versus an off-grid threshold
// (never aligned, for any N up to 18).
function drawGantt(el: HTMLDivElement, scope: HTMLElement) {
  const w = 640,
    h = 420,
    margin = { top: 30, right: 20, bottom: 30, left: 90 };
  const s = mountSvg(el, w, h);

  const Ns = Array.from({ length: 18 }, (_, i) => i + 1);
  const rowH = (h - margin.top - margin.bottom) / Ns.length;
  const barMaxW = w - margin.left - margin.right;

  s.append("text").attr("x", margin.left).attr("y", 16).attr("font-size", 11).attr("fill", C.ink2).text("3-action objective: aligned ⟺ 3 | N");
  s.append("text").attr("x", margin.left + 320).attr("y", 16).attr("font-size", 11).attr("fill", C.ink2).text("off-grid threshold θ = 0.3719: never aligned");

  Ns.forEach((N, i) => {
    const y = margin.top + i * rowH;
    const aligned3 = N % 3 === 0;
    const gapLeft = aligned3 ? 0 : 1;
    const barW = barMaxW * 0.46;

    s.append("text").attr("x", margin.left - 8).attr("y", y + rowH / 2 + 4).attr("text-anchor", "end").attr("font-size", 10.5).attr("fill", C.ink3).text(`N=${N}`);

    // three-action bar
    s.append("rect")
      .attr("x", margin.left)
      .attr("y", y + rowH * 0.18)
      .attr("width", barW)
      .attr("height", rowH * 0.64)
      .attr("fill", gapLeft === 0 ? C.good : C.bad)
      .attr("opacity", gapLeft === 0 ? 0.85 : 0.35)
      .attr("rx", 2);
    s.append("text")
      .attr("x", margin.left + barW / 2)
      .attr("y", y + rowH / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", C.ink)
      .text(gapLeft === 0 ? "gap = 0" : "gap = 1.0");

    // off-grid bar — always red/full
    const x2 = margin.left + barMaxW * 0.52;
    s.append("rect")
      .attr("x", x2)
      .attr("y", y + rowH * 0.18)
      .attr("width", barW)
      .attr("height", rowH * 0.64)
      .attr("fill", C.bad)
      .attr("opacity", 0.35)
      .attr("rx", 2);
    s.append("text")
      .attr("x", x2 + barW / 2)
      .attr("y", y + rowH / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", C.ink)
      .text("gap = 1.0");
  });

  const readout = scope.querySelector<HTMLElement>("#gantt-readout");
  if (readout)
    readout.innerHTML =
      `left column: gap = 0 exactly at N ∈ {3,6,9,12,15,18} — saturation is <b>not monotone</b>, adding a cell can destroy an alignment a coarser monitor had.<br>` +
      `right column: pinned at 1.0 from N=1 to N=18 (paper: verified to N=128) — <b style="color:${C.bad}">resolution never repairs misplacement</b>.`;
}

const Slide06Saturation: SlideDef = {
  title: "Saturation and placement",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Cardinality constrains cell size. It says nothing about placement.</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Saturation</h3>
            <p>
              If the optimal rule takes m distinct values and a monitor
              with N₀ cells realises that partition, the gap hits exactly
              zero at N₀ — and stays zero for every N ≥ N₀. Beyond that
              point, additional monitor states buy nothing.
            </p>
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>But saturation isn't monotone.</b> With a 3-action
            objective, uniform cells align only when 3 | N — adding one
            cell can knock an aligned monitor out of alignment. And if the
            threshold sits off any achievable grid, no cardinality ever
            repairs it: the paper verifies this holds out to N = 128.
          </div>
        </div>
        <div>
          <D3Chart id="c-gantt" draw={drawGantt} />
          <div className="controls">
            <div id="gantt-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide06Saturation;
