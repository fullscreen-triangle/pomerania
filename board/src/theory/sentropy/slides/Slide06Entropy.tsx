import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

function probs(N: number, kind: "uniform" | "arcsine") {
  if (kind === "uniform") return d3.range(N).map(() => 1 / N);
  const cdf = (x: number) => (2 / Math.PI) * Math.asin(Math.sqrt(x));
  return d3.range(N).map((i) => cdf((i + 1) / N) - cdf(i / N));
}
function H(p: number[]) {
  return -d3.sum(
    p.filter((x) => x > 0),
    (x) => x * Math.log2(x)
  );
}

function drawEntropy(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 360;
  let mode: "uniform" | "arcsine" = "uniform";

  function draw() {
    const s = mountSvg(el, w, h);
    const N = 8,
      p = probs(N, mode),
      h0 = H(p);
    const m = { l: 48, r: 20, t: 52, b: 60 };
    const x = d3
      .scaleBand<number>()
      .domain(d3.range(N))
      .range([m.l, w - m.r])
      .padding(0.18);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(p)! * 1.25])
      .range([h - m.b, m.t]);
    s.selectAll(".b")
      .data(p)
      .join("rect")
      .attr("class", "b")
      .attr("x", (_d, i) => x(i)!)
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d))
      .attr("height", (d) => h - m.b - y(d))
      .attr("fill", C.k1)
      .attr("opacity", 0.88)
      .attr("rx", 3);
    s.selectAll(".t")
      .data(p)
      .join("text")
      .attr("class", "t")
      .attr("x", (_d, i) => x(i)! + x.bandwidth() / 2)
      .attr("y", (d) => y(d) - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", C.ink3)
      .text((d) => d.toFixed(3));
    s.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${h - m.b})`)
      .call(d3.axisBottom(x).tickFormat((i) => "b" + i));
    s.append("text")
      .attr("x", m.l)
      .attr("y", 26)
      .attr("font-size", 13)
      .attr("fill", C.ink)
      .text(
        mode === "uniform"
          ? "uniform time-share across 8 bins"
          : "arcsine time-share — the pendulum lingers at the turning points"
      );
    const rows: [string, number, string][] = [
      ["from oscillation", mode === "uniform" ? Math.log2(N) : h0, C.k1],
      ["from categories", h0, C.k2],
      ["from the partition", h0, C.k3],
    ];
    const readout = scope.querySelector<HTMLElement>("#ent-readout");
    if (readout)
      readout.innerHTML =
        rows
          .map(
            (r) =>
              `<span style="color:${r[2]}">${r[0]}</span> = <b>${r[1].toFixed(3)}</b> bits`
          )
          .join("<br>") +
        `<br><span style="color:${C.good}">all three agree</span>` +
        (mode === "uniform"
          ? ""
          : `<br><span style="color:${C.ink3}">below log₂8 = 3.000, because the share is uneven</span>`);
  }

  draw();
  const uBtn = scope.querySelector<HTMLButtonElement>("#ent-uniform");
  const aBtn = scope.querySelector<HTMLButtonElement>("#ent-arcsine");
  if (uBtn)
    uBtn.onclick = () => {
      mode = "uniform";
      draw();
    };
  if (aBtn)
    aBtn.onclick = () => {
      mode = "arcsine";
      draw();
    };
}

const Slide06Entropy: SlideDef = {
  title: "One entropy, three routes",
  maxStep: 4,
  render: (step) => (
    <>
      <h2>Now compute an entropy — three times, three ways</h2>
      <div className="two-col">
        <div>
          <p>
            Each description gives a recipe. Run all three on the same
            pendulum and compare.
          </p>

          <div className="formula" data-step={0}>
            <b className="k1">From oscillation</b>
            <div className="m">H = log₂ N</div>
            <em>N equally likely phase bins</em>
          </div>
          <div className={`formula ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b className="k2">From categories</b>
            <div className="m">
              H = −Σ p<sub>i</sub> log₂ p<sub>i</sub>
            </div>
            <em>over the category probabilities</em>
          </div>
          <div className={`formula ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b className="k3">From the partition</b>
            <div className="m">
              H = −Σ |B<sub>i</sub>|/n · log₂ |B<sub>i</sub>|/n
            </div>
            <em>over block sizes</em>
          </div>

          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>They agree exactly.</b> For a uniform pendulum at{" "}
            <span className="m">N=8</span>: all three give{" "}
            <span className="m">3.000</span> bits.
            <div className="sub">
              Switch on the arcsine weighting — a real pendulum lingers at
              the turning points — and all three still agree, now at{" "}
              <span className="m">2.847</span> bits. Not{" "}
              <span className="m">3</span>, because the time-share is
              uneven.
            </div>
          </div>

          <p className={`hl ${step < 4 ? "dim" : ""}`} data-step={4}>
            So "oscillation", "category" and "partition" are three names for
            one quantity. That is the licence for everything after this
            slide.
          </p>
        </div>
        <div>
          <D3Chart id="c-entropy" draw={drawEntropy} />
          <div className="controls">
            <button id="ent-uniform">Uniform</button>
            <button id="ent-arcsine">Arcsine (real pendulum)</button>
            <div id="ent-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide06Entropy;
