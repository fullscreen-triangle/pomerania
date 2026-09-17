import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// Real validated number (validation_results.json, suite_A
// "resolution_floor_positive"): beta = tau_0 = 1.0, confirmed positive.
const BETA = 1.0;

// Pigeonhole picture (Thm. 3.2 proof): a finite monitor with |S| states
// partitions an (in-principle unbounded) continuous quantity line into
// |S| cells; each cell's preimage has positive diameter >= beta.
const N_STATES = 6;

function drawPigeonhole(el: HTMLDivElement) {
  const w = 620,
    h = 320;
  const s = mountSvg(el, w, h);
  const m = { l: 40, r: 40, t: 40, b: 70 };
  const lineY = 120;
  const x = d3.scaleLinear().domain([0, 100]).range([m.l, w - m.r]);

  // unevenly sized cells to make "positive diameter, not uniform" visible
  const bounds = [0, 9, 24, 38, 58, 78, 100];
  const cells = d3.range(N_STATES).map((i) => ({
    i,
    a: bounds[i],
    b: bounds[i + 1],
  }));

  s.append("text")
    .attr("x", w / 2)
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-size", 12.5)
    .attr("fill", C.ink3)
    .text("continuous quantity q  (uncountably many values)");

  s.append("line")
    .attr("x1", x(0))
    .attr("x2", x(100))
    .attr("y1", lineY)
    .attr("y2", lineY)
    .attr("stroke", C.line)
    .attr("stroke-width", 2);

  cells.forEach((c, idx) => {
    s.append("rect")
      .attr("x", x(c.a))
      .attr("width", Math.max(1, x(c.b) - x(c.a)))
      .attr("y", lineY - 26)
      .attr("height", 52)
      .attr("fill", idx % 2 === 0 ? C.k1 : C.k2)
      .attr("opacity", 0.28)
      .attr("stroke", idx % 2 === 0 ? C.k1 : C.k2)
      .attr("stroke-width", 1.2);
    s.append("text")
      .attr("x", (x(c.a) + x(c.b)) / 2)
      .attr("y", lineY - 36)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", C.ink2)
      .text(`s${idx + 1}`);
    s.append("text")
      .attr("x", (x(c.a) + x(c.b)) / 2)
      .attr("y", lineY + 46)
      .attr("text-anchor", "middle")
      .attr("font-size", 10.5)
      .attr("fill", C.ink3)
      .text(`ℳ⁻¹(s${idx + 1})`);
  });

  // annotate the narrowest cell as the binding constraint
  const narrowest = cells.reduce((a, b) => (b.b - b.a < a.b - a.a ? b : a));
  s.append("text")
    .attr("x", (x(narrowest.a) + x(narrowest.b)) / 2)
    .attr("y", lineY + 66)
    .attr("text-anchor", "middle")
    .attr("font-size", 11.5)
    .attr("fill", C.bad)
    .text("narrowest cell still has diam ≥ β");

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 12.5)
    .attr("fill", C.good)
    .text(`finite monitor: ${N_STATES} states  ⇒  β = τ₀ = ${BETA} > 0 (validated)`);
}

const Slide04Floor: SlideDef = {
  title: "The resolution floor",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>No monitor returns a point</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3 className="k1">Finite observer (Assumption 3.1)</h3>
            <p>
              Any monitoring subsystem is itself a finite computational
              process: finitely many distinguishable states, finite-bandwidth
              channels, terminates in finite time. Not an engineering
              limitation — a consequence of a bounded physical substrate.
            </p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k2">Resolution floor (Theorem 3.2)</h3>
            <p>
              There exists β &gt; 0 such that for every observable quantity q
              and monitor ℳ, diam(ℳ(q)) ≥ β. Proof: a finite state space S
              induces at most |S| preimage cells over an uncountable range —
              by pigeonhole, some cell has positive diameter, or else |S| ≥
              |Q|, contradicting finiteness.
            </p>
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Compute-tick as floor</b> (Cor. 3.3): τ₀ ≥ β. Any decision
            granularity finer than β would require a monitor violating
            Theorem 3.2, so the tightest consistent scheduling quantum sets
            τ₀ = β.
          </div>
          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            Validated: β = τ₀ = <b>1.0</b>, confirmed strictly positive
            (tolerance 10⁻⁹). This constant is what recurs as the algorithmic
            closure threshold and the market's minimum lot in later slides.
          </div>
        </div>
        <div>
          <D3Chart id="c-pigeonhole" draw={drawPigeonhole} />
          <p className="cap">
            A finite monitor with 6 states partitions a continuous range into
            6 cells — every cell, even the narrowest, keeps positive
            diameter. No amount of state-splitting drives it to zero.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide04Floor;
