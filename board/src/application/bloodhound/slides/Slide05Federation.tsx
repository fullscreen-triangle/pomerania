import type { SlideDef } from "../../../deck/deckTypes";

const Slide05Federation: SlideDef = {
  title: "The federation object model",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>One registry, many tracked repos</h2>
      <div className="two-col">
        <div>
          <pre className="code-block">{`Federation {
  registry
  χ(Σ)                 // society-level character
  repos: Repo[]
}

Repo {
  path                  // local or github origin
  self_graph             // the weighted symbol graph
  χ                       // this repo's character
  m                      // monotone commit count
  salient                // cut-adjacent files
  agent_handle            // optional execution binding
}`}</pre>
        </div>
        <div>
          <p>
            A <b>Federation</b> is just a set of tracked repos plus a
            registry. Each <b>Repo</b> carries its own self-graph and χ, its
            monotone commit counter <span className="m">m</span>, and its
            salient surface. There is also a society-level{" "}
            <span className="m">χ(Σ)</span> — the same min-cut machinery run
            over a graph <em>of repos</em> rather than files, treating
            cross-repo references (shared dependencies, forked-from
            relationships) as edges.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            The federation composes with two other organs rather than
            absorbing them: it defers symbol search entirely to{" "}
            <code>purpose</code>, and — when an <code>agent_handle</code> is
            present — defers actually running a repo to a network-yield
            execution CLI. The tracker itself never runs code; if the
            execution binary is absent, it degrades gracefully to a
            read-only tracker.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide05Federation;
