/**
 * Vercel API Route: BLS Wages Proxy
 * Fetches hourly wage data from the BLS OES API for given SOC codes,
 * state, and optional MSA (metro area).
 *
 * POST /api/bls-wages
 * Body: { socCodes: string[], stateFips: string, msaCode?: string }
 * Returns: { wages: { [soc]: { entry, average, experienced } }, geoLevel: 'msa'|'state' }
 */

const BLS_API_KEY = process.env.BLS_API_KEY || ''
const BLS_API_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/'

// State-level wage adjustment ratios relative to national average.
// Derived from BLS OEWS state median wage data. Applied when the BLS
// series API returns no occupation-specific data for a state.
const STATE_WAGE_RATIOS = {
  '01': 0.88, // Alabama
  '02': 1.06, // Alaska
  '04': 0.95, // Arizona
  '05': 0.86, // Arkansas
  '06': 1.21, // California
  '08': 1.09, // Colorado
  '09': 1.18, // Connecticut
  '10': 1.02, // Delaware
  '11': 1.45, // District of Columbia
  '12': 0.93, // Florida
  '13': 0.96, // Georgia
  '15': 1.05, // Hawaii
  '16': 0.89, // Idaho
  '17': 1.04, // Illinois
  '18': 0.93, // Indiana
  '19': 0.94, // Iowa
  '20': 0.93, // Kansas
  '21': 0.89, // Kentucky
  '22': 0.90, // Louisiana
  '23': 0.94, // Maine
  '24': 1.11, // Maryland
  '25': 1.19, // Massachusetts
  '26': 0.98, // Michigan
  '27': 1.05, // Minnesota
  '28': 0.84, // Mississippi
  '29': 0.92, // Missouri
  '30': 0.88, // Montana
  '31': 0.94, // Nebraska
  '32': 0.96, // Nevada
  '33': 1.07, // New Hampshire
  '34': 1.17, // New Jersey
  '35': 0.88, // New Mexico
  '36': 1.24, // New York
  '37': 0.94, // North Carolina
  '38': 0.95, // North Dakota
  '39': 0.96, // Ohio
  '40': 0.89, // Oklahoma
  '41': 1.06, // Oregon
  '42': 1.00, // Pennsylvania
  '44': 1.05, // Rhode Island
  '45': 0.90, // South Carolina
  '46': 0.87, // South Dakota
  '47': 0.92, // Tennessee
  '48': 0.99, // Texas
  '49': 0.97, // Utah
  '50': 0.98, // Vermont
  '51': 1.11, // Virginia
  '53': 1.19, // Washington
  '54': 0.85, // West Virginia
  '55': 0.96, // Wisconsin
  '56': 0.94, // Wyoming
  '72': 0.75, // Puerto Rico
}

// BLS OES series ID format (26 chars total):
//   State: OEUS + {2-char state fips} + {12 zeros} + {6-char SOC} + {2-char datatype}
//   Metro: OEUM + {7-char CBSA left-padded} + {7 zeros} + {6-char SOC} + {2-char datatype}
function buildStateSeriesId(stateFips, soc, datatype) {
  const socClean  = soc.replace('-', '')
  const stateCode = stateFips.padStart(2, '0')
  return `OEUS${stateCode}000000000000${socClean}${datatype}`
}

function buildMsaSeriesId(cbsaCode, soc, datatype) {
  const socClean  = soc.replace('-', '')
  const areaCode  = cbsaCode.padStart(7, '0')   // e.g. "16980" → "0016980"
  return `OEUM${areaCode}0000000${socClean}${datatype}`
}

// Datatypes: 07=25th pct (entry), 08=median (average), 09=75th pct (experienced)
const DATATYPES = { entry: '07', average: '08', experienced: '09' }
const DATATYPE_TO_LEVEL = Object.fromEntries(Object.entries(DATATYPES).map(([k, v]) => [v, k]))

// Build series IDs and a reverse lookup map: seriesId → { soc, level }
function buildSeriesMap(buildFn, locationArg, socCodes) {
  const ids = []
  const lookup = {}
  for (const soc of socCodes) {
    for (const [level, dt] of Object.entries(DATATYPES)) {
      const id = buildFn(locationArg, soc, dt)
      ids.push(id)
      lookup[id] = { soc, level }
    }
  }
  return { ids, lookup }
}

async function fetchWages(seriesIds, lookup) {
  const allResults = {}
  const debug = { seriesIdsSent: seriesIds, blsStatus: null, seriesReturned: [], lookupMisses: [] }
  const chunks = []
  for (let i = 0; i < seriesIds.length; i += 50) {
    chunks.push(seriesIds.slice(i, i + 50))
  }

  for (const chunk of chunks) {
    const payload = {
      seriesid:      chunk,
      startyear:     String(new Date().getFullYear() - 2),
      endyear:       String(new Date().getFullYear() - 1),
      calculations:  false,
      annualaverage: false,
    }
    if (BLS_API_KEY) payload.registrationkey = BLS_API_KEY

    let data
    try {
      const response = await fetch(BLS_API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      data = await response.json()
    } catch (err) {
      console.error('BLS API fetch error:', err)
      debug.blsStatus = 'FETCH_ERROR'
      return { results: null, debug }
    }

    debug.blsStatus = data.status
    debug.blsMessage = data.message

    if (data.status !== 'REQUEST_SUCCEEDED') {
      console.warn('BLS API non-success:', data.message)
      return { results: null, debug }
    }

    for (const series of (data.Results?.series ?? [])) {
      debug.seriesReturned.push(series.seriesID)
      const meta = lookup[series.seriesID]
      if (!meta) { debug.lookupMisses.push(series.seriesID); continue }

      const latestEntry = series.data?.find(d => d.period === 'M13') ?? series.data?.[0]
      if (!latestEntry?.value || latestEntry.value === '-') continue

      const wage = parseFloat(latestEntry.value)
      if (!allResults[meta.soc]) allResults[meta.soc] = {}
      allResults[meta.soc][meta.level] = wage
    }
  }

  return { results: allResults, debug }
}

function hasUsableData(wages) {
  return Object.values(wages).some(w => w.entry || w.average || w.experienced)
}

export default async function handler(req, res) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Vercel plain functions don't auto-parse JSON — handle both parsed object and raw string
  let parsedBody = {}
  try {
    parsedBody = typeof req.body === 'string' ? JSON.parse(req.body)
               : Buffer.isBuffer(req.body)    ? JSON.parse(req.body.toString())
               : req.body ?? {}
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }
  const { socCodes = [], stateFips = '00', msaCode = '' } = parsedBody

  if (!socCodes.length) {
    return res.status(400).json({ error: 'socCodes array is required' })
  }

  // ── Try MSA-level first (if an MSA code was provided) ───────────────────
  if (msaCode) {
    const { ids: msaIds, lookup: msaLookup } = buildSeriesMap(buildMsaSeriesId, msaCode, socCodes)
    const { results: msaWages, debug: msaDebug } = await fetchWages(msaIds, msaLookup)
    if (msaWages && hasUsableData(msaWages)) {
      return res.status(200).json({ wages: msaWages, geoLevel: 'msa' })
    }
    console.log(`MSA ${msaCode} returned no data — falling back to state ${stateFips}`)
  }

  // ── Try state-level BLS series ────────────────────────────────────────────
  const { ids: stateIds, lookup: stateLookup } = buildSeriesMap(buildStateSeriesId, stateFips, socCodes)
  const { results: stateWages } = await fetchWages(stateIds, stateLookup)
  if (stateWages && hasUsableData(stateWages)) {
    return res.status(200).json({ wages: stateWages, geoLevel: 'state' })
  }

  // ── Fall back to state wage ratio ─────────────────────────────────────────
  // BLS time-series API doesn't serve state-level OES occupation data.
  // Use pre-computed state median wage ratios relative to national average.
  const fipsKey = stateFips.toString().padStart(2, '0')
  const stateRatio = STATE_WAGE_RATIOS[fipsKey] ?? 1.0
  return res.status(200).json({ wages: {}, geoLevel: 'state-ratio', stateRatio })
}
