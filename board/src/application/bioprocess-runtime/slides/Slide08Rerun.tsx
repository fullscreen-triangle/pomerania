import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { runBioprocess } from "../runtime";

function drawCompare(el: HTMLDivElement) {
  const w = 700,
    h = 360,
    margin = { top: 30, right: 20, bottom: 20, left: 90 };
  const s = mountSvg(el, w, h);

  const runA = runBioprocess(4, 3);
  const runB = runBioprocess(4, 91);
  const totalCycles = Math.max(runA.totalCycles, runB.totalCycles);
  const rowH = (h - margin.top - margin.bottom) / 8; // 4 plates x 2 runs

  function drawRun(result: typeof runA, offsetRow: number, label: string, color: string) {
    const toX = (cycle: number) => margin.left + (cycle / totalCycles) * (w - margin.left - margin.right);
    s.append("text").attr("x", 10).attr("y", margin.top + offsetRow * rowH - 8).attr("font-size", 11).attr("fill", color).text(label);
    result.plates.forEach((plate, i) => {
      const y = margin.top + (offsetRow + i) * rowH;
      s.append("text").attr("x", margin.left - 8).attr("y", y + rowH / 2 + 3).attr("text-anchor", "end").attr("font-size", 9.5).attr("fill", C.ink3).text(plate);
      const plateNodes = result.nodes.filter((n) => n.plate === plate);
      plateNodes.forEach((n) => {
        s.append("rect")
          .attr("x", toX(n.start))
          .attr("y", y + rowH * 0.2)
          .attr("width", Math.max(1, toX(n.start + n.duration) - toX(n.start)))
          .attr("height", rowH * 0.6)
          .attr("fill", n.kind === "read" ? color : C.panel)
          .attr("opacity", n.kind === "read" ? 0.9 : 0.5)
          .attr("stroke", C.line)
          .attr("stroke-width", 0.4);
      });
    });
  }

  drawRun(runA, 0, "run · seed 3", C.k1);
  drawRun(runB, 4.4, "run · seed 91", C.k2);
}

const Slide08Rerun: SlideDef = {
  title: "Same setup, different trajectory",
  maxStep: 0,
  render: () => (
    <>
      <h2>Reproducibility attaches to the protocol, not the numbers</h2>
      <p>
        Same four-plate setup, same protocol, same shared instrument —
        two different seeds. Which plate gets the reader first, how long
        each queues, and when transfers land all differ between the two
        runs, exactly as the paper predicts: the trajectory is
        run-constituted, so re-running the identical setup is not
        expected to reproduce the identical Gantt chart. What's
        reproducible is the protocol itself — the five-step sequence and
        the reader-contention rule — which both runs share.
      </p>
      <D3Chart id="c-rerun" draw={drawCompare} />
      <p className="aside">
        Highlighted bars are reads on the shared instrument. Notice their
        cycle positions shift between the two runs — that shift is the
        non-determinism the paper calls structural rather than incidental.
      </p>
    </>
  ),
};

export default Slide08Rerun;
