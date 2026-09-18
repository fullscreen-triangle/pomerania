import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { waterFill, type Scene } from "../waterfilling";

const SCENES: Scene[] = [
  { id: "docs", label: "internal documents", m: 4, tau: 1.5 },
  { id: "kg", label: "structured records", m: 3, tau: 1.5 },
  { id: "model", label: "domain-adapted model", m: 2, tau: 1.5 },
];

function drawWaterfill(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 20, right: 16, bottom: 60, left: 46 };

  function render(budget: number) {
    const s = mountSvg(el, w, h);
    const result = waterFill(SCENES, budget);

    const maxVal = Math.max(...SCENES.map((sc) => sc.m)) * 1.1;
    const barW = 110;
    const gap = 40;
    const groupW = barW + gap;
    const startX = margin.left + 20;

    const toY = (v: number) => h - margin.bottom - (v / maxVal) * (h - margin.top - margin.bottom);

    SCENES.forEach((sc, i) => {
      const gx = startX + i * groupW;
      const val = result.values[i];
      const alloc = result.allocations[i];
      s.append("rect")
        .attr("x", gx)
        .attr("y", toY(val))
        .attr("width", barW)
        .attr("height", h - margin.bottom - toY(val))
        .attr("fill", [C.k1, C.k2, C.k3][i])
        .attr("opacity", 0.85);
      s.append("text")
        .attr("x", gx + barW / 2)
        .attr("y", toY(val) - 8)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", C.ink)
        .text(`gain ${val.toFixed(2)}`);
      s.append("text")
        .attr("x", gx + barW / 2)
        .attr("y", h - margin.bottom + 18)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", C.ink2)
        .text(sc.label);
      s.append("text")
        .attr("x", gx + barW / 2)
        .attr("y", h - margin.bottom + 34)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("fill", C.ink3)
        .text(`a* = ${alloc.toFixed(2)}`);
    });

    s.append("line")
      .attr("x1", margin.left)
      .attr("x2", w - margin.right)
      .attr("y1", h - margin.bottom)
      .attr("y2", h - margin.bottom)
      .attr("stroke", C.line);

    const readout = scope.querySelector<HTMLElement>("#wf-readout");
    if (readout)
      readout.innerHTML =
        `budget = ${budget.toFixed(1)} &nbsp;·&nbsp; shadow price p* = <b>${result.priceStar.toFixed(3)}</b><br>` +
        `total value = <b style="color:${C.good}">${result.totalValue.toFixed(3)}</b><br>` +
        `<span style="color:${C.ink3}">marginal gain equalised across every attended scene; a scene whose price falls below p* is dropped entirely</span>`;
  }

  render(3.0);
  const sl = scope.querySelector<HTMLInputElement>("#wf-slider");
  if (sl) {
    sl.oninput = () => render(Number(sl.value));
    sl.value = "3.0";
  }
}

const Slide08Society: SlideDef = {
  title: "Federation and water-filling",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>A society of split-attention agents</h2>
      <div className="two-col">
        <div>
          <p>
            Each former pipeline stage becomes a bounded agent with its
            own conserved identity, dividing a finite attention budget
            across concurrently competing sources — here, internal
            documents, structured records, and the domain-adapted model's
            own inference — by a provably optimal water-filling rule:
            equal marginal gain across every attended source, any source
            below the shadow price dropped entirely.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Federation itself takes the <em>union</em> of receivers'
            candidate sets — a source precise for a given query benefits
            the whole federation even where the others are not — which
            provably lowers the floor below every constituent's own floor,
            never merely averages them.
          </p>
        </div>
        <div>
          <D3Chart id="c-waterfill" draw={drawWaterfill} />
          <div className="controls">
            <label>
              Attention budget:{" "}
              <input type="range" id="wf-slider" min={0.5} max={8} step={0.1} defaultValue={3.0} />
            </label>
            <div id="wf-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide08Society;
