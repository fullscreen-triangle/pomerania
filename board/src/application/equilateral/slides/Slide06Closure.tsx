import type { SlideDef } from "../../../deck/deckTypes";

const Slide06Closure: SlideDef = {
  title: "Closure, not a confidence threshold",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>The correct stopping rule for a search</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Closure</h3>
            <p>
              A search is closed when, for every available but
              not-yet-invoked source, extending the search cannot add a
              new answer class to the reachable set. Stopping is a fact
              about the registry being exhausted, not about a score
              crossing a number.
            </p>
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Closure is strictly stronger.</b> Two disjoint claim
            clusters, each reachable by one equal-weight catalyst: a
            propagation into cluster A trivially clears any confidence
            threshold up to 0.999999 against itself, while cluster B — a
            distinct answer class — sits completely uninvoked. Threshold
            crossing proves nothing about what has not yet been searched.
          </div>
          <p className={`aside ${step < 2 ? "dim" : ""}`} data-step={2}>
            Every search over a finite registry ends in exactly one of two
            states: <b>convergent closure</b> (one class survives — report
            it) or <b>contested closure</b> (more than one class survives —
            report all of them as a first-class "decline," not a silently
            chosen winner).
          </p>
        </div>
        <div>
          <p className="aside">
            For a research-group deployment this reframes "the sources
            disagree" from a failure state into the more valuable output:
            contested closure is exactly where an internal record and the
            published literature, or two internal documents, are found to
            diverge.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide06Closure;
