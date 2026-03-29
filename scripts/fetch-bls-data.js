#!/usr/bin/env node
/**
 * scripts/fetch-bls-data.js
 *
 * Reads the BLS OEWS "All data (TXT)" file and extracts hourly wage data
 * for every occupation in src/data/occupations.js, organized by national,
 * state, and MSA (metro area) geography.
 *
 * Output: api/blsWages.json  (committed to repo — no runtime downloads needed)
 *
 * ── Setup (one-time) ─────────────────────────────────────────────────────────
 * 1. Go to https://www.bls.gov/oes/tables.htm
 * 2. Find the most recent "May 20XX" section
 * 3. Click "All data (TXT)" and save to: .bls-cache/
 *    (It may download as a .zip — that's fine, the script handles both)
 * 4. Run: npm run fetch-bls
 *
 * ── Updating annually ────────────────────────────────────────────────────────
 * Each May, BLS releases new OEWS data. Repeat steps 1-4 with the new file,
 * then commit the updated api/blsWages.json.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { createReadStream }  from 'fs'
import { createInterface }   from 'readline'
import { resolve, dirname }  from 'path'
import { fileURLToPath }     from 'url'
import unzipper              from 'unzipper'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const CACHE_DIR = resolve(ROOT, '.bls-cache')
const OUTPUT    = resolve(ROOT, 'api', 'blsWages.json')

// ── Find the data file in .bls-cache/ ────────────────────────────────────────
function findDataFile() {
  if (!existsSync(CACHE_DIR)) {
    throw new Error(
      `.bls-cache/ folder not found.\n\n` +
      `  1. mkdir .bls-cache\n` +
      `  2. Download "All data (TXT)" from https://www.bls.gov/oes/tables.htm\n` +
      `  3. Save to .bls-cache/\n` +
      `  4. Re-run: npm run fetch-bls`
    )
  }

  const files = readdirSync(CACHE_DIR)

  // Prefer TXT files (fast streaming parse)
  const txtFiles = files.filter(f => f.toLowerCase().endsWith('.txt') && f.toLowerCase().includes('all_data'))
  if (txtFiles.length > 0) {
    const chosen = txtFiles.sort().at(-1)
    console.log(`  Found TXT: ${chosen}`)
    return { path: resolve(CACHE_DIR, chosen), type: 'txt' }
  }

  // Accept a zip containing a txt file
  const zipFiles = files.filter(f => f.toLowerCase().endsWith('.zip') && f.toLowerCase().includes('all_data'))
  if (zipFiles.length > 0) {
    const chosen = zipFiles.sort().at(-1)
    console.log(`  Found ZIP: ${chosen}`)
    return { path: resolve(CACHE_DIR, chosen), type: 'zip' }
  }

  // Last resort: any zip or txt in the cache dir
  const anyTxt = files.filter(f => f.toLowerCase().endsWith('.txt'))
  if (anyTxt.length === 1) {
    console.log(`  Found TXT: ${anyTxt[0]}`)
    return { path: resolve(CACHE_DIR, anyTxt[0]), type: 'txt' }
  }
  const anyZip = files.filter(f => f.toLowerCase().endsWith('.zip'))
  if (anyZip.length === 1) {
    console.log(`  Found ZIP: ${anyZip[0]}`)
    return { path: resolve(CACHE_DIR, anyZip[0]), type: 'zip' }
  }

  throw new Error(
    `No data file found in .bls-cache/.\n\n` +
    `  Download "All data (TXT)" from https://www.bls.gov/oes/tables.htm\n` +
    `  and save it to .bls-cache/\n\n` +
    `  Files currently in .bls-cache/: ${files.join(', ') || '(none)'}`
  )
}

// ── Extract all unique SOC codes from occupations.js ─────────────────────────
function loadSocCodes() {
  const src = readFileSync(resolve(ROOT, 'src/data/occupations.js'), 'utf8')
  const matches = [...src.matchAll(/soc:\s*['"]([0-9]{2}-[0-9]{4})['"]/g)]
  return new Set(matches.map(m => m[1]))
}

// ── Parse a wage value — BLS uses '#' (not published) and '*' (suppressed) ───
function parseWage(val) {
  if (!val) return null
  const s = String(val).trim()
  if (s === '#' || s === '*' || s === '-' || s === '') return null
  const n = parseFloat(s.replace(/,/g, ''))
  return isNaN(n) ? null : n
}

// ── Get a readable stream for the data (handles plain txt or zip) ─────────────
async function getReadStream({ path, type }) {
  if (type === 'txt') {
    return createReadStream(path, { encoding: 'utf8' })
  }

  // Zip: find the txt file inside and stream it
  const dir = await unzipper.Open.file(path)
  const entry = dir.files.find(f => f.path.toLowerCase().endsWith('.txt'))
  if (!entry) throw new Error(`No .txt file found inside ${path}`)
  console.log(`  Extracting from zip: ${entry.path}`)
  return entry.stream()
}

// ── Stream-parse a tab-separated BLS data file ───────────────────────────────
async function parseTsv(stream, socCodes) {
  const rl = createInterface({ input: stream, crlfDelay: Infinity })

  let headers   = null
  let rowCount  = 0
  let kept      = 0
  const national = {}
  const states   = {}
  const msas     = {}
  const ownershipRank = { '1235': 0, '235': 1, '35': 2, '5': 3 }
  const unknownAreaTypes = new Set()

  const isNational = t => ['U', 'N'].includes(String(t).trim().toUpperCase())
  const isState    = t => String(t).trim().toUpperCase() === 'S'
  const isMsa      = t => String(t).trim().toUpperCase() === 'M'

  for await (const line of rl) {
    if (!line.trim()) continue
    const cols = line.split('\t')

    if (!headers) {
      headers = cols.map(h => h.trim().toUpperCase())
      console.log(`  Columns: ${headers.slice(0, 8).join(', ')} ...`)
      continue
    }

    rowCount++
    if (rowCount % 500_000 === 0) {
      process.stdout.write(`\r  Rows processed: ${(rowCount / 1_000_000).toFixed(1)}M ...`)
    }

    const get = col => (cols[headers.indexOf(col)] ?? '').trim()

    // Filters
    if (get('GROUP').toLowerCase() !== 'detailed') continue
    const naics = get('NAICS')
    if (naics && naics !== '000000') continue
    const own  = get('OWN_CODE')
    const rank = ownershipRank[own] ?? 9
    if (rank === 9 && own !== '') continue

    const soc = get('OCC_CODE')
    if (!socCodes.has(soc)) continue

    const entry       = parseWage(get('H_PCT25'))
    const average     = parseWage(get('H_MEAN'))
    const experienced = parseWage(get('H_PCT75'))
    if (!entry || !average || !experienced) continue

    const areaType = get('AREA_TYPE')
    const areaRaw  = get('AREA')

    function store(bucket, key) {
      if (!bucket[key]) bucket[key] = {}
      const existing = bucket[key][soc]
      if (!existing || rank < (existing._rank ?? 9)) {
        bucket[key][soc] = { entry, average, experienced, _rank: rank }
        kept++
      }
    }

    if (isNational(areaType))  { store(national, '__nat__') }
    else if (isState(areaType)) { store(states, String(parseInt(areaRaw, 10) || 0).padStart(2, '0')) }
    else if (isMsa(areaType))   { store(msas,   String(parseInt(areaRaw, 10) || 0).padStart(5, '0')) }
    else { unknownAreaTypes.add(areaType || '(blank)') }
  }

  process.stdout.write('\n')
  console.log(`  Total rows: ${rowCount.toLocaleString()} | Kept: ${kept.toLocaleString()}`)
  if (unknownAreaTypes.size > 0) {
    console.log(`  Skipped AREA_TYPE values: ${[...unknownAreaTypes].join(', ')} (metro divisions, nonmetro — expected)`)
  }

  // Flatten national
  const nationalFlat = {}
  for (const [soc, w] of Object.entries(national['__nat__'] ?? {})) {
    const { _rank, ...rest } = w
    nationalFlat[soc] = rest
  }

  // Strip _rank from states + msas
  for (const bucket of [states, msas]) {
    for (const areaWages of Object.values(bucket)) {
      for (const w of Object.values(areaWages)) delete w._rank
    }
  }

  return { national: nationalFlat, states, msas }
}

// ── Guess year from filename ──────────────────────────────────────────────────
function guessYear(filePath) {
  const m = filePath.match(/20(\d{2})/)
  return m ? `20${m[1]}` : 'unknown'
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('BLS OEWS Wage Data Processor')
  console.log('─'.repeat(50))

  const socCodes = loadSocCodes()
  console.log(`SOC codes in occupations.js: ${socCodes.size}`)

  console.log('\nLocating data file in .bls-cache/ ...')
  const fileInfo = findDataFile()
  const year     = guessYear(fileInfo.path)
  console.log(`  Data year: ${year}`)

  console.log('\nStreaming and parsing data...')
  const stream = await getReadStream(fileInfo)
  const { national, states, msas } = await parseTsv(stream, socCodes)

  const natCount   = Object.keys(national).length
  const stateCount = Object.keys(states).length
  const msaCount   = Object.keys(msas).length

  console.log(`\n  National occupations: ${natCount}`)
  console.log(`  States with data:     ${stateCount}`)
  console.log(`  MSAs with data:       ${msaCount}`)

  if (natCount === 0) {
    console.warn('\n  ⚠ No national data found.')
    console.warn('  The file may use different AREA_TYPE codes than expected (U or N).')
    console.warn('  Check the "Skipped AREA_TYPE values" line above for clues.')
  }

  const output = { national, states, msas, year }
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2))
  const bytes = readFileSync(OUTPUT).length
  console.log(`\n✓ Written to api/blsWages.json`)
  console.log(`  File size: ${(bytes / 1024).toFixed(0)} KB (${(bytes / 1024 / 1024).toFixed(2)} MB)`)

  console.log('\nNext steps:')
  console.log('  git add api/blsWages.json')
  console.log('  git commit -m "Add BLS OEWS ' + year + ' wage data (national/state/MSA)"')
  console.log('  git push')
}

main().catch(err => {
  console.error('\n✗ Error:', err.message)
  process.exit(1)
})
