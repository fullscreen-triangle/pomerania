# E3 · The ChEBI respect probe — can a model repair the entrance?

**A known-answer probe on a failure that has already been diagnosed.** Near-zero GPU cost, and it
attacks the place this domain actually breaks.

---

## The question

[`VISION.md`](../VISION.md) §4 says logic fails at the **entrance** — getting the world into symbols
— and §5 says why: **every real equivalence is manufactured by declaring a respect**, and an
undeclared respect is what breaks a join silently.

The specimen is recorded ([`../EVIDENCE.md`](../EVIDENCE.md) #4): **ChEBI's class *"amino acid"*
types none of the four amino acids the reactions actually use**, because the charged species Rhea
works with sit in a branch organised by charge state. The empty result was not a bug in the logic or
in the data. It was **two undeclared respects colliding** — *ignore charge state* versus *what exists
at pH 7.3*.

> **Can a learned proposer recover the declared respect that repairs the join — with consistency and
> the join itself as the gate?**

This is the entrance problem in miniature, and it has the property nothing else here has: **we
already know the right answer**, so a wrong one cannot hide.

## Why this shape matters more than the result

Whatever the model does, this experiment tests the architecture of
[`IDEA_1.md`](../IDEA_1.md) §5 end to end: an untrusted proposer, a cheap symbolic gate, and a
verdict that carries a witness. If the harness works on a case with a known answer, it can be
pointed at cases without one. **If it cannot solve the case whose answer we know, nothing it says
about a novel case is worth reading.**

## Method

1. **Reproduce the failure.** Build the query that should return the amino acids and confirm it
   returns **nothing**. If it returns something, your corpus differs from the one in `EVIDENCE.md` —
   stop and find out why before continuing.
2. **Define the proposal space.** Candidate respects: ignore charge state · ignore protonation ·
   ignore stereochemistry · conjugate acid/base closure · *is_a* ancestor at depth *n*. ChEBI's own
   conjugate acid/base relations are the material — they are literally a declared respect already
   present in the corpus.
3. **Propose.** A model ranks candidate respects for the failing join. Start with a plain baseline
   (frequency / graph-distance heuristics) **before** anything learned — see the controls.
4. **Gate each proposal**, and record the witness:
   - does the ontology remain **consistent**?
   - does the join now **return**?
   - does it return the **right** entities, not merely some?
5. **Report** which proposals passed, which the gate rejected and why, and where the known answer
   ranked.

## Controls

- **The heuristic baseline is not optional.** If a frequency baseline finds the right respect, a
  learned model that also finds it has demonstrated nothing. Run the baseline first and report it.
- **A planted wrong respect must be rejected.** Feed the gate a respect that makes the join return
  the *wrong* entities and confirm it is caught. A gate that only checks *did something come back*
  will happily accept a respect that collapses the hierarchy — which is the sophisticated version of
  the silent zero.
- **Consistency must actually be checked.** `EVIDENCE.md` #5: a false disjointness axiom makes the
  ontology inconsistent on real data, and under classical semantics an inconsistent ontology entails
  **everything**. A proposal that "repairs" the join by making the ontology inconsistent will look
  like a total success. **Check consistency before checking the join, and record both.**
- **No leakage.** The known answer is documented in this repository. If the proposer has read
  `EVIDENCE.md` or this file, it is not solving the problem, it is recalling it. Run it against a
  corpus and a prompt that do not contain the answer.

## Done when

- [ ] The failure is reproduced (the join returns nothing) and recorded.
- [ ] The heuristic baseline is reported.
- [ ] The planted-wrong-respect control **fires**.
- [ ] The consistency check is shown to fire on `EVIDENCE.md` #5's axiom.
- [ ] Where the known-correct respect ranked is reported, with the witness for each passing
      proposal.
- [ ] A statement of whether the harness is trustworthy enough to point at a case with no known
      answer.

## Hardware

Any box; near-zero GPU. If a learned proposer is used, a small model on the **16 GB** box.

## What it does not settle

One specimen is one specimen. A harness that repairs this join has not shown it can repair a join
whose respect is not already in ChEBI's vocabulary. The honest write-up says *"recovered the known
answer on one documented failure"* and nothing broader.
