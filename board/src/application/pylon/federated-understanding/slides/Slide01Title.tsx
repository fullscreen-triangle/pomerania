import type { SlideDef } from "../../../../deck/deckTypes";

const roadmap: [string, string][] = [
  ["1", "the problem"],
  ["2", "invert data and understanding"],
  ["3", "bounded phase space"],
  ["4", "S-entropy coordinates"],
  ["5", "the protocol language"],
  ["6", "problem-directed compilation"],
  ["7", "why parametric, not retrieval"],
  ["8", "metacognitive refinement"],
  ["9", "federated architecture"],
  ["10", "the analysis graph"],
  ["11", "validated on ACTN3"],
];

const Slide01Title: SlideDef = {
  title: "Federated Understanding",
  maxStep: 0,
  render: () => (
    <>
      <h1>Federated Understanding</h1>
      <p className="subtitle">
        Automated deep research through problem-directed trajectory
        completion in distributed domain-specific language model networks
      </p>

      <div className="lede">
        <p>
          Conventional distributed computation moves <em>data</em> to a
          processor, or moves <em>model parameters</em> between nodes. This
          paper proposes moving neither: what should traverse a federated
          research network is <em>question-shaped understanding</em> —
          extracted surgically, transmitted minimally, composed
          categorically.
        </p>
        <p>
          The central inversion: the research question determines what
          information exists in the system. Without a question, no
          representation is created at all.
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
        within a slide. Every chart is live and computed from the paper's own
        definitions and reported numbers.
      </p>
    </>
  ),
};

export default Slide01Title;
