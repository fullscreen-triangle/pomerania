import type { SlideDef } from "../deckTypes";

const roadmap: [string, string][] = [
  ["1", "one floor"],
  ["2", "three invariants"],
  ["3", "three coordinates"],
  ["4", "same at every scale"],
  ["5", "commitment = closure"],
  ["6", "closure is blind"],
];

const Slide01Title: SlideDef = {
  title: "What S-entropy is",
  maxStep: 0,
  render: () => (
    <>
      <h1>S-Entropy</h1>
      <p className="subtitle">
        Three coordinates, forced by one fact about telling things apart
      </p>

      <div className="lede">
        <p>
          This talk builds the whole framework from a single observation, in
          order. Nothing is assumed that is not constructed on a previous
          slide.
        </p>
        <p>
          The claim at the end is that a society coordinates on outcomes{" "}
          <em>without agreeing on facts</em> — and that this is a theorem,
          not a metaphor.
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
        Use <b>←</b> <b>→</b> to move between slides, <b>space</b> to advance
        within a slide. Every chart is live; hover and drag.
      </p>
    </>
  ),
};

export default Slide01Title;
