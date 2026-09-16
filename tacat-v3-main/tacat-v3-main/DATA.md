# DATA · every corpus, its licence, and the command that fetches it

**Verified live 28 August 2026.** Every URL below was requested on that date; the byte sizes are
what the server reported. Re-verify before trusting a figure — §3 is the reason.

**The licence rule.** Only **CC-BY** sources may be committed to this repository. Everything else is
fetched at run time by [`scripts/fetch-data.sh`](scripts/fetch-data.sh), which records the licence
next to the fetch. `data/` is gitignored. *"Free for academic use"* is **not** open: BRENDA and
SABIO-RK are fine to query and wrong to ship.

---

## 1 · The core corpus — everything in `experiments/` uses this

| file | bytes | licence | URL |
|---|---:|---|---|
| `rhea.rdf.gz` | 8,690,178 | **CC-BY 4.0** | `https://ftp.expasy.org/databases/rhea/rdf/rhea.rdf.gz` |
| `rhea-directions.tsv` | 445,440 | **CC-BY 4.0** | `https://ftp.expasy.org/databases/rhea/tsv/rhea-directions.tsv` |
| `chebi_lite.owl` | 183,257,139 | **CC-BY 4.0** | `https://ftp.ebi.ac.uk/pub/databases/chebi/ontology/chebi_lite.owl` |
| `chebi.owl.gz` | 66,387,915 | **CC-BY 4.0** | `https://ftp.ebi.ac.uk/pub/databases/chebi/ontology/chebi.owl.gz` |

All four returned **HTTP 200** on 28 August 2026. Total ≈ 250 MB; fetch takes a few minutes.

**Use `chebi_lite.owl` unless an experiment says otherwise.** It carries the class hierarchy without
the chemical-structure payload, which is what the reasoning experiments need. `chebi.owl.gz` is the
full version and is four times the work for information none of the current protocols read.

**Why Rhea and ChEBI and not something larger.** Rhea models what this domain models — participants
with roles, stoichiometry and direction — and it is the corpus the predecessor's measurements were
taken over, so the numbers in [`EVIDENCE.md`](EVIDENCE.md) are comparable. ChEBI is the taxonomy to
*reason over*; PubChem has a hundred million entries and almost no subsumption, so it would add
volume without adding a single inference.

## 2 · Live endpoints, and the two gotchas

| endpoint | status 28 Aug 2026 |
|---|---|
| `https://sparql.rhea-db.org/sparql` | 200 (see gotcha) |
| `https://sparql.uniprot.org/sparql` | 200 |

**Gotcha 1 — a bare GET returns 302.** Follow redirects *and* send an Accept header, or you will
spend an hour on an empty result that is not empty:

```bash
curl -sL -H "Accept: application/sparql-results+json" \
  --data-urlencode 'query=SELECT (COUNT(*) AS ?n) WHERE { ?s ?p ?o }' \
  https://sparql.rhea-db.org/sparql
```

**Gotcha 2 — the counts depend on what you count, and Rhea publishes both.** Measured live with the
queries shown:

| what | count **[verified 28 Aug 2026]** | query |
|---|---:|---|
| approved masters | **18,184** | `?r rdfs:subClassOf rh:Reaction ; rh:status rh:Approved` |
| all reaction resources | **18,854** | `?r rdfs:subClassOf rh:Reaction` |
| triples on the endpoint | **7,271,615** | `SELECT (COUNT(*) AS ?n) WHERE { ?s ?p ?o }` |

**State which one you counted, every time you quote a figure.** Masters and directional variants are
not noise to be collapsed — direction is part of what the modelling reasons over.

## 3 · The endpoint moves, so never benchmark against it

The predecessor recorded **5,458,778 triples** on 5 August 2026. The same query returned
**7,271,615** on 28 August 2026 — **+1.8M in three weeks** **[verified 28 Aug 2026]**.

> **Any timing or answer-set measured against the live endpoint is unreproducible by construction.**
> Download the corpus, record its byte size and fetch date, and measure against the file. Use the
> endpoint for *discovery* and for federation, never for a number that goes in a result.

The approved-master count (18,184) has **not** moved since 5 August, so it is currently safe to
quote — with its date.

## 4 · The evaluation set — held out, never trained on

**[`sib-swiss/sparql-examples`](https://github.com/sib-swiss/sparql-examples)** — curated example
queries for the SIB endpoints. **Dual-licensed CC-BY 4.0 and MIT** (queries; the `src/` code is MIT
only) **[verified 28 Aug 2026]**.

**1,239 queries across 12 endpoints:**

| endpoint | queries | | endpoint | queries |
|---|---:|---|---|---:|
| neXtProt | 779 | | SwissLipids | 25 |
| UniProt | **132** | | emi | 24 |
| **Rhea** | **120** | | OrthoDB | 21 |
| Cellosaurus | 71 | | OMA · MetaNetX | 15 · **15** |
| Bgee | 27 | | GlyConnect · HAMAP | 6 · 4 |

Each is a Turtle file carrying an English intent (`rdfs:comment`), the query (`sh:select`) and its
endpoint (`schema:target`) — a native **(intent, query, endpoint)** triple over our exact endpoints.
Rhea also serves its own at `https://sparql.rhea-db.org/.well-known/sparql-examples/`.

> **This is an evaluation set. It is far too small to train on — 1,239 pairs trains nothing — and
> exactly the right size to be held out.** Training on it destroys the only trustworthy probe set
> this project has. See [`experiments/E4-nl2sparql.md`](experiments/E4-nl2sparql.md), which
> synthesises its training data instead.
>
> **It is also all *answerable* questions.** There are no unanswerable questions, no vacuity traps
> and no absence queries in it, so it tests generation and never refusal.

## 5 · Sources deliberately not used, and why

| source | why not |
|---|---|
| **Open Reaction Database** | data is **CC-BY-SA-4.0** — share-alike propagates to any derived corpus. Out of the core; its schema is worth reading regardless. |
| **BRENDA · SABIO-RK** | free for academic use, **not redistributable**. Fine to query, wrong to ship. |
| **KEGG · MetaCyc · Reaxys · CAS** | restricted or commercial. |
| **ChEMBL** | CC-BY-SA. **LIPID MAPS** | CC-BY-**NC** — unusable. |
| **PubChem** | public domain, but ~10⁸ compounds and almost no class hierarchy: volume without inference. |
| **MetaNetX** | **CC-BY 4.0 and genuinely useful** — a curated equivalence table across Rhea/KEGG/MetaCyc. Not in the core only because no current experiment needs it; it is the obvious referee for a *declared respect* (VISION §5) and should be added when E3 grows. |

## 6 · If an experiment outgrows this

- Needs more volume → **MetaNetX** (CC-BY, reconciles the restricted sources legitimately).
- Needs real ground truth for reversibility → **eQuilibrator**, which keys on Rhea, so it joins with
  no reconciliation.
- Needs a genuinely different reaction shape → **Open Catalyst OC20**, CC-BY 4.0 and enormous. This
  is the sharpest available test of whether the modelling is general or is biocatalysis wearing a
  general name.
