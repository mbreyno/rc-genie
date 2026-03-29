#!/usr/bin/env node
/**
 * scripts/fetch-bls-data.js
 *
 * Downloads BLS OEWS (Occupational Employment and Wage Statistics) flat files
 * for national, state, and MSA (metro area) levels, then extracts hourly wage
 * data for every occupation in src/data/occupations.js.
 *
 * Output: api/blsWages.json  (committed to repo — no runtime downloads needed)
 *
 * Run once per year when BLS releases new data (typically May):
 *   npm run fetch-bls
 *
 * Prerequisites (install once):
 *   npm install --save-dev xlsx unzipper
 *
 * BLS OEWS data year (update when new data is released):
 *   2024 data → released May 2025 → YEAR = '24'
 */

import { createWriteStream, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import unzipper from 'unzipper'
import xlsx from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const CACHE_DIR = resolve(ROOT, '.bls-cache')
const OUTPUT    = resolve(ROOT, 'api', 'blsWages.json')

// ── BLS data year — update this each May when BLS releases new data ───────────
const YEAR = '24'  // 2024 OEWS data

const BLS_URLS = {
  national: `https://www.bls.gov/oes/special.requests/oesm${YEAR}nat.zip`,
  state:    `https://www.bls.gov/oes/special.requests/oesm${YEAR}st.zip`,
  msa:      `https://www.bls.gov/oes/special.requests/oesm${YEAR}ma.zip`,
}

// ── Extract all unique SOC codes from occupations.js ─────────────────────────
function loadSocCodes() {
  const src = readFileSync(resolve(ROOT, 'src/data/occupations.js'), 'utf8')
  const matches = [...src.matchAll(/soc:\s*['"]([0-9]{2}-[0-9]{4})['"]/g)]
  return new Set(matches.map(m => m[1]))
}

// ── Parse a wage value — BLS uses '#' (not published) and '*' (suppressed) ───
function parseWage(val) {
  if (!val && val !== 0) return null
  const s = String(val).trim()
  if (s === '#' || s === '*' || s === '-' || s === '') return null
  const n = parseFloat(s.replace(/,/g, ''))
  return isNaN(n) ? null : n
}

// ── Normalize column names to uppercase (BLS files are inconsistent) ─────────
function normalizeRow(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) out[k.toUpperCase()] = v
  return out
}

// ── Download a file with progress ─────────────────────────────────────────────
async function download(url, dest) {
  const filename = url.split('/').pop()
  process.stdout.write(`  Downloading ${filename} ...`)
  const res = await fetch(url, {
    headers: { 'User-Agent': 'rc-genie-wage-tool/1.0 (contact: your-email@example.com)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const total = parseInt(res.headers.get('content-length') || '0')
  let received = 0
  const writer = createWriteStream(dest)
  const reader = res.body.getReader()
  await new Promise((resolve, reject) => {
    function pump() {
      reader.read().then(({ done, value }) => {
        if (done) { writer.end(); return }
        received += value.length
        if (total) process.stdout.write(`\r  Downloading ${filename} ... ${Math.round(received / total * 100)}%`)
        writer.write(value, pump)
      }).catch(reject)
    }
    writer.on('finish', resolve)
    writer.on('error', reject)
    pump()
  })
  const mb = (received / 1024 / 1024).toFixed(1)
  console.log(`\r  Downloaded ${filename} (${mb} MB)`)
}

// ── Extract the .xlsx file from a zip into a Buffer ───────────────────────────
async function extractXlsx(zipPath) {
  const dir = await unzipper.Open.file(zipPath)
  const entry = dir.files.find(f => f.path.toLowerCase().endsWith('.xlsx'))
  if (!entry) throw new Error(`No .xlsx found in ${zipPath}`)
  console.log(`  Extracting: ${entry.path}`)
  return entry.buffer()
}

// ── Parse an OEWS Excel buffer → wages map: { area: { soc: { entry, average, experienced } } }
function parseOews(buffer, label, socCodes) {
  console.log(`  Parsing ${label}...`)
  const wb    = xlsx.read(buffer, { type: 'buffer', raw: true })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows  = xlsx.utils.sheet_to_json(sheet, { defval: '' }).map(normalizeRow)
  console.log(`  Rows read: ${rows.length.toLocaleString()}`)

  const wages = {}
  let kept = 0

  for (const row of rows) {
    // Only detailed occupations, not major/minor/broad groupings
    if ((row.GROUP ?? '').toLowerCase() !== 'detailed') continue

    // All-industry cross-cut only (blank or '000000')
    const naics = String(row.NAICS ?? '').trim()
    if (naics && naics !== '000000') continue

    // Skip government-only or other narrow ownership breakdowns.
    // Prefer OWN_CODE 1235 (all combined). Accept 5 (private) as fallback.
    const own = String(row.OWN_CODE ?? '').trim()
    if (own && own !== '1235' && own !== '235' && own !== '35' && own !== '5' && own !== '') continue

    const soc  = String(row.OCC_CODE ?? '').trim()
    if (!socCodes.has(soc)) continue

    const area = String(row.AREA ?? row.PRIM_STATE ?? '').trim()
    if (!area) continue

    const entry      = parseWage(row.H_PCT25)
    const average    = parseWage(row.H_MEAN)
    const experienced = parseWage(row.H_PCT75)

    // Skip if any key wage is missing
    if (!entry || !average || !experienced) continue

    if (!wages[area]) wages[area] = {}
    // OWN_CODE 1235 (all combined) wins; don't overwrite with narrower scope
    if (!wages[area][soc]) {
      wages[area][soc] = { entry, average, experienced }
      kept++
    } else if (own === '1235') {
      wages[area][soc] = { entry, average, experienced }  // upgrade to all-combined
    }
  }

  const areas = Object.keys(wages).length
  const occ   = new Set(Object.values(wages).flatMap(a => Object.keys(a))).size
  console.log(`  Kept ${kept} records → ${areas} areas × ${occ} occupations`)
  return wages
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('BLS OEWS Wage Data Fetcher')
  console.log(`Data year: 20${YEAR}`)
  console.log('─'.repeat(50))

  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true })

  const socCodes = loadSocCodes()
  console.log(`SOC codes found in occupations.js: ${socCodes.size}`)
  console.log()

  const output = { national: {}, states: {}, msas: {}, year: `20${YEAR}` }

  for (const [key, url] of Object.entries(BLS_URLS)) {
    const filename = url.split('/').pop()
    const zipPath  = resolve(CACHE_DIR, filename)
    console.log(`── ${key.toUpperCase()} (${filename}) ─────────────`)

    if (!existsSync(zipPath)) {
      await download(url, zipPath)
    } else {
      console.log(`  Using cached ${filename}`)
    }

    const buffer = await extractXlsx(zipPath)
    const wages  = parseOews(buffer, key, socCodes)

    if (key === 'national') {
      // National file has a single area — flatten it
      const areas = Object.values(wages)
      for (const areaWages of areas) {
        for (const [soc, w] of Object.entries(areaWages)) {
          if (!output.national[soc]) output.national[soc] = w
        }
      }
      console.log(`  National occupations extracted: ${Object.keys(output.national).length}`)

    } else if (key === 'state') {
      // State areas use 2-digit FIPS or occasionally the full area code
      // Normalize to 2-digit string
      for (const [area, areaWages] of Object.entries(wages)) {
        const fips = area.padStart(2, '0').slice(-2)
        if (!output.states[fips]) output.states[fips] = {}
        Object.assign(output.states[fips], areaWages)
      }
      console.log(`  States extracted: ${Object.keys(output.states).length}`)

    } else if (key === 'msa') {
      // MSA areas use 5-digit CBSA codes — keep as-is
      for (const [area, areaWages] of Object.entries(wages)) {
        const cbsa = String(area).padStart(5, '0')
        if (!output.msas[cbsa]) output.msas[cbsa] = {}
        Object.assign(output.msas[cbsa], areaWages)
      }
      console.log(`  MSAs extracted: ${Object.keys(output.msas).length}`)
    }
    console.log()
  }

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2))
  const bytes = readFileSync(OUTPUT).length
  console.log('─'.repeat(50))
  console.log(`✓ Written to api/blsWages.json`)
  console.log(`  National: ${Object.keys(output.national).length} occupations`)
  console.log(`  States:   ${Object.keys(output.states).length}`)
  console.log(`  MSAs:     ${Object.keys(output.msas).length}`)
  console.log(`  File size: ${(bytes / 1024).toFixed(0)} KB  (${(bytes / 1024 / 1024).toFixed(2)} MB)`)
  console.log()
  console.log('Commit api/blsWages.json to your repo and deploy.')
  console.log('Re-run this script each May when BLS releases new annual data.')
}

main().catch(err => {
  console.error('\n✗ Error:', err.message)
  process.exit(1)
})
