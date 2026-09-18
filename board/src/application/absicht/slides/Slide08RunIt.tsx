import type { SlideDef } from "../../../deck/deckTypes";
import DslCell from "../../../deck/DslCell";
import { runQuery } from "../query";

const EXAMPLE = `# declare receivers: name, floor, per-invocation cost
receiver adapter_protocol floor 0.12 cost 0.6
receiver adapter_instrument floor 0.35 cost 2.1
receiver adapter_provenance floor 0.08 cost 0.4
receiver general_model floor 0.5 cost 2.8

federate
route budget 4.0
`;

const Slide08RunIt: SlideDef = {
  title: "Run it",
  maxStep: 0,
  render: () => (
    <>
      <h2>A live cascade-routing cell</h2>
      <p>
        There is no DSL in the source implementation — <code>absicht/web</code>{" "}
        is a static chart skin, and the real algorithms live in a Python
        validation script — so this cell is a thin interpreter over a
        faithful TypeScript port of that script's exact knapsack DP and
        greedy solver: <code>receiver</code> declares a receiver's floor
        and cost, <code>federate</code> computes the union-construction
        floor, and <code>route budget N</code> runs both the exact DP and
        the greedy allocator under that budget.
      </p>
      <DslCell language="accountable-compilation query" initialSource={EXAMPLE} run={runQuery} />
      <p className="aside">
        Try lowering the budget to 1.5 or raising it to 8.0 — watch which
        receivers the exact and greedy solvers pick, and whether the ratio
        ever dips toward the 1−1/e guarantee.
      </p>
    </>
  ),
};

export default Slide08RunIt;
