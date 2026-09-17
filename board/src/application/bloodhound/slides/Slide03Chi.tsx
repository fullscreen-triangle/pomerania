import type { SlideDef } from "../../../deck/deckTypes";

const Slide03Chi: SlideDef = {
  title: "The character invariant χ",
  maxStep: 3,
  render: (step) => (
    <>
      <h2>χ: a repo's conserved sense, as a number</h2>
      <div className="two-col">
        <div>
          <div className="defn" data-step={0}>
            <h3>1. Extract symbols</h3>
            <p>
              Walk the repo's files and pull out every named definition —
              functions, structs, classes — with its file, line, and a
              snippet. This is exactly what <code>purpose index</code>{" "}
              already builds for lookup; the tracker reuses the same
              extraction.
            </p>
          </div>

          <div className="defn" data-step={1}>
            <h3>2. Build a weighted self-graph</h3>
            <p>
              One vertex per file. An edge between two files if they{" "}
              <em>contain</em> each other by shared path prefix (a
              directory relationship), weighted by how many path segments
              they share, plus an edge if a symbol name from one file is
              referenced in another file's snippet text — the two edge
              families the design doc calls <b>containment</b> and{" "}
              <b>reference proximity</b>.
            </p>
          </div>

          <div className="defn" data-step={2}>
            <h3>3. χ = the global minimum cut</h3>
            <p>
              Take the largest connected component of that graph and run{" "}
              <b>Stoer–Wagner</b> — the classic deterministic O(V³) global
              min-cut algorithm. χ is the cheapest cost to split the repo's
              core into two pieces. High χ: tightly bound, hard to split.
              Low χ: the repo is barely holding together as one thing.
            </p>
          </div>

          <p className={`aside ${step < 3 ? "dim" : ""}`} data-step={3}>
            The vertices bordering the cheapest cut are the{" "}
            <b>salient surface</b> — the files most responsible for holding
            the repo's identity together. Removed or heavily refactored,
            they are what would fragment the repo fastest.
          </p>
        </div>
        <div>
          <p className="aside">
            This is a straight, faithful port of the browser engine at{" "}
            <code>thrust/src/lib/repo-lens/chi.ts</code> in the real
            implementation — same graph construction, same Stoer–Wagner
            routine, running here against a small fixture instead of a live
            GitHub tree so the demo works without a token. The next slide
            runs it live.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide03Chi;
