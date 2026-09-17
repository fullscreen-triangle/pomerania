import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

type Row = { l: string; hBytes: number; sigBytes: number; ratio: string };

// H(dataset) approximated as GB expressed in bytes for a shared log axis.
const rows: Row[] = [
  { l: "dbSNP (genomics)", hBytes: 65 * 1e9, sigBytes: 227, ratio: "3.5×10⁻⁹" },
  { l: "GEO (transcriptomics)", hBytes: 50 * 1e9, sigBytes: 312, ratio: "6.2×10⁻⁹" },
  { l: "UniProt (proteomics)", hBytes: 120 * 1e9, sigBytes: 429, ratio: "3.6×10⁻⁹" },
  { l: "Overall", hBytes: 218.9 * 1e9, sigBytes: 968, ratio: "4.1×10⁻⁹" },
];

function drawCompression(el: HTMLDivElement) {
  const w = 640,
    h = 420;
  const s = mountSvg(el, w, h);
  const m = { l: 170, r: 90, t: 30, b: 40 };

  const y = d3
    .scaleBand()
    .domain(rows.map((d) => d.l))
    .range([m.t, h - m.b])
    .padding(0.32);
  const x = d3.scaleLog().domain([100, 3 * 1e11]).range([m.l, w - m.r]).clamp(true);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(5, "~s"));
  s.append("text")
    .attr("x", (m.l + w - m.r) / 2)
    .attr("y", h - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("bytes (log scale)");

  rows.forEach((d) => {
    const yy = y(d.l)!;
    const bh = y.bandwidth();

    s.append("text")
      .attr("x", m.l - 12)
      .attr("y", yy + bh / 2 - 4)
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .attr("fill", C.ink2)
      .text(d.l);

    // H(dataset) bar
    s.append("rect")
      .attr("x", x(100))
      .attr("y", yy)
      .attr("height", bh / 2 - 2)
      .attr("width", 0)
      .attr("fill", C.k2)
      .attr("opacity", 0.85)
      .transition()
      .duration(650)
      .attr("width", x(d.hBytes) - x(100));
    s.append("text")
      .attr("x", x(d.hBytes) + 6)
      .attr("y", yy + bh / 4 + 4)
      .attr("font-size", 10.5)
      .attr("fill", C.k2)
      .text(`H(dataset) ${d3.format(".3~s")(d.hBytes)}B`);

    // extracted signature bar
    s.append("rect")
      .attr("x", x(100))
      .attr("y", yy + bh / 2 + 2)
      .attr("height", bh / 2 - 2)
      .attr("width", 0)
      .attr("fill", C.good)
      .attr("opacity", 0.9)
      .transition()
      .delay(200)
      .duration(650)
      .attr("width", Math.max(2, x(d.sigBytes) - x(100)));
    s.append("text")
      .attr("x", x(d.sigBytes) + 6)
      .attr("y", yy + (3 * bh) / 4 + 4)
      .attr("font-size", 10.5)
      .attr("fill", C.good)
      .text(`Σ ${d.sigBytes} B · ρ=${d.ratio}`);
  });

  s.append("text")
    .attr("x", m.l)
    .attr("y", m.t - 10)
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("H(dataset) available  vs.  H(Σ) extracted");
}

const Slide07Compilation: SlideDef = {
  title: "Problem-directed compilation & information minimality",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>The morphism chain produces a sufficient statistic</h2>
      <div className="two-col">
        <div>
          <div className="formula" data-step={0}>
            <b>Problem-directed compiler</b>
            <span className="m">
              C<sub>μ</sub>(𝒬, 𝒟<sub>μ</sub>) → Φ<sub>𝒬,μ</sub>
            </span>
            <em>a domain-specific model that maps a question and a local
            data source to a morphism chain extracting exactly what answers
            𝒬</em>
          </div>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Theorem (Information Minimality).</b> The partition signature
            Σ<sub>𝒬</sub> = Φ<sub>𝒬</sub>(𝒟) is a sufficient statistic:{" "}
            <span className="m">I(𝒟; 𝒜<sub>𝒬</sub> | Σ<sub>𝒬</sub>) = 0</span>,
            and it is minimal:{" "}
            <span className="m">H(Σ<sub>𝒬</sub>) = I(𝒟; 𝒜<sub>𝒬</sub>)</span> —
            exactly the mutual information between data and answer, no more.
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Corollary (Compression Ratio).</b>{" "}
            <span className="m">ρ = H(Σ)/H(𝒟) = I(𝒟;𝒜)/H(𝒟)</span>, reported
            at 10⁻³ to 10⁻⁷ for surgical questions against large datasets
            (§4.2).
            <div className="sub">
              The empirical run (§9.3) does even better than that range: 968
              bytes extracted from 218.9 GB overall, ρ ≈ 4.1×10⁻⁹.
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-compression" draw={drawCompression} />
          <p className="cap">
            Real numbers from §9.3: dbSNP 65 GB → 227 B; GEO 50 GB → 312 B;
            UniProt 120 GB → 429 B; overall 218.9 GB → 968 B. Every source
            compresses by roughly nine orders of magnitude.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide07Compilation;
