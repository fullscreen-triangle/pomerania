import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";

function drawBits(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 300,
    margin = { top: 20, right: 20, bottom: 36, left: 54 };

  function render(p: number) {
    const s = mountSvg(el, w, h);
    const D0 = 1;
    const R = Array.from({ length: 13 }, (_, i) => i);
    const vals = R.map((r) => (D0 / 2) * Math.pow(2, -p * r));
    const maxLog = Math.log10(vals[0]);
    const minLog = Math.log10(vals[vals.length - 1]);
    const toX = (r: number) => margin.left + (r / 12) * (w - margin.left - margin.right);
    const toY = (v: number) => {
      const lv = Math.log10(v);
      return h - margin.bottom - ((lv - minLog) / (maxLog - minLog)) * (h - margin.top - margin.bottom);
    };

    const line = "M" + R.map((r, i) => `${toX(r)},${toY(vals[i])}`).join("L");
    s.append("path").attr("d", line).attr("fill", "none").attr("stroke", C.k1).attr("stroke-width", 2.2);
    s.selectAll(".pt").data(R).join("circle").attr("class", "pt").attr("cx", (r) => toX(r)).attr("cy", (_, i) => toY(vals[i])).attr("r", 3.5).attr("fill", C.k1);

    s.append("text").attr("x", margin.left).attr("y", 14).attr("font-size", 11).attr("fill", C.ink3).text(`D(R) = (D₀/2)·2^(-${p}R)   —   ratio D(R)/D(R+1) = 2^${p} = ${Math.pow(2, p)}`);

    const readout = scope.querySelector<HTMLElement>("#rd-readout");
    if (readout)
      readout.innerHTML =
        `p = ${p} &nbsp;·&nbsp; each bit divides loss by <b style="color:${C.good}">${Math.pow(2, p)}×</b><br>` +
        `<span style="color:${C.ink3}">p=1 Lipschitz (2×/bit) · p=2 quadratic (4×/bit, 6dB) · p=4 quartic (16×/bit)</span>`;
  }

  render(2);
  for (const p of [1, 2, 4]) {
    const btn = scope.querySelector<HTMLButtonElement>(`#rd-p${p}`);
    if (btn) btn.onclick = () => render(p);
  }
}

const Slide07RateDistortion: SlideDef = {
  title: "One bit buys 2^p",
  maxStep: 0,
  render: () => (
    <>
      <h2>Reading the bound as rate–distortion</h2>
      <div className="two-col">
        <div>
          <p>
            Writing N = 2^R makes the bit-budget explicit:{" "}
            𝒟(R) = (c/2)Dᵖ·2^(−pR), so 𝒟(R)/𝒟(R+1) = 2ᵖ exactly. This is
            the number a designer can compare directly against an
            instrument's purchase price.
          </p>
          <p className="aside">
            This differs from Shannon's classical rate–distortion: it's
            worst-case not expected, a hard cardinality constraint rather
            than a mutual-information one, and its distortion is derived
            from the decision problem itself — γ assigns zero to pairs
            wanting the same action, which no difference-based measure
            does. And by the saturation theorem, once N reaches the
            number of distinct optimal actions, further bits buy nothing:
            reposition cells, don't add them.
          </p>
        </div>
        <div>
          <D3Chart id="c-bits" draw={drawBits} />
          <div className="controls">
            <button id="rd-p1">p = 1 (Lipschitz)</button>
            <button id="rd-p2">p = 2 (quadratic)</button>
            <button id="rd-p4">p = 4 (quartic)</button>
            <div id="rd-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide07RateDistortion;
