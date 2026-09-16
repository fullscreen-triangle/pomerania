# SETUP · the environment, per machine

**Three Google cloud GPU machines: two with 8 GB of graphics memory, one with 16 GB.** They are
**three independent workers, not a cluster** — no shared fabric, so model parallelism is not worth
attempting. The 3× comes from running independent jobs.

Run [`scripts/verify-env.sh`](scripts/verify-env.sh) first. It installs nothing and changes nothing;
it reports what is present and what is missing.

---

## Role per box

| box | role | needs |
|---|---|---|
| **16 GB** | the only box that can hold a 7–8B model: generation and QLoRA fine-tuning. Single tenant, one job at a time. | Python + PyTorch + transformers/peft/bitsandbytes |
| **8 GB #1** | CQA / embedding training ([`E2`](experiments/E2-cqa.md)) and sweeps | Python + PyTorch |
| **8 GB #2** | inference for back-translation and reranking; independent ablations | Python + PyTorch |
| **any / CPU** | the reasoner work ([`E1`](experiments/E1-proof-depth.md), [`E3`](experiments/E3-chebi-respect.md)), query enumeration, endpoint execution | **Java 11+**, ROBOT |

**[`E1`](experiments/E1-proof-depth.md) must not be run on a GPU box.** It is pure CPU, and it is
first.

## What to install

**Everything CPU-side (needed for E1 and E3):**

```bash
sudo apt-get update && sudo apt-get install -y openjdk-17-jre-headless curl python3-venv
curl -L https://github.com/ontodev/robot/releases/latest/download/robot.jar -o ~/robot.jar
curl -L https://raw.githubusercontent.com/ontodev/robot/master/bin/robot -o ~/robot && chmod +x ~/robot
```

ROBOT wraps the OWL API and gives `reason`, `explain` and `query` from the command line — enough for
E1's justifications and E3's consistency gate without writing Java.

**Python side:**

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install --upgrade pip
pip install rdflib SPARQLWrapper owlready2 pandas    # corpus + query work, no GPU
```

**GPU boxes, additionally** — install the PyTorch build matching the box's CUDA version, then:

```bash
pip install transformers peft bitsandbytes accelerate datasets
```

**Check the CUDA version against the driver before installing a wheel.** A `torch` that imports but
sees no GPU is a success-shaped result from a check whose subject was never examined
([`AGENTS.md`](AGENTS.md) §2) — `verify-env.sh` tests `torch.cuda.is_available()` and prints the
device, not just the import.

## Memory budget, measured against the boxes

| workload | VRAM ≈ | fits |
|---|---|---|
| KG embeddings, dim 256, ~250k entities | 1–3 GB | 8 GB, comfortably |
| label embedding + reranker | < 4 GB | 8 GB |
| QLoRA fine-tune 1.5–3B, 4-bit | 4–7 GB | 8 GB, short context |
| QLoRA fine-tune 7–8B, 4-bit, modest seq len | 12–15 GB | **16 GB only**, tightly |
| 7B inference, 4-bit | 5–6 GB | any box |
| training a theorem prover | ≫ 32 GB | **no** — see [`IDEA_1.md`](IDEA_1.md) §6 |

If a 7–8B QLoRA run OOMs on the 16 GB box, reduce sequence length before reducing model size —
context is what blows the budget here.

## Data

```bash
bash scripts/fetch-data.sh     # ~250 MB into data/, all CC-BY
```

`data/` is gitignored and must stay that way. [`DATA.md`](DATA.md) has the URLs, licences, sizes and
the two endpoint gotchas.

**Fetch once per machine and measure against the files.** Never benchmark against the live
endpoint — it moved 1.8M triples in three weeks (`DATA.md` §3).

## Disk and time

- Corpus ≈ 250 MB compressed, ~1.5 GB expanded with a materialised graph.
- A model checkpoint is a few GB. Budget 50 GB per box and it will not be close.
- The reasoner leg is ~80 s of CPU per full pass at a default heap ([`EVIDENCE.md`](EVIDENCE.md) #1).
  **Record the heap with every timing** — a reasoner timing without one is not a result.

## Long jobs

Run under `tmux` or `nohup` with output to a file. A training run killed by a dropped SSH session
that reports nothing is the most expensive failure available here.
