# Research: Which learned-model approach fits a decidable, already-fast symbolic substrate?

**ID:** 0001
**Date:** 28 August 2026
**Status:** awaiting-advice — **submission BLOCKED by a service-side outage, 28 August 2026**
**Runs attempted:**
- `run_6aebb2cb` — failed terminally, worker `account-1`: `internal_error` / `lease_not_held`,
  *"Browser session staged terminal ended"*.
- `run_d017f2f7` — resubmitted against the same `documentId` under a fresh idempotency key. Failed
  **identically** on a *different* worker (`account-2`), same `failureCode` and `failureReason`.

Two independent workers failing the same way means the fault is in the consultation service, **not
in this document and not in one unlucky worker**. No advice was produced: the advice file still
holds its placeholder. Retrying was stopped after the second attempt rather than looped.

**The fallback is open and needs no service.** This document is plain markdown written for a reader
with no codebase access — it can be handed to an advisor directly, and the response pasted into
`0001-transformer-approach.advice.md`. Then resume with `/bb-research apply 0001`. Alternatively
re-submit later against `documentId doc_d54cd8ee-d4d2-4678-a1b6-467bd131d043` (already uploaded, no
re-upload needed) under a fresh idempotency key, once the service is healthy.


## Question

We have a small, working, **symbolic** knowledge-graph stack for enzyme-catalysis data: an OWL 2 DL
ontology, an OWL reasoner, and SPARQL over a public biochemical corpus. We want to add machine
learning to it, and we have modest hardware (three separate machines, detailed under *Constraints*).

Our own measurements have made the obvious plan look wrong. The reasoning task we built the system
around is **decidable, complete, and already fast**, and a plain database query returns the
*identical* answer set to the reasoner. So a learned model that proposes proof steps would be
distilling a procedure we already run cheaply.

**Where should the learned component actually go, and what should it be?** We are choosing between
(A) learned query answering over an incomplete graph, (B) a learned *proposer* of formal artefacts
gated by the reasoner, (C) natural-language-to-query generation, and (D) something we have not
thought of — including "you do not need a learned component here", which is an acceptable answer.

**Stakes:** this decides a research programme. Picking a target where the symbolic method is already
complete would burn it on a solved problem.

---

## Context

### System Overview

The domain is **enzyme catalysis**. A biocatalysis laboratory screens enzyme variants to find one
that performs a desired chemical transformation. A robotic platform can run ~1,000 experiments a
week, but results accumulate as instrument-specific files keyed by plate and well, joinable only by
whoever remembers what was in plate 42. The response is a knowledge graph with shared, resolvable
identifiers.

> **Important scoping, so you are not misled by that motivation.** We hold **no in-house
> experimental data today.** Everything measured below is over **public reference data** (curated
> reaction and chemistry databases). The laboratory picture is the destination the programme is
> aimed at, not its current state. Whether the eventual system ingests a screening log is open, and
> it matters to your answer: it decides whether option (A) is predicting *chemistry* or *untested
> experiments*.

The stack is Python plus RDF/OWL/SPARQL. Two reasoning engines appear below:

- **HermiT** — a standard OWL 2 DL tableau reasoner, driven through **Owlready2** (a Python binding
  to the Java reasoner). This is the production path.
- **logos** — a research engine of ours: Datalog-style, closed-world, which attaches a
  **certificate** to every derived fact (a machine-checkable derivation trace naming the supporting
  facts and the steps used). It is a **measurement instrument and prototype, not deployed.** It
  appears here because comparing the two produced our most interesting result.

#### The domain vocabulary you need

- **ChEBI** — a public ontology of chemical entities (~240,000 classes) arranged as a subsumption
  hierarchy.
- **Rhea** — a public, curated database of ~18,000 biochemical reactions, published as RDF with a
  public SPARQL endpoint. A **master** is the undirected parent reaction; **approved** means
  curator-released. Rhea also mints directional children, so counts differ depending on what you
  count.
- **A transamination** — our running example. An amino acid donates its amino group to a 2-oxo acid;
  the products are the corresponding 2-oxo acid and amino acid. The *signature* is: amino acid
  consumed, 2-oxo acid consumed, 2-oxo acid produced, amino acid produced. Our two headline
  molecules are **L-glutamate** (an amino acid) and **2-oxoglutarate** (a 2-oxo acid) — they appear
  in all three of our reference transaminations.
- **Zwitterion / anion** — the *same substance at different charge states* (whether one proton is
  attached). A **microspecies** is one such named protonation state. This distinction looks
  pedantic and turns out to be the source of our sharpest failure.
- **Classification**, in the description-logic sense used throughout: computing every entailed class
  membership over the whole ontology. **Not** ML classification. **Materialisation** means writing
  all entailed triples into the store, so later queries are lookups.

### Architectural Context

#### Participation is n-ary

RDF triples are binary, so `reaction hasSubstrate alanine` has nowhere to put a role or a
coefficient. We use the standard W3C n-ary-relation pattern (sometimes called reification): a
**bridge node** per participant, carrying entity, role and coefficient. `tacat:` below is **our own
namespace** — everything in it is minted by us, including local proxy nodes for external terms.

```turtle
@prefix tacat: <https://w3id.org/bitspark/tacat/> .   # ours
@prefix rh:    <http://rdf.rhea-db.org/> .            # Rhea
@prefix obo:   <http://purl.obolibrary.org/obo/> .    # ChEBI lives here

tacat:PART_0000002_01                                  # participant 01 of reaction 0000002
    a tacat:ReactionParticipant ;
    tacat:participatingEntity tacat:CHEBI_57972 ;      # our proxy node for L-alanine zwitterion
    tacat:participantRole tacat:Reactant ;
    tacat:stoichiometricCoefficient "1.0"^^xsd:decimal .

tacat:CHEBI_57972  a  obo:CHEBI_57972 , tacat:AminoAcid .
```

External identifiers are carried as **`rdf:type` to the external class IRI**, never as string
literals — so they join and dereference. (`tacat:AminoAcid` is **our** class, not ChEBI's. Why we
had to mint it is the whole of *What actually breaks* §1.)

### Relevant Code

#### The defined class — the only thing the reasoner derives

In Manchester syntax. Primer, since we use three constructs: `some` is an existential restriction
(∃), `value` restricts to one named individual (a nominal), and `EquivalentTo` states necessary
**and sufficient** conditions — which is what makes membership *derivable* rather than asserted.

```
Class: TransaminationReaction
  SubClassOf: BiochemicalReaction
  EquivalentTo:
      BiochemicalReaction
      and (hasParticipant some (ReactionParticipant
             and (participatingEntity some AminoAcid)  and (participantRole value Reactant)))
      and (hasParticipant some (ReactionParticipant
             and (participatingEntity some TwoOxoAcid) and (participantRole value Reactant)))
      and (hasParticipant some (ReactionParticipant
             and (participatingEntity some TwoOxoAcid) and (participantRole value Product)))
      and (hasParticipant some (ReactionParticipant
             and (participatingEntity some AminoAcid)  and (participantRole value Product)))
```

No reaction is ever *asserted* to be a `TransaminationReaction`; the reasoner derives it. A negative
control — glutamate dehydrogenase, which contains the same two headline molecules with the roles
swapped — is correctly not derived.

**And here are the two classes that definition rests on.** These are the crux of question 2 and are
the artefact we most want you to look at:

```
Class: AminoAcid   EquivalentTo: CHEBI_35238 or CHEBI_37022                    # zwitterion ∪ anion
Class: TwoOxoAcid  EquivalentTo: CHEBI_35179 or CHEBI_36147 or CHEBI_133294    # three charge-state branches
```

Membership flows through ChEBI's `rdfs:subClassOf*`, so the reasoner does real work; the union is
what we had to hand-author, and *why* we had to is §1 below.

**Expressivity.** The ontology uses intersection, existentials, a nominal-valued restriction,
**functional** object properties (`participatingEntity` and `participantRole` are each
single-valued) and disjointness — roughly 𝒜ℒ𝒞 (intersection, negation, existentials) + 𝒪 (nominals)
+ ℱ (functional roles) + (𝒟) (datatypes). It is OWL 2 DL and falls outside all three OWL 2
profiles — EL, QL and RL, the syntactic fragments that trade expressivity for polynomial-time
reasoning. Functional object properties exclude EL; an existential on the superclass side of an
equivalence excludes RL.

#### The equivalent SPARQL query — no reasoner involved

Same prefixes as above, plus `chebi:` = `obo:CHEBI_`. Over the public Rhea endpoint. Note
`?r rdfs:subClassOf rh:Reaction` rather than `?r a rh:Reaction`: **Rhea models reactions as OWL
classes, not individuals**, and getting this wrong returns empty rather than erroring.
`rdfs:subClassOf*` is transitive closure; `rh:contains/rh:compound/rh:chebi` is a property path.

```sparql
SELECT DISTINCT ?r WHERE {
  ?r rdfs:subClassOf rh:Reaction . ?r rh:status rh:Approved .
  ?r rh:side ?l . ?r rh:side ?x .
  FILTER(STRENDS(STR(?l),"_L") && STRENDS(STR(?x),"_R"))     # Rhea suffixes sides _L / _R
  ?l rh:contains/rh:compound/rh:chebi ?aIn  .  ?l rh:contains/rh:compound/rh:chebi ?oIn .
  ?x rh:contains/rh:compound/rh:chebi ?oOut .  ?x rh:contains/rh:compound/rh:chebi ?aOut .
  VALUES ?aa1 { chebi:35238 chebi:37022 }   VALUES ?aa2 { chebi:35238 chebi:37022 }
  VALUES ?ox1 { chebi:35179 chebi:36147 chebi:133294 }
  VALUES ?ox2 { chebi:35179 chebi:36147 chebi:133294 }
  ?aIn  rdfs:subClassOf* ?aa1 .  ?oIn  rdfs:subClassOf* ?ox1 .
  ?oOut rdfs:subClassOf* ?ox2 .  ?aOut rdfs:subClassOf* ?aa2 .
}
```

This is the **corrected** version. §4 shows the defect it had. One caveat we should state rather than
have you find: there is no `FILTER(?aIn != ?oIn)`, so nothing forbids one compound satisfying both
the amino-acid and 2-oxo-acid conjunct on the same side — which §2 shows is a real possibility.

#### The measurement that reframed the project

Over the full corpus, both routes return **the identical 75 reactions**:

| | answer | time | measured against |
|---|---:|---:|---|
| plain SPARQL, no reasoner | **75** | **19.69 s**, per query | the **live public endpoint** — see caveat |
| HermiT, materialise | **75** | **80.54 s** once, then **0.0 s** per query | a pinned local corpus |

> ⚠ **These two numbers are not strictly comparable and we should not pretend otherwise.** The
> SPARQL figure is one measurement over a remote service with unrecorded load and no repeat count;
> the HermiT figure is local, minimum of 3 repeats. The *answer-set identity* is the robust finding.
> The timing comparison is indicative.

Scaling (HermiT via Owlready2 0.51, `-Xmx2000M`, minimum of 3 repeats, 300 s cap; CPU model not
recorded, which is a gap in our own record-keeping):

| reactions | facts (asserted triples in the participation graph) | HermiT |
|---:|---:|---|
| 89 | 1,200 | 6.15 s · 0 answers |
| 1,414 | 19,200 | 14.50 s · 16 |
| 5,736 | 76,800 | 43.18 s · 42 |
| **18,115** | **242,574** | **80.54 s** · **75** |

A **203× corpus growth costs 13× the time**, and the last leg is nearly flat. The reasoner is not
struggling. Corpus *construction* — download, parse and build the graph — took 375 s, more than
classification.

**Reconciling three counts, since we quote all three:** 18,184 approved masters exist (verified live,
28 Aug 2026); 18,854 counting directional children; **18,115** is what our pinned build actually
loaded and classified. The 69-reaction gap is a build artefact, not a silent failure.

Our reading of why the two routes agree: the defined class uses only existentials, subsumption and a
value restriction, each with a direct query equivalent (a join, a property path, a bound term). **We
believe** the rewriting is forced rather than coincidental for *this class expression with only the
axioms it depends on in scope* — we are not claiming the whole 𝒜ℒ𝒞𝒪ℱ(𝒟) ontology is
first-order-rewritable, and we would welcome correction.

---

### What actually breaks — and it is not the reasoning

#### 1 · The Entrance failure: a hierarchy quotients the world the wrong way

We needed a class containing the four amino acids our reactions use — **L-alanine zwitterion,
L-cysteine zwitterion, L-aspartate(1−), L-glutamate(1−)**. The correctly-named ChEBI classes fail
completely:

| candidate ChEBI class | descendants | subsumes how many of our 4 |
|---|---:|---|
| `CHEBI:33709` **amino acid** | 1,708 | **0 of 4** |
| `CHEBI:33704` **alpha-amino acid** | 1,317 | **0 of 4** |
| `CHEBI:35238` amino-acid **zwitterion** | 465 | 3 of 4 — misses L-glutamate(1−) |
| `CHEBI:37022` amino-acid **anion** | 331 | 2 of 4 — misses L-alanine, L-cysteine |

Because above the microspecies level ChEBI is organised by **charge state**, not chemical class:

```
L-alanine zwitterion
  → alanine zwitterion → amino-acid zwitterion → zwitterion → dipolar compound
      → organic molecule → molecule → polyatomic entity → molecular entity
```

The chain never passes through "amino acid". The narrowest common ancestor of all four is
`CHEBI:36357` *polyatomic entity* — **147,376 descendants**, about 60% of ChEBI. Hence the hand-built
unions shown above (3 of 4 ∪ 2 of 4 = 4 of 4, overlapping on nothing).

Our reading: an equivalence is only meaningful once you **declare a respect** — say which
differences do not count. "Same molecule *up to protonation*" and "what exists at pH 7.3" are
different equivalences over the same substances. ChEBI commits to one quotient; our join needed the
other. Nothing was wrong with the logic or the data; two undeclared respects collided.

#### 2 · The Disjointness failure: a false axiom that detonates only at scale

The ontology declares `DisjointWith: TwoOxoAcid, AminoAcid`. Molecules exist that are both.
`CHEBI:58556` ((S)-2-amino-6-oxopimelate, a lysine-biosynthesis intermediate) appears in two real
reactions, `rh:13561` and `rh:24797`. At our 9-molecule demonstrator scale the axiom was inert; load
the real corpus and **the ontology is inconsistent** — and under classical semantics an inconsistent
ontology entails *everything*: not a wrong answer but every answer.

The same defect, two engines:

| | behaviour |
|---|---|
| HermiT via Owlready2 | `InconsistentOntologyError` — a global failure that localises nothing |
| logos | one **certified** fact naming `CHEBI_58556`, 70 derivation steps; every other answer unchanged |

> **We should scope this honestly.** OWL justification services exist and would localise the clash;
> we did not run one. The contrast we actually care about is that localisation is *default output* in
> one engine and a separately-invoked service in the other — not that OWL cannot do it.

#### 3 · The OWA/CWA failure: the same question, two answers

Asked *"which reactions contain L-glutamate and 2-oxoglutarate but are NOT transaminations?"*:
HermiT returns **0**, logos returns **1** (correctly, the dehydrogenase control). Under the
open-world assumption, non-membership is *not entailed* rather than *entailed false*. Adding one
disjointness axiom that makes non-membership provable flips HermiT to the same answer.

Note the tension with §2, which an expert will spot immediately: a disjointness axiom is what
detonated the ontology there, and is the fix here. Local closure is exactly what we do not know how
to administer.

#### 4 · The Plausible-but-wrong failure: the one that governs everything

A SPARQL query returned **42** where the truth was **75** — a strict subset, no spurious extras,
valid syntax, real predicates, a genuine answer set. It read as *"SPARQL finds most of them"*: the
comfortable conclusion, and the wrong one.

The whole defect is two lines:

```sparql
# BROKEN — one root variable serves both amino-acid slots (42 answers)
VALUES ?aa { chebi:35238 chebi:37022 }
?aIn rdfs:subClassOf* ?aa .   ?aOut rdfs:subClassOf* ?aa .

# CORRECT — independent roots per slot (75 answers)
VALUES ?aa1 { chebi:35238 chebi:37022 }   VALUES ?aa2 { chebi:35238 chebi:37022 }
?aIn rdfs:subClassOf* ?aa1 .  ?aOut rdfs:subClassOf* ?aa2 .
```

Sharing the variable requires both amino acids to sit under the *same* branch root. One reaction
pairs a zwitterion with an anion, so no single root satisfies both: the union silently became an
intersection. **Nothing was logically wrong.** No well-formedness, type or consistency check would
have caught it.

That was not isolated. We recorded a family of *silent zeros* — a query returning 0 or a plausible
number because of a modelling or plumbing defect, indistinguishable from a correct answer. Instances:
reading an exit code instead of a payload (a correct empty result surfacing as a crash); querying
with the wrong IRI family (returns 0, not an error); creating a probe class *after* the reasoner ran
(returns `[]` for every query). Every one was caught by asking a question whose answer was already
known.

---

### The data, as a graph

For sizing a learned model. Verified live 28 August 2026 unless noted:

| | |
|---|---|
| Rhea approved masters | **18,184** (18,854 with directional children); **7,271,615** triples on the endpoint |
| ChEBI | ~240,000 classes; the `lite` release we pin is 183 MB |
| our participation graph at full scale | 18,115 reactions → **242,574** asserted triples |
| shape after n-ary expansion | one `ReactionParticipant` bridge node per participant, typically **4 per reaction** — so the graph is dominated by degree-4 star hubs |
| relation types | **few** — `hasParticipant`, `participatingEntity`, `participantRole`, `stoichiometricCoefficient`, plus ChEBI's `subClassOf`. Nothing like FB15k-237's 237 relations |
| endpoint volatility | the triple count was **5,458,778** three weeks earlier. Any number measured against the live endpoint is unreproducible; we pin files |

That relation-count line is one we would like you to weigh: the benchmarks most link-prediction work
is tuned on are relation-rich, and ours is not.

### Constraints

- **Fixed:** the corpus (no redistributable alternative with this structure); RDF/OWL/SPARQL as the
  substrate; the n-ary participation shape.
- **Hardware:** three separate machines — **2 × 8 GB VRAM, 1 × 16 GB VRAM**, no shared fabric, so
  model parallelism is unavailable and a single model must fit one card. Three boxes do buy parallel
  proposer/judge/evaluation topologies. GPU generation is not yet pinned, so assume no exotic kernel
  support.
- **Hosted frontier-model APIs are permitted** for offline/batch work such as data synthesis. There
  is no privacy barrier — the corpus is public and CC-BY. So "just back-translate with a hosted
  model" is available to you as a recommendation; we mention it because it changes option (C).
- **Latency is not a constraint.** The consumer is a laboratory that will spend a week of robot time
  on an answer. A five-minute response is fine; a batch job overnight is fine.
- **No domain training corpus.** No (question, query) dataset exists for this domain. The best public
  resource is **1,239 curated example queries** across 12 life-science endpoints (120 for our exact
  corpus), each a native *(natural-language intent, query, endpoint)* triple. Enough to **evaluate**,
  nowhere near enough to train. **And it contains only answerable questions** — no unanswerable ones,
  no vacuity traps, no absence queries — so it is structurally blind to refusal.
- **No ground truth at all for the highest-value question.** *"Which substrate × variant × condition
  combinations has nobody tested?"* is a **non-existence** claim. No public dataset contains one,
  because negative screening results are discarded.
- **Auditability is a hard requirement.** Whatever occupies a veto position must be re-runnable by
  someone who does not trust it. A **refusal is an acceptable and sometimes preferred output**: a lab
  told "we cannot determine this" loses nothing; a lab given a plausible wrong answer loses a week of
  robot time.
- **What success looks like**, since it shapes "productive": a result we would publish *and* a
  component a partner laboratory would actually run, within roughly twelve months. Generalising
  beyond this domain is a bonus, not a requirement.

### What We've Considered

**Provisionally set aside — a transformer as a proof-step oracle.** Our starting proposal was the
standard neural theorem proving architecture (tactic generation + proof search + expert iteration, as
in AlphaProof / DeepSeek-Prover). Three grounds against it *here*: the reasoning task is decidable
and finishes in 80 s (no search bottleneck); the proofs appear shallow (a classification is a handful
of subsumption steps, versus the deep unbounded search that makes learned guidance pay in Lean/HOL);
and proof supervision is free (run the reasoner, dump justifications) — so the oracle we would learn
from is already answering the question.

**The objection we could not answer, and would rather you broke than agreed with.** A guided proof
search is **sound but not complete**: it terminates when it finds a proof and never when there is
none. It can prove something *exists* and never that *nothing does*. In mathematics nobody minds; in
a laboratory the most valuable claim is a non-existence claim.

The three options, each with what is learned, the training signal, the gate, and what would falsify
it:

| | **(A)** query answering over an incomplete graph | **(B)** learned proposer of formal artefacts | **(C)** natural language → SPARQL |
|---|---|---|---|
| what is learned | embeddings / GNN over the graph (GNN-QE, CQD, QTO lineage) | a ranking over candidate class alignments and *declared respects* | a seq2seq mapping from question to query |
| training signal | held-out edges from the graph itself | almost none — see "falsified" | synthesised pairs: enumerate queries from the schema, gate by execution and non-vacuity, back-translate query → prose |
| symbolic gate | the reasoner on the full graph, as referee | consistency, **and** does the join return the *right* entities | schema conformance, non-vacuity, execution |
| what would falsify it | the ablation barely hurts the reasoner — i.e. incompleteness is not a real problem on this corpus | it cannot recover the one known answer (§1) | the valid-but-wrong rate does not fall below the naive baseline |
| status | **drafted, not deprioritised** — protocol written, fits 8 GB. It has no question below only because we do not know what to ask about it, which is itself informative | our current favourite, on a validation set of **n = 1** | largest, and the easiest to fake a good number on |

**Our bias, stated so you can attack it:** put the learned model on the *proposing* side and never in
a veto position, because the only failure this domain cannot detect is the fluent, plausible, wrong
answer.

**Prior art we are working from:** the GNN-QE / CQD / QTO line and the ACM Computing Surveys review
of complex logical query answering (Nov 2025); *Neural Reasoning for Robust Instance Retrieval in
SHOIQ* (arXiv:2510.20457), which engages HermiT directly; the Conditional Logical Message Passing
Transformer (arXiv:2402.12954); AlphaProof (*Nature*, 2025) and DeepSeek-Prover-V2 for the
theorem-proving comparison.

---

## Questions for the Expert

1. **Given a symbolic layer that is decidable, complete and fast on the task it was built for, where
   does a learned model add capability rather than duplicate it?** We would value cases from systems
   you have seen — both where a learned component earned its place alongside a complete symbolic
   core, and where one was added and turned out to be redundant. What distinguished them?

2. **How would you approach the "declared respect" problem?** Our sharpest failure was not a
   reasoning failure but an alignment one: a hierarchy quotients the world one way, a join needs
   another, and the mismatch surfaces as a plausible empty result. Are there established techniques —
   from ontology matching, representation learning, or elsewhere — for *proposing candidate
   equivalences together with the respect under which they hold*, in a form a symbolic gate can
   check? We are especially interested in how to stop a graded similarity score being silently
   promoted into a hard identity that downstream joins then treat as substitutable.

3. **The output we most want is a non-existence claim** — *"nobody has tested this substrate ×
   variant × condition"*. We have no ground truth for it, since negative results are discarded, and
   our own measurements show the answer flips on whether the world is closed locally: open-world
   returns 0, our closed-world engine returns 1, and a single disjointness axiom reconciles them —
   while §2 shows a disjointness axiom is also what made the ontology inconsistent. **How do systems
   you have seen make calibrated, auditable "nobody has done X" claims, and what is the discipline
   for deciding where to close the world?** Has learning been more useful for establishing *coverage
   of a space* than for answering within it?

4. **How would you detect a valid, non-vacuous, plausible answer to the wrong question?** We have
   four instruments: round-tripping the query into prose for human confirmation; continuously-run
   known-answer probes; differential agreement between two independent engines; and vacuity controls.
   Which have you seen actually catch this class of defect, which give false confidence, and what is
   missing? Relatedly — what would you insist on holding out, and how do you evaluate a system whose
   most valuable output is sometimes a refusal, when the only curated evaluation set available
   contains no unanswerable questions at all?

5. **What are we not seeing?** We arrived here from a symbolic-reasoning starting point and expect
   that shows. Given this substrate, this corpus and this hardware, what would you build that is not
   on our list — and what would you tell us to stop worrying about?
