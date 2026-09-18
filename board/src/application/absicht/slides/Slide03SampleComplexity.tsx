import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { validation } from "../validation";

function drawSampleComplexity(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 16, right: 16, bottom: 34, left: 46 };
  const s = mountSvg(el, w, h);
  const exp3 = validation.exp3;

  const maxN = Math.max(...exp3.N);
  const maxV = Math.max(...exp3.empirical, ...exp3.theoretical) + 1;
  const toX = (n: number) => margin.left + (n / maxN) * (w - margin.left - margin.right);
  const toY = (v: number) => h - margin.bottom - (v / maxV) * (h - margin.top - margin.bottom);

  const theoLine = exp3.N.map((n, i) => [toX(n), toY(exp3.theoretical[i])] as [number, number]);
  const empLine = exp3.N.map((n, i) => [toX(n), toY(exp3.empirical[i])] as [number, number]);
  const lineGen = (pts: [number, number][]) => "M" + pts.map((p) => p.join(",")).join("L");

  s.append("path").attr("d", lineGen(theoLine)).attr("fill", "none").attr("stroke", C.k2).attr("stroke-dasharray", "5,3").attr("stroke-width", 2);
  s.selectAll(".pt")
    .data(exp3.N)
    .join("circle")
    .attr("class", "pt")
    .attr("cx", (n) => toX(n))
    .attr("cy", (_, i) => toY(exp3.empirical[i]))
    .attr("r", 4.5)
    .attr("fill", C.k1);
  s.append("path").attr("d", lineGen(empLine)).attr("fill", "none").attr("stroke", C.k1).attr("stroke-width", 1.5);

  s.append("text").attr("x", margin.left).attr("y", 14).attr("font-size", 11).attr("fill", C.k1).text("● empirical ratio");
  s.append("text").attr("x", margin.left + 150).attr("y", 14).attr("font-size", 11).attr("fill", C.k2).text("- - theoretical N+1");

  const readout = scope.querySelector<HTMLElement>("#sc-readout");
  if (readout) {
    const maxErr = Math.max(...exp3.N.map((_, i) => Math.abs(exp3.empirical[i] - exp3.theoretical[i])));
    readout.innerHTML =
      `N ∈ {${exp3.N.join(", ")}} nested restrictions<br>` +
      `empirical sample-cost ratio matches N+1 exactly — max deviation <b>${maxErr.toExponential(2)}</b><br>` +
      `<span style="color:${C.ink3}">machine precision, not approximate agreement</span>`;
  }
}

const Slide03SampleComplexity: SlideDef = {
  title: "Sample-complexity separation",
  maxStep: 0,
  render: () => (
    <>
      <h2>One extremal-regime run pays the sample cost once</h2>
      <div className="two-col">
        <div>
          <p>
            Achieving ε-competence on N nested restrictions plus the
            extremal regime costs O(d/ε² · log 1/δ) samples once, if
            training happens only at the extremal regime — by the
            Inclusion Theorem, that one run transfers to every
            restriction. Training each regime independently costs the
            same term (N+1) times, since competence on one restriction
            gives no guarantee elsewhere.
          </p>
          <p className="aside">
            A Domain Contract — a typed operation vocabulary, a declared
            embedding, an extremal-regime sampler, and a verifier — is
            deliberately minimal: it asks for a generator of hard queries
            and a decision procedure, not a curated corpus spanning every
            restriction a deployment will ever see.
          </p>
        </div>
        <div>
          <D3Chart id="c-samplecomplexity" draw={drawSampleComplexity} />
          <div className="controls">
            <div id="sc-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide03SampleComplexity;
