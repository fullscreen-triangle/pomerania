import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg, fmt } from "../chartUtils";

function drawMetric(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 360;

  function draw(D: number) {
    const s = mountSvg(el, w, h);
    const eps = 1 / (2 * D);
    const m = { l: 52, r: 20, t: 20, b: 44 };
    const x = d3.scaleLinear().domain([0, 1]).range([m.l, w - m.r]);
    const y = d3
      .scaleLog()
      .domain([3, 400])
      .range([h - m.b, m.t])
      .clamp(true);
    const data = d3.range(0.004, 0.997, 0.002).map((sv) => ({ s: sv, g: 1 / (sv * (1 - sv)) }));
    ([[0, eps], [1 - eps, 1]] as [number, number][]).forEach(([a, b]) =>
      s
        .append("rect")
        .attr("x", x(a))
        .attr("width", Math.max(1, x(b) - x(a)))
        .attr("y", m.t)
        .attr("height", h - m.b - m.t)
        .attr("fill", C.bad)
        .attr("opacity", 0.1)
    );
    s.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", C.k1)
      .attr("stroke-width", 2.2)
      .attr(
        "d",
        d3
          .line<{ s: number; g: number }>()
          .x((d) => x(d.s))
          .y((d) => y(d.g))
      );
    [eps, 1 - eps].forEach((v) =>
      s
        .append("line")
        .attr("x1", x(v))
        .attr("x2", x(v))
        .attr("y1", m.t)
        .attr("y2", h - m.b)
        .attr("stroke", C.bad)
        .attr("stroke-dasharray", "4 3")
        .attr("stroke-width", 1.4)
    );
    s.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(d3.axisBottom(x).ticks(6));
    s.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(4, "~s"));
    s.append("text")
      .attr("x", w / 2)
      .attr("y", h - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", C.ink3)
      .text("coordinate value");
    s.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", C.ink3)
      .text("metric coefficient  1/[S(1−S)]");
    s.append("text")
      .attr("x", x(0.5))
      .attr("y", m.t + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", C.good)
      .text("coordinates live here");
    const readout = scope.querySelector<HTMLElement>("#metric-readout");
    if (readout)
      readout.innerHTML =
        `D = ${D} → ε = 1/${2 * D} = <b>${fmt(eps)}</b><br>` +
        `coordinates confined to [${fmt(eps)}, ${fmt(1 - eps)}] — shaded bands are unreachable`;
  }

  const sl = scope.querySelector<HTMLInputElement>("#metric-D");
  if (sl) sl.oninput = () => draw(Number(sl.value));
  draw(Number(sl?.value ?? 6));
}

const Slide11Metric: SlideDef = {
  title: "The floor returns",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>The floor and the geometry are the same fact</h2>
      <div className="two-col">
        <div>
          <p>
            The natural metric on these coordinates blows up at 0 and 1 —
            where a coordinate would mean <em>nothing drawn</em> or{" "}
            <em>everything drawn</em>.
          </p>

          <p className="hl" data-step={0}>
            The coordinates never get there.
          </p>

          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Reaching 0 would need a distinction that was not drawn — but
            then there is nothing to measure. Reaching 1 would need every
            available distinction drawn — but then no resolution remains.
          </p>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            The combinatorial fact (<em>distinctions are quantal</em>) and
            the analytic fact (<em>the metric is finite</em>) are one fact
            in two vocabularies.
            <div className="sub">
              Coordinates stay in <span className="m">[ε, 1−ε]</span> with{" "}
              <span className="m">ε = 1/2D</span>.
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-metric" draw={drawMetric} />
          <div className="controls">
            <label>
              Capacity <span className="m">D</span>
              <input type="range" id="metric-D" min={3} max={16} defaultValue={6} />
            </label>
            <div id="metric-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide11Metric;
