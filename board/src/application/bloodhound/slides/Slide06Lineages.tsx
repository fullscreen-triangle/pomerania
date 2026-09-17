import type { SlideDef } from "../../../deck/deckTypes";

const Slide06Lineages: SlideDef = {
  title: "Two lineages: sense vs. runtime health",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>Knowing what a repo means is cheap. Knowing if it runs is not.</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Sense-over-time</h3>
            <p>
              χ computed at every commit, or on demand. Always available,
              cheap to compute (it's a min-cut over symbols already
              extracted for search) — this is what the previous slides
              show.
            </p>
          </div>

          <div className="defn" data-step={1}>
            <h3>Image-knowability-over-time</h3>
            <p>
              A separate, strictly harder ladder:{" "}
              <b>unknown → assembled → exercised → judged</b>. A repo isn't
              "known to run" until someone actually built a container image
              from it, ran it, and — this is the wind-tunnel handoff — had
              its runtime behaviour judged against the repo's own stated
              purpose.
            </p>
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Why keep them separate.</b> A repo can have a rock-solid,
            unchanging χ for months while its build silently rots — nobody
            has run it, so nobody knows. Conflating "still means the same
            thing" with "still works" would hide exactly the failure mode
            this tool exists to surface.
          </div>
        </div>
        <div>
          <p className="aside">
            The design doc is explicit that the tracker never fabricates a
            runtime judgement it hasn't earned. If a repo's build has never
            been exercised, the honest answer is "assembled but nothing to
            exercise" or "not exercised" — never a guessed regime. The
            <code> RegimeMap</code> that supplies the "judged" step —{" "}
            <span className="m">(R_dyn, S_flat, H, D, δS)</span> — comes from
            the Wind Tunnel tool, covered next.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide06Lineages;
