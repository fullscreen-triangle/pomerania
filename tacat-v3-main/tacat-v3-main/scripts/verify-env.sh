#!/usr/bin/env bash
# Report what is present and what is missing. Installs nothing, changes nothing.
# See ../SETUP.md for what to install and on which box.
#
# This script tests SUBJECTS, not imports: it asks torch whether it can SEE a GPU
# and asks the endpoint for an actual answer, because a check that never examined
# its subject returns success either way. See ../AGENTS.md section 2.

cd "$(dirname "$0")/.."
missing=0

hdr() { printf "\n== %s ==\n" "$1"; }
ok()  { printf "  ok    %s\n" "$1"; }
no()  { printf "  MISS  %s\n" "$1"; missing=$((missing+1)); }

hdr "CPU side -- needed by E1 and E3"
command -v java >/dev/null 2>&1 \
  && ok "java: $(java -version 2>&1 | head -1)" \
  || no "java -- apt-get install openjdk-17-jre-headless"
{ [ -f "$HOME/robot.jar" ] || command -v robot >/dev/null 2>&1; } \
  && ok "robot present" \
  || no "robot -- see SETUP.md"
command -v python3 >/dev/null 2>&1 \
  && ok "python3: $(python3 --version 2>&1)" \
  || no "python3"

hdr "Python packages"
for pkg in rdflib SPARQLWrapper owlready2 pandas; do
  python3 -c "import $pkg" 2>/dev/null && ok "$pkg" || no "$pkg -- pip install $pkg"
done

hdr "GPU -- asking torch what it can SEE, not whether it imports"
if python3 -c "import torch" 2>/dev/null; then
  python3 - <<'PY'
import torch
if torch.cuda.is_available():
    for i in range(torch.cuda.device_count()):
        p = torch.cuda.get_device_properties(i)
        gb = p.total_memory / 1024**3
        print(f"  ok    cuda:{i}  {p.name}  {gb:.1f} GB")
        if gb < 9:
            print("        -> 8 GB class: E2 embeddings, 1.5-3B QLoRA, inference. SETUP.md")
        elif gb < 17:
            print("        -> 16 GB class: the only box for 7-8B QLoRA. SETUP.md")
    print(f"  ok    torch {torch.__version__}, cuda {torch.version.cuda}")
else:
    print("  MISS  torch imports but sees NO GPU -- driver/CUDA mismatch.")
    print("        This is the failure that looks like success. Fix before training.")
PY
else
  echo "  --    torch absent (fine on a CPU-only box; required on the GPU boxes)"
fi

hdr "Data"
if [ -d data ] && [ -f data/chebi_lite.owl ]; then
  ok "data/ present"
  [ -f data/FETCHED.txt ] && sed 's/^/        /' data/FETCHED.txt | head -3
else
  echo "  --    data/ not fetched yet -- run: bash scripts/fetch-data.sh"
fi

hdr "Network -- endpoints answer, not merely respond"
n=$(curl -sL --max-time 30 -H "Accept: application/sparql-results+json" \
      --data-urlencode 'query=SELECT (COUNT(*) AS ?n) WHERE { ?s ?p ?o }' \
      https://sparql.rhea-db.org/sparql 2>/dev/null \
    | grep -o '"value" : "[0-9]*"' | grep -o '[0-9]*' | head -1)
if [ -n "$n" ]; then
  ok "rhea endpoint answers: $n triples"
  echo "        (5,458,778 on 5 Aug 2026; 7,271,615 on 28 Aug 2026 -- it MOVES."
  echo "         Never benchmark against it. DATA.md section 3.)"
else
  no "rhea endpoint gave no parseable answer -- needs -L and an Accept header"
fi

printf "\n"
if [ "$missing" -eq 0 ]; then
  echo "All checks passed. Start with experiments/E1-proof-depth.md (CPU, run it first)."
else
  echo "$missing item(s) missing -- see SETUP.md. Nothing was installed or changed."
fi
exit 0
