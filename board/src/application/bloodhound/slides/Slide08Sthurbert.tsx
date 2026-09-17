import type { SlideDef } from "../../../deck/deckTypes";

const Slide08Sthurbert: SlideDef = {
  title: "The st-Hurbert query language",
  maxStep: 0,
  render: () => (
    <>
      <h2>A small language for asking a federation questions</h2>
      <div className="two-col">
        <div>
          <p>
            Rather than a bespoke API per question, the tracker exposes a
            tiny DSL — lexer, recursive-descent parser, tree-walking
            interpreter, all real, all in this browser build. Five verbs
            cover the whole surface:
          </p>
          <pre className="code-block">{`navigate <repo|*>
slice [kind] [where cond]
show {chi|sense|salient|fragments|files|symbols}
find "text"
compose  -- sequencing sugar`}</pre>
        </div>
        <div>
          <p>
            <code>navigate</code> sets the current scope to one repo or the
            whole federation (<code>*</code>). <code>slice</code> filters
            the working symbol set, optionally by kind (
            <code>fn</code>/<code>struct</code>/…) and a{" "}
            <code>where field op value</code> condition. <code>find</code>{" "}
            does a substring search over names and snippets.{" "}
            <code>show</code> renders one of six views of the current
            scope — most importantly <code>chi</code> and{" "}
            <code>sense</code>, which invoke the same live min-cut
            computation as the previous slide.
          </p>
          <p className="aside">
            The full interpreter also supports <code>show lineage</code>,{" "}
            <code>show regime</code>, and <code>show health</code>, which
            render the honest "not yet exercised" messages from the
            sense/runtime-health split two slides back. The runnable cell
            below implements a faithful subset — navigate/slice/find/show —
            against the same illustrative fixture, so you can try it
            immediately with nothing installed.
          </p>
        </div>
      </div>
    </>
  ),
};

export default Slide08Sthurbert;
