# E4 · Question → SPARQL, with synthesised training data

**The largest experiment here and the last to start.** It needs the other three to have reported,
because it is the one that can most easily produce a plausible number that is wrong.

---

## The question

[`VISION.md`](../VISION.md) §9 lists *question → query* as genuinely open science, and §10 says what
the system would have to be: it shows the query in prose before running it, validates before
execution, diagnoses empty answers, and **may refuse**.

> **Can a small model, trained on synthesised pairs and gated symbolically, turn a scientist's
> question into a query that means what was asked — and decline when it cannot?**

## The data problem, stated plainly

**There is no domain training corpus.** The 1,239 curated SIB pairs (`../DATA.md` §4) are an
**evaluation set** — 1,239 pairs trains nothing, and training on them destroys the only trustworthy
probe set this project has. **They are held out. This is not negotiable.**

So the training data is manufactured, in the easy direction:

1. **Enumerate queries from the schema, not from language.** Walk Rhea's predicates × ChEBI's
   hierarchy × EC classes, instantiating query templates. The space is combinatorial; 10⁴–10⁶
   candidates is easy.
2. **Gate them mechanically:** well-formed · schema-conformant · types line up · **executes** ·
   **non-vacuous** (returns something, and not everything). Every survivor carries its answer set,
   computed rather than annotated.
3. **Back-translate query → prose** with a local model. This is the load-bearing trick: query→NL is
   far more reliable than NL→query, so synthesise in the easy direction to train the hard one.
4. **Train** the NL→SPARQL model on the surviving pairs.

**Note what this is:** the untrusted-search-behind-a-trusted-gate architecture of `VISION.md` §6,
applied to bootstrapping itself. The generator may be mad; the gate is small and incorruptible.

## The half nobody else has: refusal data

The SIB set contains only *answerable* questions — no unanswerable ones, no vacuity traps, no
absence queries. So it cannot teach or test refusal, which `VISION.md` §10 calls the point that
decides whether any of this is usable in a laboratory.

**Because we control the generator, we can manufacture the negative class:** questions whose queries
reference predicates that do not exist, that are structurally vacuous, or that are ambiguous between
two non-equivalent readings. Each is a labelled *(question, correct response = refuse, and why)*
pair. **No public benchmark has this. It is the most novel part of this experiment.**

## Evaluation

- **Execution accuracy** on the held-out SIB pairs: does the generated query return the same answer
  set as the curated one? Not string similarity — *answer-set equality*.
- **Refusal behaviour** on the manufactured negatives: precision and recall of "I could not turn
  your question into a query I can justify."
- **The 42 test.** `../EVIDENCE.md` #3 is the specimen: a query that is valid, real, non-vacuous and
  **wrong**, returning a plausible strict subset. Report how many generated queries are *valid and
  wrong* — that number matters more than accuracy, because it is the failure the domain cannot
  detect.

## Controls

- **Never evaluate on anything the model was trained on.** Keep the SIB set physically separate;
  check for contamination against the synthesised set, since template enumeration can reproduce a
  curated query verbatim.
- **Report the vacuity rate** of generated queries. A model that learns to emit queries that return
  nothing will score well on nothing.
- **Self-test the gate** against a planted malformed query, a planted vacuous one and a planted
  valid-but-wrong one. The third one **should not be caught** — confirm that, because it is the
  documented limit (`VISION.md` §7), and a gate that appears to catch it is lying.

## Done when

- [ ] The synthesis pipeline reports how many candidates were generated, how many each gate stage
      killed, and how many survived. **No silent truncation.**
- [ ] Execution accuracy on the held-out SIB pairs is reported, with contamination checked.
- [ ] Refusal precision/recall on manufactured negatives is reported.
- [ ] The valid-and-wrong rate is reported as a first-class number.
- [ ] All three gate self-tests are recorded, including the one that correctly does **not** fire.

## Hardware

**16 GB box** for QLoRA fine-tuning a 7–8B model at 4-bit, short context. **8 GB #2** serves the
back-translation model. Enumeration, execution and gating are **CPU** and run anywhere.

## What it does not settle

Everything measured here is *the query the model wrote versus the query a curator wrote*. Whether
either means what the **scientist** meant is not formally checkable (`VISION.md` §7) — that is what
the prose round-trip in §10 point 2 is for, and a round-trip is itself a model translation that can
be fluently wrong. Do not report round-trip agreement as an intent check.
