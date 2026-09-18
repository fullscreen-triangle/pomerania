import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

function drawModuli(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 20, right: 20, bottom: 36, left: 46 };
  const s = mountSvg(el, w, h);

  const deltaMax = 0.5;
  const n = 80;
  const pts = Array.from({ length: n + 1 }, (_, i) => (deltaMax * i) / n);

  const swap = pts.map((d) => 2 * d * d);
  const cont = pts.map((d) => d * d);
  const comp = pts.map((d) => 0.5 * d * d);
  const achieved = pts.map((d) => 0.25 * d * d);

  const maxY = Math.max(...swap);
  const toX = (d: number) => margin.left + (d / deltaMax) * (w - margin.left - margin.right);
  const toY = (v: number) => h - margin.bottom - (v / maxY) * (h - margin.top - margin.bottom);

  s.append("g").attr("transform", `translate(0,${h - margin.bottom})`).call((g) => {
    const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    ticks.forEach((t) => {
      g.append("text").attr("x", toX(t)).attr("y", 16).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", C.ink3).text(t);
    });
  });
  s.append("line").attr("x1", margin.left).attr("x2", w - margin.right).attr("y1", h - margin.bottom).attr("y2", h - margin.bottom).attr("stroke", C.line);

  const series: [number[], string, string][] = [
    [swap, C.bad, "Δ  swap divergence (2δ²)"],
    [cont, C.k4, "ω_J  continuity modulus (δ²)"],
    [comp, C.k1, "Γ_J  compromise modulus (δ²/2)"],
    [achieved, C.good, "achieved gap (δ²/4)"],
  ];

  series.forEach(([data, color, label], i) => {
    const line = "M" + pts.map((d, j) => `${toX(d)},${toY(data[j])}`).join("L");
    s.append("path").attr("d", line).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2.2);
    s.append("text").attr("x", margin.left + 4).attr("y", 16 + i * 15).attr("font-size", 10.5).attr("fill", color).text(label);
  });

  const readout = scope.querySelector<HTMLElement>("#mod-readout");
  if (readout)
    readout.innerHTML =
      `strict ordering at every δ: Δ &gt; ω_J &gt; Γ_J &gt; achieved<br>` +
      `<span style="color:${C.ink3}">ω_J overstates by 4× (half-width, not width); Δ overstates by a further 2× (a rule may play a compromise optimal for neither state)</span>`;
}

const Slide04Modulus: SlideDef = {
  title: "The compromise modulus",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>Two candidates fail. A third survives.</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Candidate 1: continuity modulus ω_J — fails</h3>
            <p>
              A rule may place its action at the cell's <em>centre</em>;
              the worst state is only a half-width away. The full-width
              modulus overstates by 2ᵖ for a p-th order objective.
            </p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3>Candidate 2: swap divergence Δ — fails</h3>
            <p>
              Δ measures the cost of exchanging two states' own optimal
              actions. But a rule isn't confined to those two actions — it
              may play a <em>compromise</em> optimal for neither,
              up to 4× better.
            </p>
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Survivor: the compromise modulus Γ_J.</b> The least summed
            loss any single action incurs over a pair — γ(q,q') = inf_u
            [gap at q + gap at q']. Correctly assigns 0 to pairs agreeing
            on their optimal action, which no distance-based modulus does.
          </div>
        </div>
        <div>
          <D3Chart id="c-moduli" draw={drawModuli} />
          <div className="controls">
            <div id="mod-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide04Modulus;
