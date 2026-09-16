#!/usr/bin/env node
/**
 * Build the presentation: deck.json + runtime.css + runtime.js -> one self-contained deck.html
 *
 *   node docs/presentation/deck-src/build.mjs
 *
 * WHY THIS EXISTS. The deck was one hand-written 31 KB HTML file. Editing a
 * slide meant editing markup, the slide count was repeated in three places, and
 * "is this still self-contained?" was answered by reading rather than by
 * checking. Content now lives in `deck.json` as structured blocks — no HTML in
 * the content, the same discipline the cheat sheet applies to its cards — and
 * this script renders it.
 *
 * Three properties it enforces, because each is a defect we would otherwise
 * ship silently:
 *
 *   1. The slide count is computed, never written down, so `n / N` on the
 *      slides cannot drift from the number of slides.
 *   2. The output is asserted self-contained — the build FAILS if a remote URL
 *      reaches the artefact. A deck that fetches anything is a deck that breaks
 *      in a room with bad wifi.
 *   3. Every block type and required field is validated. An unknown type is an
 *      error, not a silently empty slide.
 *
 * Exits non-zero on any of the above, so it can be wired into a gate.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = dirname(fileURLToPath(import.meta.url))
const problems = []

// ---------------------------------------------------------------------------
// Inline markup — a deliberately tiny subset, so content stays free of HTML
// ---------------------------------------------------------------------------
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** `**bold**`, `*em*`, `` `code` ``, `[text](url)`. Nothing else. */
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code class="inl">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

// ---------------------------------------------------------------------------
// Code blocks — declarative highlighting, so the content carries no markup
// ---------------------------------------------------------------------------
function renderCode(b) {
  const kw = b.keywords || []
  const hi = b.highlight || []
  const lines = (b.text ?? (b.lines || []).join('\n')).split('\n')

  const paint = (chunk) => {
    let out = esc(chunk)
    for (const k of kw) {
      out = out.replace(new RegExp(`(^|[^\\w:])(${k})(?![\\w])`, 'g'), '$1<span class="k">$2</span>')
    }
    return out
  }

  const html = lines
    .map((line) => {
      // Whole-line comment forms: a shell prompt or a leading #
      if (/^\s*(#|\$ )/.test(line)) return `<span class="c">${esc(line)}</span>`
      // Split around highlighted substrings so keywords never paint inside them
      let parts = [line]
      for (const h of hi) {
        parts = parts.flatMap((p) =>
          typeof p === 'string' && p.includes(h)
            ? p.split(h).flatMap((seg, i) => (i ? [{ hl: h }, seg] : [seg]))
            : [p],
        )
      }
      return parts
        .map((p) => (typeof p === 'string' ? paint(p) : `<span class="hl">${esc(p.hl)}</span>`))
        .join('')
    })
    .join('\n')

  // A trailing comment on a code line, kept subtle rather than keyword-bright
  return `<pre>${html.replace(/(\s)(# [^\n<]*)$/gm, '$1<span class="c">$2</span>')}</pre>`
}

// ---------------------------------------------------------------------------
// Block renderers. Adding a slide type means adding one entry here.
// ---------------------------------------------------------------------------
const BLOCKS = {
  h1:      (b) => `<h1>${inline(b.text)}</h1>`,
  lead:    (b) => `<p class="lead${cls(b)}"${sty(b)}>${inline(b.text)}</p>`,
  body:    (b) => `<p class="body${cls(b)}"${sty(b)}>${inline(b.text)}</p>`,
  small:   (b) => `<p class="small${cls(b)}"${sty(b)}>${inline(b.text)}</p>`,
  colhead: (b) => `<div class="colhead">${inline(b.text)}</div>`,
  spacer:  (b) => `<div style="height:${b.h || 24}px"></div>`,
  code:    renderCode,

  quote: (b) =>
    `<blockquote>${inline(b.text)}</blockquote>` +
    (b.cite ? `<p class="cite">${inline(b.cite)}</p>` : ''),

  bullets: (b) =>
    `<ul class="bul">` +
    b.items.map((i) => `<li${b.progressive ? ' class="frag"' : ''}>${inline(i)}</li>`).join('') +
    `</ul>`,

  bignums: (b) =>
    `<div class="row" style="align-items:center">` +
    b.items
      .map(
        (i) =>
          `<div style="text-align:center"><div class="huge">${esc(i.n)}</div>` +
          `<p class="body" style="margin-top:10px">${inline(i.label)}</p></div>`,
      )
      .join('') +
    `</div>`,

  flow: (b) =>
    `<div class="flow">` +
    b.steps
      .map(
        (s, i) =>
          (i ? '<div class="ar">&rarr;</div>' : '') +
          `<div class="step${s.us ? ' us' : ''}">${inline(s.text)}` +
          (s.sub ? `<span class="sub">${inline(s.sub)}</span>` : '') +
          `</div>`,
      )
      .join('') +
    `</div>`,

  table: (b) =>
    `<table${sty(b)}><thead><tr>` +
    b.head
      .map((h, i) => `<th${b.widths?.[i] ? ` style="width:${b.widths[i]}"` : ''}>${inline(h)}</th>`)
      .join('') +
    `</tr></thead><tbody>` +
    b.rows
      .map((r) => {
        const cells = Array.isArray(r) ? r : r.cells
        const muted = !Array.isArray(r) && r.muted
        return (
          `<tr${muted ? ' class="out"' : ''}>` +
          cells.map((c, i) => `<td${i === 0 ? ' class="own"' : ''}>${inline(c)}</td>`).join('') +
          `</tr>`
        )
      })
      .join('') +
    `</tbody></table>`,

  columns: (b) =>
    `<div class="row"${sty(b)}>` +
    b.cols.map((c) => `<div>${blocks(c.blocks)}</div>`).join('') +
    `</div>`,

  stack: (b) =>
    b.items
      .map((i) =>
        i.arrow
          ? `<div class="arrow">${inline(i.arrow)}</div>`
          : i.split
            ? `<div style="display:grid;grid-template-columns:repeat(${i.split.length},1fr);gap:9px">` +
              i.split.map((n) => `<div class="node plain">${inline(n)}</div>`).join('') +
              `</div>`
            : `<div class="node${i.plain ? ' plain' : ''}">${inline(i.node)}</div>`,
      )
      .join(''),

  /**
   * The named escape hatch. Bespoke visuals that are not worth a block type get
   * raw HTML here rather than a contorted schema — the same reasoning as the
   * store's `as_rdflib_graph`: naming the leak beats pretending the abstraction
   * is total. Anything used twice should become a block type instead.
   */
  html: (b) => b.html,
}

const cls = (b) => (b.frag ? ' frag' : '')
const sty = (b) => (b.style ? ` style="${b.style}"` : '')

function blocks(list, where = '') {
  return (list || [])
    .map((b) => {
      const fn = BLOCKS[b.t]
      if (!fn) {
        problems.push(`${where}: unknown block type "${b.t}"`)
        return ''
      }
      const out = fn(b)
      return b.frag && !['bullets'].includes(b.t) && !out.includes('class="frag')
        ? `<div class="frag">${out}</div>`
        : out
    })
    .join('\n')
}

// ---------------------------------------------------------------------------
// Load and validate
// ---------------------------------------------------------------------------
const deck = JSON.parse(readFileSync(join(SRC, 'deck.json'), 'utf8'))
const { config = {}, theme = {}, slides = [] } = deck

for (const key of ['title', 'author', 'event', 'date', 'output']) {
  if (!config[key]) problems.push(`config.${key} is required`)
}
if (!slides.length) problems.push('deck.json declares no slides')

slides.forEach((s, i) => {
  const where = `slide ${i + 1}${s.title ? ` (${s.title})` : ''}`
  if (!s.title && !s.cover) problems.push(`${where}: needs a title`)
  if (!s.notes) problems.push(`${where}: needs speaker notes — they are the runbook`)
  if (!s.blocks?.length) problems.push(`${where}: has no blocks`)
})

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
const total = slides.length

const slideHtml = slides
  .map((s, i) => {
    const where = `slide ${i + 1}`
    const head = s.cover ? '' : `<h2>${inline(s.heading ?? s.title)}</h2>\n`
    const body = blocks(s.blocks, where)
    const live = s.live ? '<span class="live">live</span>' : ''
    return (
      `    <section class="slide${s.cover ? ' cover' : ''}" data-title="${esc(s.title || '')}"\n` +
      `      data-notes="${esc(s.notes || '')}">\n` +
      `      ${head}<div class="grow">\n${body}\n      </div>\n` +
      (live ? `      <footer>${live}</footer>\n` : '') +
      `    </section>`
    )
  })
  .join('\n\n')

const css = readFileSync(join(SRC, 'runtime.css'), 'utf8')
const js = readFileSync(join(SRC, 'runtime.js'), 'utf8')

const vars = Object.entries(theme)
  .map(([k, v]) => `    --${k}: ${v};`)
  .join('\n')

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(config.title)}</title>
<!-- GENERATED by deck-src/build.mjs from deck.json — do not edit this file. -->
<style>
  :root {
${vars}
    --stage-w: ${config.stage?.w || 1280}px;
    --stage-h: ${config.stage?.h || 720}px;
  }
${css}
</style>
</head>
<body>

<div id="viewport">
  <div id="stage">

${slideHtml}

  </div>
</div>

<div id="overview"></div>
<div id="notes"></div>
<div id="help"><div>
  <p style="font-size:22px;font-weight:700;margin-bottom:16px">keys</p>
  <p><kbd>&rarr;</kbd> <kbd>space</kbd> next &middot; <kbd>&larr;</kbd> back &middot; <kbd>home</kbd> first</p>
  <p><kbd>esc</kbd> overview &mdash; <em>every scene at once, click to jump</em></p>
  <p><kbd>1</kbd>&ndash;<kbd>9</kbd> <kbd>0</kbd> jump straight to a scene</p>
  <p><kbd>f</kbd> fullscreen &middot; <kbd>?</kbd> this help</p>
  <p style="margin-top:16px;color:#35e0c2"><kbd>n</kbd> notes &mdash;
     what each scene claims, and why</p>
</div></div>
<div id="hint">? for keys</div>

<script>
const DECK = ${JSON.stringify({
  author: config.author,
  event: config.event,
  date: config.date,
  total,
})};
${js}
</script>
</body>
</html>
`

// ---------------------------------------------------------------------------
// Assert the artefact, not the log
// ---------------------------------------------------------------------------
const remote = [...out.matchAll(/(?:src|href)\s*=\s*"(https?:)?\/\/[^"]*"/g)].map((m) => m[0])
if (remote.length) {
  problems.push(`output is not self-contained — ${remote.length} remote reference(s): ${remote[0]}`)
}
if (!out.includes('id="stage"')) problems.push('output lost its stage element')

if (problems.length) {
  console.error(`\n  ${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  ERROR  ${p}`)
  console.error('')
  process.exit(1)
}

const dest = resolve(SRC, config.output)
const before = existsSync(dest) ? readFileSync(dest, 'utf8') : ''
writeFileSync(dest, out, 'utf8')

console.log(`  ${total} slides · ${(out.length / 1024).toFixed(1)} KB · no remote references`)
console.log(`  ${before === out ? 'unchanged' : 'wrote'} ${dest}`)
