import type { SlideDef } from "../../../deck/deckTypes";

const roadmap: [string, string][] = [
  ["1", "the resolution floor for retrieval"],
  ["2", "content and meaning provably diverge"],
  ["3", "recognition/search identity, receiver-relativity"],
  ["4", "retrieval as individuation, live"],
  ["5", "coherence requires a triangle"],
  ["6", "closure, not a confidence threshold"],
  ["7", "the four-column route-audit"],
  ["8", "federation and water-filling"],
  ["9", "run it — a live query cell"],
];

const Slide01Title: SlideDef = {
  title: "Federated Retrieval-Augmentation",
  maxStep: 0,
  render: () => (
    <>
      <h1>Federated Retrieval-Augmentation</h1>
      <p className="subtitle">
        Search as individuation, answers as societies of agents, and why a
        true answer can be a useless one
      </p>

      <div className="lede">
        <p>
          A retrieval-augmented system can return a passage that is true,
          well-sourced, and lexically close to the query — and still be
          useless, because it optimised <em>content fidelity</em> while the
          asker needed <em>meaning fidelity</em>. This is not a ranking
          defect to tune away; it is a category error, provable from the
          same finite-weighted-graph machinery used elsewhere on this
          board.
        </p>
        <p>
          A corpus, a knowledge base, and a querying agent are each a{" "}
          <b>contact graph</b> with a distinguished vertex, the medium,
          standing for everything not yet individuated. Retrieval is a{" "}
          minimum cut against that medium — never a point, always a
          bounded region — and the same cut computed against a different
          receiver's graph gives a genuinely different, equally correct
          answer.
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
        advance within a slide. Every chart and the query cell run the
        paper's own algorithms — Edmonds-Karp min-cut, water-filling,
        four-column relaxation — live, in this browser.
      </p>
    </>
  ),
};

export default Slide01Title;
