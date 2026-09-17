import type { SlideDef } from "../../../../deck/deckTypes";

const roadmap: [string, string][] = [
  ["1", "one quantum, three roles"],
  ["2", "the computing network"],
  ["3", "resolution floor"],
  ["4", "cell-partition scheduler"],
  ["5", "separation cost & yield market"],
  ["6", "the Three-way Equivalence"],
  ["7", "forced utilisation & sorting"],
  ["8", "liveness under backpressure"],
  ["9", "structural incorruptibility"],
  ["10", "processes as persistent agents"],
  ["11", "validation"],
];

const Slide01Title: SlideDef = {
  title: "Network Yield and Computing Allocation",
  maxStep: 0,
  render: () => (
    <>
      <h1>Network Yield &amp; Computing Allocation</h1>
      <p className="subtitle">
        A unified framework for distributed task scheduling via
        thermodynamic resolution floors, cell-partition control, and market
        clearing
      </p>

      <div className="lede">
        <p>
          Every schedulable resource, every state observation, and every
          economic signal in this framework shares one irreducible quantum{" "}
          <span className="m">τ₀ &gt; 0</span>: the compute-tick.
        </p>
        <p>
          The central result is a <em>Three-way Equivalence</em>:
          yield-optimality, deterministic scheduler closure, and market
          clearing are one fixed point — because the same tick serves as the
          physical resolution floor, the algorithmic closure threshold, and
          the minimum market lot, simultaneously.
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
        within a slide. Charts marked "validated" are driven by the paper's
        own computational validation suite.
      </p>
    </>
  ),
};

export default Slide01Title;
