import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { relax } from "../quiescence";

function drawQuiescence(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 290,
    margin = { top: 16, right: 16, bottom: 30, left: 50 };

  function render(convergent: boolean) {
    const s = mountSvg(el, w, h);
    const a0 = [1, 2, 3];
    const b0 = convergent ? [1.4, 2.3, 3.2] : [4, 1, 5];
    const pa0 = [0, 0, 0];
    const pb0 = convergent ? [0.2, 0.1, 0.1] : [3, 3, 3];

    const result = relax(a0, b0, pa0, pb0, 0.05, 40, !convergent);
    const maxY = Math.max(...result.steps.map((s2) => s2.maxResidual), 0.1);
    const toX = (i: number) => margin.left + (i / Math.max(1, result.steps.length - 1)) * (w - margin.left - margin.right);
    const toY = (v: number) => h - margin.bottom - (v / maxY) * (h - margin.top - margin.bottom);

    s.append("line")
      .attr("x1", margin.left)
      .attr("x2", w - margin.right)
      .attr("y1", toY(0.05))
      .attr("y2", toY(0.05))
      .attr("stroke", C.ink3)
      .attr("stroke-dasharray", "4,3");

    const line = (key: "central" | "provoked") =>
      "M" + result.steps.map((st, i) => `${toX(i)},${toY(st[key])}`).join("L");

    s.append("path").attr("d", line("central")).attr("fill", "none").attr("stroke", C.k1).attr("stroke-width", 2);
    s.append("path").attr("d", line("provoked")).attr("fill", "none").attr("stroke", C.k2).attr("stroke-width", 2);

    const readout = scope.querySelector<HTMLElement>("#verif-readout");
    if (readout)
      readout.innerHTML = result.quiescent
        ? `quiescent after ${result.steps.length} round(s): central=${result.finalCentral.toFixed(3)}, provoked=${result.finalProvoked.toFixed(3)}<br><span style="color:${C.good}">agreement certified without either receiver disclosing internal state</span>`
        : `declined after ${result.steps.length} rounds: central=${result.finalCentral.toFixed(3)}, provoked=${result.finalProvoked.toFixed(3)}<br><span style="color:${C.bad}">residual bounded away from zero — non-quiescence reported honestly, not silently resolved</span>`;
  }

  render(true);
  const cBtn = scope.querySelector<HTMLButtonElement>("#verif-conv");
  const dBtn = scope.querySelector<HTMLButtonElement>("#verif-decl");
  if (cBtn) cBtn.onclick = () => render(true);
  if (dBtn) dBtn.onclick = () => render(false);
}

const Slide07Verification: SlideDef = {
  title: "Verification without disclosure",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>The verifier is itself a receiver</h2>
      <div className="two-col">
        <div>
          <p>
            Two receivers with incommensurable internal representations —
            an opaque pair — certify agreement via a four-column
            relaxation: central columns (their answers) and provoked
            columns (each receiver's own follow-up on its own answer). By
            the Dichotomy Theorem, the relaxation either reaches
            quiescence in finitely many rounds or the residual stays
            bounded away from zero — no third outcome.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            The paper's principal new result: this relaxation, run to
            quiescence or declared non-convergence, is <em>itself</em> a
            bounded receiver with an explicit floor
            floor(R_AB) ≤ floor(A) + floor(B) + η_AB. Verification is not
            an oracle standing outside the compositional calculus — it is
            an ordinary federation member, routable and further
            verifiable by the same machinery, all the way up a tree of
            verification receivers to one architecture-level floor.
          </p>
        </div>
        <div>
          <D3Chart id="c-quiescence" draw={drawQuiescence} />
          <div className="controls">
            <button id="verif-conv">Convergent pair</button>
            <button id="verif-decl">Declining pair</button>
            <div id="verif-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide07Verification;
