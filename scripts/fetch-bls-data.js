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
 * ── Usage ────────────────────────────────────────────────────────────────────
 * Run once per year when BLS releases new data (typically May):
 *   npm run fetch-bls
 *
 * Prerequisites (install once):
 *   npm install
 *
 * ── If automatic download fails ──────────────────────────────────────────────
 * BLS sometimes blocks automated requests. If you see a download error:
 *
 *   1. Open these URLs in your browser and save them to .bls-cache/:
 *        https://www.bls.gov/oes/special.requests/oesm24nat.zip  → .bls-cache/oesm24nat.zip
 *        https://www.bls.gov/oes/special.requests/oesm24st.zip   → .bls-cache/oesm24st.zip
 *        https://www.bls.gov/oes/special.requests/oesm24ma.zip   → .bls-cache/oesm24ma.zip
 *
 *   2. Then re-run: npm run fetch-bls
 *      (The script skips downloads when cached files already exist)
 *
 * BLS OEWS data year (update each May when BLS releases new data):
 *   2024 data → released May 2025 → YEAR = '24'
 */

import { createWriteStream, readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
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

// ── Validate that a file is a real ZIP (starts with PK magic bytes) ──────────
function validateZip(filePath) {
  const buf = readFileSync(filePath)
  if (buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4B) {
    // Show what we actually got (likely an HTML error page)
    const preview = buf.slice(0, 300).toString('utf8').replace(/\s+/g, ' ').trim()
    throw new Error(
      `Downloaded file is not a valid ZIP.\n` +
      `  File contents start with: ${preview.slice(0, 200)}\n\n` +
      `  BLS may be blocking automated downloads. Please download manually:\n` +
      `  Open in browser → save to .bls-cache/:\n` +
      Object.entries(BLS_URLS).map(([k, url]) =>
        `    ${url}  →  .bls-cache/${url.split('/').pop()}`
      ).join('\n')
    )
  }
  return buf.length
}

// ── Download a file with progress ─────────────────────────────────────────────
async function download(url, dest) {
  const filename = url.split('/').pop()
  process.stdout.write(`  Downloading ${filename}...`)

  const res = await fetch(url, {
    headers: {
      'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept':          'application/zip, application/octet-stream, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer':         'https://www.bls.gov/oes/tables.htm',
    },
    redirect: 'follow',
  })

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText} from BLS.\n` +
      `  Please download manually and save to .bls-cache/:\n` +
      `    ${url}  →  .bls-cache/${filename}`
    )
  }

  const total = parseInt(res.headers.get('content-length') || '0')
  let received = 0

  const writer = createWriteStream(dest)
  const reader = res.body.getReader()

  await new Promise((resolve, reject) => {
    function pump() {
      reader.read().then(({ done, value }) => {
        if (done) { writer.end(); return }
        received += value.length
        if (total) {
          const pct = Math.round(received / total * 100)
          process.stdout.write(`\r  Downloading ${filename}... ${pct}%`)
        }
        writer.write(value, pump)
      }).catch(reject)
    }
    writer.on('finish', resolve)
    writer.on('error', reject)
    pump()
  })

  const mb = (received / 1024 / 1024).toFixed(1)
  process.stdout.write(`\r  Downloaded  ${filename} (${mb} MB)\n`)

  // Validate — delete and abort if BLS returned an HTML error page
  try {
    validateZip(dest)
  } catch (err) {
    unlinkSync(dest)  // remove bad cached file so next run retries
    throw err
  }
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
  const ownershipRank = { '1235': 0, '235': 1, '35': 2, '5': 3, '': 4 }
  let kept = 0

  for (const row of rows) {
    // Only detailed occupations
    if ((row.GROUP ?? '').toLowerCase() !== 'detailed') continue

    // All-industry cross-cut only (blank NAICS or '000000')
    const naics = String(row.NAICS ?? '').trim()
    if (naics && naics !== '000000') continue

    // Filter to comprehensive ownership groupings only
    const own = String(row.OWN_CODE ?? '').trim()
    if (!(own in ownershipRank)) continue

    const soc = String(row.OCC_CODE ?? '').trim()
    if (!socCodes.has(soc)) continue

    const area = String(row.AREA ?? row.PRIM_STATE ?? '').trim()
    if (!area) continue

    const entry       = parseWage(row.H_PCT25)
    const average     = parseWage(row.H_MEAN)
    const experienced = parseWage(row.H_PCT75)

    if (!entry || !average || !experienced) continue

    const rank = ownershipRank[own] ?? 9
    if (!wages[area]) wages[area] = {}

    // Keep the most comprehensive ownership scope per (area, soc)
    if (!wages[area][soc]) {
      wages[area][soc] = { entry, average, experienced, _rank: rank }
      kept++
    } else if (rank < wages[area][soc]._rank) {
      wages[area][soc] = { entry, average, experienced, _rank: rank }
    }
  }

  // Strip internal _rank field
  for (const areaWages of Object.values(wages)) {
    for (const w of Object.values(areaWages)) delete w._rank
  }

  const areas = Object.keys(wages).length
  const occ   = new Set(Object.values(wages).flatMap(a => Object.keys(a))).size
  console.log(`  Kept ${kept.toLocaleString()} records → ${areas} areas × ${occ} occupations`)
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

    if (existsSync(zipPath)) {
      // Validate cached file — delete it if corrupt so we re-download
      try {
        validateZip(zipPath)
        const mb = (readFileSync(zipPath).length / 1024 / 1024).toFixed(1)
        console.log(`  Using cached ${filename} (${mb} MB)`)
      } catch {
        console.log(`  Cached file is invalid — deleting and re-downloading...`)
        unlinkSync(zipPath)
        await download(url, zipPath)
      }
    } else {
      await download(url, zipPath)
    }

    const buffer = await extractXlsx(zipPath)
    const wages  = parseOews(buffer, key, socCodes)

    if (key === 'national') {
      // National file has one area — flatten it into output.national
      for (const areaWages of Object.values(wages)) {
        for (const [soc, w] of Object.entries(areaWages)) {
          if (!output.national[soc]) output.national[soc] = w
        }
      }
      console.log(`  National occupations: ${Object.keys(output.national).length}`)

    } else if (key === 'state') {
      // Normalize to 2-digit FIPS string
      for (const [area, areaWages] of Object.entries(wages)) {
        const fips = String(parseInt(area, 10)).padStart(2, '0')
        if (!output.states[fips]) output.states[fips] = {}
        Object.assign(output.states[fips], areaWages)
      }
      console.log(`  States: ${Object.keys(output.states).length}`)

    } else if (key === 'msa') {
      // Normalize to 5-digit CBSA string
      for (const [area, areaWages] of Object.entries(wages)) {
        const cbsa = String(parseInt(area, 10)).padStart(5, '0')
        if (!output.msas[cbsa]) output.msas[cbsa] = {}
        Object.assign(output.msas[cbsa], areaWages)
      }
      console.log(`  MSAs: ${Object.keys(output.msas).length}`)
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
  console.log(`  File size: ${(bytes / 1024).toFixed(0)} KB (${(bytes / 1024 / 1024).toFixed(2)} MB)`)
  console.log()
  console.log('Next steps:')
  console.log('  git add api/blsWages.json')
  console.log('  git commit -m "Add BLS OEWS 2024 wage data"')
  console.log('  git push')
  console.log()
  console.log('Re-run this script each May when BLS releases new annual data.')
}

main().catch(err => {
  console.error('\n✗ Error:', err.message)
  process.exit(1)
})
