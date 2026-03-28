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
      return null
    }

    if (data.status !== 'REQUEST_SUCCEEDED') {
      console.warn('BLS API non-success:', data.message, data.message)
      return null
    }

    for (const series of (data.Results?.series ?? [])) {
      // Use the lookup map — no fragile string slicing needed
      const meta = lookup[series.seriesID]
      if (!meta) continue

      const latestEntry = series.data?.find(d => d.period === 'M13') ?? series.data?.[0]
      if (!latestEntry?.value || latestEntry.value === '-') continue

      const wage = parseFloat(latestEntry.value)
      if (!allResults[meta.soc]) allResults[meta.soc] = {}
      allResults[meta.soc][meta.level] = wage
    }
  }

  return allResults
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

  const emptyResponse = (warning) =>
    res.status(200).json({ wages: {}, geoLevel: 'none', warning })

  // ── Try MSA-level first (if an MSA code was provided) ───────────────────
  if (msaCode) {
    const { ids: msaIds, lookup: msaLookup } = buildSeriesMap(buildMsaSeriesId, msaCode, socCodes)
    const msaWages = await fetchWages(msaIds, msaLookup)
    if (msaWages && hasUsableData(msaWages)) {
      return res.status(200).json({ wages: msaWages, geoLevel: 'msa' })
    }
    console.log(`MSA ${msaCode} returned no data — falling back to state ${stateFips}`)
  }

  // ── Fall back to state-level ─────────────────────────────────────────────
  const { ids: stateIds, lookup: stateLookup } = buildSeriesMap(buildStateSeriesId, stateFips, socCodes)
  const stateWages = await fetchWages(stateIds, stateLookup)
  if (!stateWages) return emptyResponse('BLS API unavailable — using fallback data')

  return res.status(200).json({ wages: stateWages, geoLevel: 'state' })
}
