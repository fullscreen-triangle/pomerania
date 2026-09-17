import type * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

type BaseNode = { id: number; g: number; x: number; y: number };

function drawRecursion(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 360;
  let level = 0;
  const base: BaseNode[] = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    g: Math.floor(i / 4),
    x: 0,
    y: 0,
  }));

  function lab(s: d3.Selection<SVGSVGElement, unknown, null, undefined>, t: string, sub: string) {
    s.append("text")
      .attr("x", w / 2)
      .attr("y", 28)
      .attr("text-anchor", "middle")
      .attr("font-size", 15)
      .attr("font-weight", 600)
      .attr("fill", C.ink)
      .text(t);
    s.append("text")
      .attr("x", w / 2)
      .attr("y", h - 14)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", C.ink3)
      .text(sub);
  }

  function draw() {
    const s = mountSvg(el, w, h);
    if (level === 0) {
      base.forEach((n, i) => {
        const ang = (i / 12) * 2 * Math.PI,
          R = 110;
        n.x = w / 2 + Math.cos(ang) * R;
        n.y = h / 2 + Math.sin(ang) * R;
      });
      for (let i = 0; i < 12; i++)
        for (let j = i + 1; j < 12; j++)
          if (base[i].g === base[j].g || (i + 1) % 12 === j)
            s.append("line")
              .attr("x1", base[i].x)
              .attr("y1", base[i].y)
              .attr("x2", base[j].x)
              .attr("y2", base[j].y)
              .attr("stroke", C.line)
              .attr("stroke-width", 1.2);
      s.selectAll(".n")
        .data(base)
        .join("circle")
        .attr("class", "n")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 11)
        .attr("fill", (d) => [C.k1, C.k2, C.k3][d.g]);
      lab(s, "subtasks", "12 positions · contacts between them");
    } else if (level === 1) {
      const P = [0, 1, 2].map((g) => ({
        g,
        x: w / 2 + Math.cos((g / 3) * 2 * Math.PI - 1.2) * 95,
        y: h / 2 + Math.sin((g / 3) * 2 * Math.PI - 1.2) * 95,
      }));
      P.forEach((a, i) =>
        P.forEach((b, j) => {
          if (i < j)
            s.append("line")
              .attr("x1", a.x)
              .attr("y1", a.y)
              .attr("x2", b.x)
              .attr("y2", b.y)
              .attr("stroke", C.line)
              .attr("stroke-width", 2);
        })
      );
      s.selectAll(".n")
        .data(P)
        .join("circle")
        .attr("class", "n")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 30)
        .attr("fill", (d) => [C.k1, C.k2, C.k3][d.g])
        .attr("opacity", 0.9);
      s.selectAll(".t")
        .data(P)
        .join("text")
        .attr("class", "t")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "#0e1620")
        .text("agent");
      lab(s, "agents", "each region is now one position — same graph structure");
    } else {
      s.append("circle")
        .attr("cx", w / 2)
        .attr("cy", h / 2)
        .attr("r", 56)
        .attr("fill", C.k1)
        .attr("opacity", 0.9);
      s.append("text")
        .attr("x", w / 2)
        .attr("y", h / 2 + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("fill", "#0e1620")
        .text("society");
      lab(s, "society", "same formula again — nothing was aggregated");
    }
    const readout = scope.querySelector<HTMLElement>("#recursion-readout");
    if (readout)
      readout.innerHTML =
        `level ${level} · the coordinate map reads only (n, ℓ, m, D)<br>` +
        `<span style="color:${C.ink3}">identical at every level — no operator combines anything</span>`;
  }

  draw();
  const zoomOutBtn = scope.querySelector<HTMLButtonElement>("#zoom-out");
  const zoomResetBtn = scope.querySelector<HTMLButtonElement>("#zoom-reset");
  if (zoomOutBtn)
    zoomOutBtn.onclick = () => {
      level = Math.min(2, level + 1);
      draw();
    };
  if (zoomResetBtn)
    zoomResetBtn.onclick = () => {
      level = 0;
      draw();
    };
}

const Slide13Recursion: SlideDef = {
  title: "No privileged level",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>The same construction at every scale</h2>
      <div className="two-col">
        <div>
          <p>
            Group positions into regions. The regions, with the contacts
            between them, form a graph again — with the same floor.
          </p>

          <p className="hl" data-step={0}>
            So the coordinate construction applies to it unchanged.
          </p>

          <p className={step < 1 ? "dim" : ""} data-step={1}>
            A subtask, an agent, and a society are the{" "}
            <em>same kind of object</em> at different depths. Click to zoom
            out.
          </p>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>No aggregator.</b> A society's coordinates are not computed{" "}
            <em>from</em> its members' coordinates. They are read off its
            own graph by the same formula.
            <div className="sub">
              This matters: an aggregator would need someone to evaluate it.
              Nobody computes society's value — and nobody needs to.
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-recursion" draw={drawRecursion} />
          <div className="controls">
            <button id="zoom-out">Zoom out one level</button>
            <button id="zoom-reset">Reset</button>
            <div id="recursion-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide13Recursion;
