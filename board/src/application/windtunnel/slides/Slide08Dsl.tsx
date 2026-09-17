import type { SlideDef } from "../../../deck/deckTypes";

const Slide08Dsl: SlideDef = {
  title: "The DSL",
  maxStep: 0,
  render: () => (
    <>
      <h2>scope / analyse / assert / report</h2>
      <div className="two-col">
        <div>
          <pre className="code-block">{`scope Checkout:
    repo "."
    include "src/**/*.ts"
    exclude "**/*.test.ts"
    language typescript

analyse:
    static
    dynamic
    cycles through [ingress, validate, persist]
    max_depth 4
    purpose ablate [audit, notify]

assert:
    regime >= Coherent
    r_est >= 0.8
    no holonomy_violations

report:
    format json
    include regime_map, cycle_graph, contribution_scores`}</pre>
        </div>
        <div>
          <p>
            <code>scope</code> names a repo slice by glob. <code>analyse</code>{" "}
            runs the static/dynamic/purposelessness passes from the
            previous slide over the cycle candidates and ablation list you
            give it. <code>assert</code> turns the resulting WT(E, Λ) tuple
            into pass/fail gates — the natural place to wire this into CI.{" "}
            <code>report</code> selects what to print.
          </p>
          <p className="aside">
            The real client (<code>web/src/lib/wtClient.js</code>) talks to
            a local Rust CLI, <code>wt serve</code>, over an unauthenticated{" "}
            <code>/health</code> check plus a token-gated <code>/check</code>{" "}
            endpoint — the token is regenerated every server start and
            stored in the browser's localStorage. A static site can't shell
            out to that local process, so the next slide's cell runs a real
            Kuramoto simulation and holonomy check client-side instead, on a
            small illustrative ensemble, and says so plainly.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide08Dsl;
