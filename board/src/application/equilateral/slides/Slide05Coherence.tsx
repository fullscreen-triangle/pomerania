import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { robustnessDetail } from "../coherence";

function drawCoherence(el: HTMLDivElement, scope: HTMLElement) {
  const w = 560,
    h = 280;
  const s = mountSvg(el, w, h);

  function render(n: number) {
    const theta = 0.5;
    const strength = 0.75;
    const { robust, removals } = robustnessDetail(n, strength, theta);

    const cx = w / 2,
      cy = h / 2 - 10,
      r = 90;
    const positions = Array.from({ length: n }, (_, i) => ({
      x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
      y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
    }));

    const edges: [number, number][] = [];
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) edges.push([i, j]);

    s.selectAll(".e")
      .data(edges)
      .join("line")
      .attr("class", "e")
      .attr("x1", (d) => positions[d[0]].x)
      .attr("y1", (d) => positions[d[0]].y)
      .attr("x2", (d) => positions[d[1]].x)
      .attr("y2", (d) => positions[d[1]].y)
      .attr("stroke", C.line)
      .attr("stroke-width", 1.4);

    s.selectAll(".n")
      .data(positions)
      .join("circle")
      .attr("class", "n")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 16)
      .attr("fill", robust ? C.k3 : C.k2)
      .attr("stroke", C.ink)
      .attr("stroke-width", 1.5);
    s.selectAll(".lbl")
      .data(positions)
      .join("text")
      .attr("class", "lbl")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "#0a0f16")
      .text((_, i) => i + 1);

    const readout = scope.querySelector<HTMLElement>("#coh-readout");
    if (readout) {
      const survivalRows = removals
        .map((r) => `removing #${r.removedIndex + 1}: ${r.stillGrounded ? "still grounded ✓" : "collapses ✗"}`)
        .join("<br>");
      readout.innerHTML =
        `n = ${n} catalysts, θ = ${theta}<br>` +
        `robust to any single removal: <b style="color:${robust ? C.good : C.bad}">${robust}</b><br><br>` +
        survivalRows;
    }
  }

  render(3);
  for (const n of [1, 2, 3, 4]) {
    const btn = scope.querySelector<HTMLButtonElement>(`#coh-btn-${n}`);
    if (btn) btn.onclick = () => render(n);
  }
}

const Slide05Coherence: SlideDef = {
  title: "Coherence requires a triangle",
  maxStep: 0,
  render: () => (
    <>
      <h2>One passage is never grounded. Neither are two.</h2>
      <div className="two-col">
        <div>
          <p>
            A claim is robustly grounded only by a strongly connected
            cycle of at least three independently-sourced, mutually
            supporting catalysts. An acyclic chain collapses if its
            terminal, unjustified member is removed. A 2-cycle — two
            catalysts justifying only each other — fails the majority
            condition θ &gt; ½: remove either and the other is left
            unsupported. Only from three onward does removing any single
            member leave the rest still mutually supporting.
          </p>
          <p className="aside">
            Pick a coalition size below and watch which removals survive —
            this is a live run of <code>robustnessDetail</code>, the exact
            function backing the paper's Experiment 5.
          </p>
        </div>
        <div>
          <D3Chart id="c-coherence" draw={drawCoherence} />
          <div className="controls">
            <button id="coh-btn-1">n = 1</button>
            <button id="coh-btn-2">n = 2</button>
            <button id="coh-btn-3">n = 3</button>
            <button id="coh-btn-4">n = 4</button>
            <div id="coh-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide05Coherence;
