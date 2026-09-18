import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

type FaultModel = "crash" | "naive" | "adaptive";

// A sequence/swimlane diagram: one lane per channel, showing what each
// reports at the single decision instant, and whether majority agreement
// correctly identifies the true value.
function drawSequence(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 300,
    margin = { top: 30, right: 20, bottom: 30, left: 110 };

  function render(model: FaultModel, n: number) {
    const s = mountSvg(el, w, h);
    const trueVal = 5.0;
    const lanes: { name: string; value: number | null; honest: boolean }[] = [];
    for (let i = 0; i < n; i++) lanes.push({ name: `channel ${i + 1}`, value: trueVal + (Math.random() - 0.5) * 0.1, honest: true });

    // last channel is the faulty one
    if (n >= 3) {
      const faulty = lanes[lanes.length - 1];
      faulty.honest = false;
      if (model === "crash") faulty.value = null;
      else if (model === "naive") faulty.value = trueVal + 3.0; // wildly off, independent
      else faulty.value = trueVal + 0.5; // adaptive: clusters near an honest reading, manufactures a false majority
    }

    const rowH = (h - margin.top - margin.bottom) / lanes.length;
    const xMin = trueVal - 1.5,
      xMax = trueVal + 1.5;
    const toX = (v: number) => margin.left + ((v - xMin) / (xMax - xMin)) * (w - margin.left - margin.right);

    // true-value reference line
    s.append("line").attr("x1", toX(trueVal)).attr("x2", toX(trueVal)).attr("y1", margin.top - 10).attr("y2", h - margin.bottom).attr("stroke", C.ink3).attr("stroke-dasharray", "3,3");
    s.append("text").attr("x", toX(trueVal)).attr("y", margin.top - 14).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", C.ink3).text("true value");

    lanes.forEach((lane, i) => {
      const y = margin.top + i * rowH + rowH / 2;
      s.append("text").attr("x", margin.left - 10).attr("y", y + 4).attr("text-anchor", "end").attr("font-size", 10.5).attr("fill", C.ink2).text(lane.name + (lane.honest ? "" : " (faulty)"));
      s.append("line").attr("x1", margin.left).attr("x2", w - margin.right).attr("y1", y).attr("y2", y).attr("stroke", C.line).attr("stroke-width", 0.5);
      if (lane.value === null) {
        s.append("text").attr("x", toX(trueVal)).attr("y", y + 4).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", C.ink3).text("(no report — crashed)");
      } else {
        s.append("circle")
          .attr("cx", toX(lane.value))
          .attr("cy", y)
          .attr("r", 8)
          .attr("fill", lane.honest ? C.k1 : C.bad)
          .attr("stroke", C.ink)
          .attr("stroke-width", 1);
      }
    });

    // majority-cluster detection: bucket reports within 0.3 of each other
    const reports = lanes.filter((l) => l.value !== null).map((l) => l.value!);
    let bestCluster: number[] = [];
    for (const r of reports) {
      const cluster = reports.filter((r2) => Math.abs(r2 - r) < 0.3);
      if (cluster.length > bestCluster.length) bestCluster = cluster;
    }
    const clusterMean = bestCluster.reduce((a, b) => a + b, 0) / (bestCluster.length || 1);
    const identified = Math.abs(clusterMean - trueVal) < 0.3;

    const readout = scope.querySelector<HTMLElement>("#seq-readout");
    if (readout)
      readout.innerHTML =
        `n = ${n} channels, fault model: <b>${model}</b><br>` +
        `largest cluster: ${bestCluster.length} reports, mean ${clusterMean.toFixed(2)}<br>` +
        `majority identifies true value: <b style="color:${identified ? C.good : C.bad}">${identified ? "yes ✓" : "no — false majority ✗"}</b>`;
  }

  render("crash", 3);
  const modelSel = scope.querySelector<HTMLSelectElement>("#seq-model");
  const nSel = scope.querySelector<HTMLSelectElement>("#seq-n");
  const rerender = () => render((modelSel?.value as FaultModel) ?? "crash", Number(nSel?.value ?? 3));
  if (modelSel) modelSel.onchange = rerender;
  if (nSel) nSel.onchange = rerender;
}

const Slide10Redundancy: SlideDef = {
  title: "Redundancy: three, until it doesn't",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Three sources suffice — against crash and naive faults only</h2>
      <div className="two-col">
        <div>
          <p>
            "Robust agreement needs three independent sources" is
            folklore with a hidden fault model. Against a channel that{" "}
            <b>crashes</b>, or reports a value <b>independent</b> of the
            honest channels, n = 3 suffices — the honest majority
            dominates.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Against an <b>adaptive</b> fault — one that reports a value{" "}
            <em>as a function of</em> the honest channels — three is not
            enough. A miscalibrated instrument is exactly this: it tracks
            the true signal with an offset, clustering with one honest
            channel to manufacture a false majority of two against one.
            n ≥ 3f+1 = 4 is necessary and sufficient for f=1 — the classical
            Byzantine bound.
          </p>
        </div>
        <div>
          <D3Chart id="c-sequence" draw={drawSequence} />
          <div className="controls">
            <label>
              Fault model:{" "}
              <select id="seq-model">
                <option value="crash">crash</option>
                <option value="naive">naive (independent)</option>
                <option value="adaptive">adaptive (mimics honest)</option>
              </select>
            </label>
            <label>
              n channels:{" "}
              <select id="seq-n">
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </label>
            <div id="seq-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide10Redundancy;
