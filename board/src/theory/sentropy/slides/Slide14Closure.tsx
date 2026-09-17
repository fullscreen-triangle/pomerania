import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

type Cat = { id: number; name: string; target: "A" | "B"; on: boolean };

function drawClosure(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 330;
  const cats: Cat[] = [
    { id: 0, name: "engineering study", target: "A", on: true },
    { id: 1, name: "cost model", target: "A", on: true },
    { id: 2, name: "lake ecology", target: "B", on: false },
  ];

  function draw() {
    const s = mountSvg(el, w, h);
    const regions: Record<"A" | "B", { x: number; y: number; col: string }> = {
      A: { x: 200, y: 120, col: C.k1 },
      B: { x: 440, y: 120, col: C.k3 },
    };
    (Object.entries(regions) as ["A" | "B", { x: number; y: number; col: string }][]).forEach(
      ([k, r]) => {
        s.append("circle")
          .attr("cx", r.x)
          .attr("cy", r.y)
          .attr("r", 46)
          .attr("fill", r.col)
          .attr("opacity", 0.16)
          .attr("stroke", r.col)
          .attr("stroke-width", 2);
        s.append("text")
          .attr("x", r.x)
          .attr("y", r.y + 6)
          .attr("text-anchor", "middle")
          .attr("font-size", 20)
          .attr("fill", r.col)
          .text(k);
      }
    );
    cats.forEach((c, i) => {
      const y = 235 + i * 30,
        r = regions[c.target];
      s.append("line")
        .attr("x1", 70)
        .attr("y1", y)
        .attr("x2", r.x)
        .attr("y2", r.y + 50)
        .attr("stroke", c.on ? r.col : C.line)
        .attr("stroke-width", c.on ? 2.2 : 1.2)
        .attr("stroke-dasharray", c.on ? null : "4 3");
      s.append("circle")
        .attr("cx", 60)
        .attr("cy", y)
        .attr("r", 7)
        .attr("fill", c.on ? r.col : "#fff")
        .attr("stroke", r.col)
        .attr("stroke-width", 2);
      s.append("text")
        .attr("x", 78)
        .attr("y", y + 4)
        .text(c.name)
        .attr("font-size", 12.5)
        .attr("fill", c.on ? C.ink : C.ink3);
      s.append("text")
        .attr("x", 250)
        .attr("y", y + 4)
        .text(c.on ? "invoked" : "available, not invoked")
        .attr("font-size", 11.5)
        .attr("fill", C.ink3);
    });
    const invoked = new Set(cats.filter((c) => c.on).map((c) => c.target));
    const all = new Set(cats.map((c) => c.target));
    const closed = invoked.size === all.size && [...all].every((t) => invoked.has(t));
    const readout = scope.querySelector<HTMLElement>("#closure-readout");
    if (readout)
      readout.innerHTML =
        `invoked reach = {${[...invoked].join(", ") || "—"}} · ` +
        `available reach = {${[...all].join(", ")}}<br>` +
        (closed
          ? `<b style="color:${C.good}">CLOSED → commits</b>`
          : `<b style="color:${C.bad}">NOT CLOSED → no commitment</b> ` +
            `<span style="color:${C.ink3}">(confidence in A is maximal regardless)</span>`);
  }

  const box = scope.querySelector<HTMLElement>("#closure-controls");
  if (box) {
    box.innerHTML = "";
    cats.forEach((c) => {
      const b = document.createElement("button");
      b.textContent = `toggle: ${c.name}`;
      b.onclick = () => {
        c.on = !c.on;
        draw();
      };
      box.appendChild(b);
    });
  }
  draw();
}

const Slide14Closure: SlideDef = {
  title: "Commitment is closure",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>When does an agent actually commit?</h2>
      <div className="two-col">
        <div>
          <p>
            Not when confidence passes a threshold. When{" "}
            <b>nothing available could change the answer</b>.
          </p>

          <div className="boxed" data-step={0}>
            <b>Closure.</b> Every catalyst still available resolves into a
            region already reached.
          </div>

          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Toggle the catalysts. Two point at <span className="k1">A</span>,
            one at <span className="k3">B</span>. Confidence in{" "}
            <span className="k1">A</span> is maximal either way.
          </p>

          <p className={`hl ${step < 2 ? "dim" : ""}`} data-step={2}>
            With the third one available and uninvoked, the region is{" "}
            <b>not closed</b> — so there is no commitment, however confident
            you are.
          </p>

          <p className={step < 3 ? "dim" : ""} data-step={3}>
            This is strictly stronger than any threshold. No value of θ
            rescues it.
          </p>
        </div>
        <div>
          <D3Chart id="c-closure" draw={drawClosure} />
          <div className="controls" id="closure-controls" />
          <div id="closure-readout" className="readout" />
        </div>
      </div>
    </>
  ),
};

export default Slide14Closure;
