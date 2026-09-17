import type { SlideDef } from "../../../deck/deckTypes";

const Slide05IsolationBlindness: SlideDef = {
  title: "Isolation blindness",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Purposelessness is relational, not local</h2>
      <div className="two-col">
        <div>
          <p>
            A unit cannot be judged purposeless by staring at it alone. The{" "}
            <b>Isolation Blindness Theorem</b> proves this with a
            duplicate-unit construction: take a unit U that contributes
            nothing on its own, and place a second, identical copy U′
            immediately downstream. Now ask whether U is purposeless.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            The answer depends entirely on what U′ does with U's output —
            a fact about the <em>relationship</em>, invisible from U's own
            code, tests, or spec. Delete U′ and the same U might become
            load-bearing, or stay dead weight — you cannot tell which from
            U in isolation. This is why Wind Tunnel's{" "}
            <code>purpose ablate […]</code> step works by actually removing
            candidate units from a running ensemble and measuring the
            resulting shift <span className="m">δS</span>, rather than
            trying to score each unit's code in isolation.
          </p>
        </div>
        <div>
          <p className="aside">
            This is the direct analogue of the S-entropy board's own
            observation that relevance is receiver-relative, not a property
            of content alone — the same shape of argument, applied here to
            "does this code matter" instead of "is this passage relevant."
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide05IsolationBlindness;
