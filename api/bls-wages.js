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

async function fetchWages(seriesIds) {
  const allResults = {}
  const chunks = []
  for (let i = 0; i < seriesIds.length; i += 50) {
    chunks.push(seriesIds.slice(i, i + 50))
  }

  for (const chunk of chunks) {
    const payload = {
      seriesid:      chunk,
      startyear:     String(new Date().getFullYear() - 1),
      endyear:       String(new Date().getFullYear()),
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
      console.warn('BLS API non-success:', data.message)
      return null
    }

    for (const series of (data.Results?.series ?? [])) {
      const sid = series.seriesID
      // Extract SOC (chars 12–17) and datatype (chars 18–19) — same offset for both state and MSA
      const socDigits    = sid.slice(12, 18)
      const socFormatted = `${socDigits.slice(0, 2)}-${socDigits.slice(2)}`
      const datatype     = sid.slice(18, 20)

      const latestEntry = series.data?.find(d => d.period === 'M13') ?? series.data?.[0]
      if (!latestEntry?.value || latestEntry.value === '-') continue

      const wage = parseFloat(latestEntry.value)
      if (!allResults[socFormatted]) allResults[socFormatted] = {}
      for (const [level, dt] of Object.entries(DATATYPES)) {
        if (dt === datatype) allResults[socFormatted][level] = wage
      }
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

  const { socCodes = [], stateFips = '00', msaCode = '' } = req.body ?? {}

  if (!socCodes.length) {
    return res.status(400).json({ error: 'socCodes array is required' })
  }

  const emptyResponse = (warning) =>
    res.status(200).json({ wages: {}, geoLevel: 'none', warning })

  // ── Try MSA-level first (if an MSA code was provided) ───────────────────
  if (msaCode) {
    const msaSeriesIds = []
    for (const soc of socCodes) {
      for (const dt of Object.values(DATATYPES)) {
        msaSeriesIds.push(buildMsaSeriesId(msaCode, soc, dt))
      }
    }

    const msaWages = await fetchWages(msaSeriesIds)
    if (msaWages && hasUsableData(msaWages)) {
      return res.status(200).json({ wages: msaWages, geoLevel: 'msa' })
    }
    console.log(`MSA ${msaCode} returned no data — falling back to state ${stateFips}`)
  }

  // ── Fall back to state-level ─────────────────────────────────────────────
  const stateSeriesIds = []
  for (const soc of socCodes) {
    for (const dt of Object.values(DATATYPES)) {
      stateSeriesIds.push(buildStateSeriesId(stateFips, soc, dt))
    }
  }

  const stateWages = await fetchWages(stateSeriesIds)
  if (!stateWages) return emptyResponse('BLS API unavailable — using fallback data')

  return res.status(200).json({ wages: stateWages, geoLevel: 'state' })
}
