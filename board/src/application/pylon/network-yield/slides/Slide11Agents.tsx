import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// Real validated data (validation_results.json, suite_B_dynamical_simulation,
// "persistence_goal_succession"): 12 agents, 400 ticks, successions_per_agent
// exactly as reported. This is the full real per-agent array, used directly.
const successionsPerAgent = [189, 188, 185, 182, 187, 185, 181, 189, 180, 181, 186, 182];
const cellCrossingsPerAgent = [398, 399, 398, 399, 399, 399, 399, 399, 399, 399, 399, 399];

function drawSuccessions(el: HTMLDivElement) {
  const w = 620,
    h = 340;
  const s = mountSvg(el, w, h);
  const m = { l: 44, r: 20, t: 44, b: 44 };

  const data = successionsPerAgent.map((v, i) => ({ agent: `a${i}`, v }));

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.agent))
    .range([m.l, w - m.r])
    .padding(0.25);
  const y = d3.scaleLinear().domain([0, 200]).range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).tickFormat((_, i) => String(i)));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5));

  s.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.agent)!)
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.v))
    .attr("height", (d) => y(0) - y(d.v))
    .attr("rx", 3)
    .attr("fill", C.k1);

  s.selectAll(".val")
    .data(data)
    .join("text")
    .attr("class", "val")
    .attr("x", (d) => x(d.agent)! + x.bandwidth() / 2)
    .attr("y", (d) => y(d.v) - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("fill", C.ink3)
    .text((d) => d.v);

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("agent index (12 agents, 400 ticks)");
  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 14)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("goal successions");

  s.append("text")
    .attr("x", w / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 11.5)
    .attr("fill", C.good)
    .text(`range ${d3.min(successionsPerAgent)}–${d3.max(successionsPerAgent)} — every agent succeeds, none terminates`);
}

const Slide11Agents: SlideDef = {
  title: "Processes as persistent agents",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>Inverting the locus of agency</h2>
      <div className="two-col">
        <div>
          <p className="story" data-step={0}>
            "Occupied at the forge" — the paper's own motivating picture is a
            town smith who is busy when approached rather than idling, gives
            a different response each time because his state has advanced,
            and may hail you first.
          </p>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k1">Process agent (Def. 9.1)</h3>
            <p>
              A task re-read as autonomous: owns its target τ(x) as a{" "}
              <em>standing goal</em>, reduces its own residual every tick,
              persists past r = 0 by goal succession rather than
              terminating.
            </p>
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Occupancy</b> (Thm. 9.3): never idle while the goal is unmet —
            progress ≥ τ every tick. <b>Goal succession</b> (Def. 9.4): on
            reaching r ≤ β, succeed to τ′ = γ(τ, history) instead of
            terminating. <b>Persistence</b> (Thm. 9.5): no terminal horizon —
            V(t) revives after each succession rather than draining to zero.
          </div>
          <div className={`defn ${step < 3 ? "dim" : ""}`} data-step={3}>
            <h3 className="k2">Ever-fresh response (Prop. 9.7)</h3>
            <p>
              No two identical interactions — crossing a cell boundary
              changes the response even to an identical query.{" "}
              <b>Agent-initiated contact</b> (Prop. 9.8): a stalled agent
              raises its own separation cost and summons help — the smith
              may hail you.
            </p>
          </div>
          <div className={`boxed ${step < 4 ? "dim" : ""}`} data-step={4}>
            Validated over 12 agents, 400 ticks: successions per agent range{" "}
            <b>180–189</b>, cell crossings per agent <b>~398–399</b>{" "}
            (near-total — almost every tick crosses a boundary), committed-step
            counters monotone for all agents. Total residual traces stay in
            the ~14–27 range throughout — reviving, never draining to zero.
          </div>
        </div>
        <div>
          <D3Chart id="c-successions" draw={drawSuccessions} />
          <p className="cap">
            Goal successions per agent — real per-agent data from the
            400-tick simulation. Cell crossings per agent: {cellCrossingsPerAgent.join(", ")}.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide11Agents;
