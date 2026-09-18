import type { SlideDef } from "../../../deck/deckTypes";

const rows: { id: string; target: string; falsification: boolean }[] = [
  { id: "A1", target: "Mean-diameter identity", falsification: false },
  { id: "A2", target: "Some cell ≥ D/N", falsification: false },
  { id: "A3", target: "Occupied-cell bound", falsification: false },
  { id: "F1", target: "Infimum floor — refuted", falsification: true },
  { id: "F2", target: "Continuity modulus overstates 4× — refuted", falsification: true },
  { id: "B1", target: "Decision bound, in-cell form", falsification: false },
  { id: "B1b", target: "Global-modulus form — refuted", falsification: true },
  { id: "B1c", target: "Grid-refinement control", falsification: false },
  { id: "B2", target: "Tightness / attainment", falsification: false },
  { id: "B3", target: "Saturation and placement", falsification: false },
  { id: "B4", target: "Value of one bit", falsification: false },
  { id: "C1", target: "Adversarial search, 400 objectives", falsification: true },
  { id: "D1", target: "Causal bias persistence", falsification: false },
  { id: "E1", target: "Crash / naive / adaptive redundancy", falsification: false },
  { id: "G1", target: "d-dimensional N^(-1/d) scaling", falsification: false },
];

const Slide11Validation: SlideDef = {
  title: "Validation",
  maxStep: 0,
  render: () => (
    <>
      <h2>Fifteen checks, including three deliberate falsifications</h2>
      <table className="inv-table">
        <thead>
          <tr>
            <th>Check</th>
            <th>Target</th>
            <th>Kind</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <b>{r.id}</b>
              </td>
              <td>{r.target}</td>
              <td className={r.falsification ? "k2" : "k3"}>{r.falsification ? "falsification" : "confirmation"}</td>
              <td style={{ color: "#5cbf95" }}>pass</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="aside">
        The suite ran <em>before</em> the final theorem statement was
        fixed — Check B1b forced the replacement of an earlier global
        modulus with the in-cell one. The paper reports this rather than
        presenting the corrected theorem as though it had been the
        original: three claims (the infimum floor, the continuity
        modulus, the global-modulus bound) were asserted, tested, and
        broken on purpose.
      </p>
    </>
  ),
};

export default Slide11Validation;
