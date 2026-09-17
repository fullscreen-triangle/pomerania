import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

const LAB = ["pendulums", "machines of pendulums", "a factory of machines"];

function drawLevels(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 350;
  let lvl = 0;

  function draw() {
    const s = mountSvg(el, w, h);
    const groups = lvl === 0 ? 9 : lvl === 1 ? 3 : 1;
    const per = lvl === 0 ? 1 : lvl === 1 ? 3 : 9;
    const R = lvl === 0 ? 15 : lvl === 1 ? 34 : 62;
    const cols = [C.k1, C.k2, C.k3];
    const pos: { x: number; y: number; g: number }[] = [];
    for (let i = 0; i < groups; i++) {
      const ang = (i / groups) * 2 * Math.PI - Math.PI / 2;
      const rad = groups === 1 ? 0 : 110;
      pos.push({ x: w / 2 + Math.cos(ang) * rad, y: 165 + Math.sin(ang) * rad, g: i % 3 });
    }
    pos.forEach((a, i) =>
      pos.forEach((b, j) => {
        if (i < j)
          s.append("line")
            .attr("x1", a.x)
            .attr("y1", a.y)
            .attr("x2", b.x)
            .attr("y2", b.y)
            .attr("stroke", C.line)
            .attr("stroke-width", 1.1);
      })
    );
    s.selectAll(".n")
      .data(pos)
      .join("circle")
      .attr("class", "n")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", R)
      .attr("fill", (d) => cols[d.g])
      .attr("opacity", 0.85);
    if (lvl > 0)
      s.selectAll(".c")
        .data(pos)
        .join("text")
        .attr("class", "c")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", C.bg)
        .text(per + "×");
    s.append("text")
      .attr("x", w / 2)
      .attr("y", 26)
      .attr("text-anchor", "middle")
      .attr("font-size", 15)
      .attr("font-weight", 600)
      .attr("fill", C.ink)
      .text("level " + lvl + " — " + LAB[lvl]);
    s.append("text")
      .attr("x", w / 2)
      .attr("y", h - 14)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", C.ink3)
      .text("the floor β is unchanged; the formula is unchanged");
    const readout = scope.querySelector<HTMLElement>("#lv-readout");
    if (readout)
      readout.innerHTML =
        `coordinates read <span class="m">(n, ℓ, m, D)</span> — identical at every level` +
        `<br><span style="color:${C.ink3}">nothing here averaged anything</span>`;
  }

  draw();
  const upBtn = scope.querySelector<HTMLButtonElement>("#lv-up");
  const resetBtn = scope.querySelector<HTMLButtonElement>("#lv-reset");
  if (upBtn)
    upBtn.onclick = () => {
      lvl = Math.min(2, lvl + 1);
      draw();
    };
  if (resetBtn)
    resetBtn.onclick = () => {
      lvl = 0;
      draw();
    };
}

const Slide12LevelsConcretely: SlideDef = {
  title: "No privileged level, concretely",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>Why the same three numbers work at every scale</h2>
      <div className="two-col">
        <div>
          <p>
            "Recursive with no privileged level" sounds like a slogan. It is
            a statement with a short proof, and it is worth being exact.
          </p>

          <div className="boxed" data-step={0}>
            <b>Step 1.</b> Group the dots into regions. Keep an edge between
            two regions whenever any edge joined them, and add up the
            weights.
            <div className="sub">This is the <em>level graph</em>.</div>
          </div>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Step 2.</b> The level graph is again a graph with positive
            weights and the same floor <span className="m">β</span> —
            because a sum of things each ≥ β is ≥ β.
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Step 3.</b> The coordinate formula reads only{" "}
            <span className="m">(n, ℓ, m, D)</span> — depth, articulation,
            orientation, capacity. It never mentions how many dots there are
            or what they stand for.
          </div>

          <p className={`hl ${step < 3 ? "dim" : ""}`} data-step={3}>
            So it applies to the level graph unchanged. And to the level
            graph <em>of</em> the level graph. Forever.
          </p>

          <div className={`boxed danger ${step < 4 ? "dim" : ""}`} data-step={4}>
            <b>The consequence people miss.</b> A society's coordinates are{" "}
            <em>not computed from</em> its members' coordinates — no
            averaging, no aggregation operator, nothing to evaluate.
            <div className="sub">
              An aggregator would need somebody to hold every member's value
              at once, and no such person exists.
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-levels" draw={drawLevels} />
          <div className="controls">
            <button id="lv-up">Group into regions →</button>
            <button id="lv-reset">Reset</button>
            <div id="lv-readout" className="readout" />
          </div>
          <p className="cap">
            A pendulum, a machine of pendulums, a factory of machines. Same
            formula each time; the floor survives every step.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide12LevelsConcretely;
