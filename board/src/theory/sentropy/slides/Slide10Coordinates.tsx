import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

type Pt3 = { Sk: number; St: number; Se: number; n: number };
type Proj = Pt3 & { x: number; y: number; z: number };

function drawCube(el: HTMLDivElement) {
  const D = 9,
    w = 620,
    h = 420;
  const s = mountSvg(el, w, h);
  const rot = { x: -0.42, y: 0.62 };

  function buildPts(): Pt3[] {
    const pts: Pt3[] = [];
    for (let n = 2; n < D; n++)
      for (let l = 1; l < n; l++) {
        const k = n - l;
        for (let m = -(k - 1); m < k; m++)
          pts.push({ Sk: (n - 1) / (D - 1), St: l / n, Se: (m + k) / (2 * k), n });
      }
    return pts;
  }
  const pts = buildPts();

  function project(p: { Sk: number; St: number; Se: number }) {
    const { x: rx, y: ry } = rot;
    const X = p.Sk - 0.5,
      Y = p.St - 0.5,
      Z = p.Se - 0.5;
    const x1 = X * Math.cos(ry) - Z * Math.sin(ry);
    const z1 = X * Math.sin(ry) + Z * Math.cos(ry);
    const y1 = Y * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = Y * Math.sin(rx) + z1 * Math.cos(rx);
    const sc = 250 / (1.9 + z2 * 0.55);
    return { x: w / 2 + x1 * sc, y: h / 2 + y1 * sc, z: z2 };
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
    const cp = corners.map((c) => project({ Sk: c[0], St: c[1], Se: c[2] }));
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
    const col = d3.scaleSequential(d3.interpolateViridis).domain([2, D]);
    const proj: Proj[] = pts.map((p) => ({ ...p, ...project(p) })).sort((a, b) => a.z - b.z);
    s.selectAll(".pt")
      .data(proj)
      .join("circle")
      .attr("class", "pt")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => 3.4 + d.z * 1.6)
      .attr("fill", (d) => col(d.n))
      .attr("opacity", 0.86);
  }

  render();
  s.append("text")
    .attr("x", w / 2)
    .attr("y", h - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink3)
    .text(`${pts.length} configurations · none touches a face`);

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

const Slide10Coordinates: SlideDef = {
  title: "The three coordinates",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Normalise each against its own range</h2>
      <div className="two-col">
        <div>
          <p>
            Each invariant is divided by how much of it was{" "}
            <em>available</em>. What comes out is a fraction: how much of
            the possible resolution was actually drawn.
          </p>

          <div className="coord-defs">
            <div className="cd" data-step={0}>
              <span className="k1">
                S<sub>k</sub>
              </span>
              <span className="frac">
                <span>n − 1</span>
                <span>D − 1</span>
              </span>
              <em>fraction of available depth descended</em>
            </div>
            <div className={`cd ${step < 1 ? "dim" : ""}`} data-step={1}>
              <span className="k2">
                S<sub>t</sub>
              </span>
              <span className="frac">
                <span>ℓ</span>
                <span>n</span>
              </span>
              <em>fraction of levels articulated</em>
            </div>
            <div className={`cd ${step < 2 ? "dim" : ""}`} data-step={2}>
              <span className="k3">
                S<sub>e</sub>
              </span>
              <span className="frac">
                <span>m + k</span>
                <span>2k</span>
              </span>
              <em>position of the orientation in its range</em>
            </div>
          </div>

          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            Every coordinate is <b>drawn ÷ available</b>.
            <div className="sub">
              Because of the floor, a distinction is drawn or it is not —
              there is no third case. So each coordinate splits a genuine
              two-point alternative.
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-cube" draw={drawCube} />
          <p className="cap">
            Every admissible configuration at capacity{" "}
            <span className="m">D=9</span>, coloured by depth. Drag to
            rotate.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide10Coordinates;
