import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg, fmt } from "../chartUtils";

function drawNest(el: HTMLDivElement, scope: HTMLElement) {
  const s = mountSvg(el, 620, 290);

  function draw(n: number, l: number) {
    s.selectAll(".lvl").remove();
    const cx = 310,
      top = 40,
      gap = 44;
    for (let j = 0; j < n; j++) {
      const rw = 480 - j * 70,
        x = cx - rw / 2,
        y = top + j * gap;
      const g = s.append("g").attr("class", "lvl");
      g.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", rw)
        .attr("height", 34)
        .attr("rx", 5)
        .attr("fill", "none")
        .attr("stroke", C.k1)
        .attr("stroke-width", 1.8)
        .attr("opacity", 0)
        .transition()
        .delay(j * 90)
        .duration(400)
        .attr("opacity", 1);
      if (j < l) {
        g.append("line")
          .attr("x1", cx)
          .attr("x2", cx)
          .attr("y1", y)
          .attr("y2", y + 34)
          .attr("stroke", C.k2)
          .attr("stroke-width", 2.4)
          .attr("opacity", 0)
          .transition()
          .delay(j * 90 + 180)
          .duration(350)
          .attr("opacity", 1);
        g.append("text")
          .attr("x", x + rw + 12)
          .attr("y", y + 22)
          .text("articulated")
          .attr("font-size", 11)
          .attr("fill", C.k2);
      } else {
        g.append("text")
          .attr("x", x + rw + 12)
          .attr("y", y + 22)
          .text("descends only")
          .attr("font-size", 11)
          .attr("fill", C.ink3);
      }
    }
    const k = n - l,
      mRange = 2 * k + 1;
    const readout = scope.querySelector<HTMLElement>("#nest-readout");
    if (readout)
      readout.innerHTML =
        `depth n = <b class="k1" style="color:${C.k1}">${n}</b> · ` +
        `articulation ℓ = <b style="color:${C.k2}">${l}</b> · ` +
        `orientation range = <b style="color:${C.k3}">${k < 1 ? "—" : mRange + " values"}</b>` +
        `<br>${
          l >= n
            ? "<span style='color:" + C.bad + "'>ℓ = n: orientation degenerates — excluded</span>"
            : "S<sub>k</sub> = " + fmt((n - 1) / 8) + " · S<sub>t</sub> = " + fmt(l / n)
        }`;
  }

  const nn = scope.querySelector<HTMLInputElement>("#nest-n");
  const ll = scope.querySelector<HTMLInputElement>("#nest-l");
  const upd = () => {
    const n = Number(nn?.value ?? 3);
    if (ll) ll.max = String(n);
    draw(n, Math.min(Number(ll?.value ?? 1), n));
  };
  if (nn) nn.oninput = upd;
  if (ll) ll.oninput = upd;
  upd();
}

const Slide09WhyThree: SlideDef = {
  title: "Why exactly three",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>Nest the distinctions. Four things can be said — and only four</h2>
      <div className="two-col">
        <div>
          <p>
            Draw distinctions inside distinctions. Ask: what can be said
            about the result that does not depend on the <em>names</em> of
            the positions?
          </p>

          <ul className="invariants">
            <li data-step={0}>
              <b className="k1">Depth</b> <span className="m">n</span> — how
              many nested distinctions.
            </li>
            <li className={step < 1 ? "dim" : ""} data-step={1}>
              <b className="k2">Articulation</b> <span className="m">ℓ</span>{" "}
              — how many levels genuinely branch.
            </li>
            <li className={step < 2 ? "dim" : ""} data-step={2}>
              <b className="k3">Orientation</b> <span className="m">m</span>{" "}
              — the signed imbalance of that branching.
            </li>
            <li className={step < 3 ? "dim" : ""} data-step={3}>
              <b className="k4">Parity</b> <span className="m">s</span> —
              which side is taken as inside.
            </li>
          </ul>

          <div className={`boxed ${step < 4 ? "dim" : ""}`} data-step={4}>
            The first three are <b>graded</b> — they order, so each becomes
            an axis.
            <br />
            The fourth is <b>binary</b>: swapping inside for outside is an
            involution with no order, so it is a <em>sign</em>, not an axis.
            <div className="sub">
              <b>Three axes and a sign.</b> Not chosen — forced.
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-nest" draw={drawNest} />
          <div className="controls">
            <label>
              Depth <span className="m">n</span>
              <input type="range" id="nest-n" min={1} max={5} defaultValue={3} />
            </label>
            <label>
              Articulation <span className="m">ℓ</span>
              <input type="range" id="nest-l" min={0} max={4} defaultValue={1} />
            </label>
            <div id="nest-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide09WhyThree;
