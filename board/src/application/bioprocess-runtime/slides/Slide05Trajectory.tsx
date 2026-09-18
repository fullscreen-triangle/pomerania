import type { SlideDef } from "../../../deck/deckTypes";

const Slide05Trajectory: SlideDef = {
  title: "The trajectory is emergent",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Not knowable before the run, not storable as a plan</h2>
      <div className="two-col">
        <div>
          <p>
            Whether Plate-C's read happens before or after Plate-A's
            depends on which agent happens to check the reader's
            occupancy value first — a fact that comes into being only as
            the run proceeds. The trajectory at cycle t is a function of
            the values present at cycle t, which are the emissions of
            cycles &lt; t, which depend on the trajectory up to t−1: a
            fixed point defined by the run itself, not evaluable in
            advance.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            A stored schedule would have to name the sequence in advance.
            But the sequence <em>is</em> the fixed point, and the fixed
            point is defined only by running. The next two slides make
            this concrete: the Gantt chart is one such trajectory, and
            re-running the identical setup with a different seed produces
            a genuinely different one.
          </p>
        </div>
        <div>
          <p className="aside">
            What <em>is</em> durable and storable is the node catalogue —
            the five-step protocol every plate follows, and the rule that
            reads govern reader access. What is <em>not</em> durable is
            which plate actually got the reader at cycle 11. Reproducing
            this process means re-importing the same protocol, not
            expecting the same Gantt chart twice.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide05Trajectory;
