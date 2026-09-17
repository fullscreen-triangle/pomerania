import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

function drawCube(el: HTMLDivElement) {
  const w = 620,
    h = 420;
  const s = mountSvg(el, w, h);
  const rot = { x: -0.42, y: 0.62 };
  const S_TOTAL = 1; // conservation constant for the illustration

  function project(p: { x: number; y: number; z: number }, r: { x: number; y: number }) {
    const X = p.x - 0.5,
      Y = p.y - 0.5,
      Z = p.z - 0.5;
    const x1 = X * Math.cos(r.y) - Z * Math.sin(r.y);
    const z1 = X * Math.sin(r.y) + Z * Math.cos(r.y);
    const y1 = Y * Math.cos(r.x) - z1 * Math.sin(r.x);
    const z2 = Y * Math.sin(r.x) + z1 * Math.cos(r.x);
    const sc = 250 / (1.9 + z2 * 0.55);
    return { x: w / 2 + x1 * sc, y: h / 2 + y1 * sc, z: z2 };
  }

  // sample points on the conservation plane Sk + St + Se = S_TOTAL within [0,1]^3
  const planePts: { x: number; y: number; z: number }[] = [];
  const STEPS = 14;
  for (let i = 0; i <= STEPS; i++) {
    for (let j = 0; j <= STEPS; j++) {
      const Sk = (i / STEPS) * S_TOTAL;
      const St = (j / STEPS) * (S_TOTAL - Sk);
      const Se = S_TOTAL - Sk - St;
      if (Se >= 0 && Se <= 1 && Sk <= 1 && St <= 1) planePts.push({ x: Sk, y: St, z: Se });
    }
  }

  function render() {
    const corners: [number, number, number][] = [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1],
    ];
    const cedges: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];
    const cp = corners.map((c) => project({ x: c[0], y: c[1], z: c[2] }, rot));
    s.selectAll(".cube")
      .data(cedges)
      .join("line")
      .attr("class", "cube")
      .attr("x1", (d) => cp[d[0]].x)
      .attr("y1", (d) => cp[d[0]].y)
      .attr("x2", (d) => cp[d[1]].x)
      .attr("y2", (d) => cp[d[1]].y)
      .attr("stroke", C.line)
      .attr("stroke-width", 1);

    const proj = planePts.map((p) => ({ ...p, ...project(p, rot) }));
    s.selectAll(".plane")
      .data(proj)
      .join("circle")
      .attr("class", "plane")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 2)
      .attr("fill", C.k1)
      .attr("opacity", 0.35);

    // three axis labels
    const axLab: [string, [number, number, number]][] = [
      ["Sk", [1.08, 0, 0]],
      ["St", [0, 1.08, 0]],
      ["Se", [0, 0, 1.08]],
    ];
    s.selectAll(".axlab")
      .data(axLab)
      .join("text")
      .attr("class", "axlab")
      .attr("x", (d) => project({ x: d[1][0], y: d[1][1], z: d[1][2] }, rot).x)
      .attr("y", (d) => project({ x: d[1][0], y: d[1][1], z: d[1][2] }, rot).y)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("font-weight", 600)
      .attr("fill", C.ink)
      .text((d) => d[0]);
  }

  render();
  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text("shaded triangle: Sk + St + Se = S_total — drag to rotate");

  let start: { mx: number; my: number; rx: number; ry: number } | null = null;
  const onMouseDown = (e: MouseEvent) => {
    start = { mx: e.clientX, my: e.clientY, rx: rot.x, ry: rot.y };
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!start) return;
    rot.y = start.ry + (e.clientX - start.mx) * 0.007;
    rot.x = start.rx + (e.clientY - start.my) * 0.007;
    render();
  };
  const onMouseUp = () => {
    start = null;
  };
  s.on("mousedown", (event) => onMouseDown(event));
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
}

const Slide05Coordinates: SlideDef = {
  title: "S-entropy coordinates",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Knowledge, temporal, evolution — a conserved triple</h2>
      <div className="two-col">
        <div>
          <div className="coord-defs">
            <div className="cd" data-step={0}>
              <span className="k1">Sk</span>
              <span>knowledge</span>
              <em>uncertainty in state identification</em>
            </div>
            <div className={`cd ${step < 1 ? "dim" : ""}`} data-step={1}>
              <span className="k2">St</span>
              <span>temporal</span>
              <em>uncertainty in timing</em>
            </div>
            <div className={`cd ${step < 2 ? "dim" : ""}`} data-step={2}>
              <span className="k3">Se</span>
              <span>evolution</span>
              <em>uncertainty in trajectory</em>
            </div>
          </div>

          <p className={step < 2 ? "dim" : ""} data-step={2}>
            𝒮 = [0,1]³ (Def. 2.3). Categorical distance between two
            coordinates is a base-3 weighted sum over ternary-trit
            differences (Def. 2.4):{" "}
            <span className="m">
              d<sub>cat</sub>(S₁,S₂) = Σᵢ |tᵢ⁽¹⁾ − tᵢ⁽²⁾| / 3ⁱ⁺¹
            </span>
            .
          </p>

          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>Theorem (S-Entropy Conservation).</b> Sk + St + Se = S
            <sub>total</sub> = constant. Categorical measurement redistributes
            entropy among the three axes; it never creates or destroys it.
            When knowledge is gained, temporal and evolution entropy give it
            up in equal total.
          </div>

          <p className="aside">
            Note: this is a <em>different</em> formalism from the Sk/St/Se
            used elsewhere in this deck's S-entropy papers (there:
            depth/articulation/orientation of a categorical partition). Same
            coordinate-space shape — a resolved [0,1]³ cube with three named
            axes — applied to a different problem. The naming coincidence is
            not a shared derivation.
          </p>
        </div>
        <div>
          <D3Chart id="c-coords" draw={drawCube} />
          <p className="cap">
            The conservation constraint confines every reachable state to a
            triangular slice of the cube: the plane Sk + St + Se = S
            <sub>total</sub>. Drag to rotate.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide05Coordinates;
