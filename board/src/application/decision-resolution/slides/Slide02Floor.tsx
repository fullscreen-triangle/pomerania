import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPartition(n: number, D: number, seed: number, clustered: boolean): number[] {
  const rng = mulberry32(seed);
  const cuts = [0, D];
  for (let i = 1; i < n; i++) {
    const raw = clustered ? Math.pow(rng(), 3) : rng();
    cuts.push(raw * D);
  }
  cuts.sort((a, b) => a - b);
  const widths: number[] = [];
  for (let i = 1; i < cuts.length; i++) widths.push(cuts[i] - cuts[i - 1]);
  return widths;
}

function drawFloor(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 300,
    margin = { top: 30, right: 20, bottom: 40, left: 20 };
  const D = 10;

  function render(n: number, clustered: boolean) {
    const s = mountSvg(el, w, h);
    const widths = randomPartition(n, D, 7 + n, clustered);
    const mean = D / n;

    let x = margin.left;
    const barY = h / 2 - 20;
    const barH = 60;
    const scaleX = (w - margin.left - margin.right) / D;

    widths.forEach((width) => {
      const bw = width * scaleX;
      s.append("rect")
        .attr("x", x)
        .attr("y", barY)
        .attr("width", Math.max(0.5, bw - 1))
        .attr("height", barH)
        .attr("fill", width >= mean ? C.k1 : C.panel)
        .attr("stroke", C.line)
        .attr("stroke-width", 1);
      x += bw;
    });

    // mean-diameter reference line, drawn as a "width" bracket
    const meanW = mean * scaleX;
    s.append("line")
      .attr("x1", margin.left)
      .attr("x2", margin.left + meanW)
      .attr("y1", barY - 14)
      .attr("y2", barY - 14)
      .attr("stroke", C.k2)
      .attr("stroke-width", 2);
    s.append("text")
      .attr("x", margin.left)
      .attr("y", barY - 20)
      .attr("font-size", 11)
      .attr("fill", C.k2)
      .text(`D/N = ${mean.toFixed(2)}`);

    const maxWidth = Math.max(...widths);
    const readout = scope.querySelector<HTMLElement>("#floor-readout");
    if (readout)
      readout.innerHTML =
        `${n} cells over D = ${D}<br>` +
        `mean cell width = <b>${mean.toFixed(3)}</b><br>` +
        `largest cell = <b style="color:${C.good}">${maxWidth.toFixed(3)}</b> ${maxWidth >= mean ? "≥ D/N ✓" : ""}`;
  }

  render(8, false);
  const uniformBtn = scope.querySelector<HTMLButtonElement>("#floor-uniform");
  const clusteredBtn = scope.querySelector<HTMLButtonElement>("#floor-clustered");
  const sl = scope.querySelector<HTMLInputElement>("#floor-n");
  let clustered = false;
  const rerender = () => render(Number(sl?.value ?? 8), clustered);
  if (sl) sl.oninput = rerender;
  if (uniformBtn) uniformBtn.onclick = () => { clustered = false; rerender(); };
  if (clusteredBtn) clusteredBtn.onclick = () => { clustered = true; rerender(); };
}

const Slide02Floor: SlideDef = {
  title: "The resolution floor, computed",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>Mean cell diameter: an identity, not an existence claim</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>The customary argument</h3>
            <p>
              "A finite monitor can't separate all points of an
              uncountable range, so some cell is non-degenerate, so a
              positive floor exists." True, but it proves existence only
              — no number.
            </p>
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Mean-diameter identity.</b> For N cells partitioning an
            interval of diameter D, disjoint intervals covering [0,D] sum
            to at least D — so the mean cell width is exactly D/N, and
            some cell has width ≥ D/N. One line of measure additivity,
            no contradiction needed.
          </div>
          <p className={`aside ${step < 2 ? "dim" : ""}`} data-step={2}>
            This is <em>readable off a datasheet</em>: a 16-bit ADC over
            0–5V gives β = 5V/65536 ≈ 76.3 μV. A decision branching on a
            smaller difference is branching on a distinction the
            instrument never made.
          </p>
        </div>
        <div>
          <D3Chart id="c-floor-dr" draw={drawFloor} />
          <div className="controls">
            <label>
              N cells: <input type="range" id="floor-n" min={3} max={20} defaultValue={8} />
            </label>
            <button id="floor-uniform">Uniform random cuts</button>
            <button id="floor-clustered">Clustered cuts</button>
            <div id="floor-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide02Floor;
