import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// Illustrative instance (not paper-reported): 5 slots with made-up but
// clearly-labeled pressure/capacity values, showing sep(e,A) higher for
// bottleneck slots and near-zero for redundant ones (Def. 2.7 / 5.1 remark).
type SlotCost = { e: string; sep: number; note: string };
const slotCosts: SlotCost[] = [
  { e: "e₁", sep: 8.4, note: "bottleneck — no substitute" },
  { e: "e₂", sep: 6.1, note: "partial substitute exists" },
  { e: "e₃", sep: 0.3, note: "near-redundant" },
  { e: "e₄", sep: 3.9, note: "moderate demand" },
  { e: "e₅", sep: 0.1, note: "redundant — perfect substitute" },
];

function drawSeparation(el: HTMLDivElement) {
  const w = 620,
    h = 320;
  const s = mountSvg(el, w, h);
  const m = { l: 44, r: 20, t: 24, b: 50 };

  const x = d3
    .scaleBand()
    .domain(slotCosts.map((d) => d.e))
    .range([m.l, w - m.r])
    .padding(0.32);
  const y = d3.scaleLinear().domain([0, 10]).range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5));

  s.selectAll(".bar")
    .data(slotCosts)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.e)!)
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.sep))
    .attr("height", (d) => y(0) - y(d.sep))
    .attr("rx", 3)
    .attr("fill", (d) => (d.sep > 5 ? C.bad : d.sep < 1 ? C.good : C.k4));

  s.selectAll(".val")
    .data(slotCosts)
    .join("text")
    .attr("class", "val")
    .attr("x", (d) => x(d.e)! + x.bandwidth() / 2)
    .attr("y", (d) => y(d.sep) - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink2)
    .text((d) => d.sep.toFixed(1));

  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 14)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("sep(e, A) = clearing price p(e)");

  s.append("text")
    .attr("x", w - m.r)
    .attr("y", h - 6)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", C.ink3)
    .text("illustrative instance — not paper-reported");
}

const Slide06Separation: SlideDef = {
  title: "Separation cost & the yield market",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>The marginal slot is the priced slot</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3 className="k1">Separation cost (Def. 2.7)</h3>
            <p>
              sep(e,A) = yield(A) − yield(A|_{"{E∖{e}}"}) — the marginal yield
              lost by removing slot e from the network, with the remainder
              re-optimised. sep ≥ 0 always; a redundant slot has sep = 0, a
              bottleneck slot has large sep.
            </p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k2">Deterministic closure (Def. 2.9)</h3>
            <p>
              No τ-adjacent reassignment — differing in at most one task —
              improves yield by more than τ.
            </p>
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Separation cost as price</b> (Prop. 5.3): sep(e,A) is exactly
            the correct clearing price for slot e — a task's willingness to
            pay for e equals the yield it gains over its next-best
            alternative.
          </div>
          <div className={`defn ${step < 3 ? "dim" : ""}`} data-step={3}>
            <h3 className="k3">Yield market (Def. 5.4, 5.5)</h3>
            <p>
              Each slot offered at p(e); each task demands e*(x) =
              argmax_e[yield_x(e) − p(e)]. Clearing requires: individual
              rationality, markets clear (demand = capacity), prices
              non-negative.
            </p>
          </div>
        </div>
        <div>
          <D3Chart id="c-separation" draw={drawSeparation} />
          <p className="cap">
            Separation cost per slot for a constructed 5-slot instance —
            higher where a slot has no substitute, near zero where capacity
            is redundant. Illustrative, not a paper-reported numerical
            result.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide06Separation;
