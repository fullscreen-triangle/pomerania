#!/usr/bin/env node
/**
 * Regenerate the CHECKS manifest in primer.js from the pages themselves.
 *
 *   node build-manifest.mjs          verify the manifest matches the pages
 *   node build-manifest.mjs --write  rewrite it in place
 *
 * The progress denominator has to be the COMPLETE set of checks, not the set
 * discovered on pages already visited — otherwise opening one chapter and
 * ticking its boxes reports full readiness. Deriving it from the HTML keeps it
 * true as chapters change, and exiting non-zero on drift makes a stale
 * manifest a build failure rather than a silently wrong percentage.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const write = process.argv.includes('--write')

// Page order matters: the manifest reads as the route through the primer.
const pages = readdirSync(HERE)
  .filter((f) => /^\d\d-.*\.html$/.test(f))
  .sort()

const found = []
for (const page of pages) {
  const html = readFileSync(join(HERE, page), 'utf8')
  for (const m of html.matchAll(/data-check="([^"]+)"/g)) {
    if (!found.includes(m[1])) found.push(m[1])
  }
}

const src = readFileSync(join(HERE, 'primer.js'), 'utf8')
const block = /(var CHECKS = \[)([\s\S]*?)(\];)/.exec(src)
if (!block) {
  console.error('  could not find the CHECKS array in primer.js')
  process.exit(1)
}

const current = [...block[2].matchAll(/"([^"]+)"/g)].map((m) => m[1])

const missing = found.filter((id) => !current.includes(id))
const extra = current.filter((id) => !found.includes(id))

if (!missing.length && !extra.length) {
  console.log(`  manifest ok — ${current.length} checks, matching the pages`)
  process.exit(0)
}

for (const id of missing) console.error(`  MISSING from manifest: ${id}`)
for (const id of extra) console.error(`  STALE in manifest (no such check on any page): ${id}`)

if (!write) {
  console.error('\n  run with --write to regenerate')
  process.exit(1)
}

// Group by page number so the array stays readable.
const byPage = new Map()
for (const id of found) {
  const p = id.split(':')[0]
  if (!byPage.has(p)) byPage.set(p, [])
  byPage.get(p).push(id)
}
const body =
  '\n    ' +
  [...byPage.values()].map((ids) => ids.map((i) => `"${i}"`).join(', ')).join(',\n    ') +
  '\n  '

writeFileSync(join(HERE, 'primer.js'), src.replace(block[0], `${block[1]}${body}${block[3]}`), 'utf8')
console.log(`  manifest rewritten — ${found.length} checks`)
