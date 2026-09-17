import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// real reported values, §9.5
const points = [
  { step: 0, T: 0.45, l: "initial genomics extraction" },
  { step: 1, T: 0.425, l: "after first composition" },
  { step: 2, T: 0.414, l: "after final composition" },
];

function drawTemperature(el: HTMLDivElement) {
  const w = 620,
    h = 360;
  const s = mountSvg(el, w, h);
  const m = { l: 56, r: 20, t: 24, b: 42 };

  const x = d3.scaleLinear().domain([0, 2]).range([m.l, w - m.r]);
  const y = d3.scaleLinear().domain([0, 0.65]).range([h - m.b, m.t]);

  // phase bands: gas > 0.5, liquid 0.2-0.5, crystal < 0.2
  const bands: [number, number, string, string][] = [
    [0.5, 0.65, C.bad, "gas  (T > 0.5)"],
    [0.2, 0.5, C.k4, "liquid  (0.2 < T < 0.5)"],
    [0, 0.2, C.good, "crystal  (T < 0.2)"],
  ];
  bands.forEach(([lo, hi, col]) => {
    s.append("rect")
      .attr("x", m.l)
      .attr("y", y(hi))
      .attr("width", w - m.l - m.r)
      .attr("height", y(lo) - y(hi))
      .attr("fill", col)
      .attr("opacity", 0.09);
  });
  bands.forEach(([lo, hi, col, lab]) => {
    s.append("text")
      .attr("x", w - m.r - 6)
      .attr("y", (y(lo) + y(hi)) / 2 + 4)
      .attr("text-anchor", "end")
      .attr("font-size", 10.5)
      .attr("fill", col)
      .text(lab);
  });

  [0.2, 0.5].forEach((v) =>
    s
      .append("line")
      .attr("x1", m.l)
      .attr("x2", w - m.r)
      .attr("y1", y(v))
      .attr("y2", y(v))
      .attr("stroke", C.ink3)
      .attr("stroke-dasharray", "4 3")
      .attr("stroke-width", 1)
  );

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(2).tickFormat((d) => `step ${d}`));
  s.append("g").attr("class", "axis").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6));
  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("analysis temperature T");

  const line = d3
    .line<(typeof points)[number]>()
    .x((d) => x(d.step))
    .y((d) => y(d.T));

  s.append("path")
    .datum(points)
    .attr("fill", "none")
    .attr("stroke", C.k1)
    .attr("stroke-width", 2.4)
    .attr("d", line);

  s.selectAll(".pt")
    .data(points)
    .join("circle")
    .attr("cx", (d) => x(d.step))
    .attr("cy", (d) => y(d.T))
    .attr("r", 4.5)
    .attr("fill", C.k1);

  s.selectAll(".ptlab")
    .data(points)
    .join("text")
    .attr("x", (d) => x(d.step))
    .attr("y", (d) => y(d.T) - 12)
    .attr("text-anchor", "middle")
    .attr("font-size", 11)
    .attr("fill", C.ink)
    .text((d) => d.T.toFixed(3));

  s.append("text")
    .attr("x", m.l)
    .attr("y", m.t - 8)
    .attr("font-size", 11.5)
    .attr("fill", C.ink3)
    .text("T(t) = T(0)·exp(−t/τ) — three real measurements, §9.5");
}

const Slide11AnalysisGraph: SlideDef = {
  title: "The analysis graph & convergence",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Variance restoration drives fragments toward a crystal</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Analysis graph</h3>
            <p>
              A DAG of understanding fragments 𝒢<sub>𝒬</sub> = (𝒰, E, σ);
              root vertices are surgical extractions, the terminal vertex is
              the validated answer, and σ tracks each vertex's state
              (extracting / refining / composing / validating /
              crystallized).
            </p>
          </div>

          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3>Analysis temperature</h3>
            <p>
              T<sub>𝒬</sub> = categorical variance of the fragments' Σ:{" "}
              <span className="m">
                T<sub>𝒬</sub> = (1/m) Σᵢ d<sub>cat</sub>(Σᵢ, Σ̄)²
              </span>
              . High T means the fragments are dispersed; the analysis has
              not converged.
            </p>
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Theorem (Convergence).</b> T<sub>𝒬</sub>(t) = T<sub>𝒬</sub>(0)
            exp(−t/τ) — exponential decay, coupled to a zero-variance
            reference like Newton's law of cooling. Timescale τ ∝
            N<sub>nodes</sub><sup>−1/2</sup> · H(𝒬)/R<sub>pipeline</sub>.
          </div>

          <p className={`aside ${step < 3 ? "dim" : ""}`} data-step={3}>
            §9.5: T fell 0.450 → 0.425 → 0.414 across the three
            extraction/composition steps of the ACTN3 run — staying in the
            liquid phase throughout. This proof-of-concept does not reach
            the crystal phase; it would need further refinement rounds.
          </p>
        </div>
        <div>
          <D3Chart id="c-temperature" draw={drawTemperature} />
          <p className="cap">
            Gas / liquid / crystal phase bands at T = 0.5 and T = 0.2
            (Def. 8.6). All three measured points sit inside the liquid
            band.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide11AnalysisGraph;
