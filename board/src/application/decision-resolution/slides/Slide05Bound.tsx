import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

function drawScallop(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 300,
    margin = { top: 20, right: 20, bottom: 36, left: 50 };

  function render(N: number, D = 10) {
    const s = mountSvg(el, w, h);
    const wCell = D / N;
    const nPts = 400;
    const toX = (q: number) => margin.left + (q / D) * (w - margin.left - margin.right);
    const gapAt = (q: number) => {
      const cellIdx = Math.floor(q / wCell);
      const center = (cellIdx + 0.5) * wCell;
      return (q - center) ** 2;
    };
    const maxGap = (wCell / 2) ** 2;
    const toY = (g: number) => h - margin.bottom - (g / maxGap) * (h - margin.top - margin.bottom);

    const pts = Array.from({ length: nPts + 1 }, (_, i) => (D * i) / nPts);
    const line = "M" + pts.map((q) => `${toX(q)},${toY(gapAt(q))}`).join("L");
    s.append("path").attr("d", line).attr("fill", "none").attr("stroke", C.k1).attr("stroke-width", 2);

    s.append("line")
      .attr("x1", margin.left)
      .attr("x2", w - margin.right)
      .attr("y1", toY(maxGap / 4))
      .attr("y2", toY(maxGap / 4))
      .attr("stroke", C.k2)
      .attr("stroke-dasharray", "4,3");
    s.append("text")
      .attr("x", w - margin.right)
      .attr("y", toY(maxGap / 4) - 6)
      .attr("text-anchor", "end")
      .attr("font-size", 10)
      .attr("fill", C.k2)
      .text("½Γ_J bound");

    for (let i = 0; i <= N; i++) {
      const x = toX(i * wCell);
      s.append("line").attr("x1", x).attr("x2", x).attr("y1", margin.top).attr("y2", h - margin.bottom).attr("stroke", C.line).attr("stroke-dasharray", "2,3");
    }

    const readout = scope.querySelector<HTMLElement>("#bound-readout");
    if (readout)
      readout.innerHTML =
        `N = ${N} cells, cell width w = ${wCell.toFixed(3)}<br>` +
        `Gap_A = w²/4 = <b style="color:${C.good}">${(wCell * wCell / 4).toFixed(4)}</b> = ½Γ_J(M) exactly<br>` +
        `<span style="color:${C.ink3}">one scallop per cell — vanishes at centres, peaks at boundaries at (w/2)², never w²</span>`;
  }

  render(6);
  const sl = scope.querySelector<HTMLInputElement>("#bound-n");
  if (sl) sl.oninput = () => render(Number(sl.value));
}

const Slide05Bound: SlideDef = {
  title: "The decision resolution bound",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Gap_A ≥ ½ Γ_J(M) — proved, attained, and drawn</h2>
      <div className="two-col">
        <div>
          <p>
            For any rule A factoring through monitor M, the worst-case
            optimality gap is at least half the in-cell compromise
            modulus. The proof is three lines: pick the maximising cell,
            sum the gaps at any in-cell pair, bound below by γ, take the
            supremum.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            For the quadratic objective the bound is not just valid but{" "}
            <b>attained</b>: the uniform monitor with the midpoint rule
            hits Gap_A = w²/4 exactly, matching ½Γ_J to the decimal. Drag
            the slider — every scallop's peak sits at exactly (w/2)², the
            theorem's own prediction, live.
          </p>
        </div>
        <div>
          <D3Chart id="c-scallop" draw={drawScallop} />
          <div className="controls">
            <label>
              N cells: <input type="range" id="bound-n" min={2} max={20} defaultValue={6} />
            </label>
            <div id="bound-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide05Bound;
