import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { addClaim, addContact, alignment, newGraph } from "../graph";

function drawDivergence(el: HTMLDivElement, scope: HTMLElement) {
  const w = 560,
    h = 260;
  const s = mountSvg(el, w, h);

  // Content graph: T (textbook) and E (specific explanation) both close
  // to the query by lexical similarity, but T is much closer overall.
  const gc = newGraph();
  addClaim(gc, "query", 1);
  addClaim(gc, "T", 1);
  addClaim(gc, "E", 1);
  addContact(gc, "query", "T", 10.0);
  addContact(gc, "query", "E", 2.0);

  // Receiver graph: the researcher's own context already fixes the assay
  // and buffer, so E is now the tightly-bound claim and T is a loose,
  // generic one.
  const gr = newGraph();
  addClaim(gr, "query", 1);
  addClaim(gr, "T", 1);
  addClaim(gr, "E", 1);
  addContact(gr, "query", "T", 1.5);
  addContact(gr, "query", "E", 13.5);

  const alignTc = alignment(gc, "query", "T");
  const alignEc = alignment(gc, "query", "E");
  const alignTr = alignment(gr, "query", "T");
  const alignEr = alignment(gr, "query", "E");

  const data = [
    { label: "T (textbook)", content: alignTc, meaning: alignTr },
    { label: "E (specific)", content: alignEc, meaning: alignEr },
  ];

  const x = d3Scale(w);
  function d3Scale(width: number) {
    return { pad: 90, w: width };
  }
  const barW = 70;
  const groups = [
    { x: x.pad, label: "content-graph alignment" },
    { x: x.pad + 260, label: "receiver-graph alignment" },
  ];

  s.selectAll(".glabel")
    .data(groups)
    .join("text")
    .attr("class", "glabel")
    .attr("x", (d) => d.x + barW)
    .attr("y", 24)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text((d) => d.label);

  const maxV = 14;
  const yScale = (v: number) => 200 - (v / maxV) * 160;

  data.forEach((d, i) => {
    const color = i === 0 ? C.k2 : C.k3;
    [
      { gx: groups[0].x, val: d.content },
      { gx: groups[1].x, val: d.meaning },
    ].forEach(({ gx, val }) => {
      s.append("rect")
        .attr("x", gx + i * (barW + 8))
        .attr("y", yScale(val))
        .attr("width", barW)
        .attr("height", 200 - yScale(val))
        .attr("fill", color)
        .attr("opacity", 0.85);
      s.append("text")
        .attr("x", gx + i * (barW + 8) + barW / 2)
        .attr("y", yScale(val) - 6)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", C.ink2)
        .text(val.toFixed(1));
    });
  });

  s.selectAll(".leg")
    .data(data)
    .join("text")
    .attr("class", "leg")
    .attr("x", 20)
    .attr("y", (_, i) => 230 + i * 16)
    .attr("font-size", 11)
    .attr("fill", (_, i) => (i === 0 ? C.k2 : C.k3))
    .text((d) => `■ ${d.label}`);

  const readout = scope.querySelector<HTMLElement>("#cm-readout");
  if (readout) {
    const contentWinner = alignTc > alignEc ? "T" : "E";
    const meaningWinner = alignTr > alignEr ? "T" : "E";
    readout.innerHTML =
      `content-optimal: <b>${contentWinner}</b> (σ_C(T)=${alignTc.toFixed(1)}, σ_C(E)=${alignEc.toFixed(1)})<br>` +
      `meaning-optimal: <b style="color:${meaningWinner !== contentWinner ? C.bad : C.good}">${meaningWinner}</b> (σ_R(T)=${alignTr.toFixed(1)}, σ_R(E)=${alignEr.toFixed(1)})<br>` +
      `<span style="color:${C.ink3}">${meaningWinner !== contentWinner ? "the rankings invert — content and meaning pick different claims entirely" : "rankings agree here"}</span>`;
  }
}

const Slide03ContentMeaning: SlideDef = {
  title: "Content and meaning diverge",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>The true, irrelevant passage</h2>
      <div className="two-col">
        <div>
          <p>
            A researcher's specific enzyme assay fails under a specific
            buffer condition. The top passage by lexical overlap is a true,
            correctly-cited textbook statement of general kinetics — high
            content alignment, low meaning alignment once the researcher's
            own already-fixed context (the specific assay, the specific
            failure) is the graph being cut against.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            The chart alignments below are the exact numbers from the
            paper's own constructed instance (Experiment 2): σ_C(T)=10.0 &gt;
            σ_C(E)=2.0 in the content graph, but σ_R(E)=13.5 &gt;
            σ_R(T)=1.5 in the receiver graph — the two rankings invert
            completely, computed by the same min-cut routine on two
            differently-weighted graphs over the identical two claims.
          </p>
        </div>
        <div>
          <D3Chart id="c-content-meaning" draw={drawDivergence} />
          <div className="controls">
            <div id="cm-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide03ContentMeaning;
