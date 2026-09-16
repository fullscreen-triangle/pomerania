# tacat-v3

**A position, and the experiments that would test it.** Enzyme-catalysis research data
infrastructure: where machine learning belongs, where logic belongs, and which of the two can say
*no*.

This repository is **self-contained**. Everything needed to run the work — the argument, the
evidence it rests on, the data sources with their licences, the environment, and the experiment
protocols with their pass/fail criteria — is here. It depends on no sibling checkout.

---

## Read in this order

| file | what it is |
|---|---|
| [`VISION.md`](VISION.md) | **the position.** ML has the ideas, logic has the veto — and the three tiers underneath that slogan. Start here. |
| [`IDEA_1.md`](IDEA_1.md) | the first proposal assessed against it (a transformer proof oracle), why it is redirected, and what the hardware can actually do. |
| [`EVIDENCE.md`](EVIDENCE.md) | **the measured facts both documents cite**, carried into this repository because the work that produced them lives elsewhere and is not checked out here. |
| [`DATA.md`](DATA.md) | every corpus, its URL, its licence, its size, and the exact command to fetch it. Verified live. |
| [`SETUP.md`](SETUP.md) | the environment, per machine, with a verification script that must pass before anything else runs. |
| [`experiments/`](experiments/) | one protocol per experiment: the question, the method, the controls, and **what counts as done**. |
| [`AGENTS.md`](AGENTS.md) | how to work in this repository. **An agent must read this before acting.** `CLAUDE.md` is a byte-identical copy. |
| [`apps/adventure/`](apps/adventure/) | the slide deck of the argument. Built from `src/deck.json`; do not hand-edit `index.html`. |

## The hardware this is written for

Three Google cloud GPU machines: **two with 8 GB of graphics memory, one with 16 GB.** They are
three independent workers, not a cluster. `IDEA_1.md` §6–§8 sizes the work against them; `SETUP.md`
says what to install on which.

**The GPUs are not the constraint.** The corpus is a few million triples and the embeddings fit in
3 GB. What is scarce is ground truth — see `AGENTS.md`.

## Start here, on a fresh machine

```bash
git clone git@github.com:jm9e/tacat-v3.git && cd tacat-v3
bash scripts/verify-env.sh          # says what is missing; installs nothing
bash scripts/fetch-data.sh          # ~250 MB, all CC-BY, into data/ (gitignored)
```

Then open [`experiments/E1-proof-depth.md`](experiments/E1-proof-depth.md). It is first because it is
the cheapest and because it can **falsify the argument this repository is built on** — which is the
right thing to run first.
