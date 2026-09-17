import type { SlideDef } from "../../../deck/deckTypes";
import DslCell from "../../../deck/DslCell";
import { runWindTunnel } from "../wtDsl";

const EXAMPLE = `scope Checkout:
    repo "."
    include "src/**/*.ts"

analyse:
    static
    dynamic
    cycles through [ingress, validate, transform, persist, notify, audit]
    purpose ablate [audit, notify]

assert:
    regime >= Coherent
    r_est >= 0.5
    no holonomy_violations

report:
    format json
    include regime_map, cycle_graph, contribution_scores
`;

const Slide09RunIt: SlideDef = {
  title: "Run it",
  maxStep: 0,
  render: () => (
    <>
      <h2>A live wind-tunnel cell</h2>
      <p>
        This is not the full local <code>wt serve</code> engine — it's a
        teaching subset that runs a real Kuramoto simulation (seeded from
        your script) and a real holonomy check, client-side. Edit the{" "}
        <code>cycles</code>, <code>ablate</code>, or <code>assert</code>{" "}
        lines and press Run (or shift+enter) to see the regime, R_est, and
        pass/fail verdict actually change.
      </p>
      <DslCell language="wind-tunnel dsl" initialSource={EXAMPLE} run={runWindTunnel} />
      <p className="aside">
        Try tightening <code>r_est &gt;= 0.5</code> to{" "}
        <code>r_est &gt;= 0.95</code>, or adding more names to the ablate
        list — each ablated unit gets its own δS verdict, purposeful or not,
        computed rather than asserted.
      </p>
    </>
  ),
};

export default Slide09RunIt;
