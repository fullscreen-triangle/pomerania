import type { SlideDef } from "../../../../deck/deckTypes";
import D3Chart from "../../../../deck/D3Chart";
import { C, mountSvg } from "../../../../deck/chartUtils";

function drawMovement(el: HTMLDivElement) {
  const w = 620,
    h = 300;
  const s = mountSvg(el, w, h);
  const m = { l: 90, r: 90, t: 20, b: 40 };

  const data = [
    { l: "genomics", gb: 70 },
    { l: "proteomics", gb: 20 },
    { l: "microscopy", gb: 50 },
  ];
  const total = data.reduce((a, d) => a + d.gb, 0);

  const x = (i: number, acc: number[]) =>
    m.l + (acc[i] / total) * (w - m.l - m.r);

  let running = 0;
  const acc: number[] = [0];
  data.forEach((d) => {
    running += d.gb;
    acc.push(running);
  });

  s.selectAll(".bar")
    .data(data)
    .join("rect")
    .attr("x", (_d, i) => x(i, acc))
    .attr("y", 60)
    .attr("width", (_d, i) => x(i + 1, acc) - x(i, acc) - 2)
    .attr("height", 60)
    .attr("fill", (_d, i) => [C.k1, C.k2, C.k3][i])
    .attr("opacity", 0.85);

  s.selectAll(".lab")
    .data(data)
    .join("text")
    .attr("x", (_d, i) => (x(i, acc) + x(i + 1, acc)) / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("fill", C.ink2)
    .text((d) => `${d.l} (${d.gb} GB)`);

  s.append("text")
    .attr("x", w / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .attr("font-size", 13)
    .attr("fill", C.ink3)
    .text(`${total} GB moved`);

  // tiny sliver representing 10 KB extracted
  const sliverW = 2;
  s.append("rect")
    .attr("x", m.l)
    .attr("y", 170)
    .attr("width", sliverW)
    .attr("height", 30)
    .attr("fill", C.good);
  s.append("text")
    .attr("x", m.l + sliverW + 10)
    .attr("y", 190)
    .attr("font-size", 13)
    .attr("fill", C.good)
    .text("~10 KB actually relevant");

  s.append("text")
    .attr("x", w / 2)
    .attr("y", 240)
    .attr("text-anchor", "middle")
    .attr("font-size", 14)
    .attr("font-weight", 600)
    .attr("fill", C.bad)
    .text("ratio of data moved to information gained: ~10⁷ : 1");
}

const Slide02Problem: SlideDef = {
  title: "The problem",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>Three limits that share one cause</h2>
      <div className="two-col">
        <div>
          <div className="boxed" data-step={0}>
            <b>Data movement.</b> A multi-omic investigation touching 70 GB
            of genomics, 20 GB of proteomics, and 50 GB of microscopy moves
            over 140 GB to extract perhaps 10 KB of relevant information.
          </div>

          <div className={`boxed ${step < 1 ? "dim" : ""}`} data-step={1}>
            <b>The expertise bottleneck.</b> Translating a question into an
            executable analysis — spanning molecular biology, statistics,
            physiology, computation — is the rate-limiting step, and it
            cannot be parallelized or amortized.
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>The reproducibility crisis.</b> Over 70% of researchers
            cannot reproduce others' experiments; over 50% cannot reproduce
            their own. Methodology lives as implicit expert knowledge, not
            as an executable specification.
          </div>

          <p className={`aside ${step < 3 ? "dim" : ""}`} data-step={3}>
            All three share a common origin: the separation of data from
            understanding. Data is inert and moved; understanding is
            ephemeral and lost. The fix is to stop separating them.
          </p>
        </div>
        <div>
          <D3Chart id="c-movement" draw={drawMovement} />
          <p className="cap">
            A representative multi-omic investigation. Nearly all of what
            moves across the network is never relevant to the question
            asked.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide02Problem;
