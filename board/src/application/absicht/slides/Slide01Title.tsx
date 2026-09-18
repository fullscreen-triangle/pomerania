import type { SlideDef } from "../../../deck/deckTypes";

const roadmap: [string, string][] = [
  ["1", "the extremal regime: train hardest, deploy anywhere"],
  ["2", "the Inclusion Theorem, live"],
  ["3", "sample complexity: one run vs. N+1 runs"],
  ["4", "bounded receivers and the floor"],
  ["5", "federation lowers the floor"],
  ["6", "cascade routing is exactly a knapsack"],
  ["7", "the minimum loop: why three, not two"],
  ["8", "verification without disclosure"],
  ["9", "run it — a live cascade-routing cell"],
];

const Slide01Title: SlideDef = {
  title: "Accountable Compilation",
  maxStep: 0,
  render: () => (
    <>
      <h1>Accountable Compilation</h1>
      <p className="subtitle">
        A unified framework for producing, composing, and cross-verifying
        domain-specific language models
      </p>

      <div className="lede">
        <p>
          Training a domain-specific model, combining several such models,
          and certifying their combined output are usually three
          engineering decisions made by three different teams. This paper
          treats them as one problem: minimising a single quantity, a
          bounded receiver's irreducible error floor, at every layer.
        </p>
        <p>
          Train at a domain's <b>extremal regime</b> — its hardest,
          fullest-coverage instances — because competence there provably
          transfers to every easier restriction for free. Combine models
          by <b>federation</b> and route a fixed budget across them by an
          exact <b>0–1 knapsack</b>. Certify the combination with a{" "}
          <b>minimum loop</b> of at least three mutually-checking
          receivers — and when two receivers share no internal
          representation, certify agreement via a{" "}
          <b>four-column relaxation</b> that is itself, provably, an
          ordinary receiver with its own floor.
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
        advance within a slide. Charts are driven by the paper's own
        recorded validation trials; the final cell runs a real 0-1
        knapsack DP and greedy solver.
      </p>
    </>
  ),
};

export default Slide01Title;
