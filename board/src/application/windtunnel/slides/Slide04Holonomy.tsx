import type { SlideDef } from "../../../deck/deckTypes";

const Slide04Holonomy: SlideDef = {
  title: "Holonomy: a Kirchhoff law for correctness",
  maxStep: 2,
  render: (step) => (
    <>
      <h2>Walk any cycle. If you don't return home, something's wrong.</h2>
      <div className="two-col">
        <div>
          <div className="formula" data-step={0}>
            <b>Holonomy on a cycle c</b>
            <div className="m">hol(c, x) = ‖T_c(x) − T_c^spec(x)‖</div>
            <em>
              actual transform around the cycle, minus the spec's transform,
              measured at state x
            </em>
          </div>

          <div className="defn" data-step={1}>
            <h3>The Kirchhoff analogy</h3>
            <p>
              In a circuit, voltage summed around any closed loop must be
              zero — that's Kirchhoff's voltage law. Holonomy plays the same
              role for behaviour: compose a system's units around a cycle,
              and the net deviation from spec should vanish. Nonzero
              holonomy on any cycle is a proof, not a suspicion, that the
              system is globally incorrect somewhere on that cycle.
            </p>
          </div>

          <div className={`boxed ${step < 2 ? "dim" : ""}`} data-step={2}>
            <b>Necessary, not sufficient.</b> Zero holonomy on every cycle
            rules out cyclic drift, but a DAG has no cycles at all — it is
            trivially holonomy-free — and can still be globally wrong
            through bad boundary conditions at its sources and sinks. The{" "}
            <b>Cycle Inconsistency Theorem</b> pins this down precisely:
            holonomy only certifies the part of correctness that lives on
            loops.
          </div>
        </div>
        <div>
          <p className="aside">
            The previous slide's 3-cycle is exactly a holonomy measurement:
            the "walk the cycle globally" button sums per-edge drift around
            A→B→C→A. A nonzero sum there <em>is</em> nonzero holonomy on
            that cycle, made concrete.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide04Holonomy;
