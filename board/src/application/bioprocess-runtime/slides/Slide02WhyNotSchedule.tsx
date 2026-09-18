import type { SlideDef } from "../../../deck/deckTypes";

const Slide02WhyNotSchedule: SlideDef = {
  title: "Why this isn't a schedule",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>A conventional operating system executes a plan. This one doesn't.</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Three assumptions of procedural computation</h3>
            <p>
              Control flow is a <em>plan</em>, fixed before the first step
              runs. Termination is <em>adjudicated</em> — an exit code is
              a verdict. Execution is <em>repeatable</em> — same input,
              same output, or it's a bug.
            </p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3>None of these hold at a bench</h3>
            <p>
              A scientist assembles a protocol from reusable steps and
              runs it to completion. An unexpected reading doesn't abort
              the assay — it's recorded, and it's often the most valuable
              thing the run produced. Repeatability is a property of the{" "}
              <em>protocol</em>, never of the numbers that come out.
            </p>
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>The bioprocess is the same shape.</b> Four plates competing
            for one reader is not a project-management problem with a
            correct answer computed in advance — it's an emergent
            consequence of which plate's protocol happens to check the
            reader's availability first, at runtime. That's exactly what
            the causal-knowledge-graph runtime is built to model.
          </div>
        </div>
        <div>
          <p className="aside">
            Every plate's protocol becomes a sequence of <b>nodes</b> —
            seed, incubate, read, passage, transfer. Every node carries
            code that actually runs. The reader's occupancy is a{" "}
            <b>value</b> on a shared node that any plate's agent may read
            before deciding whether to proceed or wait. Nobody schedules
            the reader; every plate's agent independently checks it.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide02WhyNotSchedule;
