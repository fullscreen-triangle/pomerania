import type { SlideDef } from "../../../deck/deckTypes";

const roadmap: [string, string][] = [
  ["1", "the problem: forks drift, nobody notices"],
  ["2", "the character invariant χ"],
  ["3", "min-cut, live, on real symbols"],
  ["4", "the federation object model"],
  ["5", "two lineages: sense vs. runtime health"],
  ["6", "the invariants (I1–I4)"],
  ["7", "the st-Hurbert query language"],
  ["8", "run it — a live DSL cell"],
];

const Slide01Title: SlideDef = {
  title: "Repo-Federation Tracker",
  maxStep: 0,
  render: () => (
    <>
      <h1>Repo-Federation Tracker</h1>
      <p className="subtitle">
        "Bloodhound" — measuring the similarity and confluence of forks and
        clones of the same project, and giving each one a place to actually
        run
      </p>

      <div className="lede">
        <p>
          The same project accretes forks, mirrors, vendored copies, and
          long-lived feature branches. Each drifts. Nothing in the ordinary
          toolchain answers a simple question: <em>do these repositories
          still mean the same thing?</em> Diffing counts lines changed, not
          whether the change preserved the thing the repo was for.
        </p>
        <p>
          The tracker answers with a single conserved number per repository —
          the <b>character invariant χ</b> — computed as a graph minimum
          cut over the repo's own extracted symbols. Two repos with close χ
          and overlapping salient structure are still the same project in a
          meaningful sense, however far their commit histories have diverged.
          A companion execution layer lets you actually spin up and probe a
          tracked repo, not just measure it from the outside.
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
        within a slide. The min-cut and the DSL cell are real computations
        over a small illustrative fixture — nothing here is a canned number.
      </p>
    </>
  ),
};

export default Slide01Title;
