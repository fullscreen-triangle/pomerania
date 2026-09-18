import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { runBioprocess, type NodeKind } from "../runtime";

const KIND_COLOR: Record<NodeKind, string> = {
  seed: C.k3,
  incubate: C.panel,
  read: C.k1,
  passage: C.k4,
  transfer: C.k2,
};
function drawGantt(el: HTMLDivElement, scope: HTMLElement) {
  const w = 760,
    h = 460,
    margin = { top: 30, right: 20, bottom: 40, left: 110 };

  function render(plateCount: number, seed: number) {
    const s = mountSvg(el, w, h);
    const result = runBioprocess(plateCount, seed);
    const rowH = (h - margin.top - margin.bottom) / result.plates.length;
    const toX = (cycle: number) => margin.left + (cycle / result.totalCycles) * (w - margin.left - margin.right);

    // axis
    const ticks = Math.min(10, result.totalCycles);
    for (let i = 0; i <= ticks; i++) {
      const cyc = Math.round((result.totalCycles * i) / ticks);
      s.append("line").attr("x1", toX(cyc)).attr("x2", toX(cyc)).attr("y1", margin.top - 6).attr("y2", h - margin.bottom).attr("stroke", C.line).attr("stroke-width", 0.5);
      s.append("text").attr("x", toX(cyc)).attr("y", h - margin.bottom + 16).attr("text-anchor", "middle").attr("font-size", 9.5).attr("fill", C.ink3).text(cyc);
    }
    s.append("text").attr("x", w - margin.right).attr("y", h - margin.bottom + 30).attr("text-anchor", "end").attr("font-size", 10).attr("fill", C.ink3).text("cycles →");

    result.plates.forEach((plate, i) => {
      const y = margin.top + i * rowH;
      s.append("text").attr("x", margin.left - 10).attr("y", y + rowH / 2 + 4).attr("text-anchor", "end").attr("font-size", 11).attr("fill", C.ink2).text(plate);
      s.append("line").attr("x1", margin.left).attr("x2", w - margin.right).attr("y1", y + rowH / 2).attr("y2", y + rowH / 2).attr("stroke", C.line).attr("stroke-width", 0.3);

      const plateNodes = result.nodes.filter((n) => n.plate === plate).sort((a, b) => a.start - b.start);

      // queue-wait ghost bars (drawn first, underneath)
      plateNodes.forEach((n) => {
        if (n.queueWait > 0) {
          s.append("rect")
            .attr("x", toX(n.start - n.queueWait))
            .attr("y", y + rowH * 0.28)
            .attr("width", Math.max(0.5, toX(n.start) - toX(n.start - n.queueWait)))
            .attr("height", rowH * 0.44)
            .attr("fill", C.bad)
            .attr("opacity", 0.25)
            .attr("stroke", C.bad)
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", "2,2");
        }
      });

      plateNodes.forEach((n) => {
        const barX = toX(n.start);
        const barW = Math.max(1, toX(n.start + n.duration) - barX);
        s.append("rect")
          .attr("x", barX)
          .attr("y", y + rowH * 0.15)
          .attr("width", barW)
          .attr("height", rowH * 0.7)
          .attr("fill", KIND_COLOR[n.kind])
          .attr("opacity", n.kind === "incubate" ? 0.45 : 0.9)
          .attr("stroke", n.anomaly ? C.bad : C.ink)
          .attr("stroke-width", n.anomaly ? 2 : 0.5)
          .attr("rx", 2);
        if (n.anomaly) {
          s.append("text").attr("x", barX + barW / 2).attr("y", y + rowH / 2 + 3).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", C.ink).text("⚠");
        }
      });

      // transfer connectors: draw a thin line from a transfer node to
      // the next plate's seed (material moving between plates).
    });

    // material-transfer arcs across plates
    const plateY = (plate: string) => {
      const i = result.plates.indexOf(plate);
      return margin.top + i * rowH + rowH / 2;
    };
    const transfers = result.nodes.filter((n) => n.kind === "transfer");
    transfers.forEach((tn) => {
      const targetPlate = result.plates[(result.plates.indexOf(tn.plate) + 1) % result.plates.length];
      if (targetPlate === tn.plate) return;
      const x1 = toX(tn.start + tn.duration);
      const y1 = plateY(tn.plate);
      const y2 = plateY(targetPlate);
      s.append("path")
        .attr("d", `M${x1},${y1} C${x1 + 20},${y1} ${x1 + 20},${y2} ${x1},${y2}`)
        .attr("fill", "none")
        .attr("stroke", C.k2)
        .attr("stroke-width", 1.3)
        .attr("stroke-dasharray", "3,2")
        .attr("opacity", 0.7);
    });

    const readout = scope.querySelector<HTMLElement>("#gantt-dr-readout");
    if (readout)
      readout.innerHTML =
        `${plateCount} plates · seed ${seed} · ${result.totalCycles} cycles · ${result.nodes.length} nodes executed<br>` +
        `instrument utilisation: <b>${(result.instrumentUtilisation * 100).toFixed(0)}%</b> &nbsp;·&nbsp; queue events: <b style="color:${result.queueEvents > 0 ? C.bad : C.good}">${result.queueEvents}</b><br>` +
        `<span style="color:${C.ink3}">dashed red = time spent queued for the shared reader; dashed teal arcs = material transferred between plates; ⚠ = a recorded anomaly that did not halt the run</span>`;
  }

  render(5, 42);
  const plateSl = scope.querySelector<HTMLInputElement>("#gantt-plates");
  const seedSl = scope.querySelector<HTMLInputElement>("#gantt-seed");
  const rerender = () => render(Number(plateSl?.value ?? 5), Number(seedSl?.value ?? 42));
  if (plateSl) plateSl.oninput = rerender;
  if (seedSl) seedSl.oninput = rerender;
}

const Slide06Gantt: SlideDef = {
  title: "The Gantt chart, live",
  maxStep: 0,
  render: () => (
    <>
      <h2>Five plates, one reader, material moving between them</h2>
      <p>
        Each row is a plate's protocol executing — seed, incubate, read,
        passage, incubate, read, transfer. Solid bars are node execution;
        the dashed red ghost before a "read" bar is time spent queued for
        the shared instrument; dashed teal arcs are material transferred
        from one plate's protocol into the next. This is not authored —
        it's the output of the simulation in <code>runtime.ts</code>,
        re-run live as you move the sliders.
      </p>
      <D3Chart id="c-gantt-bio" draw={drawGantt} />
      <div className="controls">
        <label>
          Plates: <input type="range" id="gantt-plates" min={2} max={9} defaultValue={5} />
        </label>
        <label>
          Seed: <input type="range" id="gantt-seed" min={1} max={99} defaultValue={42} />
        </label>
        <div id="gantt-dr-readout" className="readout" />
      </div>
    </>
  ),
};

export default Slide06Gantt;
