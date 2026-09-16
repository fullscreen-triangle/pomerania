# IDEA_1 · Learn to propose, not to prove.

**Written 28 August 2026.** An assessment of a proposal, and a plan for the hardware it would run
on. It follows [`VISION.md`](VISION.md) and uses its vocabulary; section references below are to
that document.

**Claims are marked, in the same convention.** **[measured]** rests on a recorded number from
`nfdi4cat-v2`. **[verified 28 Aug 2026]** was checked live against the source while writing this.
Everything else is argument, and the literature summary in §2 is reported from a search conducted
for this document rather than from a reading of the papers — the systems named exist and are roughly
as described; check before leaning on a specific figure.

---

## 1 · The proposal, as put

> Use a transformer. The input sequence is the beginning of a proof, taken in reverse. The model is
> the oracle that produces the next proof step. It terminates when a correct proof has been found.
> Train it either on correct proofs, or without ground truth in a reinforcement-like way.

The instinct is right in every structural particular, which is why the answer is not a simple no.

## 2 · This is a known paradigm, and it works

What is described is the dominant architecture in neural theorem proving: a tactic-generation model
proposing steps, wrapped in a proof search, with a kernel that verifies. Backward — goal-directed,
reducing a goal to subgoals — is the standard direction, not an exotic choice. Working systems:
AlphaProof (IMO-silver 2024, *Nature* 2025), DeepSeek-Prover-V2, Goedel-Prover-V2, Seed-Prover,
Aristotle.

The supervised-or-RL fork also has a settled answer, and it is neither: **expert iteration.**
Bootstrap supervised, attempt new theorems, keep the verified successes, retrain, repeat.
Goedel-Prover-V2's recipe is explicit — generate 16 proofs per statement, verify with the compiler,
keep one per solved statement, fine-tune, iterate. Pure RL from scratch is punished by sparse
reward; pure supervision caps at the corpus.

**And it is worth naming what this vindicates.** Formal mathematics is the clearest success story in
reinforcement learning precisely because the reward is free, mechanical and unhackable: the kernel
answers yes or no and does not care where the candidate came from. That is §6's gate, and §6's
origin-blindness, with a published existence proof attached. The vision's central architecture is
not speculative. Somebody built it and it won a medal.

## 3 · Why it is nonetheless the wrong target here

**The search is not the bottleneck.** Lean and HOL proving is undecidable with unbounded search,
which is what makes a learned oracle worth its parameters. OWL 2 DL is decidable, ChEBI is
EL-shaped, and the cost is measured: **18,115 reactions classified in ~80 s at a default heap**
**[measured]**. A learned prover would compete with a complete decision procedure that already
finishes in under two minutes — and could only be trusted through the same gate the reasoner *is*.

**The proofs are shallow.** The neural win in mathematics comes from depth. §3 found the domain's
shape from the other side: plain SPARQL returns the identical answer set as HermiT for the headline
question **[measured]** — *the questions are query-shaped*. A transaminase classification is a
handful of subsumption steps.

**The training data is free, and that is the tell.** Unlike the natural-language-to-query problem,
proof supervision costs nothing: run the reasoner, dump justifications, get unlimited traces. That
reads as an advantage until one notices what it means — **the oracle you would learn from is already
sitting there answering the question.** The work would be distillation of a solved procedure.

## 4 · The objection that decides it: a prover cannot say *no*

A transformer-guided search terminates when it finds a proof, and never when there is none. It is
**sound** — the gate ensures that — and **not complete**. Failure to find is indistinguishable from
failure to look.

This is the generate-and-test route of the two named in §6, and the distinction is the one the v3
deck states as its own slide while the document does not yet carry it:

> Generate-and-test can prove that something **exists**. It can never prove that **nothing does**.

In mathematics nobody minds; non-provability is not the deliverable. **In a laboratory it is the
deliverable.** §3 calls *"what have we not tried?"* the highest-value question, and it is a
non-existence claim. A complete reasoner can certify non-entailment. A sampler cannot, at any scale.

> **The neural prover sits on the wrong side of the split for the one query the vision cares most
> about.**

## 5 · Where the same machinery does pay

Keep the architecture — untrusted proposer, cheap auditable gate — and move it one layer out, to
where the space is genuinely open. Ranked by how stuck the domain is:

| target | why a learned proposer earns its keep | the gate |
|---|---|---|
| **the entrance problem** (§4) — propose axioms, alignments, **declared respects** (§5) | no decision procedure exists for *"is this the right formalisation"*, and this is where the domain actually breaks | consistency, and *does the join now return* |
| **question → query** (§10) | genuinely open science, per §9 | schema conformance · non-vacuity · execution |
| **abduction** — *what would have to be true for this to hold* | not cheap-decidable, and isomorphic to *"what experiment should we run"* | entailment check of the proposed hypothesis |
| **inconsistency repair** (§7) | minimal repair is combinatorially hard, and §7 calls tolerance a baseline requirement | consistency restored, minimality checked |
| **explanation ranking** (§9 — *"works; output often unreadable"*) | choosing which justification a human sees is a ranking, not a decision | none — it is similarity-shaped by §5, and must not pretend otherwise |

**And the relevant literature is not neural theorem proving.** It is **complex query answering over
incomplete knowledge graphs** — the GNN-QE / CQD / QTO line, the Conditional Logical Message Passing
Transformer, an ACM Computing Surveys review of November 2025, and *Neural Reasoning for Robust
Instance Retrieval in SHOIQ*, which engages HermiT directly. That field exists because of a gap
logic really has: the graph is incomplete, so traversal misses answers that ought to be there. It is
the open-world half of §3, and the one place a learned model adds recall a reasoner cannot.

## 6 · The hardware

Three Google cloud GPU machines: **two with 8 GB of graphics memory, one with 16 GB.**

**This fleet cannot train a prover, and by §3–§4 it should not try.** Frontier provers run from 7B to
671B parameters on hundreds of accelerators; Goedel-Prover-V2 makes a point of beating a 671B model
and is still far outside 16 GB.

What matters more: **the corpus is small.** Rhea's endpoint holds **7,271,615 triples** and
**18,184 approved masters** (18,854 reaction resources counting directional variants); ChEBI `lite`
is 183,257,139 bytes **[verified 28 Aug 2026]**. A 256-dimension embedding table over even 250,000
entities is ~256 MB of parameters, ~750 MB with optimiser states. **The GPUs are not the constraint
on this project.**

> ~~5,458,778 triples~~ — that figure, inherited from `nfdi4cat-v2`'s `DATA_SOURCES.md` and correct
> when checked on 5 August 2026, was already stale when this document was written: the same query
> returned 7,271,615 on 28 August, **+1.8M in three weeks**. The master count did not move. Left
> struck rather than deleted, because the lesson is the point: **never benchmark against the live
> endpoint** — pin the corpus and measure against the file. [`DATA.md`](DATA.md) §3.

### What fits

| workload | VRAM, approximate | verdict |
|---|---|---|
| KG embeddings / complex query answering on Rhea + ChEBI | 1–3 GB | comfortable on 8 GB; sweeps across all three |
| label/sequence embedding plus a reranker for similarity retrieval | < 4 GB | trivial |
| QLoRA fine-tune, 1.5–3B model, 4-bit | 4–7 GB | fits 8 GB, short context |
| QLoRA fine-tune, 7–8B, 4-bit, modest sequence length | 12–15 GB | fits the 16 GB box, tightly |
| 7B inference at 4-bit — generation, back-translation | 5–6 GB | fits any box |
| training a theorem prover | far beyond 32 GB | no |

## 7 · Three projects that fit

**1 · Complex query answering over an incomplete Rhea/ChEBI.** The best fit by a distance. The
protocol is what makes it honest: **hold out known edges, ask whether the model recovers them, and
use the complete reasoner as the referee.** Hours on one 8 GB card, and it instruments the
open-world half of §3 directly.

**2 · The ChEBI respect benchmark.** A known-answer probe built from a failure v2 already recorded:
ChEBI's *"amino acid"* types none of the four amino acids the reactions use **[measured]**, because
two respects collided undeclared (§5). The model proposes candidate respects and alignments; the
gate is *does the join now return, and does the ontology stay consistent*. Near-zero GPU cost. Its
value is that it attacks the entrance failure, and that a known answer is the only instrument that
caught the 42 **[measured]**.

**3 · Question → SPARQL, with synthesis.** Enumerate queries from the schema, execute them against
the endpoint, gate on schema conformance and non-vacuity, then **back-translate query → prose** with
a small local model — synthesise in the easy direction to train the hard one. Only the last step
needs a GPU.

> **The evaluation set is not negotiable.** SIB publishes **1,239 curated example queries across 12
> endpoints — 120 for Rhea, 132 for UniProt, 15 for MetaNetX — each a Turtle file carrying an English
> intent (`rdfs:comment`), the SPARQL (`sh:select`) and its endpoint (`schema:target`), dual-licensed
> CC-BY 4.0 and MIT** **[verified 28 Aug 2026]**. That is a native (intent, query, endpoint) corpus
> over our exact endpoints. It is far too small to train on and exactly the right size to be held
> out. **It goes in a drawer marked *eval only*, and is never trained on.**

## 8 · Fleet assignment

| box | role |
|---|---|
| **16 GB** | the only box that can hold a 7–8B model: generation, and QLoRA fine-tuning. Single tenant, one job at a time. |
| **8 GB #1** | CQA / embedding training and hyper-parameter sweeps. |
| **8 GB #2** | inference for back-translation and reranking; independent ablations. |

**Three independent workers, not a cluster.** No shared fabric, so model parallelism is not worth
attempting; the 3× comes from embarrassingly parallel runs.

## 9 · What is not a GPU problem

Most of this pipeline never touches one. The reasoner, the query enumeration, the endpoint
execution, the vacuity checks, the justification dumps — CPU and I/O throughout; the reasoner leg
alone is ~80 s of pure CPU per full pass **[measured]**.

So the standing hazard is scaling the GPU work to fill the machines, when the binding constraints
are elsewhere and were identified before the hardware was: **there is no domain training corpus for
question → query, and there is no ground truth at all for the absence query.** Neither is fixed by
FLOPs. An idle GPU is cheaper than a result nobody can check.

## 10 · What to do first

1. **Measure the proof depth before believing §3.** Dump the reasoner's justifications over the Rhea
   corpus and look at the step-count distribution. If the median is three steps, the case against a
   learned prover closes itself — on our own number rather than on an argument.
2. **Stand up the CQA experiment** on one 8 GB box: small, self-contained, and it produces a real
   number against a reasoner referee.
3. **Run the ChEBI respect probe.** Known answer, near-zero cost, and it tests the entrance
   hypothesis rather than the one this document argues against.
4. Leave the third box idle rather than inventing work for it.

---

## What this rests on

| fact | status | where it matters |
|---|---|---|
| 18,115 reactions classified in ~80 s at a default heap | **[measured]** | §3, §9 — the reasoner is already fast enough to beat |
| plain SPARQL returns the identical answer set for the headline question | **[measured]** | §3 — the questions are query-shaped, not proof-shaped |
| ChEBI's *"amino acid"* types none of the four amino acids the reactions use | **[measured]** | §7 — the respect benchmark's known answer |
| a valid query returned 42 where the truth was 75 | **[measured]** | §4, §7 — why a known answer is the load-bearing instrument |
| Rhea: 5,458,778 triples · ~18,184 approved masters · ~15,193 compounds; ChEBI `lite` 175 MB | v2 `DATA_SOURCES.md`, checked 5 Aug 2026 | §6 — the corpus is small; the GPUs are not the constraint |
| SIB `sparql-examples`: 1,239 queries over 12 endpoints, 120 for Rhea, dual CC-BY 4.0 / MIT | **[verified 28 Aug 2026]** | §7 — the held-out evaluation set |

**Sources for §2 and §5.**
[AlphaProof, *Nature*](https://www.nature.com/articles/s41586-025-09833-y) ·
[DeepSeek-Prover-V2](https://arxiv.org/html/2504.21801v1) ·
[Goedel-Prover-V2](https://arxiv.org/pdf/2508.03613) ·
[Seed-Prover](https://arxiv.org/pdf/2507.23726) ·
[Aristotle](https://arxiv.org/pdf/2510.01346) ·
[awesome-logical-query](https://github.com/neuralgraphdatabases/awesome-logical-query) ·
[Conditional Logical Message Passing Transformer](https://arxiv.org/html/2402.12954v2) ·
[Neural Graph Reasoning survey](https://arxiv.org/pdf/2303.14617) ·
[Neural Reasoning for Robust Instance Retrieval in SHOIQ](https://arxiv.org/pdf/2510.20457) ·
[sib-swiss/sparql-examples](https://github.com/sib-swiss/sparql-examples)

**The residual risk, stated here rather than discovered later.** This document argues against a
learned prover on the strength of a corpus that is fast *today*. If the modelling grows — richer
axioms, kinetics, conditions, an ABox that is no longer EL-shaped — the reasoner's 80 s is not a
fixed point, and §3's argument weakens with it. The first action in §10 exists so that this is
tracked with a number rather than assumed.
