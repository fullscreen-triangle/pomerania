import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

type Row = { label: string; moves: string; color: string; note: string };

const rows: Row[] = [
  { label: "Centralized", moves: "raw data", color: C.k2, note: "𝒟ᵢ → central → compute → answer" },
  { label: "Federated Learning", moves: "model parameters", color: C.k4, note: "𝒟ᵢ → train → θᵢ → transmit → θ̄ → infer → answer" },
  { label: "Federated Understanding", moves: "understanding fragments", color: C.k3, note: "𝒟ᵢ → Φ(q,i) → 𝒰ᵢ → transmit → 𝒰* → crystallize → answer" },
];

function drawParadigms(el: HTMLDivElement) {
  const w = 640,
    h = 300;
  const s = mountSvg(el, w, h);
  const m = { l: 16, r: 16 };
  const rowH = 78;
  const top = 20;

  rows.forEach((r, i) => {
    const y = top + i * rowH;

    s.append("text")
      .attr("x", m.l)
      .attr("y", y)
      .attr("font-size", 13)
      .attr("font-weight", 600)
      .attr("fill", C.ink)
      .text(r.label);

    // source node
    s.append("rect")
      .attr("x", m.l)
      .attr("y", y + 12)
      .attr("width", 64)
      .attr("height", 30)
      .attr("rx", 4)
      .attr("fill", C.panel)
      .attr("stroke", C.line);
    s.append("text")
      .attr("x", m.l + 32)
      .attr("y", y + 31)
      .attr("text-anchor", "middle")
      .attr("font-size", 10.5)
      .attr("fill", C.ink3)
      .text("node i");

    // arrow shaft
    const x1 = m.l + 64 + 10;
    const x2 = w - m.r - 74;
    s.append("line")
      .attr("x1", x1)
      .attr("y1", y + 27)
      .attr("x2", x2)
      .attr("y2", y + 27)
      .attr("stroke", r.color)
      .attr("stroke-width", 3);
    s.append("polygon")
      .attr("points", `${x2},${y + 20} ${x2},${y + 34} ${x2 + 10},${y + 27}`)
      .attr("fill", r.color);

    // what moves, labeled on the arrow
    s.append("text")
      .attr("x", (x1 + x2) / 2)
      .attr("y", y + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", 11.5)
      .attr("font-weight", 600)
      .attr("fill", r.color)
      .text(r.moves);

    // destination node
    s.append("rect")
      .attr("x", w - m.r - 64)
      .attr("y", y + 12)
      .attr("width", 64)
      .attr("height", 30)
      .attr("rx", 4)
      .attr("fill", C.panel)
      .attr("stroke", C.line);
    s.append("text")
      .attr("x", w - m.r - 32)
      .attr("y", y + 31)
      .attr("text-anchor", "middle")
      .attr("font-size", 10.5)
      .attr("fill", C.ink3)
      .text("answer");

    s.append("text")
      .attr("x", m.l)
      .attr("y", y + 58)
      .attr("font-size", 10.5)
      .attr("font-family", "var(--mono)")
      .attr("fill", C.ink3)
      .text(r.note);
  });
}

const Slide03Inversion: SlideDef = {
  title: "The paradigm inversion",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>What traverses the network</h2>
      <div className="two-col">
        <div>
          <div className="boxed" data-step={0}>
            <b>Domain knowledge lives in parameters.</b> Continued
            pretraining and distillation embed domain reasoning directly into
            model weights — models that <em>know</em> a domain rather than
            retrieving facts about it.
          </div>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Questions are trajectory specifications.</b> A research
            question is a declarative protocol — a target region of
            S-entropy coordinate space, not a query string.
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>A metacognitive refinement pipeline</b> compiles each protocol
            statement into a morphism chain, executed with the same iterative
            structure a human researcher would use.
          </div>

          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>What flows is question-shaped understanding</b> — not data,
            not model weights. Every extraction is surgical: shaped by the
            question, from the moment it touches a data source.
          </div>

          <p className={`aside ${step < 4 ? "dim" : ""}`} data-step={4}>
            Convergence is thermodynamic: distributed understanding
            fragments are driven toward a crystalline ground state by
            variance restoration, not by a coordinator averaging results.
          </p>
        </div>
        <div>
          <D3Chart id="c-paradigms" draw={drawParadigms} />
          <p className="cap">
            Three distributed paradigms, one question: what object actually
            crosses the wire? (§7.2, Theorem 7.2 — the paradigm comparison
            chain equations.)
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide03Inversion;
