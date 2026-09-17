import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

interface MiniSpec {
  rows: { l: string; v: number; c: string }[];
  foot: string;
}

function mini(el: HTMLDivElement, spec: MiniSpec) {
  const w = 300,
    h = 120;
  const s = mountSvg(el, w, h);
  spec.rows.forEach((r, i) => {
    const y = 22 + i * 30;
    s.append("text")
      .attr("x", 0)
      .attr("y", y + 4)
      .text(r.l)
      .attr("font-size", 11.5)
      .attr("fill", C.ink2);
    s.append("rect")
      .attr("x", 120)
      .attr("y", y - 8)
      .attr("height", 15)
      .attr("rx", 3)
      .attr("fill", r.c)
      .attr("width", 0)
      .transition()
      .delay(i * 160)
      .duration(520)
      .attr("width", r.v * 150);
  });
  s.append("text")
    .attr("x", 0)
    .attr("y", h - 6)
    .text(spec.foot)
    .attr("font-size", 11)
    .attr("fill", C.ink3);
}

const drawPilotMini = (el: HTMLDivElement) =>
  mini(el, {
    rows: [
      { l: "instructor reach", v: 1, c: C.k1 },
      { l: "passenger reach", v: 1, c: C.k3 },
      { l: "shared provenance", v: 0.001, c: C.bad },
    ],
    foot: "same reach, no shared route",
  });

const drawBakerMini = (el: HTMLDivElement) =>
  mini(el, {
    rows: [
      { l: "1 baker", v: 0.2, c: C.k1 },
      { l: "10 identical", v: 0.2, c: C.k1 },
      { l: "10 varied", v: 0.95, c: C.k3 },
    ],
    foot: "reach grows with variety, not count",
  });

const drawHydroMini = (el: HTMLDivElement) =>
  mini(el, {
    rows: [
      { l: "confidence", v: 1, c: C.k1 },
      { l: "closed", v: 0.001, c: C.bad },
      { l: "committed", v: 0.001, c: C.bad },
    ],
    foot: "maximal belief, no commitment",
  });

const Slide16Society: SlideDef = {
  title: "Why societies work",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Three ordinary things, now explained</h2>
      <div className="three-col">
        <div className="case" data-step={0}>
          <h3>The pilot</h3>
          <p>
            Instructor and passenger perform the <em>same individuation</em>{" "}
            by routes the condition cannot read.
          </p>
          <p className="verdict good">Both commit.</p>
          <D3Chart id="m-pilot" className="mini" draw={drawPilotMini} />
        </div>
        <div className={`case ${step < 1 ? "dim" : ""}`} data-step={1}>
          <h3>The baker</h3>
          <p>
            Sufficiency is the whole criterion. And ten identical bakers
            resolve exactly what one does — so "good bread" is not
            distinguished at all.
          </p>
          <p className="verdict good">Stable anyway.</p>
          <D3Chart id="m-baker" className="mini" draw={drawBakerMini} />
        </div>
        <div className={`case ${step < 2 ? "dim" : ""}`} data-step={2}>
          <h3>The hydrofoil</h3>
          <p>
            Everyone agrees it would work. One available consideration
            reaches somewhere else, so the region never closes.
          </p>
          <p className="verdict bad">Never built.</p>
          <D3Chart id="m-hydro" className="mini" draw={drawHydroMini} />
        </div>
      </div>

      <div className={`boxed wide ${step < 3 ? "dim" : ""}`} data-step={3}>
        A failure of closure is <b>not an event</b>. Nobody decided against
        the hydrofoil — which is exactly why nobody remembers deciding.
      </div>
    </>
  ),
};

export default Slide16Society;
