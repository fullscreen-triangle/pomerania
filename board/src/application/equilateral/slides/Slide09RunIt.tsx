import type { SlideDef } from "../../../deck/deckTypes";
import DslCell from "../../../deck/DslCell";
import { runQuery } from "../query";

const EXAMPLE = `# build a small contact graph, then query it
claim doc_A 3
claim doc_B 2.5
claim record_C 4
contact doc_A doc_B 1.5
contact doc_B record_C 1.2

separation doc_A
alignment doc_A record_C
floor
`;

const Slide09RunIt: SlideDef = {
  title: "Run it",
  maxStep: 0,
  render: () => (
    <>
      <h2>A live contact-graph cell</h2>
      <p>
        There is no DSL in the source paper — Equilateral exposes its
        algorithms as direct function calls from sliders, not a scripting
        surface — so this cell is a thin interpreter over the same real
        min-cut functions used in the charts above: <code>claim</code>{" "}
        registers a vertex against the medium, <code>contact</code> adds a
        weighted edge between two claims, and{" "}
        <code>separation</code>/<code>alignment</code>/<code>floor</code>{" "}
        run real Edmonds-Karp max-flow on whatever graph you've built so
        far.
      </p>
      <DslCell language="contact-graph query" initialSource={EXAMPLE} run={runQuery} />
      <p className="aside">
        Try adding a fourth claim and a new contact, or query{" "}
        <code>alignment doc_A record_C</code> before and after adding a
        direct contact between them — the number changes because the cut
        genuinely changes, not because it was looked up.
      </p>
    </>
  ),
};

export default Slide09RunIt;
