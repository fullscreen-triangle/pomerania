import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { validation } from "../validation";

function drawFederation(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 16, right: 16, bottom: 34, left: 46 };
  const s = mountSvg(el, w, h);
  const exp4 = validation.exp4;
  const sizes = exp4.sizes!;

  const maxN = Math.max(...sizes);
  const toX = (n: number) => margin.left + ((n - 1) / (maxN - 1)) * (w - margin.left - margin.right);
  const toY = (v: number) => h - margin.bottom - v * (h - margin.top - margin.bottom);

  const band = sizes.map((n, i) => [toX(n), toY(exp4.hi[i])] as [number, number]).concat(
    sizes.slice().reverse().map((n, i) => [toX(n), toY(exp4.lo[sizes.length - 1 - i])] as [number, number])
  );
  s.append("path").attr("d", "M" + band.map((p) => p.join(",")).join("L") + "Z").attr("fill", C.k1).attr("opacity", 0.15);

  const meanLine = sizes.map((n, i) => [toX(n), toY(exp4.mean[i])] as [number, number]);
  s.append("path").attr("d", "M" + meanLine.map((p) => p.join(",")).join("L")).attr("fill", "none").attr("stroke", C.k1).attr("stroke-width", 2);
  s.selectAll(".pt")
    .data(sizes)
    .join("circle")
    .attr("class", "pt")
    .attr("cx", (n) => toX(n))
    .attr("cy", (_, i) => toY(exp4.mean[i]))
    .attr("r", 4)
    .attr("fill", C.k1);

  const readout = scope.querySelector<HTMLElement>("#fed-readout");
  if (readout)
    readout.innerHTML =
      `federation size n = 1 → ${sizes[sizes.length - 1]}, floor normalised by single-receiver floor<br>` +
      `falls from <b>${exp4.mean[0].toFixed(3)}</b> at n=1 to <b style="color:${C.good}">${exp4.mean[exp4.mean.length - 1].toFixed(3)}</b> at n=${sizes[sizes.length - 1]}<br>` +
      `<span style="color:${C.ink3}">every additional non-redundant receiver strictly lowers the joint floor</span>`;
}

const Slide04Federation: SlideDef = {
  title: "Federation lowers the floor",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Union of candidates, never intersection</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>Bounded receiver, floor</h3>
            <p>
              A receiver is a map from queries to a finite internal state
              and a candidate projection. Its floor is the worst-case
              unresolved distance between a query and the best candidate
              its own internal state permits. Every bounded receiver has a
              strictly positive floor — a counting fact about maps between
              finite sets, not an engineering defect.
            </p>
          </div>
          <p className={`aside ${step < 1 ? "dim" : ""}`} data-step={1}>
            Federation takes the <em>union</em> of candidate sets: a query
            on which one member is precise benefits the whole federation
            even if the others are not. The floor of a federation is at
            most the minimum floor of its constituents, strictly less
            under non-redundancy — measured here across federation size 1
            through 5.
          </p>
        </div>
        <div>
          <D3Chart id="c-federation-abs" draw={drawFederation} />
          <div className="controls">
            <div id="fed-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide04Federation;
