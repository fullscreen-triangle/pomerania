import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

const M = 3; // independent coordinates, fixed for the demonstration

function drawTriple(el: HTMLDivElement) {
  const w = 620,
    h = 340;
  const s = mountSvg(el, w, h);
  const m = { l: 56, r: 20, t: 24, b: 40 };

  const ns = d3.range(2, 11);
  const data = ns.map((n) => ({
    n,
    osc: M * Math.log(n), // S_osc / k_B
    cat: Math.log(Math.pow(n, M)), // S_cat / k_B
    part: Math.log(Math.pow(n, M)), // S_part / k_B — identical by construction
  }));

  const x = d3.scaleLinear().domain([2, 10]).range([m.l, w - m.r]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.osc)! * 1.08])
    .range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(9).tickFormat(d3.format("d")));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5));

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("partition depth n");
  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("entropy / k_B");

  const line = (acc: (d: (typeof data)[number]) => number) =>
    d3
      .line<(typeof data)[number]>()
      .x((d) => x(d.n))
      .y((d) => y(acc(d)));

  // oscillatory: solid, thick, drawn first
  s.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", C.k1)
    .attr("stroke-width", 4)
    .attr("opacity", 0.9)
    .attr("d", line((d) => d.osc));

  // categorical: dashed, on top, slight visual offset so the coincidence is checkable
  s.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", C.k2)
    .attr("stroke-width", 2.2)
    .attr("stroke-dasharray", "7 4")
    .attr("d", line((d) => d.cat));

  // partition: dotted, thin, on top
  s.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", C.k3)
    .attr("stroke-width", 1.4)
    .attr("stroke-dasharray", "1.5 3.5")
    .attr("d", line((d) => d.part));

  data.forEach((d) => {
    s.append("circle").attr("cx", x(d.n)).attr("cy", y(d.osc)).attr("r", 3).attr("fill", C.k1);
  });

  const legend: [string, string, string][] = [
    ["S_osc = k_B M ln n", C.k1, "solid"],
    ["S_cat = k_B ln(nᴹ)", C.k2, "dashed"],
    ["S_part = k_B ln|P(M,n)|", C.k3, "dotted"],
  ];
  legend.forEach(([lab, col], i) => {
    const ly = m.t + i * 16;
    s.append("line")
      .attr("x1", w - m.r - 150)
      .attr("x2", w - m.r - 122)
      .attr("y1", ly)
      .attr("y2", ly)
      .attr("stroke", col)
      .attr("stroke-width", 2.5);
    s.append("text")
      .attr("x", w - m.r - 116)
      .attr("y", ly + 4)
      .attr("font-size", 11)
      .attr("fill", C.ink2)
      .text(lab);
  });

  s.append("text")
    .attr("x", m.l)
    .attr("y", m.t - 6)
    .attr("font-size", 12)
    .attr("fill", C.good)
    .text(`M = ${M} independent coordinates — three formulas, one curve`);
}

const Slide04BoundedPhaseSpace: SlideDef = {
  title: "Bounded phase space & the triple equivalence",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Recurrence precludes monotonic dynamics</h2>
      <div className="two-col">
        <div>
          <div className="boxed" data-step={0}>
            <b>Axiom (Bounded Phase Space).</b> Physical systems occupy
            finite phase space volume μ(Γ) &lt; ∞ and evolve under
            measure-preserving dynamics.
          </div>

          <p className={step < 1 ? "dim" : ""} data-step={1}>
            By Poincaré recurrence, trajectories in bounded phase space
            return arbitrarily close to their initial configuration in
            finite time. A bounded system cannot drift monotonically — it
            oscillates.
          </p>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Theorem (Triple Equivalence).</b> For a bounded system with M
            independent coordinates partitioned to depth n:
            <div className="sub">
              S<sub>osc</sub> = k<sub>B</sub> M ln n (oscillatory) = S
              <sub>cat</sub> = k<sub>B</sub> ln(n<sup>M</sup>) (categorical) =
              S<sub>part</sub> = k<sub>B</sub> ln|P(M,n)| (partition), where
              |P(M,n)| = n<sup>M</sup>.
            </div>
          </div>

          <p className={`aside ${step < 3 ? "dim" : ""}`} data-step={3}>
            Oscillation, category, and partition are three vocabularies for
            one structure. Physical measurement, categorical representation,
            and computational operation share an entropy space — that
            sharing is what lets a partition-signature extraction stand in
            for a physical measurement later in the paper.
          </p>
        </div>
        <div>
          <D3Chart id="c-triple" draw={drawTriple} />
          <p className="cap">
            All three formulas evaluated at M = 3 across n = 2…10. They are
            drawn with different strokes only so the overlap is visually
            checkable — the underlying numbers are identical at every n.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide04BoundedPhaseSpace;
