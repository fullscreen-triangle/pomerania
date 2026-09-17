import { useState } from "react";

export interface DslCellProps {
  /** Initial source shown in the cell. */
  initialSource: string;
  /** Runs the source against a real, in-browser interpreter and returns
   * terminal-style output lines. Never fabricated — an empty/absent input
   * should produce an honest "nothing to run" line, not a canned result. */
  run: (source: string) => CellLine[];
  /** Label shown above the cell, e.g. the DSL name. */
  language?: string;
}

export interface CellLine {
  kind: "info" | "success" | "warn" | "error" | "metric";
  text: string;
}

const KIND_COLOR: Record<CellLine["kind"], string> = {
  info: "#9cdcfe",
  success: "#5cbf95",
  warn: "#e0b464",
  error: "#e08b90",
  metric: "#e8eef4",
};

const KIND_PREFIX: Record<CellLine["kind"], string> = {
  info: "ℹ ",
  success: "✔ ",
  warn: "⚠ ",
  error: "✖ ",
  metric: "  ",
};

/** A Jupyter-like runnable cell: an editable source box, a Run button, and a
 * terminal-style output panel — backed by a real in-browser interpreter
 * (`run`), not by canned/fabricated output. */
export default function DslCell({ initialSource, run, language }: DslCellProps) {
  const [source, setSource] = useState(initialSource);
  const [lines, setLines] = useState<CellLine[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const execute = () => {
    setLines(run(source));
    setHasRun(true);
  };

  return (
    <div className="dsl-cell">
      {language && <div className="dsl-cell-lang">{language}</div>}
      <textarea
        className="dsl-cell-source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const ta = e.currentTarget;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const next = source.slice(0, start) + "    " + source.slice(end);
            setSource(next);
            requestAnimationFrame(() => {
              ta.selectionStart = ta.selectionEnd = start + 4;
            });
          } else if ((e.key === "Enter" && e.shiftKey) || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
            e.preventDefault();
            execute();
          }
        }}
      />
      <div className="dsl-cell-toolbar">
        <button className="dsl-cell-run" onClick={execute}>
          ▶ Run
        </button>
        <span className="dsl-cell-hint">shift+enter to run</span>
      </div>
      <div className="dsl-cell-output">
        {!hasRun && <span className="dsl-cell-placeholder">Press ▶ Run to execute.</span>}
        {lines.map((l, i) => (
          <div key={i} style={{ color: KIND_COLOR[l.kind], whiteSpace: "pre-wrap" }}>
            {KIND_PREFIX[l.kind]}
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
