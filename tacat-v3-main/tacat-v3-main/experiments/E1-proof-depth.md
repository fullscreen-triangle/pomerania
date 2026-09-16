# E1 · How deep are the proofs, actually?

**Run this first.** It is the cheapest experiment here, it needs no GPU, and it is the only one that
can **falsify the argument this repository is built on**. That is why it is first.

---

## The question

[`IDEA_1.md`](../IDEA_1.md) §3 argues against a learned proof oracle on the grounds that *the proofs
in this domain are shallow* — a transaminase classification is a handful of subsumption steps, not a
200-step Lean proof, so there is no search bottleneck for a transformer to attack.

**That claim is currently an argument, not a measurement.** This experiment turns it into a number.

## The prediction, stated before the run

> The median justification over the Rhea corpus is **≤ 5 axioms**, and the 95th percentile is
> **≤ 15**.

**If that holds**, the case against a learned prover closes on our own number, and effort moves to
[`E2`](E2-cqa.md) and [`E3`](E3-chebi-respect.md) without further argument.

**If it fails** — if there is a long tail of deep justifications — then `IDEA_1.md` §3 is wrong on
its central factual claim, guided search has something to bite on, and that is a genuine finding
that must be written up as a correction rather than buried. **Write down which outcome you got
before you start interpreting it.**

## Method

1. Load `chebi_lite.owl` plus the Rhea corpus (see [`../DATA.md`](../DATA.md) §1). **Use the
   downloaded files, never the live endpoint** — `DATA.md` §3 says why.
2. Materialise with a reasoner (ELK for the EL fragment; HermiT if the axioms need it). Record the
   **heap size** — a reasoner timing without a heap figure is not a result.
3. For each inferred subsumption/classification, extract a **justification** — a minimal subset of
   axioms entailing it. `owlapi`'s explanation API or ROBOT's `explain` will do it.
4. Record per justification: the entailment, the number of axioms, and the axiom types.
5. Report the **distribution**: median, 95th percentile, max, and the histogram. Not the mean — one
   pathological entailment would carry it.

## Controls — run these before believing the distribution

- **Known-answer probe.** The headline question has a known answer: **75 reactions**
  ([`../EVIDENCE.md`](../EVIDENCE.md) #2). If your pipeline does not reproduce 75, it is
  mis-configured, and **any depth distribution it produces is meaningless**. Check this first and
  stop if it fails.
- **Self-test the extractor against a planted deep entailment.** Add a synthetic chain of, say, 12
  axioms; confirm the extractor reports 12. A justification extractor that silently returns the
  entailment itself reports depth 1 for everything and looks like a beautiful confirmation of the
  hypothesis. **This control exists because a check that has never fired cannot be trusted**
  (`EVIDENCE.md` #8).
- **Non-vacuity.** If the corpus yields zero justifications, that is a fact about the load, not
  about the ontology. Diagnose before reporting.

## Done when

- [ ] The known-answer probe returns **75**, and it is recorded.
- [ ] The planted-deep-entailment self-test **fires** and is recorded.
- [ ] The depth distribution is reported with median, p95, max and histogram, plus the heap size,
      the reasoner and version, and the corpus file sizes and fetch date.
- [ ] The prediction above is marked **held** or **failed**, in writing, with one sentence on what
      follows for `IDEA_1.md` §3.

## What this costs

CPU only, minutes to an hour. **Do not use a GPU box for this.**

## What it does not settle

Depth is not the only reason a learned prover might pay. Abduction — *what would have to be true for
this to hold* — is a genuinely harder search and is not measured here. A shallow distribution argues
against learned **deduction**, not against learned **proposal** (`IDEA_1.md` §5).
