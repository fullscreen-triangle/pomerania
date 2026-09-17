import type { SlideDef } from "../../../../deck/deckTypes";

const protocolSrc = `#!/usr/bin/env bloodhound

# Research question as trajectory specification
investigate "Association between ACTN3
  genotype and cardiac adaptation
  in elite sprinters"
  with confidence > 0.95
  with significance < 0.01

# Surgical extraction from distributed nodes
parallel {
    # Genomics laboratory (Node A)
    genotype = slice genomics.ACTN3
        @ cohort(elite_sprinters)
        @ variant(rs1815739)

    # Sports physiology clinic (Node B)
    cardiac = slice echocardiography
        @ cohort(elite_sprinters)
        @ measure(LV_mass, EF, GLS)

    # Proteomics facility (Node C)
    protein = slice proteomics
        @ target(alpha_actinin_3)
        @ tissue(cardiac_muscle)
        @ cohort(elite_sprinters)
}

# Compose understanding fragments
joined = compose genotype with cardiac
    preserving athlete_id
joined = compose joined with protein
    preserving athlete_id

# Navigate to answer with refinement
result = navigate joined to target
    via correlation_analysis
    via mediation_model

# Validate through multiple criteria
validate result
    against bootstrap(n=10000)
validate result
    against domain_consistency

# Completion condition
converge at confidence > 0.95`;

const Slide06Protocol: SlideDef = {
  title: "The research protocol language",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>A declarative trajectory specification, not a script</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Investigation, not computation</h3>
            <p>
              Verbs describe research actions — <code>investigate</code>,{" "}
              <code>slice</code>, <code>compose</code>, <code>validate</code>{" "}
              — not data transformations. The language models what a
              researcher <em>does</em>, not what a computer executes.
            </p>
          </div>

          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3>Completion, not return</h3>
            <p>
              Protocols specify when an investigation has reached sufficient
              confidence, statistical power, or categorical resolution.
              There is no return value — there is a convergence condition.
            </p>
          </div>

          <div className={`defn ${step < 2 ? "dim" : ""}`} data-step={2}>
            <h3>Trajectory as provenance</h3>
            <p>
              The path through S-entropy space to reach a conclusion is
              simultaneously the result's address and its complete
              methodological provenance. Reproducibility is structural, not
              documented.
            </p>
          </div>

          <div className={`defn ${step < 3 ? "dim" : ""}`} data-step={3}>
            <h3>Surgical specification</h3>
            <p>
              Protocols declare exactly what information is needed from each
              source. The declaration simultaneously constrains what is
              extracted and what is transmitted — irrelevant data is never
              touched.
            </p>
          </div>
        </div>
        <div>
          <pre className="protocol-code">
            <code>{protocolSrc}</code>
          </pre>
          <p className="cap">
            §3.5's worked example: three parallel extractions, two
            compositions, one navigation with two methods, two validations,
            one convergence criterion — parsed into 3 surgical extraction
            targets, 2 composition operations, 1 navigation chain, 2
            validation steps, 1 convergence criterion (§9.1).
          </p>
        </div>
      </div>
      <style>{`
        .protocol-code {
          background: #0d1420;
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 16px 18px;
          font-family: var(--mono);
          font-size: 12px;
          line-height: 1.55;
          color: var(--ink-2);
          overflow-x: auto;
          max-height: 480px;
          overflow-y: auto;
        }
        .protocol-code code {
          white-space: pre;
        }
      `}</style>
    </>
  ),
};

export default Slide06Protocol;
