import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { validation } from "../validation";

function drawInclusion(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 16, right: 16, bottom: 30, left: 46 };
  const s = mountSvg(el, w, h);
  const exp1 = validation.exp1;

  const toX = (i: number) => margin.left + (i / (exp1.ratios.length - 1)) * (w - margin.left - margin.right);
  const domainMin = 0.9,
    domainMax = 1.05;
  const toY = (v: number) => h - margin.bottom - ((v - domainMin) / (domainMax - domainMin)) * (h - margin.top - margin.bottom);

  s.append("line")
    .attr("x1", margin.left)
    .attr("x2", w - margin.right)
    .attr("y1", toY(1.0))
    .attr("y2", toY(1.0))
    .attr("stroke", C.k2)
    .attr("stroke-dasharray", "5,3");
  s.append("text")
    .attr("x", w - margin.right)
    .attr("y", toY(1.0) - 6)
    .attr("text-anchor", "end")
    .attr("font-size", 10)
    .attr("fill", C.k2)
    .text("no-cost-of-transfer reference");

  s.append("rect")
    .attr("x", margin.left)
    .attr("y", toY(exp1.ci_hi))
    .attr("width", w - margin.left - margin.right)
    .attr("height", toY(exp1.ci_lo) - toY(exp1.ci_hi))
    .attr("fill", C.k1)
    .attr("opacity", 0.12);

  s.selectAll(".pt")
    .data(exp1.ratios)
    .join("circle")
    .attr("class", "pt")
    .attr("cx", (_, i) => toX(i))
    .attr("cy", (d) => toY(d))
    .attr("r", 4)
    .attr("fill", C.k1)
    .attr("opacity", 0.85);

  s.append("line")
    .attr("x1", margin.left)
    .attr("x2", w - margin.right)
    .attr("y1", toY(exp1.mean))
    .attr("y2", toY(exp1.mean))
    .attr("stroke", C.good)
    .attr("stroke-width", 1.5);

  const readout = scope.querySelector<HTMLElement>("#incl-readout");
  if (readout)
    readout.innerHTML =
      `30 trials, projecting the extremal-regime optimum onto nested restrictions<br>` +
      `mean loss ratio = <b style="color:${C.good}">${exp1.mean.toFixed(4)}</b> (95% CI [${exp1.ci_lo.toFixed(3)}, ${exp1.ci_hi.toFixed(3)}])<br>` +
      `<span style="color:${C.ink3}">every trial sits at or below the no-cost reference of 1.0</span>`;
}

const Slide02Inclusion: SlideDef = {
  title: "The Inclusion Theorem",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Competence at the extremal regime transfers down for free</h2>
      <div className="two-col">
        <div>
          <p>
            An <b>extremal regime</b> is the sub-domain exercising every
            degree of freedom of the domain's action space under a single
            scalar objective — the hardest instances, cleanest signal. A
            model competent there is automatically competent on every
            easier restriction, by a non-expansive projection argument:
            projecting the unrestricted optimum onto a smaller admissible
            set cannot increase its loss.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            The reverse fails: a model trained only on a restriction has an
            out-of-support gap on the extremal regime bounded away from
            zero, growing with how much of the regime it never saw
            (Non-inclusion, Experiment 2 — Pearson r = 0.992 between the
            gap and the uncovered measure).
          </p>
        </div>
        <div>
          <D3Chart id="c-inclusion" draw={drawInclusion} />
          <div className="controls">
            <div id="incl-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide02Inclusion;
