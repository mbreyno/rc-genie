#!/usr/bin/env node
/**
 * scripts/fetch-bls-data.js
 *
 * Reads the BLS OEWS "All data" Excel file and extracts hourly wage data
 * for every occupation in src/data/occupations.js, organized by national,
 * state, and MSA (metro area) geography.
 *
 * Output: api/blsWages.json  (committed to repo — no runtime downloads needed)
 *
 * ── Setup (one-time) ─────────────────────────────────────────────────────────
 * 1. Go to https://www.bls.gov/oes/tables.htm
 * 2. Find the most recent "May 20XX" section
 * 3. Click "All data (XLSX)" and save to: .bls-cache/all_data_M_20XX.xlsx
 * 4. Run: npm run fetch-bls
 *
 * ── Updating annually ────────────────────────────────────────────────────────
 * Each May, BLS releases new OEWS data. Repeat steps 1-4 above with the
 * new file, then commit the updated api/blsWages.json.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import xlsx from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const CACHE_DIR = resolve(ROOT, '.bls-cache')
const OUTPUT    = resolve(ROOT, 'api', 'blsWages.json')

// ── Find the all_data xlsx in .bls-cache/ ─────────────────────────────────────
function findDataFile() {
  if (!existsSync(CACHE_DIR)) {
    throw new Error(
      `.bls-cache/ folder not found.\n\n` +
      `  1. Create it: mkdir .bls-cache\n` +
      `  2. Download "All data (XLSX)" from https://www.bls.gov/oes/tables.htm\n` +
      `  3. Save the file into .bls-cache/\n` +
      `  4. Re-run: npm run fetch-bls`
    )
  }

  const files = readdirSync(CACHE_DIR).filter(f =>
    f.toLowerCase().endsWith('.xlsx') && f.toLowerCase().includes('all_data')
  )

  if (files.length === 0) {
    // Also accept any xlsx file in .bls-cache/ as a fallback
    const anyXlsx = readdirSync(CACHE_DIR).filter(f => f.toLowerCase().endsWith('.xlsx'))
    if (anyXlsx.length === 1) {
      console.log(`  Found: ${anyXlsx[0]}`)
      return resolve(CACHE_DIR, anyXlsx[0])
    }
    throw new Error(
      `No "all_data*.xlsx" file found in .bls-cache/.\n\n` +
      `  Download "All data (XLSX)" from https://www.bls.gov/oes/tables.htm\n` +
      `  and save it to .bls-cache/`
    )
  }

  // Use the most recently downloaded file if there are multiple
  files.sort()
  const chosen = files[files.length - 1]
  console.log(`  Found: ${chosen}`)
  return resolve(CACHE_DIR, chosen)
}

// ── Extract all unique SOC codes from occupations.js ─────────────────────────
function loadSocCodes() {
  const src = readFileSync(resolve(ROOT, 'src/data/occupations.js'), 'utf8')
  const matches = [...src.matchAll(/soc:\s*['"]([0-9]{2}-[0-9]{4})['"]/g)]
  return new Set(matches.map(m => m[1]))
}

// ── Parse a wage value — BLS uses '#' (not published) and '*' (suppressed) ───
function parseWage(val) {
  if (val === null || val === undefined || val === '') return null
  const s = String(val).trim()
  if (s === '#' || s === '*' || s === '-') return null
  const n = parseFloat(s.replace(/,/g, ''))
  return isNaN(n) ? null : n
}

// ── Normalize a row's keys to uppercase ──────────────────────────────────────
function normalizeRow(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) out[k.trim().toUpperCase()] = v
  return out
}

// ── Parse year from filename ──────────────────────────────────────────────────
function guessYear(filename) {
  const m = filename.match(/20(\d{2})/)
  return m ? `20${m[1]}` : 'unknown'
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('BLS OEWS Wage Data Processor')
  console.log('─'.repeat(50))

  const socCodes = loadSocCodes()
  console.log(`SOC codes in occupations.js: ${socCodes.size}`)

  console.log('\nLocating data file...')
  const filePath = findDataFile()
  const year     = guessYear(filePath)
  const fileSizeMB = (readFileSync(filePath).length / 1024 / 1024).toFixed(1)
  console.log(`  Size: ${fileSizeMB} MB | Year: ${year}`)

  console.log('\nParsing Excel file (this may take 1-2 minutes for large files)...')
  const wb    = xlsx.read(readFileSync(filePath), { type: 'buffer', raw: true })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows  = xlsx.utils.sheet_to_json(sheet, { defval: '' }).map(normalizeRow)
  console.log(`  Rows read: ${rows.length.toLocaleString()}`)

  // ── Discover AREA_TYPE values in this file ──────────────────────────────
  const areaTypes = new Set(rows.slice(0, 5000).map(r => String(r.AREA_TYPE ?? '').trim()))
  console.log(`  AREA_TYPE values seen (sample): ${[...areaTypes].join(', ')}`)

  // ── Categorize area types ───────────────────────────────────────────────
  // BLS uses: U=National, S=State, M=Metro MSA, B=Metro Division, A=Nonmetro
  // Some files use numeric codes or slight variations — handle both
  const isNational = t => ['U', 'N', '0', '00'].includes(String(t).toUpperCase().trim())
  const isState    = t => String(t).toUpperCase().trim() === 'S'
  const isMsa      = t => String(t).toUpperCase().trim() === 'M'

  const output = { national: {}, states: {}, msas: {}, year }

  // Track ownership rank so we prefer the most comprehensive scope
  const ownershipRank = { '1235': 0, '235': 1, '35': 2, '5': 3 }

  let totalKept = 0
  let unknownTypes = new Set()

  for (const row of rows) {
    // Only detailed occupation level (not major/minor/broad group totals)
    if (String(row.GROUP ?? '').toLowerCase().trim() !== 'detailed') continue

    // Cross-industry only (NAICS = blank or 000000)
    const naics = String(row.NAICS ?? '').trim()
    if (naics && naics !== '000000') continue

    // Filter ownership to comprehensive groupings
    const own  = String(row.OWN_CODE ?? '').trim()
    const rank = ownershipRank[own] ?? 9
    if (rank === 9 && own !== '') continue

    // Must be one of our target SOC codes
    const soc = String(row.OCC_CODE ?? '').trim()
    if (!socCodes.has(soc)) continue

    // Must have usable hourly wage data
    const entry       = parseWage(row.H_PCT25)
    const average     = parseWage(row.H_MEAN)
    const experienced = parseWage(row.H_PCT75)
    if (!entry || !average || !experienced) continue

    const areaType = String(row.AREA_TYPE ?? '').trim()
    const areaRaw  = String(row.AREA ?? '').trim()

    const wages = { entry, average, experienced }

    function store(bucket, key) {
      if (!bucket[key]) {
        bucket[key] = {}
      }
      // Keep the most comprehensive ownership grouping per (area, soc)
      if (!bucket[key][soc] || rank < (bucket[key][soc]._rank ?? 9)) {
        bucket[key][soc] = { ...wages, _rank: rank }
        totalKept++
      }
    }

    if (isNational(areaType)) {
      store(output.national, '__national__')
    } else if (isState(areaType)) {
      // State FIPS — normalize to 2-digit string
      const fips = String(parseInt(areaRaw, 10) || 0).padStart(2, '0')
      store(output.states, fips)
    } else if (isMsa(areaType)) {
      // CBSA code — normalize to 5-digit string
      const cbsa = String(parseInt(areaRaw, 10) || 0).padStart(5, '0')
      store(output.msas, cbsa)
    } else {
      unknownTypes.add(areaType)
    }
  }

  // ── Flatten national (was keyed by dummy key) ─────────────────────────────
  const nationalData = output.national['__national__'] ?? {}
  output.national = {}
  for (const [soc, w] of Object.entries(nationalData)) {
    const { _rank, ...rest } = w
    output.national[soc] = rest
  }

  // ── Strip _rank fields from states and msas ───────────────────────────────
  for (const bucket of [output.states, output.msas]) {
    for (const areaWages of Object.values(bucket)) {
      for (const soc of Object.keys(areaWages)) {
        delete areaWages[soc]._rank
      }
    }
  }

  if (unknownTypes.size > 0) {
    console.log(`\n  Note: Skipped unrecognized AREA_TYPE values: ${[...unknownTypes].join(', ')}`)
    console.log(`  (These are likely metro divisions or nonmetro areas — not needed)`)
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const natCount   = Object.keys(output.national).length
  const stateCount = Object.keys(output.states).length
  const msaCount   = Object.keys(output.msas).length

  console.log(`\n  Records kept: ${totalKept.toLocaleString()}`)
  console.log(`  National occupations: ${natCount}`)
  console.log(`  States with data:     ${stateCount}`)
  console.log(`  MSAs with data:       ${msaCount}`)

  if (natCount === 0) {
    console.warn('\n  ⚠ No national data found. The file may use a different AREA_TYPE code.')
    console.warn('  Check the "AREA_TYPE values seen" line above and report it so the script can be updated.')
  }

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2))
  const outBytes = readFileSync(OUTPUT).length
  console.log(`\n✓ Written to api/blsWages.json`)
  console.log(`  File size: ${(outBytes / 1024).toFixed(0)} KB (${(outBytes / 1024 / 1024).toFixed(2)} MB)`)

  console.log('\nNext steps:')
  console.log('  git add api/blsWages.json')
  console.log('  git commit -m "Add BLS OEWS ' + year + ' wage data (national/state/MSA)"')
  console.log('  git push')
  console.log('\nRe-run each May after BLS releases new annual OEWS data.')
}

main().catch(err => {
  console.error('\n✗ Error:', err.message)
  process.exit(1)
})
