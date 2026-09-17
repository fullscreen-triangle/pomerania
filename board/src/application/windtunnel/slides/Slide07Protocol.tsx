import type { SlideDef } from "../../../deck/deckTypes";

const Slide07Protocol: SlideDef = {
  title: "The wind tunnel protocol",
  maxStep: 0,
  render: () => (
    <>
      <h2>Two-phase analysis, one output tuple</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>1. Static analysis</h3>
            <p>
              Parse the codebase into cycle candidates and compute holonomy
              on each — the part of correctness certifiable without ever
              running anything.
            </p>
          </div>
          <div className="defn" data-step={0}>
            <h3>2. Dynamic analysis</h3>
            <p>
              Model the system's units as a Kuramoto ensemble under real or
              synthetic load, measure <span className="m">R_ens</span>, and
              classify the coordination regime.
            </p>
          </div>
          <div className="defn" data-step={0}>
            <h3>3. Purposelessness analysis</h3>
            <p>
              Ablate candidate units one at a time from the running
              ensemble and measure the shift <span className="m">δS</span>{" "}
              — the Isolation Blindness answer, made operational.
            </p>
          </div>
        </div>
        <div>
          <pre className="code-block">{`WT(E, Λ) = (
  regime,               -- classifyRegime(R_ens)
  r_est,                -- estimated coordination quality
  cycle_graph,           -- holonomy per cycle
  contribution_scores    -- δS per ablated unit
)`}</pre>
          <p className="aside">
            E is the exercised system, Λ its purpose statement. Nothing in
            this tuple is inferred without actually running the analysis —
            the DSL's <code>report:</code> block simply selects which
            fields of WT(E, Λ) to print.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide07Protocol;
