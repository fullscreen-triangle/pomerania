import * as d3 from "d3";
import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// Real validated data (validation/results/validation_results.json, suite_A
// "shell_capacity"): enumerated (l,m,s) count equals 2n^2 for n=1..10,
// checked exactly, zero mismatches.
const shellData = d3.range(1, 11).map((n) => ({ n, count: 2 * n * n }));

function drawShell(el: HTMLDivElement) {
  const w = 620,
    h = 320;
  const s = mountSvg(el, w, h);
  const m = { l: 54, r: 20, t: 24, b: 44 };

  const x = d3
    .scaleLinear()
    .domain([1, 10])
    .range([m.l, w - m.r]);
  const y = d3
    .scaleLinear()
    .domain([0, 200])
    .range([h - m.b, m.t]);

  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${h - m.b})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
  s.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5));

  s.append("path")
    .datum(shellData)
    .attr("fill", "none")
    .attr("stroke", C.k2)
    .attr("stroke-width", 2.4)
    .attr(
      "d",
      d3
        .line<{ n: number; count: number }>()
        .x((d) => x(d.n))
        .y((d) => y(d.count))
    );

  s.selectAll(".pt")
    .data(shellData)
    .join("circle")
    .attr("class", "pt")
    .attr("cx", (d) => x(d.n))
    .attr("cy", (d) => y(d.count))
    .attr("r", 4)
    .attr("fill", C.k2);

  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 8)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("depth n");
  s.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("|Shell(n)| = 2n²");

  s.append("text")
    .attr("x", x(3))
    .attr("y", y(150))
    .attr("font-size", 12.5)
    .attr("fill", C.good)
    .text("enumerated = formula for n = 1..10 (10/10 exact)");
}

const Slide02ThreeRoles: SlideDef = {
  title: "One quantum, three roles",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>The same τ₀ appears three times</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3 className="k1">Physical</h3>
            <p>
              The resolution floor below which no finite monitor can
              distinguish system states — a consequence of the finite
              observer axiom, not an engineering choice.
            </p>
          </div>
          <div className={`defn ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3 className="k2">Algorithmic</h3>
            <p>
              The gap below which the scheduler cannot improve yield by
              reassigning a single task — deterministic closure.
            </p>
          </div>
          <div className={`defn ${step < 2 ? "dim" : ""}`} data-step={2}>
            <h3 className="k3">Economic</h3>
            <p>
              The minimum lot size in the clearing market for execution
              capacity.
            </p>
          </div>

          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            When the same constant plays all three roles, the three
            fixed-point conditions coincide exactly — the Three-way
            Equivalence. When they are distinct constants, the equivalence
            degrades gracefully rather than failing outright.
          </div>
        </div>
        <div>
          <D3Chart id="c-shell" draw={drawShell} />
          <p className="cap">
            A structural quantity checked against its closed form at every
            depth 1&ndash;10 in the paper's validation suite — the same
            discipline the Three-way Equivalence itself is checked with.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide02ThreeRoles;
