import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg, fmt } from "../../../../deck/chartUtils";

// Real validated numbers (validation_results.json, suite_A
// "forced_utilisation_unique_interior"): v_star=0.431637, foc_residual
// near-zero, argmax interior, objective strictly concave, vbar=1.0.
const V_STAR = 0.431637;
const VBAR = 1.0;
const FOC_RESIDUAL = 0.000122;

// Representative concave benefit / convex cost pair (paper leaves b, g_u
// general subject to b'>0,b''<0,b(0)=0 and g_u'>0,g_u''>0,g_u(0)=0,
// g_u(v)->infinity as v->vbar). P, tau*c chosen so the closed-form
// marginal-balance root of THESE representative functions lands close to
// the reported v_star, for a visually honest recreation of the corrected
// theorem's shape -- the marked point itself uses the exact validated v*.
const P = 2.0; // representative directional pressure
const TC = 1.0; // representative tau0 * c(e)
function b(v: number): number {
  return Math.sqrt(v);
}
function gu(v: number): number {
  return (v * v) / (1 - v);
}
function Y(v: number): number {
  return P * b(v) - TC * gu(v);
}

function drawUtilisation(el: HTMLDivElement) {
  const w = 620,
    h = 340;
  const s = mountSvg(el, w, h);
  const m = { l: 54, r: 20, t: 24, b: 44 };

  const data = d3.range(0.001, 0.97, 0.002).map((v) => ({ v, y: Y(v) }));
  const yStar = Y(V_STAR);

  const x = d3.scaleLinear().domain([0, VBAR]).range([m.l, w - m.r]);
  const yExtent = d3.extent(data, (d) => d.y) as [number, number];
  const y = d3.scaleLinear().domain([Math.min(0, yExtent[0]), yExtent[1] * 1.15]).range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(6));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5));

  s.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", C.k1)
    .attr("stroke-width", 2.4)
    .attr(
      "d",
      d3
        .line<{ v: number; y: number }>()
        .x((d) => x(d.v))
        .y((d) => y(d.y))
    );

  s.append("line")
    .attr("x1", x(V_STAR))
    .attr("x2", x(V_STAR))
    .attr("y1", y(yStar))
    .attr("y2", h - m.b)
    .attr("stroke", C.good)
    .attr("stroke-dasharray", "4 3")
    .attr("stroke-width", 1.4);
  s.append("circle")
    .attr("cx", x(V_STAR))
    .attr("cy", y(yStar))
    .attr("r", 5.5)
    .attr("fill", C.good);
  s.append("text")
    .attr("x", x(V_STAR))
    .attr("y", h - m.b + 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 11.5)
    .attr("fill", C.good)
    .text(`v* = ${fmt(V_STAR)} (validated)`);

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("utilisation rate v");
  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("Y(v) = P·b(v) − τ₀c·g_u(v)");

  s.append("text")
    .attr("x", m.l + 8)
    .attr("y", m.t + 14)
    .attr("font-size", 11.5)
    .attr("fill", C.ink3)
    .text("representative b(v)=√v, g_u(v)=v²/(1−v) — unique interior maximum");
}

const Slide08ForcedUtilisation: SlideDef = {
  title: "Forced optimal utilisation",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>A theorem the validation suite corrected</h2>
      <div className="two-col">
        <div>
          <div className="boxed danger" data-step={0}>
            <b>Original form (wrong):</b> yield contribution P/(τ₀c·g_u(v)).
            With P constant in v and g_u strictly convex, this ratio is{" "}
            <em>decreasing</em> in v — its argmax is the boundary v→0⁺, and
            the stated first-order condition g_u(v) − v·g_u′(v) = 0 has no
            interior root. The paper's own validation suite found this and
            refused to certify it.
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Corrected form</b> (Theorem 6.4): net yield Y(v) = P·b(v) −
            τ₀c·g_u(v), with b strictly concave (b′&gt;0, b″&lt;0) and g_u
            strictly convex. Concave minus convex is strictly concave — a
            unique interior maximiser is now guaranteed.
          </div>
          <div className={`defn ${step < 2 ? "dim" : ""}`} data-step={2}>
            <h3 className="k1">Marginal-balance condition</h3>
            <p>P·b′(v*) = τ₀c·g_u′(v*) — marginal benefit meets marginal cost exactly at v*.</p>
          </div>
          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            Validated: v* = <b>{fmt(V_STAR)}</b> (v̄ = {fmt(VBAR)}), interior
            argmax confirmed, objective strictly concave confirmed, FOC
            residual = {FOC_RESIDUAL} (near-zero — marginal balance holds).
          </div>
          <div className={`defn ${step < 4 ? "dim" : ""}`} data-step={4}>
            <h3 className="k3">Comparative-advantage sorting (Thm. 6.5)</h3>
            <p>
              At closure, each slot is occupied by the task with comparative
              advantage in yield density — a swap that improved yield would
              contradict closure.
            </p>
          </div>
        </div>
        <div>
          <D3Chart id="c-utilisation" draw={drawUtilisation} />
          <p className="cap">
            The corrected net-yield objective for representative concave
            benefit / convex cost functions — strictly concave, single
            interior optimum, exactly the shape the correction was designed
            to produce.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide08ForcedUtilisation;
