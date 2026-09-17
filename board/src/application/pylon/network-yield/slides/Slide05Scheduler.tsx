import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg, fmt } from "../../../../deck/chartUtils";

// Closed-form from Thm. 4.10: rho_i = sqrt(1 - 2*tau*alpha + tau^2*L^2).
// Computed directly here -- no external data needed, this is a formula check.
const ALPHA = 0.9;
const L = 1.1;

function rho(tau: number): number {
  return Math.sqrt(Math.max(0, 1 - 2 * tau * ALPHA + tau * tau * L * L));
}

function drawContraction(el: HTMLDivElement) {
  const w = 620,
    h = 320;
  const s = mountSvg(el, w, h);
  const m = { l: 54, r: 20, t: 24, b: 44 };
  const tauMax = (2 * ALPHA) / (L * L); // validity bound from Thm 4.10

  const data = d3.range(0, tauMax * 1.15, tauMax / 200).map((tau) => ({ tau, r: rho(tau) }));

  const x = d3.scaleLinear().domain([0, tauMax * 1.15]).range([m.l, w - m.r]);
  const y = d3.scaleLinear().domain([0, 1.05]).range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5));

  // shade the valid region tau < 2*alpha/L^2 where rho_i < 1
  s.append("rect")
    .attr("x", x(0))
    .attr("width", x(tauMax) - x(0))
    .attr("y", m.t)
    .attr("height", h - m.b - m.t)
    .attr("fill", C.good)
    .attr("opacity", 0.08);

  s.append("line")
    .attr("x1", x(0))
    .attr("x2", w - m.r)
    .attr("y1", y(1))
    .attr("y2", y(1))
    .attr("stroke", C.ink3)
    .attr("stroke-dasharray", "4 3")
    .attr("stroke-width", 1.2);
  s.append("text")
    .attr("x", w - m.r)
    .attr("y", y(1) - 6)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", C.ink3)
    .text("ρᵢ = 1 (no longer a contraction)");

  s.append("line")
    .attr("x1", x(tauMax))
    .attr("x2", x(tauMax))
    .attr("y1", m.t)
    .attr("y2", h - m.b)
    .attr("stroke", C.bad)
    .attr("stroke-dasharray", "3 3")
    .attr("stroke-width", 1.3);
  s.append("text")
    .attr("x", x(tauMax))
    .attr("y", m.t - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", C.bad)
    .text("τ = 2α/L²");

  s.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", C.k1)
    .attr("stroke-width", 2.4)
    .attr(
      "d",
      d3
        .line<{ tau: number; r: number }>()
        .x((d) => x(d.tau))
        .y((d) => y(d.r))
    );

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("τ (compute-tick step size)");
  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("ρᵢ = √(1 − 2τα + τ²L²)");

  s.append("text")
    .attr("x", x(tauMax * 0.35))
    .attr("y", y(0.15))
    .attr("font-size", 12)
    .attr("fill", C.good)
    .text(`α = ${fmt(ALPHA)}, L = ${fmt(L)} — dips below 1 for all 0 < τ < 2α/L²`);
}

const Slide05Scheduler: SlideDef = {
  title: "Cell-partition scheduler",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>An offline-compiled lookup table with a contraction guarantee</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3 className="k1">S-entropy state space (Def. 4.2)</h3>
            <p>
              ℋ = [0,1]ᵐ. This paper's coordinates are s_k (queue occupancy),
              s_t (task age), s_e (residual work fraction) — a{" "}
              <em>third</em>, independent meaning for "S-entropy" alongside
              the Musande papers' depth/articulation/orientation and the
              Federated Understanding paper's
              knowledge/temporal/evolution entropy. Same name, unrelated
              constructions — not to be conflated.
            </p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k2">Cell partition (Def. 4.4)</h3>
            <p>
              A finite Borel partition 𝒞 = {"{C₁,…,C_N}"} of ℋ with every
              cell width w_i ≥ β. The scheduler is the table lookup u(t) =
              A(cell(S(h(t)))) (Def. 4.7) — compiled offline, one lookup at
              runtime.
            </p>
          </div>
          <div className={`defn ${step < 2 ? "dim" : ""}`} data-step={2}>
            <h3 className="k3">Piecewise Lyapunov stability (Thm. 4.8)</h3>
            <p>
              Under a per-cell quadratic Lyapunov condition, h(t) converges
              globally to the target cell C* — boundary crossings cost at
              most a bounded increment, absorbed by the per-cell decrease
              rate.
            </p>
          </div>
          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>Discrete Banach contraction</b> (Thm. 4.10): with step τ,
            𝒯ᵢ(h) = h + τFᵢ(h) contracts with ratio ρᵢ =
            √(1 − 2τα + τ²L²) &lt; 1, valid whenever τ &lt; 2α/L².
          </div>
        </div>
        <div>
          <D3Chart id="c-contraction" draw={drawContraction} />
          <p className={`cap ${step < 4 ? "dim" : ""}`} data-step={4}>
            Closed-form ρᵢ(τ) for representative α = 0.9, L = 1.1 — computed
            directly from Theorem 4.10, not fit to data. It dips below 1
            throughout the valid range and diverges past the stability bound.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide05Scheduler;
