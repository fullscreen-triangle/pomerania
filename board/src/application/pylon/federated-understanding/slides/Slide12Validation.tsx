import type { SlideDef } from "../../../../deck/deckTypes";

const modalities: { l: string; Sk: number; St: number; Se: number; color: string }[] = [
  { l: "genomics", Sk: 0.3, St: 0.1, Se: 0.6, color: "var(--k1)" },
  { l: "transcriptomics", Sk: 0.35, St: 0.2, Se: 0.45, color: "var(--k2)" },
  { l: "proteomics", Sk: 0.4, St: 0.15, Se: 0.45, color: "var(--k3)" },
];

const falsifiers = [
  "violation of the information minimality bound",
  "failure of composition preservation across modalities",
  "breakdown of convergence under variance restoration",
  "retrieval-augmented compilation achieving equivalent surgical extraction to parametric compilation",
];

const Slide12Validation: SlideDef = {
  title: "Validated on ACTN3",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>A live multi-omics investigation, end to end</h2>
      <div className="two-col">
        <div>
          <div className="boxed" data-step={0}>
            <b>The investigation.</b> ACTN3 R577X genotype (rs1815739)
            against cardiac adaptation in elite sprinters, run against live
            public APIs — NCBI dbSNP and GWAS Catalog (genomics), NCBI GEO
            (transcriptomics), UniProt (proteomics). Seven validation checks
            evaluated end to end.
          </div>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Cross-modal link discovery.</b> Composition operations
            discovered shared terms (ACTN3), gene-protein links, and tissue
            context (cardiac_muscle) across modalities that concatenation
            alone would not surface. Links grew 0 → 3 → 4 through the two
            compositions (§9.6); Sk moved 0.30 → 0.27 → 0.29 while S
            <sub>total</sub> was preserved.
          </div>

          <p className={`aside ${step < 2 ? "dim" : ""}`} data-step={2}>
            Everything on this slide is a proof-of-concept run on one
            question, not a benchmark suite — the paper is explicit that
            temperature convergence here reaches liquid, not crystal (Slide
            11), and that generalization across question types is untested.
          </p>

          <div className={`boxed danger ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>Stated falsifiability (Conclusion).</b> The framework is
            falsifiable through any of:
            <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
              {falsifiers.map((f) => (
                <li key={f} style={{ fontSize: 14.5, margin: "4px 0" }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <div>
            {modalities.map((m) => (
              <div
                key={m.l}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  padding: "11px 0",
                  borderBottom: "1px solid var(--line)",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: m.color, fontWeight: 600, fontSize: 16, minWidth: 130 }}>
                  {m.l}
                </span>
                <span className="m" style={{ fontSize: 13 }}>
                  ({m.Sk.toFixed(2)}, {m.St.toFixed(2)}, {m.Se.toFixed(2)})
                </span>
                <em style={{ fontSize: 13, color: "var(--ink-2)", fontStyle: "normal" }}>
                  (Sk, St, Se) — §9.2
                </em>
              </div>
            ))}
          </div>
          <p className="cap">
            Each modality's extracted fragment lands at a distinct point in
            𝒮 = [0,1]³ (§9.2) — different knowledge/temporal/evolution
            balance per data type, composed while conserving S
            <sub>total</sub>.
          </p>
          <p className="punch" style={{ marginTop: 24 }}>
            <em>
              Automated deep research is trajectory completion in bounded
              phase space. The question is the scalpel. Understanding is the
              currency. The answer crystallizes.
            </em>
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide12Validation;
