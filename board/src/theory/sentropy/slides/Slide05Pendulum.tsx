import * as d3 from "d3";
import type { SlideDef } from "../deckTypes";
import D3Chart from "../D3Chart";
import { C, mountSvg } from "../chartUtils";

function drawPendulum(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 380;

  function draw(N: number, t: number) {
    const s = mountSvg(el, w, h);
    const cx = 150,
      cy = 60,
      L = 150,
      amp = Math.PI / 3;
    const ph = t / 100;
    const th = amp * Math.sin(2 * Math.PI * ph);
    const bx = cx + L * Math.sin(th),
      by = cy + L * Math.cos(th);
    const arc = d3
      .range(-amp, amp, 0.02)
      .map((a) => [cx + L * Math.sin(a), cy + L * Math.cos(a)] as [number, number]);
    s.append("path")
      .attr("d", d3.line()(arc))
      .attr("fill", "none")
      .attr("stroke", C.line)
      .attr("stroke-width", 1.4)
      .attr("stroke-dasharray", "3 3");
    s.append("line")
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", bx)
      .attr("y2", by)
      .attr("stroke", C.ink2)
      .attr("stroke-width", 2);
    s.append("circle").attr("cx", bx).attr("cy", by).attr("r", 13).attr("fill", C.k1);
    s.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 4).attr("fill", C.ink2);

    const bin = Math.floor(ph * N) % N;
    const ox = 420,
      oy = 95,
      R = 52;
    s.append("circle")
      .attr("cx", ox)
      .attr("cy", oy)
      .attr("r", R)
      .attr("fill", "none")
      .attr("stroke", C.line)
      .attr("stroke-width", 1.5);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * 2 * Math.PI - Math.PI / 2;
      s.append("line")
        .attr("x1", ox + Math.cos(a) * (R - 7))
        .attr("y1", oy + Math.sin(a) * (R - 7))
        .attr("x2", ox + Math.cos(a) * R)
        .attr("y2", oy + Math.sin(a) * R)
        .attr("stroke", C.ink3)
        .attr("stroke-width", 1);
    }
    const pa = ph * 2 * Math.PI - Math.PI / 2;
    s.append("line")
      .attr("x1", ox)
      .attr("y1", oy)
      .attr("x2", ox + Math.cos(pa) * (R - 9))
      .attr("y2", oy + Math.sin(pa) * (R - 9))
      .attr("stroke", C.k1)
      .attr("stroke-width", 2.6);
    s.append("text")
      .attr("x", ox)
      .attr("y", oy + R + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", C.k1)
      .text("oscillatory");

    const bxs = 40,
      bys = 250,
      bw = Math.min(34, 540 / N - 4);
    for (let i = 0; i < N; i++) {
      s.append("rect")
        .attr("x", bxs + i * (bw + 4))
        .attr("y", bys)
        .attr("width", bw)
        .attr("height", 30)
        .attr("rx", 4)
        .attr("fill", i === bin ? C.k2 : C.panel)
        .attr("stroke", C.k2)
        .attr("stroke-width", 1.4);
    }
    s.append("text")
      .attr("x", bxs)
      .attr("y", bys - 9)
      .attr("font-size", 12)
      .attr("fill", C.k2)
      .text("categorical — " + N + " mutually exclusive categories");

    const pys = 320,
      pw = 540;
    for (let i = 0; i < N; i++) {
      s.append("rect")
        .attr("x", bxs + i * (pw / N))
        .attr("y", pys)
        .attr("width", pw / N - 2)
        .attr("height", 26)
        .attr("fill", i === bin ? C.k3 : C.panel)
        .attr("stroke", C.k3)
        .attr("stroke-width", 1.2);
    }
    s.append("text")
      .attr("x", bxs)
      .attr("y", pys - 9)
      .attr("font-size", 12)
      .attr("fill", C.k3)
      .text("partition — the swing cut into " + N + " blocks");

    const readout = scope.querySelector<HTMLElement>("#pend-readout");
    if (readout)
      readout.innerHTML =
        `phase = <b>${ph.toFixed(3)}</b> → bin <b>${bin}</b> of ${N}` +
        `<br><span style="color:${C.ink3}">all three panels are showing the same fact</span>`;
  }

  const n = scope.querySelector<HTMLInputElement>("#pend-n");
  const t = scope.querySelector<HTMLInputElement>("#pend-t");
  const u = () => draw(Number(n?.value ?? 8), Number(t?.value ?? 20));
  if (n) n.oninput = u;
  if (t) t.oninput = u;
  u();
}

const Slide05Pendulum: SlideDef = {
  title: "A pendulum, three ways",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>One pendulum. Three descriptions. Same content</h2>
      <div className="two-col">
        <div>
          <p>
            Take a swinging pendulum and resolve its swing into{" "}
            <span className="m">N = 8</span> bins. There are three ways to
            say what state it is in, and they are the <em>same</em>{" "}
            statement. Below is one worked example; move the sliders and all
            three panels change together.
          </p>

          <div className="boxed" data-step={0}>
            <b className="k1">Oscillatory.</b> A phase on the circle:{" "}
            <span className="m">0.375</span> of the way through the cycle.
          </div>
          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b className="k2">Categorical.</b> One of 8 mutually exclusive
            categories: it is in category <span className="m">3</span>.
          </div>
          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b className="k3">Partition.</b> A block of a partition of the
            swing: it is in block <span className="m">3</span>.
          </div>

          <div className={`boxed ${step < 3 ? "dim" : ""}`} data-step={3}>
            <b>These are not analogies.</b> A phase resolved to{" "}
            <span className="m">N</span> bins <em>is</em> a category, and a
            set of categories covering the swing without overlap{" "}
            <em>is</em> a partition. Same object, three vocabularies.
            <div className="sub">
              The paper proves this as an equivalence of categories — with
              one correction: frequency and phase alone are <em>not</em>{" "}
              enough, you also need the modulation. Two different nests
              collide otherwise.
            </div>
          </div>
        </div>
        <div>
          <D3Chart id="c-pendulum" draw={drawPendulum} />
          <div className="controls">
            <label>
              Resolution <span className="m">N</span>
              <input type="range" id="pend-n" min={2} max={16} defaultValue={8} />
            </label>
            <label>
              Swing <input type="range" id="pend-t" min={0} max={100} defaultValue={20} />
            </label>
            <div id="pend-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide05Pendulum;
