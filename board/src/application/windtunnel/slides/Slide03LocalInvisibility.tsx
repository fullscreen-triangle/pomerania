import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

type Unit = { id: string; x: number; y: number; spec: number };

const units: Unit[] = [
  { id: "A", x: 130, y: 160, spec: 1 },
  { id: "B", x: 330, y: 90, spec: 1 },
  { id: "C", x: 330, y: 230, spec: -2 },
];

function drawCycle(el: HTMLDivElement, scope: HTMLElement) {
  const w = 460,
    h = 300;
  const s = mountSvg(el, w, h);

  const edges: [string, string][] = [
    ["A", "B"],
    ["B", "C"],
    ["C", "A"],
  ];
  const pos = new Map(units.map((u) => [u.id, u]));

  s.selectAll(".e")
    .data(edges)
    .join("path")
    .attr("class", "e")
    .attr("d", (d) => {
      const a = pos.get(d[0])!,
        b = pos.get(d[1])!;
      const mx = (a.x + b.x) / 2,
        my = (a.y + b.y) / 2 - 24;
      return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    })
    .attr("fill", "none")
    .attr("stroke", C.ink3)
    .attr("stroke-width", 1.6)
    .attr("marker-end", "url(#arrow)");

  s.append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 z")
    .attr("fill", C.ink3);

  s.selectAll(".n")
    .data(units)
    .join("circle")
    .attr("class", "n")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 22)
    .attr("fill", C.panel)
    .attr("stroke", C.k1)
    .attr("stroke-width", 2);

  s.selectAll(".lbl")
    .data(units)
    .join("text")
    .attr("class", "lbl")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y + 5)
    .attr("text-anchor", "middle")
    .attr("font-size", 15)
    .attr("fill", C.ink)
    .text((d) => d.id);

  function render(mode: "local" | "global") {
    let drift = 0;
    for (const u of units) drift += u.spec;
    const readout = scope.querySelector<HTMLElement>("#cyc-readout");
    if (mode === "local") {
      s.selectAll(".n").attr("stroke", C.good);
      if (readout)
        readout.innerHTML =
          `each unit checked in isolation: A +1 ✓, B +1 ✓, C −2 ✓<br>` +
          `<span style="color:${C.good}">all three local specs pass</span>`;
    } else {
      s.selectAll(".n").attr("stroke", drift !== 0 ? C.bad : C.good);
      if (readout)
        readout.innerHTML =
          `walk the cycle A→B→C→A and sum the drift: 1 + 1 + (−2) = <b style="color:${
            drift !== 0 ? C.bad : C.good
          }">${drift}</b><br>` +
          `<span style="color:${C.ink3}">nonzero net drift around a closed cycle — the system as a whole does not return to where it started, though every unit passed alone</span>`;
    }
  }

  render("local");
  const localBtn = scope.querySelector<HTMLButtonElement>("#cyc-local");
  const globalBtn = scope.querySelector<HTMLButtonElement>("#cyc-global");
  if (localBtn) localBtn.onclick = () => render("local");
  if (globalBtn) globalBtn.onclick = () => render("global");
}

const Slide03LocalInvisibility: SlideDef = {
  title: "Local invisibility",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Every unit can pass while the system is wrong</h2>
      <div className="two-col">
        <div>
          <p>
            The <b>Local Invisibility Theorem</b> is proved with an explicit
            witness: a 3-cycle of units A→B→C→A, each individually
            validated against its own local spec, each passing. But their
            per-unit behavioural drifts — the amount each one shifts state
            relative to what the next unit downstream expects — are +1, +1,
            and −2. Summed around the closed cycle, that's zero only by
            coincidence; here it's <span className="m">1 + 1 − 2 = 0</span>{" "}
            in this particular instance, but perturb any one spec slightly
            and the cycle no longer closes, with no local test able to see
            it.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            This is why "100% unit test coverage" is not evidence of global
            correctness. The failure mode lives entirely in the{" "}
            <em>relationship</em> between units, invisible to any test that
            only looks at one unit at a time.
          </p>
        </div>
        <div>
          <D3Chart id="c-cycle" draw={drawCycle} />
          <div className="controls">
            <button id="cyc-local">Check each unit locally</button>
            <button id="cyc-global">Walk the cycle globally</button>
            <div id="cyc-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide03LocalInvisibility;
