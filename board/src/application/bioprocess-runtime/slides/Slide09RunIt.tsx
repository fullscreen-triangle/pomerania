import type { SlideDef } from "../../../deck/deckTypes";
import DslCell from "../../../deck/DslCell";
import { runQuery } from "../query";

const EXAMPLE = `plates 5
seed 42
trace Plate-C
report
`;

const Slide09RunIt: SlideDef = {
  title: "Run it",
  maxStep: 0,
  render: () => (
    <>
      <h2>A live scheduling cell</h2>
      <p>
        This runs the exact simulation behind every chart in this deck —{" "}
        <code>plates N</code> declares the run, <code>seed N</code> fixes
        the run's randomness (change it to get a different trajectory),{" "}
        <code>trace &lt;plate&gt;</code> prints one plate's actual
        node-by-node execution, including any queueing for the shared
        instrument, and <code>report</code> is the runtime's only output —
        there is no exit code to check.
      </p>
      <DslCell language="bioprocess protocol" initialSource={EXAMPLE} run={runQuery} />
      <p className="aside">
        Try raising <code>plates</code> to 9 and watch queue events climb,
        or change <code>seed</code> and re-run <code>trace Plate-A</code>{" "}
        to see the same plate's protocol land at different cycles.
      </p>
    </>
  ),
};

export default Slide09RunIt;
