import * as d3 from "d3";
import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { classifyRegime, criticalCoupling, simulateKuramoto } from "../kuramoto";

const SIGMA = 1.4;
const KC = criticalCoupling(SIGMA);

function drawKuramoto(el: HTMLDivElement, scope: HTMLElement) {
  const w = 640,
    h = 320,
    margin = { top: 16, right: 16, bottom: 30, left: 42 };

  function render(K: number) {
    const s = mountSvg(el, w, h);
    const sim = simulateKuramoto(10, K, SIGMA, 320, 0.05, 42);
    const finalR = sim.rEns[sim.rEns.length - 1];
    const regime = classifyRegime(finalR);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(sim.t)!])
      .range([margin.left, w - margin.right]);
    const y = d3.scaleLinear().domain([0, 1]).range([h - margin.bottom, margin.top]);

    // regime bands (drawn first, underneath axes/line)
    const bands: [number, number, string][] = [
      [0, 0.3, "Turbulent"],
      [0.3, 0.5, "Aperture-dominated"],
      [0.5, 0.8, "Hierarchical cascade"],
      [0.8, 0.95, "Coherent"],
      [0.95, 1, "Phase-locked"],
    ];
    s.selectAll(".band")
      .data(bands)
      .join("rect")
      .attr("class", "band")
      .attr("x", margin.left)
      .attr("width", w - margin.left - margin.right)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("fill", C.panel)
      .attr("opacity", (d) => (d[2] === regime ? 0.55 : 0.15));

    s.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${h - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5));
    s.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5));

    const line = d3
      .line<number>()
      .x((_, i) => x(sim.t[i]))
      .y((d) => y(d));

    s.append("path")
      .datum(sim.rEns)
      .attr("class", "rline")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", C.k1)
      .attr("stroke-width", 2);

    const readout = scope.querySelector<HTMLElement>("#kur-readout");
    if (readout)
      readout.innerHTML =
        `K = <b>${K.toFixed(2)}</b> &nbsp;·&nbsp; K_c = 2σ/π = <b>${KC.toFixed(2)}</b><br>` +
        `R_ens(final) = <b>${finalR.toFixed(3)}</b> &nbsp;→&nbsp; regime = <b style="color:${C.accent}">${regime}</b>`;
  }

  render(2.5);
  const sl = scope.querySelector<HTMLInputElement>("#kur-slider");
  if (sl) {
    sl.oninput = () => render(Number(sl.value));
    sl.value = "2.5";
  }
}

const Slide06Kuramoto: SlideDef = {
  title: "Kuramoto regimes, live",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Coupling strength decides the coordination regime</h2>
      <div className="two-col">
        <div>
          <p>
            Model a system's units as Kuramoto oscillators: each has a
            natural frequency and nudges its phase toward its neighbours,
            with coupling strength <span className="m">K</span>. The order
            parameter <span className="m">R_ens</span> measures how
            phase-locked the ensemble is — 0 is fully incoherent, 1 is
            perfectly synchronised.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Five regimes partition <span className="m">R_ens</span>:{" "}
            Turbulent (&lt;0.3), Aperture-dominated ([0.3,0.5)),
            Hierarchical cascade ([0.5,0.8)), Coherent ([0.8,0.95)),
            Phase-locked (≥0.95). The critical coupling{" "}
            <span className="m">K_c = 2σ_ω/π</span> is where the transition
            from incoherence toward synchrony begins. The{" "}
            <b>Partition Extinction Theorem</b> shows the
            Coherent→Phase-locked step specifically is discontinuous — there
            is no regime of near-zero-friction partial coordination sitting
            between them.
          </p>
        </div>
        <div>
          <D3Chart id="c-kuramoto" draw={drawKuramoto} />
          <div className="controls">
            <label>
              Coupling K:{" "}
              <input type="range" id="kur-slider" min={0} max={6} step={0.1} defaultValue={2.5} />
            </label>
            <div id="kur-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide06Kuramoto;
