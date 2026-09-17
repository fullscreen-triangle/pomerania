import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg, fmt } from "../../../../deck/chartUtils";

// Real validated data (validation_results.json, suite_A
// "three_way_equivalence_smallcase"): brute-force enumeration on a 4x4
// unit-capacity assignment problem. n_closed=3 assignments are
// deterministically closed; n_clearing=1 is market-clearing; y_max=31.401
// is achieved by an assignment that is simultaneously in all three sets.
const Y_MAX = 31.401;
const N_TASKS = 4;
const N_SLOTS = 4;
const N_CLOSED = 3;
const N_CLEARING = 1;

// Illustrative candidate yields around the validated optimum, for the bar
// panel -- the JSON reports counts/membership, not the full 4x4=256-ish
// enumeration, so the *other* bars are constructed to be clearly lower than
// y_max while the optimum bar uses the exact validated value.
const candidates = [
  { id: "A₁", y: 31.401, closed: true, clearing: true, optimum: true },
  { id: "A₂", y: 29.8, closed: true, clearing: false, optimum: false },
  { id: "A₃", y: 28.1, closed: true, clearing: false, optimum: false },
  { id: "A₄", y: 24.6, closed: false, clearing: false, optimum: false },
  { id: "A₅", y: 21.9, closed: false, clearing: false, optimum: false },
  { id: "A₆", y: 17.3, closed: false, clearing: false, optimum: false },
];

function drawEquivalence(el: HTMLDivElement) {
  const w = 620,
    h = 340;
  const s = mountSvg(el, w, h);
  const m = { l: 44, r: 20, t: 24, b: 80 };

  const x = d3
    .scaleBand()
    .domain(candidates.map((d) => d.id))
    .range([m.l, w - m.r])
    .padding(0.3);
  const y = d3.scaleLinear().domain([0, 34]).range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5));

  s.selectAll(".bar")
    .data(candidates)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.id)!)
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.y))
    .attr("height", (d) => y(0) - y(d.y))
    .attr("rx", 3)
    .attr("fill", (d) => (d.optimum ? C.good : C.line))
    .attr("stroke", (d) => (d.optimum ? C.good : "none"))
    .attr("stroke-width", 2);

  // badges for closed / clearing on the optimum bar
  const opt = candidates.find((c) => c.optimum)!;
  s.append("text")
    .attr("x", x(opt.id)! + x.bandwidth() / 2)
    .attr("y", y(opt.y) - 34)
    .attr("text-anchor", "middle")
    .attr("font-size", 11.5)
    .attr("fill", C.k1)
    .text("yield-optimal");
  s.append("text")
    .attr("x", x(opt.id)! + x.bandwidth() / 2)
    .attr("y", y(opt.y) - 20)
    .attr("text-anchor", "middle")
    .attr("font-size", 11.5)
    .attr("fill", C.k2)
    .text("closed");
  s.append("text")
    .attr("x", x(opt.id)! + x.bandwidth() / 2)
    .attr("y", y(opt.y) - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 11.5)
    .attr("fill", C.k3)
    .text("clearing");

  s.selectAll(".val")
    .data(candidates)
    .join("text")
    .attr("class", "val")
    .attr("x", (d) => x(d.id)! + x.bandwidth() / 2)
    .attr("y", h - m.b + 34)
    .attr("text-anchor", "middle")
    .attr("font-size", 10.5)
    .attr("fill", C.ink3)
    .text((d) => fmt(d.y));

  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 14)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("yield(A)");

  s.append("text")
    .attr("x", w - m.r)
    .attr("y", h - 8)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", C.ink3)
    .text("A₁ = validated optimum; other candidates illustrative, ranked below it");
}

const Slide07Equivalence: SlideDef = {
  title: "The Three-way Equivalence",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>Yield-optimal, closed, clearing: one fixed point</h2>
      <div className="two-col">
        <div>
          <p className="hl" data-step={0}>
            This is the paper's central theorem (Theorem 6.3). Three
            conditions on an assignment A and price vector p, equivalent up
            to a slack of τ:
          </p>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k1">(i) Yield-optimality</h3>
            <p>yield(A) ≥ yield(A′) − τ for every alternative assignment A′.</p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k2">(ii) Deterministic closure</h3>
            <p>No single-task reassignment improves yield by more than τ.</p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k3">(iii) Market clearing</h3>
            <p>(A, p) with p(e) = sep(e,A) forms a market clearing.</p>
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            The proof is a cyclic implication: (i)⇒(ii)⇒(iii)⇒(i). Each step
            costs at most one slack of τ.
          </div>
          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>Exact coincidence.</b> When τ plays all three roles — physical
            resolution floor, algorithmic closure threshold, economic
            minimum lot — simultaneously, the slack terms are each exactly
            τ, and the three conditions coincide at{" "}
            <b>one fixed point with zero slack</b>.
          </div>
          <div className={`boxed ${step < 4 ? "dim" : ""}`} data-step={4}>
            Validated on a brute-force {N_TASKS}×{N_SLOTS} unit-capacity
            instance: y_max = <b>{fmt(Y_MAX)}</b>. Of {N_CLOSED} closed
            assignments found and {N_CLEARING} market-clearing assignment
            found, the yield-optimal assignment is a member of both — the
            same fixed point, exactly as the theorem asserts.
          </div>
        </div>
        <div>
          <D3Chart id="c-equivalence" draw={drawEquivalence} />
          <p className="cap">
            Candidate assignments in a 4×4 instance, ranked by yield. The
            validated optimum (green) is simultaneously yield-optimal,
            deterministically closed, and market-clearing — the "one fixed
            point" made concrete.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide07Equivalence;
