# Pomerania

An interactive information board presenting a body of research on
S-entropy coordinate theory and its applications: federated
understanding, distributed compute scheduling, repo-federation
tracking, code-correctness testing, domain-specific model compilation,
and retrieval-augmented generation.

The board is a single-page app with a force-directed landing graph.
Each node opens either a full interactive presentation deck — theory
slides, live D3 visualisations computed from the paper's own
definitions, and runnable code cells backed by faithful in-browser
ports of the real algorithms — or a standalone prebuilt application.

## Structure

```
board/               the board application (Vite + React + TypeScript + D3)
  src/
    theory/           core S-entropy theory decks
    application/       decks for each applied paper (Pylon, Bloodhound,
                       Wind Tunnel, Absicht, Equilateral, Tacat, ...)
    deck/              shared deck engine (slides, D3 chart mount, DSL cells)
    graph/             landing-page graph data (nodes/edges)
    pages/             top-level routed pages
  public/              standalone prebuilt applications served alongside
                       the board (e.g. tacat-extension, tacat-decks)
publications/          supporting PDFs referenced by the decks
tacat/, tacat-sources/,
tacat-sources-v2/       source material for the Tacat submission
```

## Running the board

```bash
cd board
npm install
npm run dev       # dev server, http://localhost:5173
npm run build      # type-check + production build
npm run lint        # oxlint
npm run preview      # preview the production build locally
```

The board is dark-mode only; every deck shares a common visual system
defined in `board/src/deck`.

## Content principles

- Every theory deck's charts and interactive controls are computed
  live from the paper's own stated definitions, algorithms, or
  recorded validation data — never a fabricated or illustrative
  number standing in for a real one.
- Where a paper has a real implementation (a Rust CLI, a TypeScript
  library, a Python validation suite), the deck's runnable cells are a
  faithful port of that implementation's actual algorithm, run
  against a small reproducible fixture, rather than a simulation of
  what the algorithm might do.
- Where no live backend is reachable from a static site (a local CLI,
  a token-gated server), the deck says so explicitly rather than
  pretending to connect to one.

## License

MIT — see [LICENSE](LICENSE).
