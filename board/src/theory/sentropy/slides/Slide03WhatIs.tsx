import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

function drawWhat(el: HTMLDivElement) {
  const w = 620,
    h = 340;
  const s = mountSvg(el, w, h);
  const m = { l: 54, r: 20, t: 30, b: 52 };
  const D = 9;
  const pts: { n: number; frac: number; rem: number }[] = [];
  for (let n = 2; n <= D; n++) {
    const frac = (n - 1) / (D - 1);
    pts.push({ n, frac, rem: 1 - frac });
  }
  const x = d3.scaleLinear().domain([2, D]).range([m.l, w - m.r]);
  const y = d3.scaleLinear().domain([0, 1]).range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d")));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5));

  s.append("path")
    .datum(pts)
    .attr("fill", "none")
    .attr("stroke", C.k2)
    .attr("stroke-width", 2.4)
    .attr("stroke-dasharray", "6 4")
    .attr(
      "d",
      d3
        .line<{ n: number; rem: number }>()
        .x((d) => x(d.n))
        .y((d) => y(d.rem))
    );
  s.append("path")
    .datum(pts)
    .attr("fill", "none")
    .attr("stroke", C.k1)
    .attr("stroke-width", 2.6)
    .attr(
      "d",
      d3
        .line<{ n: number; frac: number }>()
        .x((d) => x(d.n))
        .y((d) => y(d.frac))
    );
  s.selectAll(".pf")
    .data(pts)
    .join("circle")
    .attr("class", "pf")
    .attr("cx", (d) => x(d.n))
    .attr("cy", (d) => y(d.frac))
    .attr("r", 3.6)
    .attr("fill", C.k1);
  s.selectAll(".pr")
    .data(pts)
    .join("circle")
    .attr("class", "pr")
    .attr("cx", (d) => x(d.n))
    .attr("cy", (d) => y(d.rem))
    .attr("r", 3.2)
    .attr("fill", C.k2);

  s.append("line")
    .attr("x1", x(5.5))
    .attr("x2", x(5.5))
    .attr("y1", m.t)
    .attr("y2", h - m.b)
    .attr("stroke", C.line)
    .attr("stroke-dasharray", "3 4");

  s.append("text")
    .attr("x", x(6.2))
    .attr("y", y(0.3))
    .attr("fill", C.k1)
    .attr("font-size", 12.5)
    .text("resolved fraction  (S-entropy)");
  s.append("text")
    .attr("x", x(2.3))
    .attr("y", y(0.8))
    .attr("fill", C.k2)
    .attr("font-size", 12.5)
    .text("what is left to resolve");
  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("depth of resolution  n");
}

const Slide03WhatIs: SlideDef = {
  title: "What is S-entropy?",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>First, the plain answer</h2>
      <div className="two-col">
        <div>
          <div className="boxed" data-step={0}>
            <b>
              S-entropy is three numbers that say how far a thing has been
              resolved.
            </b>
            <div className="sub">
              Not how much disorder it has. How much of the available{" "}
              <em>telling-apart</em> has actually been done.
            </div>
          </div>

          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Ordinary entropy answers <em>"how many states could this be
            in?"</em>. S-entropy answers a different question:{" "}
            <em>
              "of all the distinctions I could draw here, what fraction have
              I drawn?"
            </em>
          </p>

          <p className={step < 2 ? "dim" : ""} data-step={2}>
            That is why each coordinate is a <b>ratio</b>, and why each one
            lands in <span className="m">[0,1]</span>. Three ratios, because
            — as we will prove — there are exactly three independent things
            you can say.
          </p>

          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            The name: <b>S</b> for the three axes{" "}
            <span className="m">
              S<sub>k</sub>
            </span>
            ,{" "}
            <span className="m">
              S<sub>t</sub>
            </span>
            ,{" "}
            <span className="m">
              S<sub>e</sub>
            </span>{" "}
            — knowledge, time, entropy in the original naming. What they{" "}
            <em>are</em> is depth, articulation, and orientation of a nested
            distinction.
          </div>

          <p className={`aside ${step < 4 ? "dim" : ""}`} data-step={4}>
            The next four slides build every word of that from scratch:
            graph, cut, minimum cut, and the pendulum.
          </p>
        </div>
        <div>
          <D3Chart id="c-what" draw={drawWhat} />
          <p className="cap">
            The same system, resolved further left to right. Ordinary
            entropy falls as you learn more; the resolved fraction rises.
            They are not the same quantity.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide03WhatIs;
