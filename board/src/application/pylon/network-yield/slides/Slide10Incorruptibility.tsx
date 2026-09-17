import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

// System diagram (Def. 8.1, 8.2, Thm. 8.3): the monitoring payload channel
// has no path to the action channel except through the cell-partition map.
function drawArchitecture(el: HTMLDivElement) {
  const w = 620,
    h = 360;
  const s = mountSvg(el, w, h);

  s.append("defs")
    .append("marker")
    .attr("id", "arrow-arch")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerWidth", 7)
    .attr("markerHeight", 7)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z")
    .attr("fill", C.ink3);

  type Box = { id: string; x: number; y: number; w: number; h: number; label: string; sub?: string; color: string };
  const boxes: Box[] = [
    { id: "monitor", x: 40, y: 40, w: 140, h: 56, label: "Monitor ℳ", color: C.k1 },
    { id: "cellmap", x: 240, y: 40, w: 140, h: 56, label: "cell ∘ S", sub: "the only path", color: C.k3 },
    { id: "scheduler", x: 440, y: 40, w: 140, h: 56, label: "Scheduler A(·)", color: C.k1 },
    { id: "action", x: 440, y: 150, w: 140, h: 56, label: "Action channel", sub: "cell indices only", color: C.good },
    { id: "payload", x: 40, y: 150, w: 140, h: 56, label: "Payload channel", sub: "raw data, metadata", color: C.bad },
    { id: "counter", x: 240, y: 260, w: 340, h: 56, label: "M(t): committed-step counter", sub: "monotone, never decrements", color: C.k4 },
  ];

  boxes.forEach((b) => {
    s.append("rect")
      .attr("x", b.x)
      .attr("y", b.y)
      .attr("width", b.w)
      .attr("height", b.h)
      .attr("rx", 7)
      .attr("fill", C.panel)
      .attr("stroke", b.color)
      .attr("stroke-width", 1.8);
    s.append("text")
      .attr("x", b.x + b.w / 2)
      .attr("y", b.y + (b.sub ? 24 : 32))
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", C.ink)
      .text(b.label);
    if (b.sub)
      s.append("text")
        .attr("x", b.x + b.w / 2)
        .attr("y", b.y + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", 10.5)
        .attr("fill", C.ink3)
        .text(b.sub);
  });

  function connect(fromId: string, toId: string, color: string, dashed = false) {
    const a = boxes.find((b) => b.id === fromId)!;
    const b = boxes.find((b2) => b2.id === toId)!;
    const x1 = a.x + a.w;
    const y1 = a.y + a.h / 2;
    const x2 = b.x;
    const y2 = b.y + b.h / 2;
    s.append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", dashed ? "4 3" : null)
      .attr("marker-end", "url(#arrow-arch)");
  }

  // monitor -> cell map (legitimate: only cell index survives)
  connect("monitor", "cellmap", C.k3);
  // cell map -> scheduler
  connect("cellmap", "scheduler", C.k3);
  // scheduler -> action channel
  s.append("line")
    .attr("x1", 510)
    .attr("y1", 96)
    .attr("x2", 510)
    .attr("y2", 150)
    .attr("stroke", C.good)
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrow-arch)");

  // payload channel -> blocked, NOT connected to action channel directly
  s.append("line")
    .attr("x1", 180)
    .attr("y1", 178)
    .attr("x2", 300)
    .attr("y2", 178)
    .attr("stroke", C.bad)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5 4");
  s.append("text")
    .attr("x", 240)
    .attr("y", 168)
    .attr("text-anchor", "middle")
    .attr("font-size", 18)
    .attr("fill", C.bad)
    .text("✕");
  s.append("text")
    .attr("x", 240)
    .attr("y", 200)
    .attr("text-anchor", "middle")
    .attr("font-size", 10.5)
    .attr("fill", C.bad)
    .text("no direct path");

  // payload -> monitor (payload arrives alongside observation, gets discarded before cell map)
  s.append("line")
    .attr("x1", 110)
    .attr("y1", 150)
    .attr("x2", 110)
    .attr("y2", 96)
    .attr("stroke", C.ink3)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3 3")
    .attr("marker-end", "url(#arrow-arch)");

  // action channel -> counter
  connect("action", "counter", C.k4);

  s.append("text")
    .attr("x", w / 2)
    .attr("y", 340)
    .attr("text-anchor", "middle")
    .attr("font-size", 11.5)
    .attr("fill", C.ink3)
    .text("payload can only influence the action by crossing a cell boundary (≥ β/2) — a legitimate state transition");
}

const Slide10Incorruptibility: SlideDef = {
  title: "Structural incorruptibility",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>The payload channel has no path to the action channel</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3 className="k1">Payload vs. action channel (Def. 8.1, 8.2)</h3>
            <p>
              The monitoring payload channel carries raw measurements,
              diagnostics, metadata — anything beyond the cell index. The
              action channel carries only the sequence of assignments
              A(cell(·)).
            </p>
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>Structural incorruptibility</b> (Theorem 8.3): (i) the action
            channel carries only cell indices, never raw payloads; (ii) the
            cell-partition map is the <em>only</em> path from monitor to
            scheduler; (iii) a payload can influence the action only by
            crossing a cell boundary (≥ β/2 change) — a legitimate,
            detectable state transition, not injected data; (iv) the
            committed-step counter M(t) is monotone non-decreasing, giving
            replay resistance without cryptography.
          </div>
          <div className={`defn ${step < 2 ? "dim" : ""}`} data-step={2}>
            <h3 className="k2">Monitor-control separation (Thm. 4.11)</h3>
            <p>
              A subsystem acting on its own observations cannot
              simultaneously be an unbiased monitor of what it controls —
              any τ-precise action induces a selection bias of at least β.
              Monitoring and control must be architecturally separate.
            </p>
          </div>
          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            This is not an added safeguard — it falls out of the
            cell-partition architecture itself. The scheduler literally
            cannot receive more than a cell index, because that's the only
            thing the lookup table A(·) accepts as input.
          </div>
        </div>
        <div>
          <D3Chart id="c-architecture" draw={drawArchitecture} />
          <p className="cap">
            The payload channel (red) has no direct edge into the action
            channel — every legitimate influence must traverse the
            cell-partition map, which quantises it to one of N cell indices.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide10Incorruptibility;
