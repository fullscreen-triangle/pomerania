import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

function drawBias(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 20, right: 20, bottom: 36, left: 50 };
  const s = mountSvg(el, w, h);

  const ns = [50, 100, 200, 400, 800, 1600, 3200, 6400, 12800];
  const biasPolicy = ns.map(() => 0.2 + (Math.random() - 0.5) * 0.01);
  const biasUniform = ns.map((n) => 0.6 / Math.sqrt(n));

  const toX = (i: number) => margin.left + (i / (ns.length - 1)) * (w - margin.left - margin.right);
  const maxLog = 0;
  const minLog = Math.log10(Math.min(...biasUniform));
  const toY = (v: number) => {
    const lv = Math.log10(v);
    return h - margin.bottom - ((lv - minLog) / (maxLog - minLog)) * (h - margin.top - margin.bottom);
  };

  const linePolicy = "M" + ns.map((_, i) => `${toX(i)},${toY(biasPolicy[i])}`).join("L");
  const lineUniform = "M" + ns.map((_, i) => `${toX(i)},${toY(biasUniform[i])}`).join("L");
  s.append("path").attr("d", linePolicy).attr("fill", "none").attr("stroke", C.bad).attr("stroke-width", 2.2);
  s.append("path").attr("d", lineUniform).attr("fill", "none").attr("stroke", C.good).attr("stroke-width", 2.2);
  s.selectAll(".p1").data(ns).join("circle").attr("class", "p1").attr("cx", (_, i) => toX(i)).attr("cy", (_, i) => toY(biasPolicy[i])).attr("r", 3.5).attr("fill", C.bad);
  s.selectAll(".p2").data(ns).join("circle").attr("class", "p2").attr("cx", (_, i) => toX(i)).attr("cy", (_, i) => toY(biasUniform[i])).attr("r", 3.5).attr("fill", C.good);

  s.append("text").attr("x", margin.left).attr("y", 16).attr("font-size", 11).attr("fill", C.bad).text("● policy-coupled estimator (flat, doesn't decay)");
  s.append("text").attr("x", margin.left).attr("y", 30).attr("font-size", 11).attr("fill", C.good).text("● uniform sampler (decays as 1/√n)");

  const readout = scope.querySelector<HTMLElement>("#causal-readout");
  if (readout)
    readout.innerHTML =
      `n = 50 → 12,800 samples<br>` +
      `policy-coupled bias: stays near <b style="color:${C.bad}">0.2</b> throughout<br>` +
      `uniform-sampler bias: falls to <b style="color:${C.good}">${biasUniform[biasUniform.length - 1].toFixed(4)}</b><br>` +
      `<span style="color:${C.ink3}">more data moves the policy-coupled estimate toward the biased value, not the truth</span>`;
}

const Slide09Causal: SlideDef = {
  title: "Estimation vs. regulation",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>A regulator isn't biased. An estimator of what it changed, is.</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>The folklore claim is false as usually stated</h3>
            <p>
              "A subsystem can't monitor and control without bias." A
              proportional regulator reading a cell and applying u = −K(q̂
              − q*) produces <em>no estimate of any population
              quantity</em> — there's no estimator to be biased.
            </p>
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Correctly scoped, it's true.</b> An estimator is{" "}
            <em>policy-coupled</em> if it's built from samples the same
            system's policy selected. Its bias converges to
            E[θ|E] − E[θ] ≠ 0 — a causal gap, bounded away from zero,{" "}
            <em>not reduced by more samples</em>. A monitor with floor
            β_inst can't even detect a bias smaller than β_inst.
          </div>
        </div>
        <div>
          <D3Chart id="c-bias" draw={drawBias} />
          <div className="controls">
            <div id="causal-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide09Causal;
