import type { SlideDef } from "../../../deck/deckTypes";

const Slide02Problem: SlideDef = {
  title: "The problem",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>Forks drift, and nobody notices until it matters</h2>
      <div className="two-col">
        <div>
          <p>
            A team forks a repository, or vendors a copy, or spins up a long
            feature branch meant to converge back later. Over months, three
            things can happen silently:
          </p>

          <div className="defn" data-step={0}>
            <h3>Drift</h3>
            <p>
              The fork accumulates changes that quietly move it away from the
              upstream project's actual purpose — refactors that change
              behaviour, not just form.
            </p>
          </div>

          <div className="defn" data-step={1}>
            <h3>Fragmentation</h3>
            <p>
              What was one coherent module becomes two or three
              disconnected pieces — the repo stops being "about" a single
              thing, even though every individual commit still compiles.
            </p>
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>What's missing.</b> A number you can compute cheaply, from the
            symbols in the repo alone, that says how "together" the repo
            still is — and that stays comparable across repos so you can ask
            whether two forks are still the same project.
          </div>
        </div>
        <div>
          <p className="aside">
            The design blueprint calls the three organs of this problem{" "}
            <b>Search</b> (find things — handled by a companion tool,{" "}
            <code>purpose</code>), <b>Execution</b> (run things — a network-yield
            CLI), and <b>Tracking</b> (measure and compare things — this
            tool). The tracker is deliberately just the third: read-only,
            measurement-only, composing with the other two rather than
            reimplementing them.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide02Problem;
