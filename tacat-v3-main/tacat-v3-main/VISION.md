# ML has the ideas. Logic has the veto.

**Written 27 August 2026.** A vision document, not a plan and not a result. It argues a position
about where enzyme-catalysis research data infrastructure should go next, and it is deliberately
built on simplifications — *"logic is rigid, ML is fuzzy"* is not true as stated, and is the right
substrate for a vision anyway.

**Two kinds of claim appear here and they are marked.** Statements tagged **[measured]** rest on work
done in `nfdi4cat-v2` and are traceable to a recorded number. Everything else is argument. Where the
distinction matters most — the failure specimens in §7 — the evidence is named inline.

**The word *check* appears at two scales, and they cost differently.** A **symbolic** check — is this
well-formed, derivable, in inventory, already tested — is a lookup; §6 and §7 are about those. An
**empirical** check is an experiment; §8 is about that one. The cost asymmetry argued in §6 belongs
to the first scale only.

---

## 1 · What is actually being looked for

The mistake is to think the goal is a model of chemistry. It is not, and nobody would fund it if it
were.

The Bornscheuer group's currency is **an enzyme that does something it could not do before** — a
transaminase that accepts a bulky ketone, a hydrolase that survives industrial conditions. Their own
phrase is *"tailor-made biocatalysts suitable for industrial applications,"* and *suitable for
industrial applications* is load-bearing: a real reaction, at real concentration, at a real
temperature, that a company could run.

But the platform work sits one level above that. Its unit of discovery is not an enzyme; it is
**a method that keeps working** — including in somebody else's lab, next year, without its author
present. The publications say so directly: LARA, SiLA2, *"towards transparent, accessible and
reproducible platforms."* This is instrument-building, and instrument-builders are judged by what
other people find with their instruments.

> **The finding being pursued is not an enzyme. It is the factory — and the proof that its output
> can be trusted.**

Everything downstream in this document follows from that. Ontologies, identifiers, reasoning and
search are not the goal. They are what stops the factory's output from evaporating.

## 2 · The bottleneck the robot created

Automating an enzyme screen means a plate courier — a robot arm moving microtiter plates between
incubator, shaker, centrifuge, liquid handler and plate reader — while the chemistry happens in the
stations. Colony picking, growth, expression, harvest, lysis, assay, evaluation. One arm, dozens of
plates, unforgiving timing.

That solved the hands, and immediately exposed the head:

**A robot can run a thousand experiments a week. A human can interpret dozens.**

Worse, the thousand do not accumulate into knowledge. They accumulate into a directory — kinetic
traces in instrument-specific exports, keyed by plate and well, joinable only by whoever remembers
what was in plate 42. A screening platform whose history cannot be queried is a machine that forgets
everything it learns.

Semantics is the answer to *that*, and only that. Not because reasoning about chemistry is
interesting for its own sake, but because without shared identifiers the platform's own accumulated
data cannot be queried as one thing.

## 3 · Search is the deliverable

The brief this workspace was assessed against ended at *"provide a SPARQL endpoint."* The endpoint
**is** the product. Everything upstream exists so that somebody can ask.

Which recasts one of v2's findings. Plain SPARQL returns the identical answer set that HermiT does
for the project's headline question **[measured]**, and that was first read half-apologetically — as
though the ontology had been caught not earning its keep. Under a search framing it is the opposite:
**the questions this domain asks are query-shaped, and that is the job description.** The reasoner's
proper role becomes unembarrassing — it is the **index builder**, precomputing so that queries are
fast and so that people who do not know the rules can still ask.

Search is not one capability. For a screening lab it is at least six, and the current stack answers
them very differently:

| the question | shape | answerable today |
|---|---|---|
| everything about variant X | exact lookup | yes — **if identity holds** |
| variants >2× wild-type on substrate S at pH 8 | filter + aggregate | yes; the bread and butter |
| which hits match known reactions or homologs | federated join | yes — what shared identifiers buy |
| the causal chain behind this number | recursive path walk | yes, and where a graph beats a table |
| enzymes **like** this one; substrates **near** this pocket | similarity | **no** — no class contains "nearly" |
| what have we **not** tried? | query over absence | **no**, and it is the valuable one |

### The query that matters most is over absence

For a machine that can run a thousand experiments a week, the highest-value question is not *what did
we find*. It is **what should we run next** — a query over the gap: which substrate × variant ×
condition combinations has nobody tested? Answering it is worth more than any single hit, because it
is what stops the robot re-running dead space. It is also the query that turns discarded negative
results from waste into an asset.

And it is precisely the query that open-world semantics cannot answer. OWL is deliberately humble:
not derivable ≠ false. That is *correct* for public knowledge — ChEBI not asserting something does
not make it untrue — and *wrong* for the lab's own records, where you genuinely do know what you ran.

So the architecture needs a split that neither the brief nor v2 articulated:

- **closed-world over the lab's own experiments** — these are all the runs, therefore that combination
  is untested
- **open-world over the public graph** — ChEBI does not say, so we do not know

in one query surface, with the boundary explicit. v2 measured these two semantics disagreeing on a
real question **[measured]** and filed it as a curiosity. It is a design requirement — and §6 shows
it is the *same* requirement one layer down, where completeness plays the part the closed-world
assumption plays here.

## 4 · Two ends of a spectrum

Logic is **crystal**: truth survives composition. A chain of a million valid inferences loses
nothing. Its price is brittleness at the boundary — the world must be curated into symbols before
logic can touch it, and one wrong symbol poisons everything downstream, silently and permanently.

Machine learning is **weather**: it touches the raw world without asking permission — noisy spectra,
misspelled labels, patterns nobody formalised. Its price is that nothing composes. Chain two model
outputs and errors do not add, they breed. And it cannot decline: ask something unanswerable and it
answers anyway, fluently.

The failure modes are mirror images, and this is the useful part of the simplification:

> **Logic fails at the entrance — getting the world in.
> ML fails at the exit — getting trust out.**

Both are attested in v2. The entrance failure: ChEBI's class *"amino acid"* contains none of the
amino acids the reactions actually use, because the charged species Rhea works with sit in a branch
organised by charge state **[measured]**. The formalisation broke; every inference afterwards was
flawless and useless. The exit failure: four separate occasions where a query returned a plausible
number that was wrong, with nothing in the system able to say so **[measured]**.

One correction to the spectrum, worth keeping because it prevents the picture from hardening: the
fuzzy middle already lives inside the rigid end. OWL's open world says *unknown*, not *false* — logic
with built-in humility. And a model at temperature zero is a deterministic function. Each end
contains a small model of the other, which suggests the spectrum is not a place a system stands. It
is a line **individual answers travel along**.

## 5 · Equivalence is not similarity

This is the deepest coordinate, and getting it wrong is what breaks joins silently.

**Equivalence** is reflexive, symmetric and — the load-bearing one — **transitive**. Transitivity
carves the world into clean non-overlapping classes, and classes license the operation logic cannot
live without: **substitution**. If A = B then B may stand wherever A appears, and every truth
survives the swap. Proofs, queries and joins are all chains of replacing equals with equals.
Equivalence is also binary and *witnessable*: same or not, and a system claiming "same" can say why.

**Similarity** is reflexive, roughly symmetric, and **not transitive** — and that is not a small
defect, it is the defining feature. A resembles B, B resembles C; iterate and you walk from an amino
acid to something that is not one, each step innocent. Similarity leaks across chains. It cannot
make classes, only neighbourhoods: fuzzy, overlapping, centred wherever you are standing. It is
graded rather than binary — nothing in an embedding space is ever *equal*, and everything is somewhat
similar to everything. And it is respect-free: similar *in what way?* The dot product will not say,
which is why a similarity score cannot carry a witness.

> **Similarity ranks. Equivalence licenses replacement.** You can retrieve with a ranking. You cannot
> reason with one.

### Every real equivalence is manufactured

The bridge between them is one move: **declare a respect**. Say which differences do not count, and
"same" becomes "differing only in ways I have agreed to ignore." Same molecule *up to protonation*.
Same reaction *up to direction*. Same sequence *up to synonymous codons*. Forced transitivity,
purchased by naming what you forget.

This is exactly where the ChEBI failure lives. *Is L-alanine zwitterion the same as L-alanine?* has
no answer until the respect is declared. Under *ignore charge state*: same. Under *what exists at
pH 7.3*: different. A single hierarchy forces **one** quotient on data that legitimately supports
several, and the join needed the other one. The empty result was not a bug in the logic or in the
data. It was **two undeclared respects colliding**.

The lab needs both relations, in sequence: **retrieve by similarity, book by identity.** The ledger
can only run on identity — provenance, joins, "this experiment tested *that* compound" are all
substitution, and a non-transitive relation corrupts them the way chained similarities walk off a
cliff. So the critical machinery is the **conversion step**: turning "these two are 0.97 similar"
into either *"same, in this declared respect, here is the witness"* or *"distinct — book
separately."* Fuzzy in, certified out, or an honest refusal.

## 6 · The synthesis

Put ML on the search side and logic on the check side. **This section is about the first gate only** —
the symbolic one, which runs before anything physical happens. The full architecture has three tiers
and §8 states them: *logic bounds → ML ranks → the experiment decides.* The experiment is the
expensive gate, and it is dealt with there.

This is not a compromise between paradigms; it rests on a real asymmetry, and the asymmetry is
specific to that first gate:

> **At the first gate: finding is hard, checking is cheap.**

The space of candidate answers is enormous; validating one candidate **against a fact** is bounded
work — a lookup, not an experiment. So the inexact, cheap, creative technology goes on the expensive
side, and the exact, rigid technology goes where exactness is affordable. Each does what its cost
profile suits.

**ML has the ideas. Logic has the veto.**

One caveat so this does not harden into dogma: the split is by **role in the loop, not by inherent
capability**. Reasoners generate too — materialisation is generation. Learned models can verify — a
discriminator is a checker. What matters is that whatever occupies a veto seat must be
**auditable**: its judgements re-runnable by someone who does not trust it.

**And there are two veto seats, not one.** Logic holds the first — over what may be proposed at all.
The experiment holds the last — over what becomes a fact (§8). Reading them as one seat makes the
cheap gate look like it is claiming the expensive gate’s authority, which is not the argument.

### The search itself has two halves, and they are not alike

"ML ranks, logic checks" is too coarse, and the order it implies is wrong. A search over the design
space is **two operations**, and the filter comes first:

1. **Feasible?** — binary, checkable, cheap, and **certifiable**: the answer carries a witness.
   *"Excluded: this ketone is not in inventory and has no supplier under six weeks."* A chemist can
   verify that.
2. **How promising?** — continuous, unverifiable until tested, and carrying **no witness**. A score of
   0.83 has no reason attached that anyone can check.

The ordering is not stylistic. You cannot rank 10¹¹ candidates and then discard most of them, so
feasibility has to act as a **generator** — defining the space that is sampled from — rather than a
sieve applied to a list already produced.

### And the stronger reason, which is not about cost

The paragraph above defends construction-first on scale, which is the weaker argument: it says only
that the other order is expensive. The real reason is a property no budget recovers.

**Both routes are sound.** Everything either one returns is genuinely feasible — construction by
definition, generate-and-test because the check said so. Neither emits a false positive, which is
the property that cannot be given up when a wrong answer sends a machine to run a plate for a week.

**Only construction is complete.** Generate-and-test finds what it proposed and nothing else, so a
candidate it never sampled is not ruled out — it is simply unexamined. Which fixes exactly what each
is entitled to claim:

> **Generate-and-test can prove that something exists. It can never prove that nothing does.**

And that collapses §3 and this section into **one requirement rather than two**. *"What have we not
tried?"* is a **non-existence claim**. So completeness is to the search what the closed-world
assumption is to the query: **the property that licenses a no.** The lab needs the same thing twice,
in two layers — over its own records, so a query can answer *nothing matches*; and over the
candidates it generates, so a campaign can answer *this specification is not reachable here*.

With one honest caveat that decides where each is available. **Construction is complete in
principle, and at 10¹¹ it cannot be run to completion in practice** — so in the design space neither
route delivers a usable *no*. Completeness is only cashable where the space is small enough to
exhaust, which is precisely the ledger. That is not a weakening of the parallel; it is why the
ledger is structural. **The place you can say no is the place you have covered completely, and for a
laboratory that is its own history — never the space of things it has not built.**

A sampled search that comes back empty and is read as *"there is none"* is an open-world unknown
wearing the clothes of a settled fact — §4's exit failure again, at the scale of a whole campaign
rather than a single answer.

And the two halves differ in exactly the way §5's two relations differ: **one licenses a decision
with grounds, the other only orders.** Feasibility is equivalence-shaped; ranking is
similarity-shaped. That is not a coincidence, and it is why they must not be merged into one score.

### The trap: feasibility that is secretly a prediction

Not everything that *looks* binary is:

| tier | examples | genuinely binary? |
|---|---|---|
| **1 · known** | substrate in stock · codon valid · **already tested** · assay covers this product · buffer holds at that pH | **yes** — lookup or rule, certifiable |
| **2 · predicted** | will it fold? · will it express? · soluble? · stable at 40 °C? | **no** — predictions wearing binary clothes |
| **3 · ranked** | activity · selectivity · *k*cat/*K*M | no, and openly so |

Tier 2 is where this vision most easily fails. *"Will it express"* feels like a fact, but it is only
known after testing. Let a model's prediction sit in the feasibility filter and **a prediction has
taken the veto seat** — the one seat that must be occupied by something auditable.

Worse, it is **self-confirming**. Exclude everything a model believes will not fold, never test
those, and the model is never contradicted there. **The blind spot never heals.** This is the same
shape as an assumption written into a description field that then validates itself on every
subsequent read, which cost this project a day of misattributed evidence **[measured]**.

### Which gives one operating rule

The two error types are wildly asymmetric:

- **Wrongly excluded** → you never find out. Silent, permanent, invisible to every metric.
- **Wrongly included** → you waste one well. Loud, cheap, and **self-correcting** — the experiment
  says so immediately.

> **Be strict where the constraint is a fact. Be generous where it is a prediction.**

Tier 1 removes from the space. Tier 2 should **demote in the ranking, never delete** — a
model-doubted candidate belongs at position 8,000 with its reason recorded, because deletion is
unfalsifiable, and one plate a month spent on doubted candidates is the only way the model gets
corrected at all.

A small unification worth noting: **"have we already tested this?" is simply one clause of the Tier-1
filter.** The absence query of §3 is not a separate capability — it is the ledger doing feasibility
work. Which is the sharpest argument for why memory and search must be one system: without the
ledger, the filter's single most valuable clause cannot be evaluated at all.

## 7 · What can be checked, and what cannot

Three things are genuinely checkable:

- **The query is well-formed** — real predicates, schema-conformant, types line up. Fully decidable,
  cheap, and it catches a great deal of generated output.
- **The answer is derivable** — the result carries a proof that can be re-run independently. Cheap
  *if the certificate is emitted*, which is a design decision made at the engine, not afterwards.
- **The answer is not vacuous** — did this return nothing because the world is empty, or because a
  conjunct never matched? Mechanical, and almost nobody does it.

And the one logic **cannot** check: **whether the query means what was asked.** There is no formal
object to check it against; the intent is in a person's head.

> **The specimen, from our own work.** A SPARQL query returned **42** answers where the truth was
> **75** **[measured]**. It was flawless — valid syntax, real predicates, a genuine answer set, a
> strict subset with no spurious extras. It read as *"SPARQL finds most of them"*, which is the
> comfortable conclusion. One variable shared across two slots had silently turned a union into an
> intersection. **No logical check would have caught it, because nothing was logically wrong.** Only
> having a known answer to contradict caught it.

That is the residual risk of this entire vision, and it belongs in the vision rather than being
discovered later: **the check catches malformed and unjustified. It does not catch plausible-but-not-
what-you-meant.**

What closes that gap is not more logic. It is four instruments, all of which v2 used — two of them
by accident:

- **Round-trip the query back into prose** and have the human confirm it. The only instrument that
  touches intent directly.
- **Ground-truth probes** — a few questions whose answers are known, run continuously. This is what
  caught the 42.
- **Differential agreement** — two independent paths to one answer. A second engine reports things no
  single engine can **[measured]**; in v2 the slower engine's value was never its speed, it was that
  it disagreed informatively.
- **Vacuity controls** — a query that would return nothing regardless of the data is a defect, not a
  result.

### The related hazard: answering over a contradiction

Under classical logic one contradiction makes everything derivable. v2's own submitted ontology
contains a disjointness axiom that is chemically false, inert at demo scale, and **makes the ontology
inconsistent once real data is loaded** **[measured]** — not a wrong answer, every answer.

For a lab whose graph will *always* be slightly inconsistent — curators disagree, instruments
contradict, one supplier's compound is not quite another's — reasoning that survives contradiction is
not exotic. It is a baseline requirement, and it is the difference between a system that degrades and
one that detonates.

## 8 · Three tiers, not two

The division is not ML-then-logic. In a laboratory it is:

> **logic bounds → ML ranks → the experiment decides.**

Logic comes first, per §6: it defines the feasible space rather than pruning a list after the fact.
ML then orders what remains. And logic can only check consistency with what is already known. For anything genuinely new — does this
mutant actually work — the only valid check is the robot. An experiment is the sole legitimate way a
conjecture becomes a fact, and **the robot is the border crossing**: fuzzy hypotheses go out, and
what survives contact with reality comes back stamped.

This is why automation is load-bearing in the vision rather than merely convenient. It makes the
final check *cheap enough to run at the speed the first two tiers generate candidates*. The lab
becomes a pump running on the gradient between the two ends of §4 — imagination in, certainty out,
and **nothing enters the ledger without a stamp**.

## 9 · What is open

A settled ontology is where the hard part starts. The field largely won *"can we represent this and
decide entailment"* and thereby exposed a much less solved problem: getting a real question from a
scientist's head to a trustworthy answer.

| problem | status |
|---|---|
| question → query (KGQA, text-to-SPARQL) | genuinely open science |
| empty answers: *why?* (why-not questions, query relaxation) | theory exists; essentially absent from production |
| querying an inconsistent graph (inconsistency-tolerant semantics, repairs) | solid theory; almost never deployed |
| similarity and structure in one query (hybrid retrieval) | very active, unsolved |
| explaining an answer (justifications) | works; output often unreadable |
| federation across real endpoints | specified; miserable in practice |

The **open science / open practice** distinction matters because the two need different responses.
Three of these have decades of literature and near-zero deployment — which is why a team with a
working stack, a curated ontology and people paying attention still met four silent zeros.

*These are reported from knowledge of the fields, not from a literature review conducted for this
document. The areas exist and this is roughly what they address; current state of the art should be
checked before anyone leans hard on a specific claim.*

## 10 · What this would actually be

Not "an LLM that writes SPARQL." That is the silent zero industrialised — it fails in exactly the
register the domain cannot detect. The interesting system is one whose generosity is matched by its
willingness to stop:

1. **Ask in your own words.** The model proposes a query.
2. **See the query, in prose, before it runs.** The only intent check that exists.
3. **It is validated before execution** — predicates exist, types line up, it is not vacuous.
4. **The answer arrives with its derivation**, re-runnable by someone who does not trust the system.
5. **An empty answer is diagnosed, never returned bare** — which conjunct killed it, and what
   relaxation would return something.
6. **Similarity is available but never silently promoted to identity.** Retrieval by neighbourhood is
   a first-class query; entering the ledger requires a declared respect and a witness.
7. **Feasibility and promise are reported separately, never as one score.** What is ruled out is
   ruled out *with a witness*; what is merely doubted is demoted, not deleted, and says by how much.
8. **The system may refuse** — *"I could not turn your question into a query I can justify"* — and a
   refusal is a recorded result, not an error.
9. **What it cannot settle becomes an experiment**, queued for the robot, and returns as a stamped
   fact.

Point 8 is the one most systems omit and the one that decides whether any of this is usable in a
laboratory. **A system that fails well is worth more than one that always answers** — because a
laboratory acts on the answers, and a plausible wrong answer does not merely mislead a reader, it
sends a machine to run the wrong plate for a week.

---

## What this rests on

Measured in `nfdi4cat-v2`, and load-bearing for the argument above:

| fact | where it matters |
|---|---|
| the semantic layer classified 18,115 real reactions in ~80 s at a default heap | §1, §3 — the wall holds; the tax is affordable |
| plain SPARQL returns the identical answer set for the headline question | §3 — the questions are query-shaped |
| ChEBI's *"amino acid"* types none of the four amino acids the reactions use | §4, §5 — the entrance failure, and the undeclared respect |
| a valid query returned 42 where the truth was 75 | §7 — the limit of what logic can check |
| four separate silent zeros across the project | §4, §9 — the exit failure, repeatedly |
| a shipped disjointness axiom makes the ontology inconsistent on real data | §7 — answering over a contradiction |
| open-world and closed-world semantics measurably disagree on a real question | §3 — the closed/open split is a requirement |

And the methodological commitment underneath all of it, which is the part that transfers: **claims
carry their evidence status, retractions stay in the record, and a result that cannot be
distinguished from a defect is treated as a defect.**
