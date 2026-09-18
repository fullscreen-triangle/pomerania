import type { SlideDef } from "../../../deck/deckTypes";

const roadmap: [string, string][] = [
  ["1", "the resolution floor: an identity, not an existence claim"],
  ["2", "why the infimum form is false"],
  ["3", "the compromise modulus: two failed candidates, one survivor"],
  ["4", "the decision resolution bound"],
  ["5", "tightness, saturation, and why placement beats cardinality"],
  ["6", "reading the bound as rate-distortion"],
  ["7", "Nyquist corrected: two constraints, not one"],
  ["8", "estimation vs. regulation: when monitoring biases"],
  ["9", "redundancy: three suffices, until it doesn't"],
  ["10", "validation: fifteen checks, three deliberate falsifications"],
];

const Slide01Title: SlideDef = {
  title: "Decision Resolution",
  maxStep: 0,
  render: () => (
    <>
      <h1>Decision Resolution</h1>
      <p className="subtitle">
        What a finite observer entitles a controller to do — finite
        constraint propagation in observed processes
      </p>

      <div className="lede">
        <p>
          Every controller reads a monitor and acts. The monitor is
          finite — bounded memory, bounded bandwidth — while the quantity
          it observes ranges over a continuum. What does that finiteness
          cost the <em>decision</em>, not the estimate?
        </p>
        <p>
          This paper answers with a computable bound rather than an
          existence claim, shows the customary "resolution floor"
          argument is false as usually stated, constructs the correct
          modulus after showing two natural candidates both fail, and
          proves the resulting bound is tight and saturating. Three
          folklore claims — the Nyquist chain, monitor/control coupling,
          "three sources suffice" — are each corrected along the way.
        </p>
      </div>

      <div className="roadmap">
        {roadmap.map(([n, t]) => (
          <div className="rm" key={n}>
            <b>{n}.</b> {t}
          </div>
        ))}
      </div>

      <p className="footnote">
        Use <b>←</b> <b>→</b> to move between slides, <b>space</b> to
        advance within a slide. Every chart is computed live from the
        paper's own closed-form results — including the process-sequence
        and feasibility diagrams.
      </p>
    </>
  ),
};

export default Slide01Title;
