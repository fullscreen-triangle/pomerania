import type { SlideDef } from "../../../deck/deckTypes";

const roadmap: [string, string][] = [
  ["1", "purpose, and its residual: semantic entropy"],
  ["2", "the action-cell — a region, not a point"],
  ["3", "local invisibility: passing tests, wrong system"],
  ["4", "holonomy: a Kirchhoff law for correctness"],
  ["5", "isolation blindness: purpose is relational"],
  ["6", "Kuramoto regimes, live"],
  ["7", "the wind tunnel protocol"],
  ["8", "the DSL"],
  ["9", "run it — a live DSL cell"],
];

const Slide01Title: SlideDef = {
  title: "Wind Tunnel",
  maxStep: 0,
  render: () => (
    <>
      <h1>Wind Tunnel</h1>
      <p className="subtitle">
        A code testing suite built on a claim most test suites don't make
        explicit: passing every unit test is not the same as being correct
      </p>

      <div className="lede">
        <p>
          Conventional testing asks "does each piece do what its local spec
          says." Wind Tunnel asks a different, harder question: does the{" "}
          <em>system</em> still do what it's <em>for</em> — a question no
          finite set of local checks can guarantee an answer to, provably.
        </p>
        <p>
          It formalises "purpose" as a residual distance — semantic entropy
          𝒮 — with a provable positive floor, shows that local validation
          can be blind to global failure (and gives an explicit witness),
          and imports a Kirchhoff-law-style holonomy check plus Kuramoto
          ensemble dynamics to turn "is this system coherent" into a number
          you can actually compute.
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
        within a slide. The Kuramoto charts and the DSL cell run a real
        simulation client-side — nothing here is a canned regime.
      </p>
    </>
  ),
};

export default Slide01Title;
