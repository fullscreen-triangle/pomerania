import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

type Cat = { name: string; prov: string; target: "A"; tru: boolean };

const PROV = ["verified", "told", "inferred", "overheard"];
const DEFAULT_CATS: Cat[] = [
  { name: "c₁", prov: "verified", target: "A", tru: true },
  { name: "c₂", prov: "told", target: "A", tru: false },
  { name: "c₃", prov: "inferred", target: "A", tru: true },
  { name: "c₄", prov: "overheard", target: "A", tru: false },
];

function drawBlind(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 330;
  let cats: Cat[] = DEFAULT_CATS.map((c) => ({ ...c }));

  function draw() {
    const s = mountSvg(el, w, h);
    s.append("circle")
      .attr("cx", 430)
      .attr("cy", 130)
      .attr("r", 52)
      .attr("fill", C.k1)
      .attr("opacity", 0.16)
      .attr("stroke", C.k1)
      .attr("stroke-width", 2);
    s.append("text")
      .attr("x", 430)
      .attr("y", 137)
      .attr("text-anchor", "middle")
      .attr("font-size", 22)
      .attr("fill", C.k1)
      .text("A");
    cats.forEach((c, i) => {
      const y = 60 + i * 54;
      s.append("line")
        .attr("x1", 130)
        .attr("y1", y)
        .attr("x2", 378)
        .attr("y2", 130)
        .attr("stroke", C.k1)
        .attr("stroke-width", 2)
        .attr("opacity", 0.5);
      s.append("text")
        .attr("x", 30)
        .attr("y", y + 4)
        .text(c.name)
        .attr("font-size", 13)
        .attr("fill", C.ink);
      s.append("text")
        .attr("x", 62)
        .attr("y", y + 4)
        .text(c.prov)
        .attr("font-size", 12)
        .attr("fill", C.ink2);
      s.append("circle")
        .attr("cx", 120)
        .attr("cy", y - 4)
        .attr("r", 6)
        .attr("fill", c.tru ? C.good : C.bad);
    });
    s.append("circle").attr("cx", 36).attr("cy", 296).attr("r", 5).attr("fill", C.good);
    s.append("text")
      .attr("x", 48)
      .attr("y", 300)
      .text("true")
      .attr("font-size", 11.5)
      .attr("fill", C.ink3);
    s.append("circle").attr("cx", 96).attr("cy", 296).attr("r", 5).attr("fill", C.bad);
    s.append("text")
      .attr("x", 108)
      .attr("y", 300)
      .text("false")
      .attr("font-size", 11.5)
      .attr("fill", C.ink3);
    const nFalse = cats.filter((c) => !c.tru).length;
    const readout = scope.querySelector<HTMLElement>("#blind-readout");
    if (readout)
      readout.innerHTML =
        `all resolutions → A · <b style="color:${C.good}">CLOSED → commits</b><br>` +
        `<span style="color:${C.ink3}">${nFalse} of 4 catalysts are false — verdict unchanged</span>`;
  }

  draw();
  const shuffleBtn = scope.querySelector<HTMLButtonElement>("#shuffle-prov");
  const flipBtn = scope.querySelector<HTMLButtonElement>("#flip-truth");
  const resetBtn = scope.querySelector<HTMLButtonElement>("#blind-reset");
  if (shuffleBtn)
    shuffleBtn.onclick = () => {
      const p = d3.shuffle(PROV.slice());
      cats.forEach((c, i) => (c.prov = p[i]));
      draw();
    };
  if (flipBtn)
    flipBtn.onclick = () => {
      cats.forEach((c) => (c.tru = !c.tru));
      draw();
    };
  if (resetBtn)
    resetBtn.onclick = () => {
      cats = DEFAULT_CATS.map((c) => ({ ...c }));
      draw();
    };
}

const Slide15Blindness: SlideDef = {
  title: "Closure is blind",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>The condition cannot read where anything came from</h2>
      <div className="two-col">
        <div>
          <p>
            Closure is stated in terms of <em>what resolves where</em>.
            Provenance — verified, told, inferred, overheard — appears
            nowhere in it.
          </p>

          <p data-step={0}>
            Shuffle the provenance labels. Watch the closure verdict.
          </p>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Provenance-blindness.</b> Relabel freely: reach and closure
            are unchanged.
            <div className="sub">
              The instructor and the passenger commit identically — not by
              coincidence, but because the difference between them is a
              label no operation reads.
            </div>
          </div>

          <p className={`hl ${step < 2 ? "dim" : ""}`} data-step={2}>
            Now flip <em>truth</em> instead. Same result.
          </p>

          <div className={`boxed danger ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>Truth-blindness.</b> Substituting false catalysts for true
            ones, with resolutions unchanged, changes nothing.
            <div className="sub">
              Correctness is not a term in the coordination law.
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-blind" draw={drawBlind} />
          <div className="controls">
            <button id="shuffle-prov">Shuffle provenance</button>
            <button id="flip-truth">Flip truth values</button>
            <button id="blind-reset">Reset</button>
          </div>
          <div id="blind-readout" className="readout" />
        </div>
      </div>
    </>
  ),
};

export default Slide15Blindness;
