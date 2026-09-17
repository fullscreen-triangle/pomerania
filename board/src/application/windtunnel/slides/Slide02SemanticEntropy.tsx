import type { SlideDef } from "../../../deck/deckTypes";

const Slide02SemanticEntropy: SlideDef = {
  title: "Semantic entropy",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>𝒮: how far a system is from its own purpose</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>A residual, not a checklist</h3>
            <p>
              𝒮 is a scalar — a distance between what a system actually
              does under exercise and what its stated purpose says it
              should do. Not a pass/fail bit per test; a single number that
              can shrink as understanding of the purpose sharpens.
            </p>
          </div>

          <div className="defn" data-step={1}>
            <h3>Floor-positive, by axiom</h3>
            <p>
              𝒮 cannot reach exactly zero for a nontrivial system: there is
              always some residual gap between a purpose statement (finite,
              human-written) and behaviour (the full state space). This
              mirrors the S-entropy floor theorem elsewhere on this board —
              no distinction, including "matches its purpose," is free.
            </p>
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>The action-cell C*.</b> The set of states where 𝒮 sits at
            its floor is a <em>region</em> with positive volume, not a
            single point. "Correct" is a neighbourhood you can be
            perturbed within and still occupy, not a knife-edge.
          </div>
        </div>
        <div>
          <p className="aside">
            This reframes "does it work" away from binary test verdicts and
            toward: how far from the action-cell is the system sitting right
            now, and is that distance shrinking or growing as the codebase
            changes. The rest of this deck builds the machinery to actually
            measure that distance.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide02SemanticEntropy;
