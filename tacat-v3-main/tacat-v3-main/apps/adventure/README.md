# adventure — the laboratory that remembers

**The visual companion to [`../../VISION.md`](../../VISION.md)** — what Mark Doerr's research
programme looks like if it fully succeeds: the self-driving enzyme-engineering laboratory whose
entire memory is a knowledge graph. Assembled from his own artefacts (LARA, SiLA2, LARAsuite,
SciDatS, the ontology papers, NFDI4Cat's "from molecule to process"); only the assembly is ours.

The two are meant to be read together and say the same thing at different resolutions: `VISION.md`
carries the argument, with claims marked by evidence status; this carries the picture. Where they
touch, `VISION.md` is the source of truth.

**Same techstack as the presentation decks, opposite visual register**: near-black ground, 1px
hairlines, large light-weight type, two saturated accents (teal `#35e0c2`, amber `#ffb454`) spent
sparingly. Content lives in `src/deck.json` as structured blocks — no HTML in the content — and
`src/build.mjs` renders one self-contained `index.html` (no remote references, asserted at build).

```bash
node apps/adventure/src/build.mjs     # deck.json + runtime.css + runtime.js -> index.html
```

Open `index.html` in a browser. Keys: arrows/space navigate · `esc` overview · `f` fullscreen ·
`?` help · `n` speaker notes (per-slide commentary on what each scene claims and why).

| file | role |
|---|---|
| `src/deck.json` | the content — scenes, copy, theme tokens. **Edit this.** |
| `src/build.mjs` | renderer + validator (copied from `presentation/medium-src`, unchanged) |
| `src/runtime.css` | the dark visual language |
| `src/runtime.js` | navigation runtime (unchanged from the presentation decks) |
| `index.html` | **generated** — do not edit by hand |

Never edit `index.html` directly — it carries a generated-file banner and is rebuilt from source,
the same discipline as `presentation/deck.html`.
