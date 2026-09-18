import type { SlideDef } from "../../../deck/deckTypes";

const Slide03Nodes: SlideDef = {
  title: "Nodes: subtask, code, values",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>A plate's protocol is a chain of nodes, not a function call</h2>
      <div className="two-col">
        <div>
          <pre className="code-block">{`node = (τ, chunks(node), values(node))

τ            = "Plate-B / read / cycle-2"
chunks(node) = { read_OD600.py }
values(node) = { od: 0.842, timestamp: 14 }`}</pre>
          <p>
            τ is the subtask's identity — what individuates the node.
            chunks(node) is the executable code realising it. values(node)
            is what the node carries once it has run: a measurement, a
            derived record, an anomaly flag.
          </p>
        </div>
        <div>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            <b>Convergence, not ownership.</b> If two plates' agents both
            arrive at "check reader availability," they converge on the{" "}
            <em>same</em> node rather than creating two — the reader's
            occupancy value is one shared fact, read by whichever agent
            asks. An edge between two nodes exists only once a value
            emitted at one was actually read at the other; it is a record
            of what happened, not a declared dependency waiting to be
            scheduled. Two runs of the identical five-plate setup can
            therefore induce different edge sets.
          </p>
          <p className="aside">
            This is why the runtime carries no semantic responsibility: it
            executes chunks and moves values, but it never compares a
            result to an expectation — that's for the module reading the
            value to decide.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide03Nodes;
