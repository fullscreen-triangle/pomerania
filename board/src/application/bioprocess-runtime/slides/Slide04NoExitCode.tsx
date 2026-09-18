import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { runBioprocess } from "../runtime";

function drawCompletion(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 280,
    margin = { top: 20, right: 20, bottom: 34, left: 46 };
  const s = mountSvg(el, w, h);

  const result = runBioprocess(5, 42);
  const anomalies = result.nodes.filter((n) => n.anomaly);
  const total = result.nodes.length;

  // Simple bar: nodes completed (this runtime) vs. a hypothetical
  // halt-on-error runtime that stops each plate's chain at its first
  // anomaly.
  const perPlateTotal: Record<string, number> = {};
  const perPlateHalted: Record<string, number> = {};
  for (const plate of result.plates) {
    const plateNodes = result.nodes.filter((n) => n.plate === plate).sort((a, b) => a.start - b.start);
    perPlateTotal[plate] = plateNodes.length;
    const firstAnomalyIdx = plateNodes.findIndex((n) => n.anomaly);
    perPlateHalted[plate] = firstAnomalyIdx === -1 ? plateNodes.length : firstAnomalyIdx + 1;
  }

  const barW = 40;
  const gap = 30;
  const groupW = barW * 2 + 10;
  const startX = margin.left + 10;
  const maxV = Math.max(...Object.values(perPlateTotal));
  const toY = (v: number) => h - margin.bottom - (v / maxV) * (h - margin.top - margin.bottom);

  result.plates.forEach((plate, i) => {
    const gx = startX + i * (groupW + gap);
    s.append("rect")
      .attr("x", gx)
      .attr("y", toY(perPlateTotal[plate]))
      .attr("width", barW)
      .attr("height", h - margin.bottom - toY(perPlateTotal[plate]))
      .attr("fill", C.good)
      .attr("opacity", 0.85);
    s.append("rect")
      .attr("x", gx + barW + 6)
      .attr("y", toY(perPlateHalted[plate]))
      .attr("width", barW)
      .attr("height", h - margin.bottom - toY(perPlateHalted[plate]))
      .attr("fill", C.bad)
      .attr("opacity", 0.55);
    s.append("text")
      .attr("x", gx + barW)
      .attr("y", h - margin.bottom + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", 10.5)
      .attr("fill", C.ink2)
      .text(plate);
  });

  s.append("text").attr("x", margin.left).attr("y", 14).attr("font-size", 11).attr("fill", C.good).text("■ this runtime (runs to completion)");
  s.append("text").attr("x", margin.left + 240).attr("y", 14).attr("font-size", 11).attr("fill", C.bad).text("■ halt-on-error (stops at first anomaly)");

  const readout = scope.querySelector<HTMLElement>("#exit-readout");
  if (readout)
    readout.innerHTML =
      `${anomalies.length} anomalies across ${total} nodes this run<br>` +
      `${anomalies.map((a) => `${a.plate} · ${a.kind}`).join(", ") || "none"}<br>` +
      `<span style="color:${C.ink3}">every anomaly is recorded as a value and the chain keeps running — nothing halts</span>`;
}

const Slide04NoExitCode: SlideDef = {
  title: "No exit code, run to completion",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>An anomalous read doesn't abort the plate's protocol</h2>
      <div className="two-col">
        <div>
          <p>
            The runtime has no verb for "expected," so it has no exit
            code — issuing one would require comparing an achieved value
            to an expectation the graph doesn't store. A chunk that
            raises an anomaly (a contaminated well, an out-of-range OD)
            produces a value exactly like a clean reading, emitted onto
            the graph the same way.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            The chart contrasts this run's actual completion against what
            a conventional halt-on-error scheduler would have achieved on
            the same anomalies: a plate that hits an anomaly at step 3 of
            7 simply stops there under halt-on-error, discarding every
            downstream step — including transfers other plates may depend
            on. Here, every plate finishes; the anomaly becomes a value in
            the final report, not a reason to abandon the run.
          </p>
        </div>
        <div>
          <D3Chart id="c-exitcode" draw={drawCompletion} />
          <div className="controls">
            <div id="exit-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide04NoExitCode;
