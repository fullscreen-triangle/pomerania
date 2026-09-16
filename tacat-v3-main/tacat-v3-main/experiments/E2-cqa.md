# E2 · Complex query answering over an incomplete graph

**The best fit for the hardware, and the one place a learned model can add something a reasoner
cannot.** Runs on one 8 GB box.

---

## The question

A reasoner is complete over what the graph **asserts**. It is silent about what the graph is
**missing** — and a real graph is always missing things: curators disagree, coverage is uneven,
links are not yet drawn. [`VISION.md`](../VISION.md) §3 calls this the open-world half.

> **Can a learned model recover edges the graph does not contain, at a precision that makes it
> usable as a *proposer* — with the reasoner still holding the veto?**

This is the established *complex query answering over incomplete knowledge graphs* task (GNN-QE /
CQD / QTO lineage — see `IDEA_1.md` §5 for pointers). We are asking whether it transfers to a real
biochemical corpus with a complete reasoner available as referee.

## Method

1. **Build the corpus** from the downloaded Rhea + ChEBI files (`../DATA.md` §1). Record the file
   sizes and fetch date.
2. **Hold out known edges.** Remove a random 10% of a chosen relation, keeping them as the test set.
   *These are edges the graph really has* — so recovery is checkable, unlike genuinely unknown facts.
3. **Train** a query-answering model on the remaining 90%. Embedding dimension 256; the table is
   ~256 MB of parameters, ~750 MB with optimiser states — comfortable in 8 GB.
4. **Evaluate on multi-hop queries**, not only single edges: 1p, 2p, 3p, 2i, 3i shapes at minimum.
   Report MRR and Hits@k.
5. **Compare against the reasoner** on the *complete* graph, which is the referee: how much of what
   the reasoner derives does the model recover, and what does it propose that the reasoner does not?

## The comparison that is the actual point

Report **three** columns, not two:

| | what it answers |
|---|---|
| reasoner on the full graph | ground truth — what is genuinely derivable |
| reasoner on the ablated graph | what a complete method gets when the graph is incomplete: **this is the gap** |
| the learned model on the ablated graph | how much of the gap it closes, and at what precision |

**The gap between columns 1 and 2 is the entire justification for this experiment.** If it is
negligible — if the ablation barely hurts the reasoner — then incompleteness is not a real problem
on this corpus and the learned model has nothing to add. **Report that outcome if you get it.**

## Controls

- **Non-vacuity.** A query shape that returns nothing on the full graph tests nothing. Confirm each
  shape has non-empty answers before scoring it.
- **A random-scoring baseline.** If the model does not beat random ranking by a wide margin, the
  embedding is not learning the graph and the metrics are decorating noise.
- **Self-test the ablation.** Confirm the held-out edges are genuinely absent from the training
  graph. An ablation that silently fails to remove them yields spectacular scores and means nothing —
  this is the standard shape of a too-good result.
- **Leakage check.** Inverse relations and directional variants can reintroduce a held-out edge by
  another name. Rhea publishes masters *and* directional variants (`../DATA.md` §2), so this is a
  live hazard here, not a theoretical one.

## Done when

- [ ] The ablation self-test fires and is recorded.
- [ ] All three columns are reported, over ≥5 query shapes, with MRR and Hits@k.
- [ ] The gap between columns 1 and 2 is stated as a number and interpreted in one sentence.
- [ ] The random baseline is reported alongside.
- [ ] A statement of whether the model's proposals, gated by the reasoner, would be worth a
      chemist's attention — or would not.

## Hardware

**8 GB box #1.** Embeddings 1–3 GB; hours, not days. Sweeps can use the second 8 GB box.

## What it does not settle

**Recovering a held-out edge is not the absence query.** This measures recall of things that *are*
true and merely unrecorded. *"What has nobody tested?"* is a claim that something is **not** true,
and no learned model can certify one (`IDEA_1.md` §4). Do not let a good result here be written up
as progress on that.
