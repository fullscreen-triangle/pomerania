import type { SlideDef } from "../../../deck/deckTypes";

const roadmap: [string, string][] = [
  ["1", "the process: plates, a shared reader, and contention"],
  ["2", "why this isn't a schedule — it's a causal knowledge graph"],
  ["3", "nodes: subtask + code + values"],
  ["4", "no exit code, run to completion"],
  ["5", "the trajectory is emergent, not planned"],
  ["6", "the Gantt chart — live, multi-plate, shared instrument"],
  ["7", "the causal edge graph behind the same run"],
  ["8", "re-run: same setup, different trajectory"],
  ["9", "run it — a live scheduling cell"],
];

const Slide01Title: SlideDef = {
  title: "Bioprocess as Causal Knowledge Graph",
  maxStep: 0,
  render: () => (
    <>
      <h1>Bioprocess as Causal Knowledge Graph</h1>
      <p className="subtitle">
        Scheduling a multi-plate cell culture process — with material
        transfer and one shared instrument — as an emergent runtime
        trajectory, not a pre-computed Gantt chart
      </p>

      <div className="lede">
        <p>
          Picture a bench running several culture plates at once, each
          growing something different, each needing periodic optical
          density reads on the <em>same</em> plate reader, and material —
          an aliquot, a passage, a seed stock — moving between plates on
          its own timetable. A conventional Gantt chart is authored in
          advance: a project manager decides who uses the reader when.
        </p>
        <p>
          This deck models the process the other way, following{" "}
          <em>Trajectory-Based Non-Deterministic Runtime Execution
          Environments</em>: every plate's protocol is an autonomous
          agent that reads the reader's current availability and either
          proceeds or queues — there is no scheduler, no plan authored
          before the run, and no exit code. The Gantt chart you'll see is
          not a plan drawn beforehand; it is the recorded trajectory of
          an actual run, and running it again with a different seed
          produces a genuinely different chart.
        </p>
      </div>

      <div className="roadmap">
        {roadmap.map(([n, t]) => (
          <div className="rm" key={n}>
            <b>{n}.</b> {t}
          </div>
        ))}
      </div>

      <p className="footnote">
        Use <b>←</b> <b>→</b> to move between slides, <b>space</b> to
        advance within a slide. The Gantt chart and causal graph are
        computed live from an executable simulation, not hand-drawn.
      </p>
    </>
  ),
};

export default Slide01Title;
