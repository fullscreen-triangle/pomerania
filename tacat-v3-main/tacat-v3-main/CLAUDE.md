# Working rules for this repository

> `AGENTS.md` and `CLAUDE.md` are byte-identical copies, because different tools read different
> filenames. **Edit one, copy it over the other.**

**Read [`README.md`](README.md) for what is here. This file is how to work.**

---

## 1 · What this repository is for

It holds a position ([`VISION.md`](VISION.md)), an assessment of one proposal against it
([`IDEA_1.md`](IDEA_1.md)), and protocols for experiments that would test both. The work is
research. **The deliverable of an experiment is a number with its evidence status attached, not a
system that runs.**

There is no product here, no user, and no deadline. A negative result that is trustworthy is worth
more than a positive result that is not.

## 2 · The one rule that matters: a result that cannot be distinguished from a defect is a defect

This project's predecessor met **four separate silent zeros** — a query returning a plausible number
that was wrong, with nothing in the system able to say so ([`EVIDENCE.md`](EVIDENCE.md)). The
sharpest specimen: a SPARQL query returned **42** answers where the truth was **75**. Valid syntax,
real predicates, a genuine answer set, a strict subset with no spurious extras. It read as *"SPARQL
finds most of them"*. One variable shared across two slots had turned a union into an intersection.

**No logical check would have caught it, because nothing was logically wrong.** Only a known answer
caught it.

So, before believing any number this repository produces:

- **A count is not an attribution.** Verify the identity of what was measured — the actual file, the
  actual command line, the actual corpus — not just that a number came back.
- **An empty or zero result is a claim about the query, not about the world.** Diagnose which
  conjunct killed it before reporting it.
- **A check that has never fired is indistinguishable from one that cannot fire.** Every control in
  this repository must be self-tested against a planted failure before its silence is believed.
- **A success-shaped result from a check whose subject was never examined is the standard failure
  mode.** An exit code of 0 from a process that never ran the thing is the shape to watch for.

## 3 · Claims carry their evidence status

Both documents mark claims and so must anything added:

| tag | means |
|---|---|
| **[measured]** | a recorded number from a run, traceable to the file that holds it |
| **[verified DD Mon YYYY]** | checked live against the source on that date |
| *unmarked* | argument. Legitimate, and must never be written so that it reads as a finding. |

**Retractions stay in the record.** If a number is wrong, strike it and say why; do not silently
correct it. A document that describes a fixed state as the current one is worse than one that admits
its age.

**Date anything that will go stale.** `DATA.md` records a live count that had already moved
1.8M triples in three weeks — an undated figure that reads as current is worse than a stale one that
admits its age.

## 4 · What is actually scarce

Not compute. Three things, and knowing which one you are short of decides the experiment:

1. **Ground truth for the absence query.** *"What have we not tried?"* is a non-existence claim and
   no public dataset contains one. It must be manufactured. This is the emptiest square on the board
   and the most valuable.
2. **A domain training corpus for question → query.** The 1,239 curated SIB pairs are an
   **evaluation set** and are never to be trained on (`DATA.md` §4). Training data must be
   synthesised, and the synthesis gated.
3. **Somebody's attention.** Which is spent by producing numbers nobody can check.

## 5 · Before you run anything

```bash
bash scripts/verify-env.sh     # must pass; it installs nothing and changes nothing
```

Then read the protocol in [`experiments/`](experiments/) **completely**, including its *done-when*
and its controls, before starting. Each protocol names what would falsify it. If a run cannot
falsify anything, it is not an experiment.

## 6 · Reproducibility rules specific to this work

- **Pin the corpus. Never benchmark against a live endpoint.** Rhea's public endpoint grew from
  5,458,778 to 7,271,615 triples in three weeks (`DATA.md`). Any number measured against it is
  unreproducible by construction. Download, record the file size and date, measure against the file.
- **Record the heap.** Reasoner timings are meaningless without it. The predecessor's headline
  figure is *"at a default heap"* for exactly this reason.
- **Report the licence of anything vendored.** Only CC-BY sources may be committed. Anything else is
  fetched at run time by a script that records its licence. `data/` is gitignored — keep it that way.
- **State the direction convention.** Rhea publishes masters *and* directional variants; the counts
  differ (18,184 vs 18,854, `DATA.md` §2). Say which you counted, every time you quote one.

## 7 · Commits

- **Never add AI-assistance trailers.** No `Co-Authored-By: Claude`, no attribution footer, in any
  commit in this repository. End the message at its last real paragraph.
- Commit and push finished work rather than leaving it in the tree.
- The remote is **private**. Nothing here is published, linked or shared without the operator saying
  so — that decision is theirs alone and is never implied by work being finished.

## 8 · What this repository does not do

- **It does not touch the sibling projects.** `nfdi4cat-v1` is a frozen artefact; `nfdi4cat-v2` holds
  the measurements. Neither is checked out here and neither may be modified from here. Facts needed
  from them are carried into [`EVIDENCE.md`](EVIDENCE.md).
- **It does not contact anyone.** No emails, no issues filed in other people's repositories, no
  posting of results anywhere outward-facing.
- **It does not invent numbers.** If a figure is needed and not measured, the honest move is to say
  it is not measured and design the experiment that would measure it.
