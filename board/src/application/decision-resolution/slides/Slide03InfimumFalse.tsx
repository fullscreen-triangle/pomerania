import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

function drawSignZero(el: HTMLDivElement, scope: HTMLElement) {
  const w = 560,
    h = 220,
    margin = { top: 40, right: 20, bottom: 40, left: 20 };
  const s = mountSvg(el, w, h);
  const scaleX = (w - margin.left - margin.right) / 2; // [-1,1]

  const cells: { x0: number; x1: number; label: string; diam: number }[] = [
    { x0: -1, x1: 0, label: "[-1, 0)", diam: 1 },
    { x0: 0, x1: 0, label: "{0}", diam: 0 },
    { x0: 0, x1: 1, label: "(0, 1]", diam: 1 },
  ];

  const toX = (v: number) => margin.left + (v + 1) * scaleX;
  const barY = h / 2 - 20;

  cells.forEach((c) => {
    if (c.diam === 0) {
      s.append("circle")
        .attr("cx", toX(c.x0))
        .attr("cy", barY + 30)
        .attr("r", 6)
        .attr("fill", C.k2);
      s.append("text")
        .attr("x", toX(c.x0))
        .attr("y", barY + 55)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", C.k2)
        .text("diam = 0");
    } else {
      s.append("rect")
        .attr("x", toX(c.x0))
        .attr("y", barY)
        .attr("width", toX(c.x1) - toX(c.x0))
        .attr("height", 60)
        .attr("fill", C.k1)
        .attr("opacity", 0.75)
        .attr("stroke", C.line);
    }
    s.append("text")
      .attr("x", (toX(c.x0) + toX(c.x1)) / 2)
      .attr("y", barY - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", C.ink2)
      .text(c.label);
  });

  const readout = scope.querySelector<HTMLElement>("#inf-readout");
  if (readout)
    readout.innerHTML =
      `sign-with-zero quantiser on [-1,1], |S| = 3<br>` +
      `cell diameters: (1, <b style="color:${C.bad}">0</b>, 1) — min diameter = <b style="color:${C.bad}">0</b><br>` +
      `<span style="color:${C.ink3}">finiteness alone never implies inf diam(C) > 0</span>`;
}

const Slide03InfimumFalse: SlideDef = {
  title: "The infimum form is false",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Some cell is large. That doesn't mean every cell is.</h2>
      <div className="two-col">
        <div>
          <p>
            The floor is often defined as β = min cell diameter, with
            "positivity by finiteness" asserted. This is false — and not
            pathologically: an exact-zero detector is a standard
            component.
          </p>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Where the error hides.</b> Pigeonhole gives a positive
            bound on the <em>maximum</em> cell (previous slide), not the
            minimum. "Some cell is large" and "every cell is large" have
            opposite quantifier structure — passing between them is the
            whole error.
          </div>
          <p className="aside">
            The correct repair bounds the cell one actually{" "}
            <em>occupies</em>: under any absolutely continuous law, the
            occupied cell has diameter ≥ D/2N with probability ≥ ½ — the
            degenerate cell exists, but it's hit with probability zero.
          </p>
        </div>
        <div>
          <D3Chart id="c-signzero" draw={drawSignZero} />
          <div className="controls">
            <div id="inf-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide03InfimumFalse;
