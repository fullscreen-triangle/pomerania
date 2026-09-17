import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

function drawCoverage(el: HTMLDivElement) {
  const w = 520,
    h = 260;
  const s = mountSvg(el, w, h);
  const m = { l: 150, r: 30, t: 24, b: 30 };

  const data = [
    { l: "compositional", rag: 0.15, param: 0.9 },
    { l: "contextual", rag: 0.2, param: 0.9 },
    { l: "constraint-aware", rag: 0.1, param: 0.9 },
  ];

  const y = d3
    .scaleBand()
    .domain(data.map((d) => d.l))
    .range([m.t, h - m.b])
    .padding(0.4);
  const x = d3.scaleLinear().domain([0, 1]).range([m.l, w - m.r]);

  data.forEach((d) => {
    const yy = y(d.l)!;
    const bh = y.bandwidth();
    s.append("text")
      .attr("x", m.l - 10)
      .attr("y", yy + bh / 2 + 4)
      .attr("text-anchor", "end")
      .attr("font-size", 11.5)
      .attr("fill", C.ink2)
      .text(d.l);

    s.append("rect")
      .attr("x", x(0))
      .attr("y", yy)
      .attr("height", bh / 2 - 2)
      .attr("width", x(d.rag) - x(0))
      .attr("fill", C.bad)
      .attr("opacity", 0.85);
    s.append("rect")
      .attr("x", x(0))
      .attr("y", yy + bh / 2 + 2)
      .attr("height", bh / 2 - 2)
      .attr("width", x(d.param) - x(0))
      .attr("fill", C.good)
      .attr("opacity", 0.9);
  });

  const legend: [string, string][] = [
    ["RAG (surface similarity)", C.bad],
    ["parametric (domain reasoning)", C.good],
  ];
  legend.forEach(([lab, col], i) => {
    const ly = m.t - 12 + i * 14;
    s.append("rect").attr("x", m.l).attr("y", ly - 8).attr("width", 10).attr("height", 10).attr("fill", col);
    s.append("text")
      .attr("x", m.l + 16)
      .attr("y", ly)
      .attr("font-size", 10.5)
      .attr("fill", C.ink2)
      .text(lab);
  });
}

const Slide08Parametric: SlideDef = {
  title: "Why parametric knowledge, not retrieval",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>Surgical extraction needs reasoning retrieval cannot supply</h2>
      <div className="two-col">
        <div>
          <div className="three-col" style={{ marginBottom: 18 }}>
            <div className="boxed danger" style={{ margin: 0 }}>
              <b>Retrieval-augmented compiler</b>
              <div className="sub">
                C<sup>RAG</sup><sub>μ</sub>(𝒬,𝒟<sub>μ</sub>) = M
                <sub>gen</sub>(𝒬, retrieve(𝒬, 𝒦<sub>μ</sub>)) — selects
                documents by surface similarity to 𝒬.
              </div>
            </div>
            <div className="boxed" style={{ margin: 0 }}>
              <b>Parametric compiler</b>
              <div className="sub">
                C<sup>param</sup><sub>μ</sub>(𝒬,𝒟<sub>μ</sub>) = M
                <sub>θμ</sub>(𝒬,𝒟<sub>μ</sub>) — θ<sub>μ</sub> specialized by
                continued pretraining and distillation.
              </div>
            </div>
          </div>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Theorem (Necessity of Parametric Knowledge).</b>{" "}
            Problem-directed compilation requires parametric embedding;
            retrieval-augmented compilation is insufficient for surgical
            extraction.
          </div>

          <p className={step < 2 ? "dim" : ""} data-step={2}>
            The proof turns on three properties relevance determination
            needs — <b>compositional</b> (relevance depends on the
            interaction of question, data, and domain constraint, e.g. why
            ACTN3 genotype bears on cardiac adaptation through calcium
            handling), <b>contextual</b> (the same data element is relevant
            to one question and not another — not a property of the data
            alone), and <b>constraint-aware</b> (extraction must satisfy
            S-entropy conservation and domain constraints, properties of the
            domain's structure, not of any retrieved document). Retrieval's{" "}
            <span className="m">
              argmax<sub>k</sub> sim(embed(𝒬), embed(k))
            </span>{" "}
            is surface matching; it cannot capture any of the three.
          </p>
        </div>
        <div>
          <D3Chart id="c-coverage" draw={drawCoverage} />
          <p className="cap">
            Qualitative coverage of the three reasoning requirements —
            retrieval's surface-similarity matching against a parametric
            compiler's internalized domain constraints. Not a measured
            metric from the paper; illustrates the proof's structure.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide08Parametric;
