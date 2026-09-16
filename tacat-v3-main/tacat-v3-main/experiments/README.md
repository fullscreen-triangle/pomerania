# experiments

Four protocols. Each states its question, its method, its **controls**, and **what counts as done**.

**Read the whole protocol, including its controls, before starting.** Each names what would falsify
it. If a run cannot falsify anything, it is not an experiment.

| # | experiment | hardware | why it is in this order |
|---|---|---|---|
| [E1](E1-proof-depth.md) | **How deep are the proofs?** | **CPU only** | Cheapest, and the only one that can falsify the argument this repository is built on. **Run it first.** |
| [E2](E2-cqa.md) | Complex query answering over an incomplete graph | 8 GB #1 | The best fit for the hardware, and the one place a learned model adds recall a reasoner cannot. |
| [E3](E3-chebi-respect.md) | The ChEBI respect probe | any; small model on 16 GB | A **known-answer** case. Tests the proposer-plus-gate harness where a wrong answer cannot hide. |
| [E4](E4-nl2sparql.md) | Question → SPARQL, with synthesised data | 16 GB + 8 GB #2 | Largest, and the easiest to fake a good number on. Last. |

## What every protocol here has in common

- **A known answer somewhere.** The predecessor's four silent zeros were caught by known answers and
  by nothing else ([`../EVIDENCE.md`](../EVIDENCE.md) #3, #7).
- **A control that is self-tested against a planted failure.** A check that has never fired is
  indistinguishable from one that cannot fire.
- **A stated prediction, written before the run.** So that the result can disagree with it.
- **A "what it does not settle" section.** Because the way this work fails is by a narrow result
  being written up as a broad one.

## Reporting

One file per run, in `results/` (gitignored — commit the write-up, not the artefacts), carrying:

- the corpus files with sizes and fetch date, the heap, the tool versions;
- the controls, each marked **fired** or **did not fire**;
- the prediction, marked **held** or **failed**;
- the number, with its evidence tag ([`../AGENTS.md`](../AGENTS.md) §3).

**A run whose controls were not recorded did not happen.**
