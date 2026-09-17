import type { SlideDef } from "../../../deck/deckTypes";
import DslCell from "../../../deck/DslCell";
import { runSthurbert } from "../sthurbert";

const EXAMPLE = `# try editing this, then Run
navigate *
show chi

navigate tracker
slice fn
show symbols

find "graph"
`;

const Slide09RunIt: SlideDef = {
  title: "Run it",
  maxStep: 0,
  render: () => (
    <>
      <h2>A live st-Hurbert cell</h2>
      <p>
        This runs a real lexer/parser-lite and interpreter against the same
        two-repo fixture (<code>tracker</code>, <code>purpose</code>) used
        two slides ago — every <code>chi</code>/<code>sense</code> value is
        computed fresh by the Stoer–Wagner routine, not looked up. Edit the
        script and press Run (or shift+enter).
      </p>
      <DslCell language="st-hurbert" initialSource={EXAMPLE} run={runSthurbert} />
      <p className="aside">
        Try: <code>navigate purpose</code>, <code>show salient</code>,{" "}
        <code>show fragments</code>, or <code>find "history"</code>. Unknown
        repos or commands produce the same runtime/parse error messages the
        real interpreter emits.
      </p>
    </>
  ),
};

export default Slide09RunIt;
