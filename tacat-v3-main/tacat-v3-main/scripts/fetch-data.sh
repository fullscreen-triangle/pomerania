#!/usr/bin/env bash
# Fetch the core corpus into data/. All sources CC-BY 4.0. See ../DATA.md.
#
# Sizes below were verified live on 28 August 2026. A mismatch is NOT an error --
# these sources are updated -- but it IS a fact worth recording, because a number
# measured against a different corpus is not comparable to one in EVIDENCE.md.
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p data
cd data

fetch() {
  local url="$1" name="$2" expect="$3" licence="$4"
  if [ -f "$name" ]; then
    echo "  = $name already present ($(wc -c <"$name") bytes) -- skipping"
    return 0
  fi
  echo "  > $name   [$licence]"
  curl -fL --retry 3 --retry-delay 2 -o "$name.part" "$url"
  mv "$name.part" "$name"
  local got; got=$(wc -c <"$name")
  if [ "$got" != "$expect" ]; then
    echo "    NOTE: size $got, expected $expect (28 Aug 2026). The source has been updated."
    echo "    Record this in your run notes -- the corpus is not the one EVIDENCE.md was measured on."
  fi
}

echo "Fetching core corpus into $(pwd)"
echo

fetch "https://ftp.expasy.org/databases/rhea/rdf/rhea.rdf.gz" \
      "rhea.rdf.gz"          "8690178"   "CC-BY 4.0"
fetch "https://ftp.expasy.org/databases/rhea/tsv/rhea-directions.tsv" \
      "rhea-directions.tsv"  "445440"    "CC-BY 4.0"
fetch "https://ftp.ebi.ac.uk/pub/databases/chebi/ontology/chebi_lite.owl" \
      "chebi_lite.owl"       "183257139" "CC-BY 4.0"

echo
echo "Optional -- full ChEBI, 4x the work, needed by no current protocol."
echo "  curl -fLO https://ftp.ebi.ac.uk/pub/databases/chebi/ontology/chebi.owl.gz"

# The held-out evaluation set. NEVER train on this -- see DATA.md section 4.
if [ ! -d sparql-examples ]; then
  echo
  echo "  > sparql-examples   [CC-BY 4.0 + MIT]  -- EVALUATION SET, never train on it"
  git clone --depth 1 https://github.com/sib-swiss/sparql-examples.git sparql-examples
fi

echo
echo "Done. Contents of data/:"
ls -la
cat > FETCHED.txt <<EOF
Fetched: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Sizes at fetch time:
$(wc -c rhea.rdf.gz rhea-directions.tsv chebi_lite.owl 2>/dev/null || true)

Quote this date and these sizes with any number measured against this corpus.
The live Rhea endpoint is NOT reproducible: 5,458,778 triples on 5 Aug 2026,
7,271,615 on 28 Aug 2026. Measure against these files, not the endpoint.
EOF
echo
echo "Wrote data/FETCHED.txt -- quote it with every result."
