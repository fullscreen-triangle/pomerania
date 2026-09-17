import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// Real validated data (validation_results.json): 11 checks, all pass.
// Suite A (formula checks, 6) + Suite B (agent simulation, 5).
const checks = [
  "shell_capacity",
  "resolution_floor_positive",
  "forced_utilisation_unique_interior",
  "settling_time_bound",
  "three_way_equivalence_smallcase",
  "multiplicative_confirmation",
  "occupancy_progress_per_tick",
  "persistence_goal_succession",
  "ever_fresh_response",
  "non_forgeable_life_history",
  "liveness_settling_first_goal",
];

function drawChecklist(el: HTMLDivElement) {
  const w = 620,
    h = 340;
  const s = mountSvg(el, w, h);
  const cols = 4;
  const cellW = (w - 40) / cols;
  const cellH = 66;
  const startX = 20;
  const startY = 24;

  checks.forEach((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * cellW + cellW / 2;
    const cy = startY + row * cellH;

    s.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 14)
      .attr("fill", C.good)
      .attr("opacity", 0)
      .transition()
      .delay(i * 60)
      .duration(300)
      .attr("opacity", 1);
    s.append("text")
      .attr("x", cx)
      .attr("y", cy + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", C.bg)
      .text("✓");
    s.append("text")
      .attr("x", cx)
      .attr("y", cy + 34)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", C.ink3)
      .text(name.length > 20 ? name.slice(0, 19) + "…" : name);
  });

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 14)
    .attr("text-anchor", "middle")
    .attr("font-size", 13.5)
    .attr("fill", C.good)
    .text("11 / 11 checks pass in final form");
}

const Slide12Validation: SlideDef = {
  title: "Validation, and one correction",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Eleven checks, all passing — one theorem corrected along the way</h2>
      <div className="two-col">
        <div>
          <div className="boxed" data-step={0}>
            <b>11 / 11</b> checks pass in the final statements: 6 formula
            checks (suite A) and 5 agent-simulation checks (suite B).
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k2">The one correction (Thm. 6.4)</h3>
            <p>
              The forced-utilisation theorem's original ratio form
              P/(τ₀c·g_u(v)) failed its own validation check — no interior
              optimum existed. The paper corrected it to the net-yield form
              P·b(v) − τ₀c·g_u(v), which does. As §10.2 puts it: "a machine
              check that refuses to certify a false claim is doing its job."
            </p>
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            Other checks: shell_capacity (10/10 depths exact), resolution
            floor positive (β = τ₀ = 1.0), settling_time_bound (4/4 cases,
            exact), three_way_equivalence_smallcase (optimum = closed =
            clearing), multiplicative_confirmation (κ = 0.766 dominating
            each component 0.2 / 0.35 / 0.5 / 0.1), plus five agent-simulation
            checks (occupancy, persistence, ever-fresh response, non-forgeable
            history, per-interval liveness).
          </div>
          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>Stated limitations (§10.7):</b> closure is a τ-local optimum,
            not global; results are deterministic-data-only, no stochastic
            arrivals treated; no mechanism-design / incentive-compatibility
            claims; finite horizon partially addressed by goal succession;
            homogeneous-task-targets addressed by piecewise-constant targets
            via succession.
          </div>
        </div>
        <div>
          <D3Chart id="c-checklist" draw={drawChecklist} />
          <p className="cap">
            All 11 validation checks from the paper's suite — six closed-form
            checks and five agent-simulation checks — passing against the
            final, corrected theorem statements.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide12Validation;
