import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

function drawValidation(el: HTMLDivElement) {
  const w = 560,
    h = 380;
  const s = mountSvg(el, w, h);
  const data = [
    { l: "floor: zero-weight edge", v: 35, note: "bound fails" },
    { l: "blindness: perturb resolution", v: 63, note: "closure changes" },
    { l: "truth-blind: all false", v: 200, note: "still commits" },
    { l: "closure: same region", v: 1, note: "closure restored" },
    { l: "hydrofoil: remove catalyst", v: 1, note: "commitment restored" },
  ];
  const m = { l: 190, r: 70, t: 34, b: 36 };
  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.l))
    .range([m.t, h - m.b])
    .padding(0.34);
  const x = d3.scaleLog().domain([1, 220]).range([m.l, w - m.r]).clamp(true);
  s.append("text")
    .attr("x", m.l)
    .attr("y", 18)
    .attr("font-size", 12.5)
    .attr("fill", C.ink3)
    .text("falsifier fired in N cases (log scale)");
  data.forEach((d) => {
    s.append("text")
      .attr("x", m.l - 12)
      .attr("y", y(d.l)! + y.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .attr("fill", C.ink2)
      .text(d.l);
    s.append("rect")
      .attr("x", m.l)
      .attr("y", y(d.l)!)
      .attr("height", y.bandwidth())
      .attr("rx", 3)
      .attr("fill", C.k1)
      .attr("width", 0)
      .transition()
      .duration(700)
      .attr("width", Math.max(3, x(d.v) - m.l));
    s.append("text")
      .attr("x", Math.max(m.l + 6, x(d.v) + 7))
      .attr("y", y(d.l)! + y.bandwidth() / 2 + 4)
      .attr("font-size", 11.5)
      .attr("fill", C.ink3)
      .text(d.note)
      .attr("opacity", 0)
      .transition()
      .delay(600)
      .duration(400)
      .attr("opacity", 1);
  });
  s.append("text")
    .attr("x", m.l)
    .attr("y", h - 10)
    .attr("font-size", 12)
    .attr("fill", C.good)
    .text("20 / 20 experiments pass · every falsifier fires");
}

const Slide17Limits: SlideDef = {
  title: "Limits",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>
        What this does <em>not</em> say
      </h2>
      <div className="two-col">
        <div>
          <div className="boxed danger" data-step={0}>
            <b>Not:</b> that truth doesn't matter.
            <div className="sub">
              A society committed to the wrong region finds out — by being
              in a region that does not suit it. That happens{" "}
              <em>afterwards</em>, through ordinary consequences, not
              through any failure of the mechanism that put it there.
            </div>
          </div>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Not:</b> that agents cannot revise.
            <div className="sub">
              A new available catalyst can break closure. Truth enters
              through <em>availability</em> — never through the closure
              condition itself.
            </div>
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Open:</b> the metric result assumes a sampling structure we
            isolate as an explicit optional axiom, and do not derive.
            <div className="sub">
              Everything before the metric is independent of it.
            </div>
          </div>

          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>Open:</b> what is <em>available</em> is not determined by the
            graph. Closure is decidable given availability, and not from
            structure alone.
            <div className="sub">
              This is the honest placement of the hard question — "what
              else should I have considered?"
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-validation" draw={drawValidation} />
          <p className="cap">
            Each claim was tested by a suite written to <em>falsify</em> it.
            Bars show the falsifier firing: remove the structural feature,
            and the claim fails as it should.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide17Limits;
