# EVIDENCE · the measured facts this repository argues from

**Carried into this repository on 28 August 2026**, because [`VISION.md`](VISION.md) and
[`IDEA_1.md`](IDEA_1.md) cite work that lives in a **separate, private repository that is not
checked out here** and will not be available on a cloud machine. Without this file an agent reading
either document cannot check a single number in it.

**What this file is.** A faithful record of results measured elsewhere, with the document that owns
each one named. **It is not the primary source and must not be edited to agree with a later
result** — if a figure here conflicts with a fresh measurement, the fresh measurement is a finding,
and both stay in the record.

**Provenance of the file itself.** Transcribed from `nfdi4cat-v2`'s finding documents. The owning
document is named per row so a figure can be traced when that repository is at hand.

---

## The load-bearing numbers

| # | fact | owner |
|---|---|---|
| 1 | **18,115 reactions classified in ~80.54 s at a default heap.** The run completed 18,115 of the 18,184 approved Rhea masters; 242,574 facts. | `FINDING_SCALING.md` |
| 2 | **A plain SPARQL query and an OWL reasoner (HermiT) return the identical 75 reactions** for the project's headline question. SPARQL 19.69 s per query; HermiT 80.54 s once, then ~0 s per query. Break-even ≈ 4 queries. | `WHAT_THE_REASONER_BUYS.md` |
| 3 | **A valid SPARQL query returned 42 where the truth was 75.** Valid syntax, real predicates, a genuine answer set, a strict subset with no spurious extras. One variable shared across two slots turned a union into an intersection. | `WHAT_THE_REASONER_BUYS.md` §"how this was nearly missed" |
| 4 | **ChEBI's class *"amino acid"* types none of the four amino acids the reactions actually use** — the charged species Rhea works with sit in a branch organised by charge state. | `FINDING_CHEBI_BRANCHES.md` |
| 5 | **A shipped disjointness axiom is chemically false**, inert at demo scale, and **makes the ontology inconsistent once real data is loaded** — under classical semantics, not a wrong answer but every answer. | `FINDING_CHEBI_BRANCHES.md` |
| 6 | **Open-world and closed-world semantics measurably disagree on a real question.** | `FINDING_OPEN_WORLD.md` |
| 7 | **Four separate silent zeros** across the project: a query returning a plausible number that was wrong, with nothing in the system able to say so. | `FINDING_NEGATION_LOWERING.md`, `DATA_SOURCES.md`, and others |
| 8 | **A control returned the right answer for the wrong reason** — it would have passed whether or not the thing it checked was true. | `FINDING_NEGATION_LOWERING.md` |

## What each one is doing in the argument

**#1 and #2 are why a learned prover is redirected** ([`IDEA_1.md`](IDEA_1.md) §3). The reasoner is
already complete and finishes in under two minutes, and the answer sets are identical — so the
domain's questions are *query-shaped*, not deep-proof-shaped. There is no search bottleneck to
attack. [`experiments/E1-proof-depth.md`](experiments/E1-proof-depth.md) exists to test this on a
fresh number rather than on this inherited one.

**#3 is the residual risk of the entire vision** ([`VISION.md`](VISION.md) §7). Logic can check that
a query is well-formed, that an answer is derivable, and that a result is not vacuous. It cannot
check *whether the query means what was asked*. Nothing was logically wrong with the 42. **Only a
known answer caught it** — which is why every protocol in this repository carries a known-answer
probe, and why the SIB pairs (`DATA.md` §4) are held out rather than trained on.

**#4 and #5 are the entrance failure** (§4, §5): the formalisation broke, and every inference
afterwards was flawless and useless. #4 is the known answer that
[`experiments/E3-chebi-respect.md`](experiments/E3-chebi-respect.md) is built on. #5 is why
inconsistency-tolerance is called a baseline requirement rather than an exotic one.

**#6 is why the closed/open split is a design requirement** (§3) rather than the curiosity it was
first filed as. The lab genuinely knows what it ran; the public graph genuinely does not know what
it does not assert. One query surface, boundary explicit.

**#7 and #8 are the methodological commitment.** A control that has never fired is
indistinguishable from one that cannot fire. Every check in this repository self-tests against a
planted failure before its silence is believed — see [`AGENTS.md`](AGENTS.md) §2.

## What is *not* measured, and must not be written as though it were

- **Nothing here measures the absence query.** *"What have we not tried?"* has no ground truth in
  this project or in any public dataset. It must be manufactured.
- **Nothing here measures question → query.** No domain corpus of (intent, query) pairs exists
  beyond the 1,239 held-out SIB examples.
- **Nothing here measures a learned model of any kind.** Every number above is symbolic — a
  reasoner, a query engine, an ontology. This repository has not yet trained anything.
