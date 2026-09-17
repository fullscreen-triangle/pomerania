import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

const rows = [
  { l: "Centralized", bytes: 218.9 * 1e9, note: "218.9 GB · O(|𝒟|)", color: C.k2 },
  { l: "Federated Learning", bytes: 286.1 * 1e6, note: "286.1 MB · O(H(𝒟))", color: C.k4 },
  { l: "Federated Understanding", bytes: 968, note: "968 B · O(I(𝒟;𝒜))", color: C.good },
];

function drawTraffic(el: HTMLDivElement) {
  const w = 620,
    h = 300;
  const s = mountSvg(el, w, h);
  const m = { l: 190, r: 30, t: 26, b: 42 };

  const y = d3
    .scaleBand()
    .domain(rows.map((d) => d.l))
    .range([m.t, h - m.b])
    .padding(0.35);
  const x = d3.scaleLog().domain([100, 5 * 1e11]).range([m.l, w - m.r]).clamp(true);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(5, "~s"));
  s.append("text")
    .attr("x", (m.l + w - m.r) / 2)
    .attr("y", h - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("network traffic, bytes (log scale)");

  rows.forEach((d) => {
    const yy = y(d.l)!;
    const bh = y.bandwidth();
    s.append("text")
      .attr("x", m.l - 12)
      .attr("y", yy + bh / 2 + 4)
      .attr("text-anchor", "end")
      .attr("font-size", 12.5)
      .attr("fill", C.ink2)
      .text(d.l);

    s.append("rect")
      .attr("x", x(100))
      .attr("y", yy)
      .attr("height", bh)
      .attr("rx", 3)
      .attr("fill", d.color)
      .attr("opacity", 0.88)
      .attr("width", 0)
      .transition()
      .duration(750)
      .attr("width", Math.max(2, x(d.bytes) - x(100)));

    s.append("text")
      .attr("x", Math.min(w - m.r - 6, x(d.bytes) + 8))
      .attr("y", yy + bh / 2 + 4)
      .attr("font-size", 11)
      .attr("fill", d.color)
      .attr("text-anchor", (function () {
        return x(d.bytes) > w - m.r - 90 ? "end" : "start";
      })())
      .text(d.note)
      .attr("opacity", 0)
      .transition()
      .delay(500)
      .duration(400)
      .attr("opacity", 1);
  });

  s.append("text")
    .attr("x", m.l)
    .attr("y", m.t - 8)
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("real numbers, §9.7 (ACTN3 validation run)");
}

const Slide10Federated: SlideDef = {
  title: "The federated architecture & paradigm comparison",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>What crosses the wire, measured</h2>
      <div className="two-col">
        <div>
          <div className="boxed" data-step={0}>
            <b>Theorem (Paradigm Comparison).</b> Network traffic:{" "}
            <span className="m">T_central = O(|𝒟|)</span>,{" "}
            <span className="m">T_FL = O(H(𝒟))</span>,{" "}
            <span className="m">T_FU = O(I(𝒟; 𝒜<sub>𝒬</sub>))</span>. For
            typical questions I(𝒟;𝒜) ≪ H(𝒟) ≤ |𝒟|, so T_FU ≪ T_FL ≪
            T_central.
          </div>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Theorem (Structural Privacy).</b> Irrelevant data is never
            processed, not merely protected. The morphism chain accesses
            only 𝒟<sub>i</sub><sup>rel</sup>; the complement is never read,
            never loaded, never enters any computation — stronger than
            ε-differential privacy for any finite ε.
          </div>

          <p className={step < 2 ? "dim" : ""} data-step={2}>
            §9.7's empirical run: centralized transfer would be 218.9 GB.
            Federated learning (3 nodes × 100 MB model parameters) ≈ 286.1
            MB. Federated understanding: 968 bytes.
          </p>

          <p className={`aside ${step < 3 ? "dim" : ""}`} data-step={3}>
            Reduction factors: 2.4×10⁸× against centralized, 3.1×10⁵×
            against federated learning — and the gap widens linearly as
            source count increases (§9.7).
          </p>
        </div>
        <div>
          <D3Chart id="c-traffic" draw={drawTraffic} />
          <p className="cap">
            Real reported transfer volumes for the ACTN3 investigation. Note
            the log axis — the bars are not to a linear scale because
            nothing at linear scale would show all three.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide10Federated;
