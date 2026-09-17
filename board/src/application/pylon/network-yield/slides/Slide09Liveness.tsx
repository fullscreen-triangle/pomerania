import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// Real validated data (validation_results.json, suite_A "settling_time_bound"):
// four cases, bound = V0/(tau*n_active), all met EXACTLY (realised == bound).
const cases = [
  { V0: 100.0, n: 4, bound: 25.0, realised: 25 },
  { V0: 37.0, n: 1, bound: 37.0, realised: 37 },
  { V0: 1024.0, n: 16, bound: 64.0, realised: 64 },
  { V0: 5.0, n: 5, bound: 1.0, realised: 1 },
];

function drawSettling(el: HTMLDivElement) {
  const w = 620,
    h = 340;
  const s = mountSvg(el, w, h);
  const m = { l: 54, r: 24, t: 24, b: 44 };
  const max = 70;

  const x = d3.scaleLinear().domain([0, max]).range([m.l, w - m.r]);
  const y = d3.scaleLinear().domain([0, max]).range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(6));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(6));

  // y = x identity line
  s.append("line")
    .attr("x1", x(0))
    .attr("y1", y(0))
    .attr("x2", x(max))
    .attr("y2", y(max))
    .attr("stroke", C.ink3)
    .attr("stroke-dasharray", "4 3")
    .attr("stroke-width", 1.3);
  s.append("text")
    .attr("x", x(max) - 4)
    .attr("y", y(max) - 8)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", C.ink3)
    .text("bound = realised (identity)");

  s.selectAll(".pt")
    .data(cases)
    .join("circle")
    .attr("class", "pt")
    .attr("cx", (d) => x(d.bound))
    .attr("cy", (d) => y(d.realised))
    .attr("r", 7)
    .attr("fill", C.good)
    .attr("stroke", C.panel)
    .attr("stroke-width", 1.5);

  s.selectAll(".lab")
    .data(cases)
    .join("text")
    .attr("class", "lab")
    .attr("x", (d) => x(d.bound) + 10)
    .attr("y", (d) => y(d.realised) - 8)
    .attr("font-size", 11)
    .attr("fill", C.ink2)
    .text((d) => `V₀=${d.V0}, |E|=${d.n}`);

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("bound = V₀/(τ·|E|_active)");
  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("realised settling ticks");

  s.append("text")
    .attr("x", m.l + 6)
    .attr("y", m.t + 14)
    .attr("font-size", 11.5)
    .attr("fill", C.good)
    .text("4/4 cases land exactly on the line — bound met exactly, not just satisfied");
}

const Slide09Liveness: SlideDef = {
  title: "Liveness under backpressure",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Every live task settles — and the bound is exact</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3 className="k1">Backpressure & descent (Assumptions 7.1, 7.2)</h3>
            <p>
              Tasks route toward e*(n) = argmax_e P(n,e); sep(e,A) is
              non-decreasing in the occupancy of queues feeding e. Every live
              task has some outgoing slot with P(n,e) &gt; 0.
            </p>
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Liveness</b> (Theorem 7.3): every live task settles in finite
            time. Proof via Lyapunov function V = Σ residuals: (1) each tick
            reduces V by at least τ per progressing task; (2) V reaches 0 in
            finite ticks; (3) a stalled queue raises sep(e,A), which by the
            Three-way Equivalence raises the clearing price and attracts
            capacity, resolving the stall in finite time.
          </div>
          <div className={`defn ${step < 2 ? "dim" : ""}`} data-step={2}>
            <h3 className="k2">Finite settling time (Cor. 7.4)</h3>
            <p>
              T_settle ≤ V₀ / (τ · |E|_active), where |E|_active is the
              number of slots with positive pressure.
            </p>
          </div>
          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            All 4 validated cases land exactly on the bound — realised
            settling ticks equal V₀/(τ|E|_active) with no slack:{" "}
            <span className="m">
              (100,4)→25, (37,1)→37, (1024,16)→64, (5,5)→1
            </span>
            . The bound isn't just an upper bound in practice — it's tight.
          </div>
        </div>
        <div>
          <D3Chart id="c-settling" draw={drawSettling} />
          <p className="cap">
            Bound vs. realised settling time for the four validated cases —
            every point sits exactly on the y = x line.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide09Liveness;
