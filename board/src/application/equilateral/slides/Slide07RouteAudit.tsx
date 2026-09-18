import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { relax } from "../relaxation";

function drawRouteAudit(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 16, right: 16, bottom: 30, left: 46 };

  function render(falseFriend: boolean) {
    const s = mountSvg(el, w, h);
    const a0 = [1, 2, 3];
    const b0 = falseFriend ? [1.05, 2.02, 2.98] : [4, 1, 5];
    const pa0 = [0, 0, 0];
    const pb0 = falseFriend ? [3, 3, 3] : [0.1, 0.1, 0.1];

    const result = relax(a0, b0, pa0, pb0, 0.05, 40, falseFriend);

    const x = d3Scale(result.steps.length);
    function d3Scale(n: number) {
      return { toX: (i: number) => margin.left + (i / Math.max(1, n - 1)) * (w - margin.left - margin.right) };
    }
    const maxY = Math.max(...result.steps.map((st) => st.maxResidual), 0.1);
    const toY = (v: number) => h - margin.bottom - (v / maxY) * (h - margin.top - margin.bottom);

    const centralLine: [number, number][] = result.steps.map((st, i) => [x.toX(i), toY(st.central)]);
    const provokedLine: [number, number][] = result.steps.map((st, i) => [x.toX(i), toY(st.provoked)]);
    const lineGen = (pts: [number, number][]) => "M" + pts.map((p) => p.join(",")).join("L");

    s.append("line")
      .attr("x1", margin.left)
      .attr("x2", w - margin.right)
      .attr("y1", toY(0.05))
      .attr("y2", toY(0.05))
      .attr("stroke", C.ink3)
      .attr("stroke-dasharray", "4,3");
    s.append("text")
      .attr("x", w - margin.right)
      .attr("y", toY(0.05) - 4)
      .attr("text-anchor", "end")
      .attr("font-size", 10)
      .attr("fill", C.ink3)
      .text("tolerance");

    s.append("path").attr("d", lineGen(centralLine)).attr("fill", "none").attr("stroke", C.k1).attr("stroke-width", 2);
    s.append("path").attr("d", lineGen(provokedLine)).attr("fill", "none").attr("stroke", C.k2).attr("stroke-width", 2);

    s.append("text").attr("x", margin.left).attr("y", 14).attr("font-size", 11).attr("fill", C.k1).text("● central residual");
    s.append("text").attr("x", margin.left + 150).attr("y", 14).attr("font-size", 11).attr("fill", C.k2).text("● provoked residual");

    const readout = scope.querySelector<HTMLElement>("#ra-readout");
    if (readout)
      readout.innerHTML = result.quiescent
        ? `both central (${result.finalCentral.toFixed(3)}) and provoked (${result.finalProvoked.toFixed(3)}) residuals fall below tolerance — <b style="color:${C.good}">quiescent</b>: genuine agreement.`
        : `central columns agree almost immediately (${result.finalCentral.toFixed(3)}) — an endpoint-only check reports agreement.<br>` +
          `provoked columns stay far apart (${result.finalProvoked.toFixed(3)}) — <b style="color:${C.bad}">non-quiescent</b>: ${falseFriend ? "a false friend, caught only by the route-audit." : "declined rather than silently resolved."}`;
  }

  render(true);
  const ffBtn = scope.querySelector<HTMLButtonElement>("#ra-ff");
  const trueBtn = scope.querySelector<HTMLButtonElement>("#ra-true");
  if (ffBtn) ffBtn.onclick = () => render(true);
  if (trueBtn) trueBtn.onclick = () => render(false);
}

const Slide07RouteAudit: SlideDef = {
  title: "The four-column route-audit",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Catching a false friend</h2>
      <div className="two-col">
        <div>
          <p>
            Two opaque receivers — no shared internal representation —
            certify agreement not by comparing answers alone, but by
            comparing what each answer <em>provokes</em> as a follow-up
            under its own policy. Central columns (the answers) and
            provoked columns (each receiver's own next question) must both
            converge for quiescence.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            A <b>false friend</b>: two receivers give numerically identical
            central answers — an endpoint-only comparison reports
            agreement — while their provoked follow-ups concern
            non-equivalent conditions and never converge. The paper's own
            Experiment 8 found this route-audit catches 100% of constructed
            false friends against 0% for central-only comparison.
          </p>
        </div>
        <div>
          <D3Chart id="c-route-audit" draw={drawRouteAudit} />
          <div className="controls">
            <button id="ra-ff">False-friend pair</button>
            <button id="ra-true">Genuine-agreement pair</button>
            <div id="ra-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide07RouteAudit;
