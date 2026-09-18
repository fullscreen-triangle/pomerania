import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { knapsackExact, knapsackGreedy, floorToValue } from "../knapsack";

function drawCascade(el: HTMLDivElement, scope: HTMLElement) {
  const w = 600,
    h = 300,
    margin = { top: 20, right: 16, bottom: 34, left: 46 };

  // A fixed illustrative receiver set (8 receivers, matching the paper's
  // own experiment shape), floors and costs chosen to be reproducible.
  const floors = [0.12, 0.35, 0.08, 0.5, 0.22, 0.44, 0.15, 0.3];
  const costs = [0.6, 2.1, 0.4, 2.8, 1.2, 2.4, 0.8, 1.6];
  const values = floors.map((f) => floorToValue(f));

  function render(budget: number) {
    const s = mountSvg(el, w, h);
    const exact = knapsackExact(values, costs, budget);
    const greedy = knapsackGreedy(values, costs, budget);
    const ratio = exact.value > 0 ? greedy.value / exact.value : 1;

    const barW = 32;
    const gap = 10;
    const startX = margin.left + 10;
    const maxV = Math.max(...values) * 2;
    const toY = (v: number) => h - margin.bottom - (v / maxV) * (h - margin.top - margin.bottom);

    values.forEach((v, i) => {
      const gx = startX + i * (barW * 2 + gap);
      s.append("rect")
        .attr("x", gx)
        .attr("y", toY(exact.selected[i] ? v : 0))
        .attr("width", barW)
        .attr("height", h - margin.bottom - toY(exact.selected[i] ? v : 0))
        .attr("fill", exact.selected[i] ? C.k3 : C.line)
        .attr("opacity", exact.selected[i] ? 0.9 : 0.3);
      s.append("rect")
        .attr("x", gx + barW)
        .attr("y", toY(greedy.selected[i] ? v : 0))
        .attr("width", barW)
        .attr("height", h - margin.bottom - toY(greedy.selected[i] ? v : 0))
        .attr("fill", greedy.selected[i] ? C.k1 : C.line)
        .attr("opacity", greedy.selected[i] ? 0.9 : 0.3);
      s.append("text")
        .attr("x", gx + barW)
        .attr("y", h - margin.bottom + 14)
        .attr("text-anchor", "middle")
        .attr("font-size", 9.5)
        .attr("fill", C.ink3)
        .text(`R${i + 1}`);
    });

    s.append("text").attr("x", margin.left).attr("y", 14).attr("font-size", 11).attr("fill", C.k3).text("■ exact (DP)");
    s.append("text").attr("x", margin.left + 110).attr("y", 14).attr("font-size", 11).attr("fill", C.k1).text("■ greedy");

    const readout = scope.querySelector<HTMLElement>("#casc-readout");
    if (readout) {
      const worstBound = 1 - 1 / Math.E;
      readout.innerHTML =
        `budget = ${budget.toFixed(1)}<br>` +
        `exact value = <b>${exact.value.toFixed(3)}</b>, greedy value = <b>${greedy.value.toFixed(3)}</b><br>` +
        `ratio = <b style="color:${ratio >= worstBound ? C.good : C.bad}">${ratio.toFixed(4)}</b> ` +
        `(worst-case guarantee 1-1/e = ${worstBound.toFixed(4)})`;
    }
  }

  render(4.0);
  const sl = scope.querySelector<HTMLInputElement>("#casc-slider");
  if (sl) {
    sl.oninput = () => render(Number(sl.value));
    sl.value = "4.0";
  }
}

const Slide05Cascade: SlideDef = {
  title: "Cascade routing is a knapsack",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Allocating a fixed budget across receivers</h2>
      <div className="two-col">
        <div>
          <p>
            Under the independent-failure hypothesis, the federation floor
            obeys a multiplicative survival law, so minimising it under a
            budget is equivalent to maximising Σ aᵢvᵢ with{" "}
            <span className="m">vᵢ = log(Ω/(Ω − floorᵢ))</span>, subject to
            Σ aᵢcostᵢ ≤ budget — an ordinary 0–1 knapsack, solved exactly
            by dynamic programming in O(kB), and within a factor (1−1/e)
            of optimal by the value-density greedy rule.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Drag the budget slider below — both solvers run live on 8
            fixed receivers of known floor and cost. The paper's own
            Experiment 5 found the greedy allocation never dropped below
            0.958 of the exact optimum across five tested budgets, far
            inside the 0.632 worst-case guarantee.
          </p>
        </div>
        <div>
          <D3Chart id="c-cascade" draw={drawCascade} />
          <div className="controls">
            <label>
              Budget:{" "}
              <input type="range" id="casc-slider" min={1} max={10} step={0.1} defaultValue={4.0} />
            </label>
            <div id="casc-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide05Cascade;
