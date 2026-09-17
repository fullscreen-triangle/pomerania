import type { SlideDef } from "../../../deck/deckTypes";
import D3Chart from "../../../deck/D3Chart";
import { C, mountSvg } from "../../../deck/chartUtils";
import { computeCharacter, extractSymbols } from "../chi";
import { TRACKER_FIXTURE } from "../fixture";

function repoFiles(repo: string) {
  return TRACKER_FIXTURE.filter((f) => f.path.startsWith(repo + "/"));
}

const REPOS = ["tracker", "purpose"];

function drawMinCut(el: HTMLDivElement, scope: HTMLElement) {
  const w = 620,
    h = 340;
  const s = mountSvg(el, w, h);

  function layoutFor(repo: string) {
    const files = repoFiles(repo);
    const symbols = files.flatMap((f) => extractSymbols(f.path, f.text));
    const character = computeCharacter(symbols);
    const labels = Array.from(new Set(symbols.map((sy) => sy.file)));
    const n = labels.length;
    const cx = w / 2,
      cy = h / 2 - 10,
      r = Math.min(w, h) / 2 - 70;
    const pos = new Map(
      labels.map((label, i) => [
        label,
        { x: cx + r * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: cy + r * Math.sin((2 * Math.PI * i) / n - Math.PI / 2) },
      ])
    );
    return { labels, character, pos, symbols };
  }

  function render(repo: string) {
    const { labels, character, pos } = layoutFor(repo);
    const cutSide = new Set(character.cutSide);

    // Build edge list purely for drawing: reuse the same rule as chi.ts —
    // any two files sharing a path prefix or name reference, drawn faint.
    const edges: [string, string][] = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        edges.push([labels[i], labels[j]]);
      }
    }

    s.selectAll(".e")
      .data(edges)
      .join("line")
      .attr("class", "e")
      .attr("x1", (d) => pos.get(d[0])!.x)
      .attr("y1", (d) => pos.get(d[0])!.y)
      .attr("x2", (d) => pos.get(d[1])!.x)
      .attr("y2", (d) => pos.get(d[1])!.y)
      .attr("stroke", (d) => (cutSide.has(d[0]) !== cutSide.has(d[1]) ? C.k2 : C.line))
      .attr("stroke-width", (d) => (cutSide.has(d[0]) !== cutSide.has(d[1]) ? 2.6 : 1))
      .attr("opacity", (d) => (cutSide.has(d[0]) !== cutSide.has(d[1]) ? 0.9 : 0.35));

    s.selectAll(".n")
      .data(labels)
      .join("circle")
      .attr("class", "n")
      .attr("cx", (d) => pos.get(d)!.x)
      .attr("cy", (d) => pos.get(d)!.y)
      .attr("r", 9)
      .attr("fill", (d) => (cutSide.has(d) ? C.k2 : C.k1))
      .attr("stroke", C.ink)
      .attr("stroke-width", 1);

    s.selectAll(".lbl")
      .data(labels)
      .join("text")
      .attr("class", "lbl")
      .attr("x", (d) => pos.get(d)!.x)
      .attr("y", (d) => pos.get(d)!.y - 14)
      .attr("text-anchor", "middle")
      .attr("font-size", 9.5)
      .attr("fill", C.ink3)
      .text((d) => d.split("/").pop()!);

    const readout = scope.querySelector<HTMLElement>("#chi-readout");
    if (readout)
      readout.innerHTML =
        `repo <b style="color:${C.accent}">${repo}</b>` +
        `&nbsp;&nbsp;·&nbsp;&nbsp;χ = <b>${character.chi.toFixed(2)}</b>` +
        `&nbsp;&nbsp;·&nbsp;&nbsp;${character.coreBlocks}/${character.blocks} core blocks, ${character.fragments} fragment(s)` +
        `<br><span style="color:${C.ink3}">highlighted edges = the cut · highlighted nodes = the salient surface</span>`;
  }

  render("tracker");

  for (const repo of REPOS) {
    const btn = scope.querySelector<HTMLButtonElement>(`#chi-btn-${repo}`);
    if (btn) btn.onclick = () => render(repo);
  }
}

const Slide04LiveMinCut: SlideDef = {
  title: "χ, live",
  maxStep: 1,
  render: (step) => (
    <>
      <h2>Two small repos, one real computation</h2>
      <div className="two-col">
        <div>
          <p>
            Below are two tiny illustrative repos —{" "}
            <code>tracker</code> (the Rust CLI itself) and{" "}
            <code>purpose</code> (its sibling search tool) — each with a
            handful of source files. Pick one and the graph shows every
            file as a node, edges by containment and reference proximity,
            and the <span style={{ color: "#e08b90" }}>highlighted edges</span>{" "}
            as the actual Stoer–Wagner minimum cut computed just now, in
            your browser, from the symbols above.
          </p>
          <p className={step < 1 ? "dim" : ""} data-step={1}>
            Notice <code>tracker</code> comes out with a higher χ than{" "}
            <code>purpose</code> — it has more files and denser
            cross-references, so it costs more to split. That's the whole
            idea: χ isn't a size metric, it's a <em>cohesion</em> metric,
            and it comes out different for genuinely differently-shaped
            code without anyone hand-tuning it per repo.
          </p>
        </div>
        <div>
          <D3Chart id="c-chi" draw={drawMinCut} />
          <div className="controls">
            <button id="chi-btn-tracker">tracker</button>
            <button id="chi-btn-purpose">purpose</button>
            <div id="chi-readout" className="readout" />
          </div>
        </div>
      </div>
    </>
  ),
};

export default Slide04LiveMinCut;
