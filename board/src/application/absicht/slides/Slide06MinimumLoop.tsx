import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { validation } from "../validation";

function drawMinLoop(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 16, right: 16, bottom: 34, left: 46 };
  const s = mountSvg(el, w, h);
  const exp6 = validation.exp6;
  const sizes = exp6.sizes;

  const maxV = Math.max(...exp6.certified_hi, ...exp6.baseline_mean);
  const toX = (n: number) => margin.left + ((n - 1) / (sizes.length - 1)) * (w - margin.left - margin.right);
  const toY = (v: number) => h - margin.bottom - (v / maxV) * (h - margin.top - margin.bottom);

  // size-3 marker
  s.append("line")
    .attr("x1", toX(3))
    .attr("x2", toX(3))
    .attr("y1", margin.top)
    .attr("y2", h - margin.bottom)
    .attr("stroke", C.ink3)
    .attr("stroke-dasharray", "3,3");

  const band = sizes.map((n, i) => [toX(n), toY(exp6.certified_hi[i])] as [number, number]).concat(
    sizes.slice().reverse().map((n, i) => [toX(n), toY(exp6.certified_lo[sizes.length - 1 - i])] as [number, number])
  );
  s.append("path").attr("d", "M" + band.map((p) => p.join(",")).join("L") + "Z").attr("fill", C.k2).attr("opacity", 0.12);

  const certLine = sizes.map((n, i) => [toX(n), toY(exp6.certified_mean[i])] as [number, number]);
  s.append("path").attr("d", "M" + certLine.map((p) => p.join(",")).join("L")).attr("fill", "none").attr("stroke", C.k2).attr("stroke-width", 2);
  s.selectAll(".pt")
    .data(sizes)
    .join("circle")
    .attr("class", "pt")
    .attr("cx", (n) => toX(n))
    .attr("cy", (_, i) => toY(exp6.certified_mean[i]))
    .attr("r", 4.5)
    .attr("fill", C.k2);

  const baseLine = sizes.map((n, i) => [toX(n), toY(exp6.baseline_mean[i])] as [number, number]);
  s.append("path").attr("d", "M" + baseLine.map((p) => p.join(",")).join("L")).attr("fill", "none").attr("stroke", C.k1).attr("stroke-dasharray", "5,3").attr("stroke-width", 1.5);

  s.append("text").attr("x", margin.left).attr("y", 14).attr("font-size", 11).attr("fill", C.k2).text("● certified error");
  s.append("text").attr("x", margin.left + 130).attr("y", 14).attr("font-size", 11).attr("fill", C.k1).text("- - best-individual baseline");

  const drop = (1 - exp6.certified_mean[2] / exp6.certified_mean[1]) * 100;
  const readout = scope.querySelector<HTMLElement>("#ml-readout");
  if (readout)
    readout.innerHTML =
      `check-graph size 1→5, single corrupted receiver (p=0.4)<br>` +
      `error falls from ${exp6.certified_mean[0].toFixed(2)} (size 1) to ${exp6.certified_mean[2].toFixed(2)} (size 3)<br>` +
      `<b style="color:${C.good}">${drop.toFixed(1)}%</b> drop specifically at the size 2→3 transition, matching the predicted discontinuity`;
}

const Slide06MinimumLoop: SlideDef = {
  title: "The minimum loop",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>Why a check-graph needs a 3-cycle, not a chain</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>No acyclic certification below the terminal floor</h3>
            <p>
              A directed acyclic check-graph always has a terminal
              receiver with no outgoing check — its own floor is never
              contested, so nothing certifies below it. A chain of
              pairwise checks is no stronger than its weakest, unchecked
              link.
            </p>
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>A three-cycle suffices.</b> If each pairwise check in a
            directed 3-cycle is non-expansive, the composite check map is
            a contraction with a unique Banach fixed point — a jointly
            agreed output no single receiver could unilaterally alter
            without failing a check. Length one is unchecked
            self-agreement; length two reduces to one receiver checking
            the other with no independent third opinion.
          </div>
          <p className={`aside ${step < 2 ? "dim" : ""}`} data-step={2}>
            The chart's sharp drop is not gradual — it is a structural
            discontinuity, occurring exactly where the theorem predicts
            it, not smoothly across every added receiver.
          </p>
        </div>
        <div>
          <D3Chart id="c-minloop" draw={drawMinLoop} />
          <div className="controls">
            <div id="ml-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide06MinimumLoop;
