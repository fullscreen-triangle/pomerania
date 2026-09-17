import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

function drawPilot(el: HTMLDivElement) {
  const w = 620,
    h = 380;
  const s = mountSvg(el, w, h);
  const agents = [
    {
      name: "Flight instructor",
      y: 70,
      ev: [
        { l: "evaluated the pilot personally", v: 1 },
        { l: "reviewed the logbook", v: 1 },
        { l: "watched the check ride", v: 1 },
      ],
    },
    {
      name: "Passenger",
      y: 210,
      ev: [
        { l: "saw the airline's name", v: 1 },
        { l: "assumes certification exists", v: 1 },
        { l: "has flown before", v: 1 },
      ],
    },
  ];
  agents.forEach((a, ai) => {
    s.append("text")
      .attr("x", 0)
      .attr("y", a.y - 16)
      .text(a.name)
      .attr("font-size", 14)
      .attr("font-weight", 600)
      .attr("fill", C.ink);
    a.ev.forEach((e, i) => {
      const y = a.y + i * 26;
      s.append("rect")
        .attr("x", 0)
        .attr("y", y)
        .attr("width", 0)
        .attr("height", 16)
        .attr("rx", 3)
        .attr("fill", ai === 0 ? C.k1 : C.k3)
        .attr("opacity", 0.85)
        .transition()
        .delay(300 + i * 140 + ai * 420)
        .duration(520)
        .attr("width", 200);
      s.append("text")
        .attr("x", 210)
        .attr("y", y + 12)
        .text(e.l)
        .attr("font-size", 12.5)
        .attr("fill", C.ink2)
        .attr("opacity", 0)
        .transition()
        .delay(400 + i * 140 + ai * 420)
        .duration(400)
        .attr("opacity", 1);
    });
  });
  const oy = 330;
  s.append("line")
    .attr("x1", 0)
    .attr("x2", w)
    .attr("y1", oy - 22)
    .attr("y2", oy - 22)
    .attr("stroke", C.line);
  s.append("text")
    .attr("x", 0)
    .attr("y", oy)
    .text("Outcome")
    .attr("font-size", 14)
    .attr("font-weight", 600)
    .attr("fill", C.ink);
  ([
    ["boards", 150, C.k1],
    ["boards", 320, C.k3],
  ] as const).forEach(([t, x, col]) => {
    s.append("rect")
      .attr("x", x)
      .attr("y", oy - 16)
      .attr("width", 110)
      .attr("height", 24)
      .attr("rx", 4)
      .attr("fill", col)
      .attr("opacity", 0)
      .transition()
      .delay(1500)
      .duration(600)
      .attr("opacity", 0.92);
    s.append("text")
      .attr("x", x + 55)
      .attr("y", oy + 1)
      .text(t)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", "#0e1620")
      .attr("opacity", 0)
      .transition()
      .delay(1650)
      .duration(400)
      .attr("opacity", 1);
  });
  s.append("text")
    .attr("x", 450)
    .attr("y", oy + 1)
    .text("identical")
    .attr("font-size", 13)
    .attr("font-style", "italic")
    .attr("fill", C.ink3)
    .attr("opacity", 0)
    .transition()
    .delay(2000)
    .duration(500)
    .attr("opacity", 1);
}

const Slide02Question: SlideDef = {
  title: "The question",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Start with something ordinary</h2>
      <div className="two-col">
        <div>
          <div className="story" data-step={0}>
            <h3>A passenger boards a plane</h3>
            <p>
              She has never met the pilot, has not seen the maintenance logs,
              and could not read them if she had. She sits down.
            </p>
          </div>
          <div className={`story ${step < 1 ? "dim" : ""}`} data-step={1}>
            <h3>So does the flight instructor</h3>
            <p>
              The one who certified that pilot. He has personally verified
              everything she has not.
            </p>
          </div>
          <div className={`story ${step < 2 ? "dim" : ""}`} data-step={2}>
            <h3>They do exactly the same thing</h3>
            <p>
              Their epistemic positions could hardly differ more. Their
              action does not differ at all.
            </p>
          </div>
          <div className={`punch ${step < 3 ? "dim" : ""}`} data-step={3}>
            <p>
              Whatever governs <em>boarding</em> cannot be reading what
              either of them knows.
            </p>
          </div>
        </div>
        <div>
          <D3Chart id="c-pilot" draw={drawPilot} />
          <p className="cap">
            Two agents, disjoint evidence, identical commitment. The bars are
            what each has verified; the outcome is the same.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide02Question;
