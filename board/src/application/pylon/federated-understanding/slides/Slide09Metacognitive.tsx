import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

type Stage = { k: string; l: string };

const stages: Stage[] = [
  { k: "D", l: "Decomposition" },
  { k: "R", l: "Resource allocation" },
  { k: "G", l: "Generation" },
  { k: "E", l: "Evaluation" },
  { k: "V", l: "Verification" },
  { k: "O", l: "Orchestration" },
];

const descriptions: string[] = [
  "Splits 𝒬 into sub-questions so that I(𝒟;𝒜𝒬) = Σᵢ I(𝒟;𝒜𝒬ᵢ) − Σᵢ<ⱼ I(𝒜𝒬ᵢ;𝒜𝒬ⱼ), balancing per-question cost against pairwise composition cost (Thm 6.3).",
  "The information-yield estimator R(𝒬ᵢ) = E[ΔI(Σ;𝒜𝒬ᵢ)] / C(𝒬ᵢ) sets budget bᵢ* = B·Rᵢ/ΣRⱼ — resources chase expected information gain per unit cost (§6.3).",
  "K candidates per sub-question from model diversity, temperature diversity, and methodological diversity, selected by a determinantal point process maximizing Σqᵢ + λ·log det(L) — quality and diversity together (Thm 6.6).",
  "Each candidate scored on five dimensions — complete, consistent, confident, compliant, correct — composed as q(a) = Πᵈ qᵈ(a)^wᵈ.",
  "Top candidates pass multi-expert domain consensus, adversarial probing, and (for mathematical claims) formal proof-assistant verification.",
  "accept(a*) if q(a*) > τ_accept; refine(𝒜,𝒬ᵢ) if between thresholds; redirect(𝒬ᵢ) if q(a*) ≤ τ_reject — the decision rule that closes the loop (§6.6).",
];

function drawPipeline(el: HTMLDivElement) {
  const w = 640,
    h = 260;
  const s = mountSvg(el, w, h);
  const n = stages.length;
  const boxW = 78,
    boxH = 52,
    gap = (w - n * boxW) / (n + 1);
  const y = h / 2 - boxH / 2;

  stages.forEach((st, i) => {
    const x = gap + i * (boxW + gap);

    s.append("rect")
      .attr("class", `stage-${i}`)
      .attr("x", x)
      .attr("y", y)
      .attr("width", boxW)
      .attr("height", boxH)
      .attr("rx", 6)
      .attr("fill", C.panel)
      .attr("stroke", C.line)
      .attr("stroke-width", 1.5);

    s.append("text")
      .attr("class", `label-${i}`)
      .attr("x", x + boxW / 2)
      .attr("y", y + 22)
      .attr("text-anchor", "middle")
      .attr("font-size", 17)
      .attr("font-weight", 700)
      .attr("fill", C.ink2)
      .text(st.k);
    s.append("text")
      .attr("x", x + boxW / 2)
      .attr("y", y + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", 9.5)
      .attr("fill", C.ink3)
      .text(st.l);

    if (i < n - 1) {
      const x2 = x + boxW + gap;
      s.append("line")
        .attr("x1", x + boxW + 4)
        .attr("x2", x2 - 6)
        .attr("y1", h / 2)
        .attr("y2", h / 2)
        .attr("stroke", C.line)
        .attr("stroke-width", 2);
      s.append("polygon")
        .attr("points", `${x2 - 6},${h / 2 - 5} ${x2 - 6},${h / 2 + 5} ${x2},${h / 2}`)
        .attr("fill", C.line);
    }
  });

  // feedback loop: O back to G (refine) and O back to D (redirect)
  s.append("path")
    .attr(
      "d",
      `M ${gap + 5 * (boxW + gap) + boxW / 2} ${y + boxH} C ${gap + 5 * (boxW + gap) + boxW / 2} ${h - 24}, ${
        gap + 2 * (boxW + gap) + boxW / 2
      } ${h - 24}, ${gap + 2 * (boxW + gap) + boxW / 2} ${y + boxH}`
    )
    .attr("fill", "none")
    .attr("stroke", C.k4)
    .attr("stroke-width", 1.4)
    .attr("stroke-dasharray", "4 3")
    .attr("marker-end", "url(#arrow-fb)");

  const defs = s.append("defs");
  defs
    .append("marker")
    .attr("id", "arrow-fb")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 8)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 z")
    .attr("fill", C.k4);

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 10.5)
    .attr("fill", C.k4)
    .text("refine / redirect loop back from Orchestration");
}

function highlightStage(el: HTMLDivElement, idx: number) {
  const svg = el.querySelector("svg");
  if (!svg) return;
  stages.forEach((_, i) => {
    const rect = svg.querySelector(`.stage-${i}`);
    const label = svg.querySelector(`.label-${i}`);
    if (rect) {
      rect.setAttribute("stroke", i === idx ? C.accent : C.line);
      rect.setAttribute("stroke-width", i === idx ? "3" : "1.5");
      rect.setAttribute("fill", i === idx ? "#1c2836" : C.panel);
    }
    if (label) label.setAttribute("fill", i === idx ? C.accent : C.ink2);
  });
}

function makeDrawWithHighlight(step: number) {
  return (el: HTMLDivElement) => {
    drawPipeline(el);
    highlightStage(el, step);
  };
}

const Slide09Metacognitive: SlideDef = {
  title: "The metacognitive refinement pipeline",
  maxStep: 5,
  render: (step) => {
    return (
      <>
        <h2>Six stages replace the researcher's iterative reasoning</h2>
        <div className="two-col">
          <div>
            {stages.map((st, i) => (
              <div
                key={st.k}
                className={`defn ${step < i ? "dim" : ""}`}
                data-step={i}
                style={{ borderLeftColor: step === i ? "var(--accent)" : undefined }}
              >
                <h3>
                  {st.k} — {st.l}
                </h3>
                <p>{descriptions[i]}</p>
              </div>
            ))}
          </div>
          <div>
            <D3Chart id="c-pipeline" draw={makeDrawWithHighlight(step)} deps={[step]} />
            <p className="cap">
              Pipeline 𝒫 = (D, R, G, E, V, O) (Def. 6.2). Orchestration's
              refine/redirect decision re-enters the pipeline rather than
              terminating it.
            </p>
          </div>
        </div>
      </>
    );
  },
};

export default Slide09Metacognitive;
