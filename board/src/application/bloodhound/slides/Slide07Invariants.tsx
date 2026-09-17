import type { SlideDef } from "../../../deck/deckTypes";

const rows: { id: string; cond: "unconditional" | "conditional"; name: string; text: string }[] = [
  {
    id: "I1",
    cond: "unconditional",
    name: "Conserved identity",
    text: "χ is defined relative to the largest connected component only, so a repo doesn't lose its identity to a stray disconnected file.",
  },
  {
    id: "I2",
    cond: "unconditional",
    name: "Monotone commit count",
    text: "m only ever increases. A repo's tracked history is append-only — rewriting it doesn't erase what the tracker has already recorded.",
  },
  {
    id: "I3",
    cond: "unconditional",
    name: "Search-not-fetch",
    text: "Every sense/where answer invokes a fresh search over the current index, never a cached read — so answers can't silently go stale.",
  },
  {
    id: "I4",
    cond: "unconditional",
    name: "Exclusive construct/commit phases",
    text: "The tool is either building its index or answering queries against a committed one — never both at once, which would let a query race a half-built graph.",
  },
  {
    id: "I5",
    cond: "conditional",
    name: "Attention water-filling",
    text: "When a scheduler is present, attention across repos in a federation is allocated by water-filling, not by round-robin — repos further from their χ floor get more scrutiny.",
  },
];

const Slide07Invariants: SlideDef = {
  title: "The invariants",
  maxStep: 0,
  render: () => (
    <>
      <h2>What the tracker guarantees</h2>
      <table className="inv-table">
        <thead>
          <tr>
            <th>Invariant</th>
            <th>Kind</th>
            <th>Guarantee</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <b>{r.id}</b> {r.name}
              </td>
              <td className={r.cond === "unconditional" ? "k3" : "k4"}>{r.cond}</td>
              <td>{r.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="aside">
        I1–I4 hold regardless of what's plugged in; I5 only applies once an
        execution/attention scheduler is actually composed in. The split
        mirrors the design doc's own unconditional/conditional table exactly.
      </p>
    </>
  ),
};

export default Slide07Invariants;
