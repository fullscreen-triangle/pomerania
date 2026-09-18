import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

// A timing / Gantt-style diagram: the horizontal axis is time, and three
// tracks show (1) the sampling instants, (2) the true trajectory's
// position sweeping through monitor cells, (3) whether each inter-sample
// interval is "safe" (cell not skipped) or "violated" (cell skipped).
function drawTiming(el: HTMLDivElement, scope: HTMLElement) {
  const w = 640,
    h = 340,
    margin = { top: 20, right: 20, bottom: 30, left: 90 };

  function render(h_period: number, L: number, wCell: number) {
    const s = mountSvg(el, w, h);
    const T = 1.0; // total time window
    const toX = (t: number) => margin.left + (t / T) * (w - margin.left - margin.right);
    const nSamples = Math.floor(T / h_period);
    const trackH = 70;
    const trackGap = 20;

    // Track 1: sampling instants
    const y1 = margin.top;
    s.append("text").attr("x", 8).attr("y", y1 + trackH / 2 + 4).attr("font-size", 11).attr("fill", C.ink2).text("sampling");
    s.append("line").attr("x1", margin.left).attr("x2", w - margin.right).attr("y1", y1 + trackH / 2).attr("y2", y1 + trackH / 2).attr("stroke", C.line);
    for (let i = 0; i <= nSamples; i++) {
      const t = i * h_period;
      s.append("line").attr("x1", toX(t)).attr("x2", toX(t)).attr("y1", y1 + 15).attr("y2", y1 + trackH - 15).attr("stroke", C.k1).attr("stroke-width", 2);
    }

    // Track 2: trajectory sweeping through cells (position = L*t mod cellwidth*3, shown as a Gantt bar per cell dwell)
    const y2 = y1 + trackH + trackGap;
    s.append("text").attr("x", 8).attr("y", y2 + trackH / 2 + 4).attr("font-size", 11).attr("fill", C.ink2).text("state cells");
    const cellDuration = wCell / L; // time to cross one cell
    let t = 0;
    let cellIdx = 0;
    const cellRows: { t0: number; t1: number; idx: number }[] = [];
    while (t < T) {
      const t1 = Math.min(T, t + cellDuration);
      cellRows.push({ t0: t, t1, idx: cellIdx });
      t = t1;
      cellIdx++;
    }
    cellRows.forEach((c) => {
      s.append("rect")
        .attr("x", toX(c.t0))
        .attr("y", y2 + 10)
        .attr("width", Math.max(1, toX(c.t1) - toX(c.t0) - 1))
        .attr("height", trackH - 20)
        .attr("fill", c.idx % 2 === 0 ? C.panel : C.k1)
        .attr("opacity", c.idx % 2 === 0 ? 0.5 : 0.35)
        .attr("stroke", C.line);
    });

    // Track 3: per-interval verdict — safe (cell not skipped) vs violated
    const y3 = y2 + trackH + trackGap;
    s.append("text").attr("x", 8).attr("y", y3 + trackH / 2 + 4).attr("font-size", 11).attr("fill", C.ink2).text("verdict");
    let violations = 0;
    for (let i = 0; i < nSamples; i++) {
      const t0 = i * h_period;
      const t1 = (i + 1) * h_period;
      const distanceTravelled = L * h_period;
      const safe = distanceTravelled <= wCell;
      if (!safe) violations++;
      s.append("rect")
        .attr("x", toX(t0))
        .attr("y", y3 + 15)
        .attr("width", Math.max(1, toX(t1) - toX(t0) - 2))
        .attr("height", trackH - 30)
        .attr("fill", safe ? C.good : C.bad)
        .attr("opacity", 0.75)
        .attr("rx", 3);
    }

    const nyquistOk = h_period <= 1 / (2 * 8); // assume B_proc = 8 Hz fixed for this demo
    const readout = scope.querySelector<HTMLElement>("#nyq-readout");
    if (readout)
      readout.innerHTML =
        `h = ${h_period.toFixed(3)}s, L = ${L.toFixed(1)}/s, w_cell = ${wCell.toFixed(2)}<br>` +
        `spatial constraint (w_cell ≥ hL): <b style="color:${violations === 0 ? C.good : C.bad}">${violations === 0 ? "satisfied every interval" : `violated in ${violations}/${nSamples} intervals — cells skipped`}</b><br>` +
        `temporal constraint (h ≤ 1/2B, B=8Hz): <b style="color:${nyquistOk ? C.good : C.bad}">${nyquistOk ? "satisfied" : "violated — aliasing"}</b><br>` +
        `<span style="color:${C.ink3}">these are two independent constraints — the composite chain β ≤ w_cell ≤ 1/2B is dimensionally invalid and cannot express either failure separately</span>`;
  }

  render(0.05, 8, 0.5);
  const hSl = scope.querySelector<HTMLInputElement>("#nyq-h");
  const lSl = scope.querySelector<HTMLInputElement>("#nyq-l");
  const wSl = scope.querySelector<HTMLInputElement>("#nyq-w");
  const rerender = () => render(Number(hSl?.value ?? 0.05), Number(lSl?.value ?? 8), Number(wSl?.value ?? 0.5));
  if (hSl) hSl.oninput = rerender;
  if (lSl) lSl.oninput = rerender;
  if (wSl) wSl.oninput = rerender;
}

const Slide08Nyquist: SlideDef = {
  title: "Two sampling constraints, one timing diagram",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>β ≤ w_cell ≤ 1/2B is dimensionally invalid</h2>
      <div className="two-col">
        <div>
          <p>
            A length in state space cannot be sandwiched against a time.
            The composite chain in the applied literature conflates two
            separate constraints: <b>temporal</b> (h ≤ 1/2B — avoid
            aliasing) and <b>spatial</b> (w_cell ≥ hL — avoid skipping a
            cell between samples, where L bounds the state's rate of
            change).
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            The timing diagram makes both failure modes visible at once:
            sampling instants on top, which state-cell the trajectory
            occupies in the middle, and — critically — whether any
            inter-sample interval let the trajectory skip a whole cell
            undetected, on the bottom track. Push L up or w_cell down and
            watch violations appear even while the Nyquist rate itself is
            still satisfied.
          </p>
        </div>
        <div>
          <D3Chart id="c-timing" draw={drawTiming} />
          <div className="controls">
            <label>Sample period h: <input type="range" id="nyq-h" min={0.01} max={0.1} step={0.005} defaultValue={0.05} /></label>
            <label>State velocity L: <input type="range" id="nyq-l" min={1} max={20} step={0.5} defaultValue={8} /></label>
            <label>Cell width w: <input type="range" id="nyq-w" min={0.1} max={1.5} step={0.05} defaultValue={0.5} /></label>
            <div id="nyq-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide08Nyquist;
