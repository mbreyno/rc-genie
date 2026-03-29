#!/usr/bin/env node
/**
 * scripts/fetch-bls-data.js
 *
 * Downloads the BLS OES time-series flat file and extracts hourly wage data
 * for every occupation in src/data/occupations.js, at national, state, and
 * MSA (metro area) level.
 *
 * Data source: https://download.bls.gov/pub/time.series/oe/
 * Files used:
 *   oe.data.0.Current  (~330 MB) — current annual wages for all OES series
 *
 * Wages extracted (all hourly):
 *   entry       = datatype 07 (hourly 25th percentile)
 *   average     = datatype 03 (hourly mean)
 *   experienced = datatype 09 (hourly 75th percentile)
 *
 * Series ID format (25 chars):
 *   OE + U + [area_type:1] + [area_code:7] + [industry:6] + [soc:6] + [datatype:2]
 *   Area types:  N=National  S=State  M=Metro MSA
 *   Area codes:  National=0000000  State=FIPS+"00000"  MSA="00"+CBSA
 *
 * Output: api/blsWages.json  (commit this to your repo)
 *
 * Run:   npm run fetch-bls
 * Cache: Downloaded file is saved to .bls-cache/ and reused on subsequent runs.
 *        Delete .bls-cache/oe.data.0.Current to force a fresh download.
 * Update: Re-run periodically — BLS updates this file each spring (March–May).
 */

import { createWriteStream, createReadStream, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { createInterface } from 'readline'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const CACHE_DIR = resolve(ROOT, '.bls-cache')
const OUTPUT    = resolve(ROOT, 'api', 'blsWages.json')

const DATA_URL  = 'https://download.bls.gov/pub/time.series/oe/oe.data.0.Current'
const DATA_FILE = 'oe.data.0.Current'

// Hourly wage data types we extract
const DATATYPE_MAP = {
  '07': 'entry',        // hourly 25th percentile
  '03': 'average',      // hourly mean
  '09': 'experienced',  // hourly 75th percentile
}

// ── Load SOC codes from occupations.js ───────────────────────────────────────
function loadSocCodes() {
  const src = readFileSync(resolve(ROOT, 'src/data/occupations.js'), 'utf8')
  const matches = [...src.matchAll(/soc:\s*['"]([0-9]{2}-[0-9]{4})['"]/g)]
  return new Set(matches.map(m => m[1]))
}

// ── Parse a wage value — BLS uses '-' and '*' for missing/suppressed ─────────
function parseWage(val) {
  const s = String(val ?? '').trim()
  if (!s || s === '-' || s === '*' || s === '#') return null
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

// ── Download a file with progress ─────────────────────────────────────────────
async function download(url, dest) {
  const filename = url.split('/').pop()
  process.stdout.write(`  Downloading ${filename}...`)

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bls-wage-fetcher/2.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)

  const total  = parseInt(res.headers.get('content-length') || '0')
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
          const mb  = (received / 1024 / 1024).toFixed(0)
          process.stdout.write(`\r  Downloading ${filename}... ${pct}% (${mb} MB)`)
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
}

// ── Stream-parse the OES data file ───────────────────────────────────────────
async function parseDataFile(filePath, socLookup) {
  const rl = createInterface({
    input:      createReadStream(filePath, { encoding: 'latin1' }),  // BLS files use latin1
    crlfDelay:  Infinity,
  })

  let headers    = null
  let idCol      = 0
  let yearCol    = 1
  let valueCol   = 3
  let rowCount   = 0
  let matchCount = 0
  let maxYear    = 0

  // tracker: `areaType|areaCode|soc` → { areaType, areaCode, soc, entry, average, experienced }
  // Each wage slot: { value: number, year: number }
  const tracker = {}

  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Parse header row to find column positions
    if (!headers) {
      headers  = trimmed.split('\t').map(h => h.trim().toLowerCase())
      idCol    = Math.max(0, headers.indexOf('series_id'))
      yearCol  = Math.max(1, headers.indexOf('year'))
      valueCol = Math.max(3, headers.indexOf('value'))
      continue
    }

    rowCount++
    if (rowCount % 1_000_000 === 0) {
      process.stdout.write(`\r  Scanned ${(rowCount / 1_000_000).toFixed(1)}M rows, ${matchCount.toLocaleString()} matched...`)
    }

    const cols = trimmed.split('\t')
    const sid  = (cols[idCol] ?? '').trim()

    // Series must be exactly 25 chars, start with 'OEU'
    if (sid.length !== 25 || sid[0] !== 'O' || sid[1] !== 'E' || sid[2] !== 'U') continue

    const areaType  = sid[3]            // N, S, M, B, A …
    const areaCode  = sid.slice(4, 11)  // 7-char area code
    const industry  = sid.slice(11, 17) // 6-char NAICS (000000 = all)
    const seriesSoc = sid.slice(17, 23) // 6-char SOC without dash
    const datatype  = sid.slice(23, 25) // 2-char data type

    // Filter: all-industry, our occupations, hourly wage types, N/S/M areas only
    if (industry  !== '000000')          continue
    if (!(datatype in DATATYPE_MAP))     continue
    if (!['N', 'S', 'M'].includes(areaType)) continue
    const soc = socLookup.get(seriesSoc)
    if (!soc) continue

    const year  = parseInt((cols[yearCol]  ?? '').trim(), 10)
    const value = parseWage(cols[valueCol])
    if (!value || !year) continue

    if (year > maxYear) maxYear = year

    const wageField = DATATYPE_MAP[datatype]
    const key       = `${areaType}|${areaCode}|${soc}`

    if (!tracker[key]) {
      tracker[key] = { areaType, areaCode, soc }
    }
    // Keep the most recent year's value for each wage field
    const existing = tracker[key][wageField]
    if (!existing || year > existing.year) {
      tracker[key][wageField] = { value, year }
      matchCount++
    }
  }

  process.stdout.write(`\r  Scanned ${rowCount.toLocaleString()} rows, ${matchCount.toLocaleString()} matched.  \n`)
  console.log(`  Most recent data year: ${maxYear}`)

  // ── Organize into national / states / msas ──────────────────────────────
  const national = {}
  const states   = {}
  const msas     = {}

  for (const entry of Object.values(tracker)) {
    const { areaType, areaCode, soc } = entry
    const e = entry.entry?.value
    const a = entry.average?.value
    const x = entry.experienced?.value
    if (!e || !a || !x) continue  // skip if any wage level is missing

    const wages = { entry: e, average: a, experienced: x }

    if (areaType === 'N') {
      national[soc] = wages
    } else if (areaType === 'S') {
      const fips = areaCode.slice(0, 2)   // '0100000' → '01'
      if (!states[fips]) states[fips] = {}
      states[fips][soc] = wages
    } else if (areaType === 'M') {
      const cbsa = areaCode.slice(2)      // '0031080' → '31080'
      if (!msas[cbsa]) msas[cbsa] = {}
      msas[cbsa][soc] = wages
    }
  }

  return { national, states, msas, year: String(maxYear) }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('BLS OES Wage Data Fetcher')
  console.log('Source: download.bls.gov/pub/time.series/oe/')
  console.log('─'.repeat(50))

  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true })

  const socCodes  = loadSocCodes()
  console.log(`SOC codes in occupations.js: ${socCodes.size}`)

  // Build fast lookup: '111011' → '11-1011'
  const socLookup = new Map([...socCodes].map(s => [s.replace('-', ''), s]))

  console.log()

  // Ensure data file is cached
  const dataPath = resolve(CACHE_DIR, DATA_FILE)
  if (existsSync(dataPath)) {
    const mb = (readFileSync(dataPath).length / 1024 / 1024).toFixed(0)
    console.log(`  Using cached ${DATA_FILE} (${mb} MB)`)
    console.log(`  (Delete .bls-cache/${DATA_FILE} to re-download)`)
  } else {
    await download(DATA_URL, dataPath)
  }

  console.log()
  console.log('Streaming and parsing wage data...')
  const { national, states, msas, year } = await parseDataFile(dataPath, socLookup)

  const natCount   = Object.keys(national).length
  const stateCount = Object.keys(states).length
  const msaCount   = Object.keys(msas).length

  console.log()
  console.log(`  National occupations: ${natCount}`)
  console.log(`  States with data:     ${stateCount}`)
  console.log(`  MSAs with data:       ${msaCount}`)

  if (natCount === 0) {
    console.error('\n  ✗ No national data found — something may be wrong.')
    console.error('  Expected series IDs like: OEUN0000000000000111011XX')
    console.error('  Check that oe.data.0.Current downloaded correctly.')
    process.exit(1)
  }

  const output = { national, states, msas, year }
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2))

  const bytes = readFileSync(OUTPUT).length
  console.log()
  console.log(`✓ Written to api/blsWages.json`)
  console.log(`  Data year: ${year}`)
  console.log(`  File size: ${(bytes / 1024).toFixed(0)} KB  (${(bytes / 1024 / 1024).toFixed(2)} MB)`)
  console.log()
  console.log('Next steps:')
  console.log('  git add api/blsWages.json')
  console.log(`  git commit -m "Add BLS OES wage data (${year})"`)
  console.log('  git push')
}

main().catch(err => {
  console.error('\n✗ Error:', err.message)
  process.exit(1)
})
