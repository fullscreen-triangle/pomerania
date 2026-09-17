/**
 * A small st-Hurbert interpreter for the runnable cells — the same subset
 * documented in the tracker's browser engine (navigate / slice / show /
 * find), running against the fixture federation rather than a live GitHub
 * fetch. Real parsing, real filtering, real χ — no canned output.
 */

import type { CellLine } from "../../deck/DslCell";
import { computeCharacter, extractSymbols, type Character, type Sym } from "./chi";
import { TRACKER_FIXTURE } from "./fixture";

interface RepoScope {
  name: string;
  symbols: Sym[];
  character: Character;
}

function buildRepos(): RepoScope[] {
  const byRepo = new Map<string, Sym[]>();
  for (const f of TRACKER_FIXTURE) {
    const repo = f.path.split("/")[0];
    const syms = extractSymbols(f.path, f.text);
    byRepo.set(repo, [...(byRepo.get(repo) ?? []), ...syms]);
  }
  return Array.from(byRepo.entries()).map(([name, symbols]) => ({
    name,
    symbols,
    character: computeCharacter(symbols),
  }));
}

export function runSthurbert(source: string): CellLine[] {
  const repos = buildRepos();
  const lines: CellLine[] = [];
  let scope: { repos: RepoScope[]; working: { repo: RepoScope; sym: Sym }[]; label: string } = {
    repos,
    working: repos.flatMap((r) => r.symbols.map((sym) => ({ repo: r, sym }))),
    label: "* (federation)",
  };

  const stmts = source
    .split(/\r?\n|;/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("#"));

  if (stmts.length === 0) {
    return [{ kind: "warn", text: "empty program — nothing to run" }];
  }

  for (const stmt of stmts) {
    const [cmd, ...rest] = stmt.split(/\s+/);
    const arg = rest.join(" ");

    if (cmd === "navigate") {
      if (arg === "*") {
        scope = { repos, working: repos.flatMap((r) => r.symbols.map((sym) => ({ repo: r, sym }))), label: "* (federation)" };
      } else {
        const repo = repos.find((r) => r.name === arg);
        if (!repo) {
          lines.push({ kind: "error", text: `runtime error: no repo "${arg}" in scope (have: ${repos.map((r) => r.name).join(", ")})` });
          continue;
        }
        scope = { repos: [repo], working: repo.symbols.map((sym) => ({ repo, sym })), label: repo.name };
      }
      lines.push({ kind: "info", text: `scope: ${scope.label} (${scope.repos.length} repo(s), ${scope.working.length} symbols)` });
    } else if (cmd === "slice") {
      const whereIdx = rest.indexOf("where");
      const kind = whereIdx === -1 ? (rest[0] || null) : rest[0] === "where" ? null : rest[0];
      let working = scope.working;
      if (kind) working = working.filter((w) => w.sym.kind === kind);
      // Only a light `where field op value` subset for the demo cells.
      if (whereIdx !== -1) {
        const cond = rest.slice(whereIdx + 1).join(" ");
        const m = cond.match(/^(\w+)\s*(==|!=|~|contains)\s*"?([^"]+)"?$/);
        if (m) {
          const [, field, op, val] = m;
          working = working.filter((w) => {
            const fv = String((w.sym as unknown as Record<string, unknown>)[field] ?? "");
            if (op === "==") return fv === val;
            if (op === "!=") return fv !== val;
            return fv.toLowerCase().includes(val.toLowerCase());
          });
        }
      }
      scope = { ...scope, working };
      lines.push({ kind: "info", text: `${scope.working.length} symbol(s) after slice` });
    } else if (cmd === "find") {
      const needle = arg.replace(/^"|"$/g, "").toLowerCase();
      const working = scope.working.filter(
        (w) => w.sym.name.toLowerCase().includes(needle) || w.sym.snippet.toLowerCase().includes(needle)
      );
      scope = { ...scope, working };
      if (working.length === 0) {
        lines.push({ kind: "warn", text: `no symbols matching "${needle}"` });
      } else {
        for (const w of working.slice(0, 20)) {
          lines.push({ kind: "info", text: `${w.repo.name}  ${w.sym.file}:${w.sym.line}  [${w.sym.kind}] ${w.sym.name}` });
        }
      }
    } else if (cmd === "show") {
      switch (arg) {
        case "chi":
          for (const r of scope.repos) lines.push({ kind: "metric", text: `${r.name}: χ = ${r.character.chi.toFixed(3)}` });
          break;
        case "sense":
          for (const r of scope.repos) {
            lines.push({ kind: "metric", text: `${r.name}: χ = ${r.character.chi.toFixed(3)} (core ${r.character.coreBlocks}/${r.character.blocks} blocks; ${r.character.fragments} fragment(s))` });
            for (const s of r.character.salient.slice(0, 5))
              lines.push({ kind: "info", text: `  · ${s.file}  (weight ${s.weight.toFixed(1)})` });
          }
          break;
        case "salient":
          for (const r of scope.repos) {
            lines.push({ kind: "info", text: `${r.name}:` });
            for (const s of r.character.salient.slice(0, 6))
              lines.push({ kind: "info", text: `  · ${s.file}  (weight ${s.weight.toFixed(1)})` });
          }
          break;
        case "fragments":
          for (const r of scope.repos)
            lines.push({ kind: "metric", text: `${r.name}: ${r.character.fragments} fragment(s), core ${r.character.coreBlocks}/${r.character.blocks} blocks` });
          break;
        case "files": {
          const files = Array.from(new Set(scope.working.map((w) => w.sym.file))).sort();
          for (const f of files) lines.push({ kind: "info", text: f });
          break;
        }
        case "symbols":
          for (const w of scope.working.slice(0, 40))
            lines.push({ kind: "info", text: `${w.sym.file}:${w.sym.line}  [${w.sym.kind}] ${w.sym.name}` });
          break;
        default:
          lines.push({ kind: "error", text: `runtime error: cannot show "${arg}" in this subset` });
      }
    } else {
      lines.push({ kind: "error", text: `parse error: unknown command "${cmd}" (expected navigate/slice/show/find)` });
    }
  }

  return lines;
}
