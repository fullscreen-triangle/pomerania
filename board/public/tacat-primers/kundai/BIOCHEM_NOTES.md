# Biochemistry papers — read notes

**Read 2 August 2026.** This is a private working note. It is not for the assessor and not
for Greifswald.

Two separate bodies of work, and **they are not the same quality tier**. Read §7 before
§6 — §7 was written later, after running the cytochrome validation, and it corrects §2.

**Part A — the levinthal application papers.** §§1–6 below.
Source: `bioinformatics\levinthal\publication\revised`. Four papers, ~330 KB, read in full.

- `protein-dynamics/protein-dynamic-equations.tex` — the framework (7 equations, 1200 lines)
- `carbonic-anhydrase/carbonic-anhydrase.tex` — CA II (889 lines)
- `superoxide-dismutase/superoxide-dismutase.tex` — SOD1 (1483 lines)
- `copper-redox/azurin-copper-redox-mechanism.tex` — azurin (2194 lines)

**Part B — the cytochrome P450 monograph.** §7.
Source: `bioinformatics\levinthal\cytochrome\publications`. 18 papers, ~757 KB, plus 140
validation scripts that **run**. Introduction read in full; validation run in full.

---

## 1. What the framework claims

One axiom — phase space is bounded, `Vol(Ω) < ∞` — and therefore the number of
distinguishable states `N = Vol(Ω)/hⁿ` is finite. Seven equations follow:

| | Equation | |
|---|---|---|
| I | `C(n) = 2n²` | capacity at partition level n |
| II | `Δℓ = ±1, |Δm| ≤ 1, Δs = 0` | selection rules |
| III | `M = Σ log_b(k_i)` | partition depth |
| IV | `ẋ = −γ∇M` | gradient flow |
| V | `φ̇_i = ω_i + Σ K_ij sin(φ_j − φ_i)` | Kuramoto phase-lock |
| VI | `Native = argmax ⟨r⟩` | folding endpoint |
| VII | `S_k + S_t + S_e = 1` | measurement without backaction |

Derived: categorical distance `d_C = |E_i △ E_j|`; step time `τ_step = h/k_BT`;
turnover `k_cat = 1/(d_C·τ_step + τ_diff)`.

Headline claim (abstract, repeated in the conclusion):
*"36 independent tests spanning five domains yield a 94% pass rate with zero free
parameters."*

**The bounded-phase-space axiom is sound and the argument from it to a resolution floor
is the same argument that works in pylon.** That part is not the problem. Everything
below is about what was built on top of it.

---

## 2. The finding that decides the framing

**There is no validation suite.** `\section{Comprehensive Validation Summary}`
(line 1008) is a five-row LaTeX table of prose claims:

```
Atomic structure    7   100%   C(n)=2n² exact for n=1–4        I
Electron transfer   5   100%   v_e = 9.5 km/s; δ = 1.65e-4     II, VII
Enzyme catalysis   12    92%   MAE = 0.97 log units            IV, V
Protein folding     5   100%   variance 1.08e-9; 5 steps       V, VI
Disease/ALS         7    86%   ρ = 0.841                       V, VI
Total              36    94%   Zero free parameters            I–VII
```

The 36 tests are never enumerated. The two failures are never named. No test is
described anywhere in the paper, and no runner is referenced. `C(n) = 2n²` "exact for
n = 1–4" is checking that 2n² equals 2n²; that is four of the seven atomic tests.

**Contrast with what I actually have:**

| | pylon | medium kernel | levinthal (Part A) | cytochrome (Part B) |
|---|---|---|---|---|
| checks | 11 | EXP-A/B/C | "36" | 140 scripts, ~700 checks |
| named | yes | yes | no | yes |
| runnable | `validate_network_yield.py` | yes, re-run and reproduced verbatim | no runner exists | **yes — 17 runners, run 2 Aug** |
| a check that failed | **yes — A.3, and it corrected the paper** | — | two failures, unnamed | **yes — 1, named and diagnosed** |

**The "biochemistry" column used to say "no runner exists" for everything. That was wrong
for Part B and is corrected above.** The cytochrome monograph has a real harness. Its
problem is a different one — see §7.

That last row is the whole difference. In pylon, A.3 failed, and the failure was
diagnosable, and diagnosing it changed the theory: the ratio form `P/(τcg(v))` had no
interior optimum, and the corrected concave-benefit/convex-cost form gave `v* = 0.4316`.
**A validation that can fail is worth more than one that reports 94%.** The biochemistry
papers have a 94% and no artefact behind it.

---

## 3. Defects a biocatalysis PI would find in minutes

Ordered by how fast Bornscheuer's group would hit them. These are not nitpicks; each one
is load-bearing for a headline claim.

### 3.1 The enzyme table refutes its own rule (framework, line 821)

The rule is `log₁₀(k_cat/K_M) ≈ 10 − d_C`, MAE 0.97 log units, "zero free parameters".

```
SOD1                1   pred 9   obs 9.85   err 0.85
Carbonic anhydrase  1   pred 9   obs 8.0    err 1.0
Catalase            1   pred 9   obs 7.6    err 1.4
Acetylcholinesterase 1  pred 9   obs 8.3    err 0.7
Fumarase            2   pred 8   obs 8.9    err 0.9
β-Amylase           2   pred 8   obs 7.6    err 0.4
Lysozyme            3   pred 7   obs 6.5    err 0.5
Chymotrypsin        4   pred 6   obs 4.0    err 2.0
```

Three problems, any one of which is fatal on its own:

1. **`10 − d_C` has two free parameters**, the intercept 10 and the slope −1. Calling it
   zero-parameter is only true if `d_C` were computed independently — and it isn't (§3.2).
2. **d_C is assigned, not measured.** Nothing in any of the four papers computes `d_C`
   from a structure. Given the observed rate, `d_C = round(10 − log₁₀(k_cat/K_M))` is the
   assignment, and the "prediction" is then arithmetic.
3. **MAE 0.97 log units is a factor of 9.3.** In enzyme engineering that is not a
   prediction. The paper's own Limitations section concedes this — *"insufficient for
   quantitative enzyme engineering"* — which is the honest sentence, but it is on
   line 1115 and the abstract is on line 30.

The four `d_C = 1` enzymes span 7.6 to 9.85 — a factor of 180 at a single value of the
only independent variable. **The table is the refutation.**

### 3.2 d_C has no algorithm

`d_C = |E_i △ E_j|` (graph edit distance between phase-lock edge sets) is well defined
and never computed. The CA II paper's Future Work asks for an algorithm. Every `d_C`
in every table is an asserted integer. In the CA II paper `d_C = 1` is *definitional* —
the two states are stipulated in §2.1, before any simulation runs.

This is the single most important defect, because every downstream number depends on it.

### 3.3 SOD1: a units error, and the prediction is the textbook answer

Framework line 794–797, and the same in the SOD1 paper:

```
k_cat^pred ≈ 1/τ_diff ≈ 1/0.1 ns = 10¹⁰ s⁻¹
experimental: k_cat/K_M ≈ 7×10⁹ M⁻¹s⁻¹     ← different units
```

`s⁻¹` compared against `M⁻¹s⁻¹`. And `d_C·τ_step` contributes 0.2% of the denominator,
so `k_cat = 1/(d_C τ_step + τ_diff)` reduces to `1/τ_diff`. **The prediction is "SOD1 is
diffusion-limited", which is the 1972 result being used as the comparison value.**

Worse for this audience: **electrostatic steering is never mentioned in the entire SOD1
paper.** No Debye screening, no ionic strength dependence, no Arg143. That is the actual
mechanism — Getzoff/Tainer's electrostatic funnel — and it is the reason SOD1 beats naive
diffusion. Getzoff1983 is cited, for loop gating.

### 3.4 CA II: predicts 10⁹, measures 10⁶, rescues with His64

Framework line 805, stated plainly: geometric limit predicts `10⁹ s⁻¹`, experiment is
`10⁶`, *"This discrepancy is explained by the rate-limiting proton transfer via His64."*

**A prediction wrong by 10³, rescued by the standard mechanism (Silverman 1988), and the
rescue presented as the framework "correctly identifying which step is rate-limiting."**
It identified nothing; the answer was imported.

### 3.5 The rate equation is falsified by the uncatalysed rate

Paradox 3 (line 817): the uncatalysed reaction has `d_C → ∞`, therefore
`k = 1/(d_C τ_step + τ_diff) → 0`. Uncatalysed CO₂ hydration is ~10⁻¹ s⁻¹, not zero.
The equation is falsified by a number in every textbook.

### 3.6 τ_step is the Eyring prefactor renamed

`τ_step = h/k_BT`. The paper says so itself at line 1088: TST *"is a special case"* with
`ΔM ≡ ΔG/(k_B T_P ln b)`. That substitution *defines* ΔM as ΔG rescaled. Deriving
Arrhenius "from geometry" is then circular — and in the SOD1 paper `τ_step` takes two
values 60× apart (0.2 ps in Catalysis, 12.5 ps implied in Conformational).

### 3.7 Determinism claimed from deterministic simulation

- SOD1: `σ_traj = 7.2×10⁻⁷` from *"100 independent folding trajectories with identical
  initial conditions."* Identical ICs in a deterministic ODE give **zero** variance by
  construction. The number measures floating-point noise.
- Framework line 889: `σ_traj = 1.08×10⁻⁹` across 30 runs, called *"not a funnel — a
  highway."*
- CA II: `R = 0.9999999999997446` — 16 significant figures from 100 stochastic runs, with
  a "dip" of size <10⁻¹² given a physical interpretation.

### 3.8 Text and captions disagree by orders of magnitude

| paper | quantity | body | caption |
|---|---|---|---|
| azurin | backaction δ̄ | 1.68×10⁻⁴ | **1.73×10⁻⁶** (100×) |
| azurin | cumulative | 2.78×10⁻³ | 2.94×10⁻⁵ |
| CA II | min approach | 91 pm | ~10 pm (9×) |
| SOD1 | τ_step | 0.2 ps | 12.5 ps (60×) |

The azurin body spends three paragraphs defending a cumulative excess that its own
figure caption says is 34× *below* threshold.

### 3.9 The azurin ternary result is negative and reported as positive

Trit distribution 0% / 71% / 29%, `H = 0.613`. The Discussion's own
`K_ternary ≈ 1.03 × K_binary` means ternary needed **3% more** measurements than binary
— stated in the same sentence as *"far better than the 37% speedup."* Abstract and
Conclusion still claim an advantage.

### 3.10 The azurin paper does not contain azurin

2194 lines, and the **entatic/rack state is never mentioned.** Nor Franck–Condon, nor
superexchange β, nor ΔG dependence, nor the inverted region. λ = 0.70 eV appears once,
as a cited table entry, and is never used in a calculation. **No rate is computed. There
is no limit in which the machinery returns Marcus.** §2.5 lists *"extensive literature
for validation"* as a selection criterion for choosing azurin — which is the tell.

All seven theorem environments are defined in the preamble and none is instantiated. The
four extraction functions `f_n, f_ℓ, f_m, f_s` are declared to be *"defined in
Eqs. n_map–s_map"* — and those equations **are** those four declarations. Never defined.

### 3.11 The ALS section is the most exposed

`τ_survival ∝ exp[10(⟨r⟩ − 0.5)]` fitted on four points, with a free coefficient (10)
and a threshold (0.5) placed after seeing the answer. Clinical survival figures uncited.
D90A is recessive and Scandinavian-founder — it cannot be one scalar. And the paper
**contradicts its own premise**: it states most mutants retain enzymatic function (the
correct gain-of-function view), yet A4V at ⟨r⟩ = 0.850 would be misfolded by its own
criterion. Aggregation — the actual disease mechanism — is never modelled.

Note also that the framework's table gives A4V ⟨r⟩ = 0.850 while the SOD1 paper gives
0.43. **The same variant, two numbers, in the same body of work.**

### 3.12 Housekeeping

- No figure files exist on disk for the CA II paper; `references.bib` in the SOD1 paper
  is 0 bytes.
- Affiliations differ between papers: AIMe Registry (framework) vs TU Munich, Dept of
  Theoretical Biology (CA II). One of those needs to be right.
- Azurin Theorem 4.3 (categorical commutation) is false as stated — coarse-grained
  projectors do not commute with momentum. And an operator commuting with `x̂`, `p̂` *and*
  `Ĥ` is by Schur a multiple of the identity, carrying no information; the paper claims
  exactly this as its *"key innovation."*
- Azurin physical errors: Cu(I) is 3d¹⁰4s⁰ but one caption says 4s¹; P₂ is generated by a
  Cu(II) spin absent at t=0 in a state the paper's own EPR check confirms diamagnetic;
  perturbations certified as ≪ kT are credited with driving 1.9 eV and 10.2 eV
  transitions.

---

## 4. The pattern, stated once

Across all four papers:

1. **Nothing could have failed.** Every ✓ is a literature value re-listed in the results
   column, a model output inside a factor-of-3 window, or a constraint imposed in Methods
   and announced in Results. (Azurin: *"Normalization enforced: S_k+S_t+S_e = 1 at each
   time step"* in Methods → *"confirming information is conserved"* in Results.)
2. **The central quantity is uncomputable.** d_C, everywhere, asserted.
3. **The textbook answer is reached and presented as confirmation** — His64 for CA II,
   1/τ_diff for SOD1 — while the mechanism that actually explains the system is omitted
   (electrostatic steering; the entatic state).
4. **The evidence loop is closed.** Azurin reconstructs ψ *from* the categorical
   trajectory, then derives p, then δ, then "no collapse" — the evidence that measurement
   didn't disturb the wavefunction is a wavefunction built from the measurement record.

None of this is fraud. It is what happens when a framework is elaborated without an
adversary. **pylon had an adversary — the validation script — and it cost one wrong
equation and bought a correct one.**

---

## 5. What is actually salvageable

Three things survive contact with a biocatalysis group, and they are worth more than the
seven equations.

### 5.1 Adaptive experimental design under measurement cost — the strongest bridge

The ternary trisection algorithm, stripped of every quantum claim, is: **localise a hit
in a large space in `O(log₃ N)` informative measurements rather than `O(N)` exhaustive
ones.** That is *exactly* the transaminase-HTS problem — minimise assays to find an
active variant. Dörr's group runs a Thermo Fisher/Fanuc F5 doing fully automated
screening; the binding constraint there is plate-hours, not ideas.

This connects to work I can actually defend:
- **pylon**: allocation under a resolution floor, with a settling bound and a
  confirm-or-decline rule — a scheduler that *refuses* when the evidence cannot narrow
  the cell.
- **the medium**: per-join gating, refusal carrying `required_budget`, threshold
  `e* → 2N ln2` computable from corpus size with **no fitted constant**.

Both are the same shape as "should this plate be run, and if not, what would make it
worth running." That is a contribution to a screening platform, and it is backed by
runnable validation.

### 5.2 The framework's predictions are hypotheses an HTS platform is built to falsify

Predictions 1 and 2 (lines 1049–1051) are the honest part of the paper and are stated as
untested:

> **P1.** Any enzyme with d_C = 1 operates at or near the diffusion limit.
> **P2.** Artificial enzymes designed with d_C = 1 will achieve higher catalytic
> efficiency than those designed by transition-state stabilisation alone.

P2 is directly testable by directed evolution — which is Bornscheuer's core method. The
right framing is not "my framework explains catalysis" but **"here is a structural
predictor that I believe is wrong in an interesting way, and your platform can falsify it
at a throughput no one else has."** That is a proposal a screening group can act on. It
also requires solving §3.2 first — an algorithm that computes d_C from a PDB structure —
which is a concrete, finishable piece of work.

### 5.3 Multi-modal data fusion and structure-prep pipelines

Ordinary, useful, and immediately applicable to a lab that generates plate reader traces,
GC/MS, and sequence data that currently don't sit in one place.

---

## 6. How to handle this tomorrow

**Do not present the seven equations as validated.** If catalysis comes up — and it will,
because it is his field and I raised it — the defensible version is:

> "I've been working on a categorical/topological account of catalysis — the idea that
> turnover reflects pathway length in configuration space rather than barrier height.
> I have a framework paper and three application studies. I want to be straight about
> where it stands: the central quantity, the categorical distance, I can define but not
> yet compute from a structure, and until I can, the enzyme correlation has free
> parameters I've been calling zero. The eight-enzyme table has four enzymes at the same
> categorical distance spanning two and a half orders of magnitude, which is either the
> refutation or the interesting part, and I don't yet know which. What I'd want from a
> screening platform is the thing that settles it."

**Why this is the strong move, not the weak one.** He is a biocatalysis scientist. If I
present the enzyme table as a result, he finds §3.1 and §3.3 during the talk — the units
error is a five-second catch for someone who works on `k_cat/K_M` daily — and everything
else I say becomes suspect, including tacat and pylon, which are sound. If I present it
as a live problem with a known weak point, I am the person who audits their own work, and
**that is the thing he already said he liked** — someone who thinks like him.

The contrast is available and I should use it. **pylon's A.3 failed and corrected the
paper. The medium's threshold has no fitted constant. Those are on slides.** The
biochemistry doesn't have that yet, and saying so out loud is what makes the other two
credible.

The one-sentence version, if I only get one:

> "Catalysis as pathway topology rather than barrier height — the framework is written,
> the validation isn't real yet, and the fastest way to find out if it's true is a
> screening platform."

---
---

# 7. Part B — the cytochrome P450 monograph

**Read and run 2 August 2026.** `bioinformatics\levinthal\cytochrome\publications`.
18 papers, ~757 KB. Introduction read in full (840 lines); all 140 validation scripts
executed.

**This is a better body of work than Part A and it should be discussed instead of Part A.**
It also has one specific weakness that I need to be able to state before I am asked.

## 7.1 What is different, and it is not cosmetic

| | levinthal (Part A) | cytochrome (Part B) |
|---|---|---|
| validation scripts | none exist | **140, all runnable** |
| verified result | unverifiable | **138/140, run this session** |
| named checks | none | yes — `orbit_closed`, `n_states_7`, `ratio_chem_ET_ge_100` |
| free parameters | claimed zero, actually ≥2 hidden | **2, declared up front** |
| a failing check | 2, unnamed | **1, named, diagnosed to root cause** |

The two constants are **declared**, which is the single biggest improvement over Part A:

- `ν_floor = 10¹⁰ s⁻¹` — condensed-phase attempt floor, `= κ_sol/τ_p`
- `T_part = 65 kJ/mol` — partition temperature

Universal rate law `k = ν_floor · exp(−ΔM)`. The introduction says plainly (lines 548–550):
*"ν_floor and T_part are not fitted to P450 data; they are set once from the partition-landscape
calibration and held fixed through all seventeen papers."*

**One internal tension to own before it is found.** The abstract says the framework
*"calibrates"* two constants and *"There are no other free parameters"*; line 360 says
*"There are no tunable parameters. There are no fits to data."* Those are not the same
sentence, and 65 kJ/mol was *"established against activation energies... giving r = 0.97"*
(line 641). **That is a fit.** Two declared constants fitted once and held fixed across 18
papers is a perfectly respectable position — but it must be said that way, not as "no fits
to data."

## 7.2 The suites run. Verified, not asserted — 138/140

```
catalytic-cycle/ch-activation-rebound              8/8 PASS
catalytic-cycle/compound-i-formation               8/8 PASS
catalytic-cycle/multi-hop-et-chain                12/12 PASS
construction/membrane-cofactor-cpr                 8/8 PASS
diversity/57-human-isoforms                        6/8 PASS   <-- the one failure
diversity/polymorphisms-ddi-inhibitors             8/8 PASS
equilibrium-states/cyp3a4-resting-substrate-bound  8/8 PASS
foundations/expression-algebra-for-biomolecules    8/8 PASS
foundations/glb-structural-input                   8/8 PASS
informatics/database-recovery                      8/8 PASS
manifold/p450-address-manifold-cyp3a4-fold         8/8 PASS
pharmacology/pharmacogenomics-atlas                8/8 PASS
reactions/atypical-reactions-atlas                 8/8 PASS
reactions/heteroatom-dealkylation                  8/8 PASS
spectroscopy/spectroscopic-atlas                   8/8 PASS
synthesis/57-isoform-taxonomy                      8/8 PASS
synthesis/seven-state-closed-orbit                 8/8 PASS
```

Note: the introduction claims *"132 independent validation scripts"* across *"fifteen
papers."* On disk there are **140 scripts across 17 suites**. The claim understates it —
harmless, but a reader who counts will find the mismatch, so don't quote 132.

**Refined 2 Aug, third pass.** The introduction is not uniformly wrong on the count — it
contradicts *itself*. The abstract, §1.8 and the conclusion all say **seventeen papers**,
which matches disk exactly. Only §7 ("Overview") enumerates fifteen and totals "132 scripts
across all fifteen monograph papers." So the **prose is right and the enumeration is
stale** — §7 was written when the monograph was fifteen papers and never updated. If asked,
that is the answer: two papers were added and the overview section didn't follow.

Also refined: **`diversity/polymorphisms-ddi-inhibitors` ships an empty `validation/results/`
directory** while its abstract claims "All 8 validation scripts pass (8/8 PASS)." I ran the
eight scripts on 2 Aug — **they all pass, 13/13 checks on the summary script.** The results
were simply never committed (there is a `__pycache__`, so they had been run). Nothing is
wrong with the claim; the artefact is just missing. Worth knowing before someone opens that
directory live and finds it bare.

## 7.3 The results directories — the real artefact

**Corrected 2 Aug, second pass.** My first read looked only at the scripts and concluded
"empirically thin." **That was too harsh and partly wrong.** Each paper writes a
`validation/results/` directory: **142 JSON files** across 17 suites. They are the strongest
part of the corpus and they should be shown.

Each result carries: `validation_id`, a `paper_reference` to a **numbered theorem**,
per-check pass counts, `elapsed_s`, `random_seed`, the full computed record, a
`paper_predictions` block, and — the thing that matters most — **parameter sweeps**.

A sweep is what separates "I found a parameter that works" from "here is how the answer
moves when the parameter does." `03_heme_capacitor` sweeps ε_r from 3 to 10;
`08_redox_shift` sweeps `n_eff` 1–6 and ΔM; `07_chamber_confinement` sweeps Δσ and ε_r.
**That is a habit a physical scientist recognises immediately.**

### Where it genuinely lands

| result | computed | reference | verdict |
|---|---|---|---|
| KIE at 310 K (`03_kie_prediction`) | **9.63** | experimental 8–11 | real prediction |
| heme capacitance | 56.7 zF, 1.41 eV, 56.7 ps | paper 57 zF, 1.4 eV, 60 ps | consistent |
| redox shift on binding | **E_bound = −177.4 mV** | experimental **−180 mV** | good |
| spin-crossover E_a | 14.26 kcal/mol | paper 14.0 | good |

The KIE one is the best single number in the corpus: ν_CH = 3000 cm⁻¹, ν_CD = 2121 cm⁻¹
→ ΔZPE = 1.26 kcal/mol → semiclassical 7.68, tunnelling κ_H/κ_D = 1.25, **total 9.63**,
falling to 7.63 at 350 K. That is computed from physical inputs, not re-listed.

### Where a check passes that should not — say these before he finds them

1. **`07_chamber_confinement`: `z_star` = 796.6 nm vs paper prediction 5.0 nm.** A factor
   of **160**, printed side by side in the same file, and the script **PASSes**. Δφ 282 mV
   vs 180; confinement 10.6 kT vs 7.0. **This is the single most exposed file in the
   monograph** — the disagreement is legible without reading any code.
2. **`05_spin_crossover`: `k_predicted` = 1.62×10¹³ s⁻¹ vs `experimental_range`
   [10⁷, 10⁸].** Five orders of magnitude, recorded as PASS. Note the diagnosis is
   available and good: **E_a is right (14.26 vs 14.0) and the prefactor is wrong.** The
   check was written on the activation energy, which agrees, rather than on the rate,
   which does not.
3. **`04_water_variance`: resting F = 0.121 kcal/mol vs paper 0.6** (5×). The binding
   number is fine (−6.64 vs −7.4).

The check kinds I catalogued from the scripts still stand and still matter — tautologies
(`N_INITIAL_CONDITIONS == 100`, `delta_M_matches_ln2` where ΔM *is* ln 2), re-asserted
constants (`d_C_eq_1` — **the Part A §3.2 problem, now inside the harness**), and windows
too wide to fail (`tau_310K_within_factor_1000_of_paper`). **The results files are what
make those visible**, because they print the paper's number next to the computed one.

### The manifold results confirm the §7.4 circularity from the other side

`03_family_clustering` records CYP1, CYP2 in cell `11011` and CYP4, CYP11 in `11101` —
**families sharing dominant cells** — with purity as low as **0.50** (CYP5) and 0.55
(CYP7), and it passes. And `05_allele_resolution` gives `*5` the address `555555555` with
Sk=St=Se=0.5 — a sentinel for the whole-gene deletion, not an address. Both are legible
to anyone who opens the file.

## 7.4 The family-separation pair — the single most useful artefact here

Two scripts test the same claim (CYP family structure is recoverable from a
bounded-phase-space address) and **neither one tests it**. They fail in opposite
directions, which is what makes the pair worth presenting.

| | addresses from | outcome | why |
|---|---|---|---|
| `manifold/03_family_clustering` | synthetic sequences drawn from `FAMILY_BIASES` | **PASS** | circular — separation was injected by the generator |
| `diversity/02_family_separation` | `rng.integers(0,3,size=6)`, families by index range | **FAIL**, ratio 0.998 | no family information in the addresses at all |

**The failing one.** `02_family_separation` asserts `ratio_inter/intra > 1.5` and measures:

```
k=3 intra-family mean Hamming: 2.023
k=3 inter-family mean Hamming: 2.020
Ratio inter/intra: 0.998
```

Root cause, from the source: addresses are `np.random.default_rng(42).integers(0,3,size=6)`
tuples, and `FAMILIES` assigns membership by **index range** (`CYP1 = range(0,3)`,
`CYP2 = range(3,17)`, ...). Family membership is an arbitrary partition of random tuples.
Separation is impossible **by construction** — the check could never have passed.

**The passing one is worse.** `03_family_clustering` generates sequences i.i.d. from
hand-written per-family amino-acid compositions (`FAMILY_BIASES`, `_common.py` lines
114–133), then confirms that composition-derived addresses cluster by family. That is a
round-trip through the encoder, not recovery of Nelson's nomenclature. **No real CYP
sequence appears anywhere.** And it carries its own admission in a code comment:

```python
# Whole-sequence centroid is too coarse at k=3 for full 18-family
# resolution; this validation uses k=5 (243 cells, ~14x families)
# to demonstrate the methodology. The depth-3 narrative claim of the
# paper assumes active-site-weighted addresses (deferred to Paper 4).
DEPTH = 5
```

The paper's Theorem 5.1 is a **depth-3** claim. The validation runs **depth 5** — 243 cells
for 18 families — and says so in a comment rather than in the paper.

**Why this is an asset and not just a defect.** One check failed honestly, in my own
harness, and diagnosing it exposed that its passing twin was circular. That is the
biochemistry analogue of pylon's A.3 — a test that could fail, that did, and whose failure
taught me something specific. The difference from A.3 is that A.3's lesson has already been
folded back into the paper and this one has not yet. Say that.

Secondary and environmental, worth one clause only: the failing script also crashes on
`TypeError: Object of type bool is not JSON serializable` — a `numpy.bool_` issue under
Python 3.14 in `_common.py:25`. It masks the scientific failure but is not the failure.
`08_validation_summary` then fails `all_7_prior_pass` downstream, which is why the suite
reads 6/8.

## 7.6 What the checks are, structurally — read all 17 papers, 2 Aug

**This is the finding that should govern the framing, and it took reading every paper and
every results directory to see it.** §7.3 said the results files are "the strongest part of
the corpus." That stands. But there is a structural fact about *what kind of thing* they
check, and it is visible in about ninety seconds to anyone who opens one script.

**Most checks are round-trips through a unit conversion.** The shape recurs across suites:
take a literature rate, convert to ΔM via `ΔM = ln(ν_floor/k)`, then verify that
`ν_floor·exp(−ΔM)` returns the literature rate. `membrane-cofactor-cpr/03_fmn_heme_distance`
states it in its own field names:

```
k_ET_exp: 5000000.0  →  DM_ET: 7.6009  →  k_ET_reconstructed: 5000000.0
check "k_ET_reconstructed_matches": true
```

That is `exp(ln(x)) = x`. It cannot fail.

**This is not fraud and not useless — but it is not what "validated" means.** ΔM is a
re-parameterisation of rate: a log scale with two constants fixed once. The suites verify
the algebra is applied consistently across 17 papers and that no paper contradicts another.
That is a real property and worth claiming. What it is *not* is empirical confirmation.

**So: never say "validated." Say "internally consistent, and here is where it makes a
falsifiable prediction."** Dörr builds lab automation and reads code. The gap between "132
scripts, all PASS" and what those scripts contain is exactly the kind of gap a person who
writes test harnesses for robots notices, and being the one to name it first is the whole
difference.

### The closed-orbit paper is wrong by 1000× on its own headline

The single largest numerical defect found, and it is in the **synthesis** paper — the one
that closes the monograph.

| | paper (`closed-orbit.tex` L310–318) | its own JSON (`05_poincare_return`) |
|---|---|---|
| dwell times | "0.14–0.25 ps" | **134.99–250.93 ps** |
| `T_return` | "≈ 1.4 ps" | **1510.43 ps = 1.51 ns** |
| `k_cat,intrinsic` | "≈ 7×10¹¹ s⁻¹" | **6.6×10⁸ s⁻¹** |

**The JSON is right.** 1/(3.985×10⁹ s⁻¹) = 251 ps, not 0.25 ps. One unit slip, propagated
through every dwell time in the section. Consequence: the abstract's **"sub-nanosecond
intrinsic return time" is false on the paper's own numbers** — 1.51 ns is not sub-nanosecond.
Six occurrences of the phrase, five in `closed-orbit.tex` and **one inherited by the
introduction** (L352).

Second defect, same paper: the abstract says chemistry outpaces ET by **1040×**.
`05_poincare_return.json` computes the whole-cycle ratio as **132.41**. Both numbers live in
the same suite — `07_rate_hierarchy` reports *per-step* ratios (~1000–1275), `05` reports
*cycle-level* (132). The conclusion survives either way; the quoted number is the wrong one
of the two.

Third: the paper's Table 2 gives 4-tuples `(n,ℓ,m,s)`; `04_non_identity.json` gives
**6-tuples** — State 1 is `[3,0,3,2,0,1]` against the paper's `(3,2,0,1)`. The paper's tuple
is the last four. Two leading coordinates exist in the code and are never mentioned in the
paper. And the Newton's Cradle theorem's proof is *"inspection of Table 2"* — the states are
distinguishable because they were **assigned** distinct addresses, not because distinctness
was derived.

### Cross-document number drift — do not quote two of these together

| quantity | values found | where |
|---|---|---|
| aliphatic C–H KIE | **7.2 / 9.63 / 7.7** | ch-activation paper / its JSON / heteroatom abstract |
| Cpd I redox potential | **0.9 V / 0.53 V** | compound-i abstract / its own proof (26.7×5×4 = 534 mV) |
| Floor(R_bio) | **3.7×10⁻⁴ / 3.43×10⁻⁴** | expression-algebra text / its panel 01 |
| manifold depths | **k=3, k=6 / depth-5, depth-8** | theorems / figures + code |

All three KIE values sit inside the experimental 4–11 band, so all three "PASS." That is the
point: the window is wide enough that three different numbers all clear it.

### What is genuinely strong, having now read everything

- **The introduction's §1 is the best writing in either corpus** and needs no framework
  vocabulary to land. The monkey calculation is correct and devastating: 47⁻¹³⁰·⁰⁰⁰ ≈
  10⁻²¹⁷·⁰⁰⁰; every atom in the observable universe typing at one key per Planck time for
  the age of the universe still falls short by **216,860 orders of magnitude**. Then the
  real move — the monkey isn't sampling, it's evaluating what monkeys are. The Plymouth 2003
  six-monkey trial (output: mostly the letter S) is a real citation and a good one.
- **`informatics/database-recovery` is the cleanest suite** — Shannon capacity against
  classes to distinguish, provable rather than fitted. 9.51 bits available at k=6 against
  5.83 needed for 57 isoforms. Caveat: its "accuracy 0.80" is *derived from the bit ratio*,
  not measured on sequences. No P450 sequence is read anywhere in it.
- **Two-tier chirality (expression-algebra Thm 12.1)** resolves a real tension rather than
  patching it: `s_orbital` topologically conserved, `s_state` free, so spin-crossover is
  reorganisation *within* a categorical cell rather than a forbidden transition.
- The parameter-free hits from §7.3 all stand.

### The one real falsifiable prediction — lead with this if he engages

**KIE should fall with temperature**: 9.63 at 310 K → 7.63 at 350 K (or 7.2 → 5.8 on the
paper's other value). **QM/MM tunnelling models predict the opposite.** It is cheap, it is
discriminating, and it is measurable on the kind of platform Bornscheuer's group already
runs. That is the sentence that turns a monograph into a proposal.

Second, weaker but distinctive: the Newton's-cradle non-identity implies isotope-labelled
NADPH electrons should **not** physically arrive at the heme.

## 7.5 What to say tomorrow — this replaces §6

**Lead with the cytochrome work. Keep Part A out of the room.** If catalysis comes up, and
it will:

> "The larger piece is a monograph on cytochrome P450 — the catalytic cycle, Compound I
> formation, the multi-hop electron transfer chain, the 57 human isoforms. What I'd
> actually want to show you is the harness: 140 scripts, 142 result files, every check
> tied to a numbered theorem, with parameter sweeps. I'd call it internally consistent
> rather than validated — a lot of those checks are round-trips through a unit conversion,
> and I'd rather say that than have you find it. Some of it lands — the kinetic
> isotope effect comes out at 9.6 against an experimental 8 to 11, from nothing but zero-
> point energies and a tunnelling correction, and the redox shift on substrate binding
> predicts minus 177 millivolts against a measured minus 180. And some of it passes when
> it shouldn't. The spin-crossover rate is five orders of magnitude off the experimental
> range and my check let it through, because I wrote the check on the activation energy,
> which is right, instead of on the rate, which isn't."

**Lead with a number that lands, then a number that doesn't.** Both in the first thirty
seconds. That ordering is the whole move — it buys the right to be believed on the first
one by volunteering the second.

Then, if pressed on the deepest problem:

> "The structural one is the address encoding. There's a test that asks whether CYP family
> structure falls out of it — it fails, ratio 0.998 against a threshold of 1.5. Tracing
> that showed me the twin test that passes, passes because the sequences are synthesised
> from per-family compositions. So the answer was planted in one and absent in the other,
> and neither actually tests the claim. What it needs is real sequences — the 57 isoforms
> are in UniProt, the alleles are in PharmVar. Every input in that repository is currently
> generated. That's a weekend of work and it's the difference between internally
> consistent and tested."

**Why this is the strong move.** He is a biocatalysis scientist running a screening
platform — the entire value of that platform is *real measurements at throughput*. A person
who says "my validation is synthetic and here is exactly which script gave it away" is
speaking his language. A person who says "138 of 140 pass" and gets one script opened is
not.

**The contrast still works and is now three-wide:** pylon's A.3 failed and corrected the
paper; the medium's `e* → 2N ln2` has no fitted constant; the cytochrome harness caught its
own circular test. All three are the same habit, which is the thing he said he liked.

The one-sentence version:

> "17 papers on P450 with a harness that runs — the KIE prediction comes out at 9.6 against
> an experimental 8 to 11, and the spin-crossover rate is off by five orders of magnitude
> and still passes, which tells you where my checks need tightening."

**If he only remembers one thing, make it that sentence.** It contains a real result, a
real failure, and the fact that I found the failure myself. (**Seventeen, not eighteen** —
17 papers plus one 0-byte placeholder file, `foundations/p450-sequence-space`, which is
empty on disk. The introduction's own abstract and conclusion both say seventeen.)

### The close, if the conversation is going well

Everything above is defensive. This is the one forward-looking move, and it should be held
until he engages rather than spent early:

> "There's one prediction in it that isn't a re-parameterisation. The kinetic isotope effect
> should *fall* with temperature — 9.6 at 310 K down to 7.6 at 350. Tunnelling-corrected
> QM/MM predicts it goes the other way. That's a real disagreement, it's cheap to measure,
> and it's the kind of thing your platform runs without noticing. If it falls, the framework
> survives a test it could have failed. If it rises, I've learned something that eighteen
> months of algebra couldn't tell me."

**Why this closes well.** It hands him something to *do* rather than something to assess, it
concedes falsifiability out loud, and it is phrased as an experiment on his equipment. He
said five times he was glad to meet someone who thinks like him — this is the sentence that
tests whether that was true.

### The three files to have open

If the laptop is on and he asks to see something, these in this order:

1. `catalytic-cycle/ch-activation-rebound/validation/results/03_kie_prediction.json` — the
   best number. ZPE in, KIE 9.63 out, correct T-dependence.
2. `equilibrium-states/.../results/08_redox_shift.json` — −177.4 mV predicted vs −180 mV
   measured, with the `n_eff` and ΔM sweeps visible.
3. `equilibrium-states/.../results/07_chamber_confinement.json` — **volunteer this one.**
   796.6 nm vs a paper prediction of 5.0, passing. Showing it unprompted is worth more
   than the first two combined.

**Do not** open `diversity/57-human-isoforms/` live — it crashes on a numpy/JSON
serialization bug under Python 3.14 before it prints anything useful. Describe that one.

## 7.7 The monograph website — what it is, and the one thing to say about it first

`cytochrome/src` is a Next.js pages-router site: 24 pages mirroring the papers, D3 chart
components, react-three-fiber canvases, and — the part worth showing — `pages/ide.js`, a
`.shk` sandbox at `components/shakespeare/` + `helpers/shakespeare.js`. Eleven lessons, each
performing one paper into **one accumulating receiver**: the cut count `M` is monotone across
lessons, so lesson 5 runs on the state lesson 4 left behind. That is a genuinely good
demonstration of the framework's central claim, and it is the natural bridge to his interest
in an operating system for science.

**Say the limitation before demoing it, for the same reason as §7.6.** The interpreter's own
header says it: *"Heavy operations (fold, track) replay the lesson's baked oracle — the
monograph's own validated numbers — rather than recomputing."* It is a teaching surface, not
a solver. Volunteering that costs nothing and it is visible in the first comment block of the
file he would open.

**One defect to know about before he finds it.** `helpers/shakespeare.js` `assert` does not
evaluate its condition at all:

```js
m = line.match(/^assert\s+(.+?)(?:\s+emit\s+"([^"]*)")?$/);
if (m) {
  say(`assert ${m[1]}   ${oracle.verdict === "PASS" ? "✓" : "✗"}`, ...);
```

It prints ✓ whenever the lesson's baked verdict is `PASS`, regardless of the assertion. The
one place this bites is lesson `09_variant-effect`, whose assertion is *also* written
backwards — `assert mut.coherence >= wt.coherence` with `emit "variant destabilises fold"`,
where the oracle has 0.79 and 0.83. So a false condition prints a tick next to a message
saying the opposite. **This is the same finding as §7.6 in a second medium**: the harness
reports PASS structurally rather than by checking. If it comes up, that is the honest reading
and it is a better answer than a fix would be. See [[biochem-deck-is-built]].

## 7.8 Biochemistry audit — every claim against the accepted literature, 2 Aug

Scope: is the mechanism right, are the cited experimental values real and correctly used, is
any standard result misstated — **independent of whether the framework explains it**. Read the
result JSONs, recomputed the physics where it was checkable.

### The verdict first: the biochemistry is sound, and that is not the contribution

The mechanism is correct throughout. Seven-state cycle, oxidation states +3/+3/+2/+2/+3/+4/+3,
d-counts 5/5/6/6/5/4/5, per-state spins 1/2, 5/2, 2, 0, 1/2, 1/2, 1/2 — all verified against
the accepted cycle, d-counts recomputed from electron count. Heterolytic O–O cleavage,
Compound I as Fe(IV)=O porphyrin pi-cation radical, oxygen rebound, the CPR chain.

The experimental values are **real and correctly recalled**, several from specific papers:

| Value | Source | Verdict |
|---|---|---|
| Mössbauer delta = 0.11, dE_Q = 0.90 mm/s | Rittle & Green, CYP119 Cpd I | correct |
| Cpd I Soret 367 nm | Rittle & Green | correct |
| CO complex 450 nm | definitional for the family | correct |
| Soret 417 LS to 392 HS (Type I shift) | canonical, right direction | correct |
| EPR LS g = 2.42/2.25/1.92 | P450cam rhombic | correct |
| EPR HS g_max = 7.7 | S = 5/2 substrate-bound | correct |
| nu(Fe=O) 795 cm-1 | ferryl stretch | correct |
| tau_radical 54–133 ps, k_rebound 7.4e9 | Newcomb radical clocks | correct |
| KIE = 1 for aromatic + epoxidation | non-HAT, no primary KIE | **correct and discriminating** |
| 57 human isoforms, Nelson symbols | enumerated, all real | correct |
| 1TQN / 1W0E | CYP3A4 free / progesterone-bound | correct pairing |

Someone bluffing writes g = 6.0 for the high-spin form and misses that epoxidation has no KIE.
**Say this out loud if the mechanism is questioned — but do not lead with it.** Everyone in
Bornscheuer's group knows the P450 cycle. Knowing it correctly is the floor, not the edge.

### The defect list — thirteen, and they cluster into one failure mode

**Checks that cannot fail (the slide-10 pattern), strongest first:**

1. **`08_spectroscopic_observables.json` — five of eight "predictions" are numerically identical
   to the experimental value.** EPR g 1.99=1.99, Soret 367=367, spin 0.5=0.5, potential 0.9=0.9,
   lifetime 1.0=1.0, absolute error exactly 0.0. These are the measured values entered as
   predictions and compared against themselves. The 2.4% average relative error is five zeros
   dragging down three real comparisons. **This is the best example in the corpus — the tautology
   is visible without algebra: two columns, same column.**
2. **`05_absorbance_dm_correlation.json` — `pearson_r = 1.0` exactly.** dM is computed as a log
   of the Soret wavenumber, so this correlates a quantity with a transform of itself. r = 1.000
   across seven points is never empirical. Produces a headline ("spectroscopy correlates with
   partition depth, r = 1.0") that is an identity. **Pair it with (1) on the slide — two
   independent instances of one failure mode beats one.**
3. `KIE_decreases_at_higher_T` — exp(dZPE/kT) is monotone decreasing for any positive dZPE,
   and dZPE > 0 by construction since omega_H > omega_D always. Verifies that a decreasing
   function decreases.
4. `Fe_is_HS` — a check that a value equals the value the author wrote. Restatement, not test.

**Checks that pass on values outside their own stated range:**

5. **`kcat_KM_within_BRENDA_range: true`** with predicted 1.00e+08 against a stated range of
   [2.0e+05, 5.0e+06]. **20x above the top.** Most citable defect in the corpus — the
   contradiction is on one screen.
6. `f_6beta_within_experimental_range: true` with 0.4875 against [0.5, 0.7]. Below the range.
7. `predicted_rate_within_8_log_of_experimental` — a tolerance of **eight orders of magnitude**;
   the 4.9-order miss passes. (Disclosed in the paper's own figure caption, line 607.)
8. `KIE_total_in_range_4_to_11` — seven-wide window on a quantity whose range is ~5–15.
9. `expected_spin_crossover_steps_present` — tests subset membership only, so it cannot fail on
   an *extra* crossover. Found 4, expected 3, PASS. The classifier flags any dS != 0, so it
   counts the trivial 5/2 -> 2 shift of a one-electron reduction as a crossover. By that rule
   every one-electron step in every metalloenzyme is a spin crossover.
10. `raman_shift_gt_30cm1` — one-sided floor; passes on 35, 45, or 300.

**Substantive biochemistry errors:**

11. **18-O Raman shift given as 45.5 cm-1; harmonic reduced-mass calculation gives 35.2 cm-1**
    from 795 cm-1. Off by 29%. Observed ferryl 18-O shifts are ~34–36. Cleanest defect in the
    corpus — pure arithmetic, no framework involved, easiest for someone else to find.
12. **The radical intermediate has three incompatible descriptions across two files.**
    `04_radical_intermediate` says `Fe_spin: "HS"`; `08_full_state7_transition` says
    `Fe_state: "Fe(III)"`; the accepted assignment is **Fe(IV)-OH (Compound II), S = 1**, an
    intermediate-spin ferryl — not high-spin, not Fe(III). Both files PASS.
13. **Compound I is labelled three ways**: `"LS-doublet"`, `"HS_radical"`, and bare S = 0.5.
    The accepted description is Fe(IV) S=1 antiferromagnetically coupled to a porphyrin radical
    S=1/2 giving S_total = 1/2, with near-degenerate doublet/quartet surfaces (two-state
    reactivity). `"HS_radical"` is actively wrong.

**Also:** ferrous Fe(II) labelled LS in the spectral atlas but correctly HS (S=2) in the
spin-crossover file — substrate-bound ferrous P450 is high-spin five-coordinate.
`bits_needed_57_isoforms: 5` — log2(57) = 5.83, so 6; five bits addresses 32. And the corpus
cites the FMN-to-heme rate as 5e7 s-1 in one paper and 5e6 in another, and beta as 1.1 A-1 in
one and 1.4 in another, both as "the literature value". **Do not quote two of these together.**

### The Marcus finding, stated precisely

Not "the Marcus theory is wrong." The distance decay is correct — the ratio 1.670170079e-05
equals exp(-1.1 x 10) exactly, verified independently. The defect is narrower: the activation
term is `exp(-lambda/4kT)`, which is Marcus **with dG0 = 0**, and physiological FMN-to-heme ET
runs downhill — that is *why* it is fast. The paper's own theory section (line 168) names dG0 as
an ingredient; the implementation omits it. The figure caption concedes the H_DA point and not
the dG0 point, so the whole shortfall is attributed to coupling when part of it is the missing
driving force. H_DA is independently ~13–130x too small.

### The one correction this forces on the deck

**Slide 12 is wrong as stated.** It frames KIE 9.63 -> 7.63 as "opposite in sign to
tunnelling-corrected QM/MM". It is not opposite in sign — the tunnelling ratio kappa_H/kappa_D =
1.253 is held **constant** between 310 K and 350 K, which is precisely the term that must vary
(tunnelling grows as T falls). So the predicted decline is entirely the semiclassical ZPE term,
and a tunnelling-corrected calculation predicts a *steeper* decline in the same direction, not
an opposite one. The prediction is still falsifiable; the distinguishing claim is wrong. **Fix
the slide before Monday** — this is the one audit finding that is a task, because it is a false
claim on a slide rather than a defect in a frozen artefact.

### How to use this

Everything except the slide 12 correction is **material, not a task** — the same rule as the
tacat submission. The corpus is not being assessed line by line; the defects are worth more as
evidence that you audit your own work than as bugs to close. The register: *"I went through my
own monograph against the literature. The mechanism holds. I found thirteen places where a check
was structurally incapable of failing, including two that produce impressive-looking headline
numbers — a Pearson r of exactly 1.0, and a table where five of eight predictions equal the
experiment to the digit. Here is how I would rebuild the checks."*

That is the answer to *what do I bring in biochemistry*: **the mechanism is the credential; the
audit is the contribution.** See [[biochem-deck-is-built]] and section 7.6.
