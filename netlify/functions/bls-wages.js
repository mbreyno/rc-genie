/**
 * Netlify Function: BLS Wages Proxy
 * Fetches hourly wage data from the BLS OES API for given SOC codes and state.
 * Keeps the BLS API key server-side.
 *
 * POST /api/bls-wages
 * Body: { socCodes: string[], stateFips: string }
 * Returns: { wages: { [soc]: { entry, average, experienced } } }
 */

const BLS_API_KEY  = process.env.BLS_API_KEY || ''
const BLS_API_URL  = 'https://api.bls.gov/publicAPI/v2/timeseries/data/'

// BLS OES series ID format:
// OEUS[state_fips_2digit][00000000][soc_6digit][datatype_2digit]
// datatype: 06=10th pct, 07=25th pct, 08=median, 09=75th pct, 04=annual mean
function buildSeriesId(stateFips, soc, datatype) {
  const socClean  = soc.replace('-', '')           // "13-1161" → "131161"
  const stateCode = stateFips.padStart(2, '0')     // "18" → "18"
  return `OEUS${stateCode}000000000000${socClean}${datatype}`
}

// Datatypes we fetch
const DATATYPES = { entry: '07', average: '08', experienced: '09' }

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { socCodes = [], stateFips = '00' } = body

  if (!socCodes.length) {
    return { statusCode: 400, body: JSON.stringify({ error: 'socCodes array is required' }) }
  }

  // Build series IDs for all SOC codes × all wage percentiles
  const seriesIds = []
  for (const soc of socCodes) {
    for (const [, datatype] of Object.entries(DATATYPES)) {
      // Try state-level first; we'll fall back in the reducer below
      seriesIds.push(buildSeriesId(stateFips, soc, datatype))
    }
  }

  // BLS API allows max 50 series per request
  const chunks = []
  for (let i = 0; i < seriesIds.length; i += 50) {
    chunks.push(seriesIds.slice(i, i + 50))
  }

  const allResults = {}

  for (const chunk of chunks) {
    const payload = {
      seriesid:        chunk,
      startyear:       String(new Date().getFullYear() - 1),
      endyear:         String(new Date().getFullYear()),
      calculations:    false,
      annualaverage:   false,
    }
    if (BLS_API_KEY) payload.registrationkey = BLS_API_KEY

    let response, data
    try {
      response = await fetch(BLS_API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      data = await response.json()
    } catch (err) {
      console.error('BLS API fetch error:', err)
      // Return empty — frontend will fall back to hardcoded wages
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wages: {}, warning: 'BLS API unavailable — using fallback data' }),
      }
    }

    if (data.status !== 'REQUEST_SUCCEEDED') {
      console.warn('BLS API non-success:', data.message)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wages: {}, warning: data.message?.join('; ') || 'BLS API error' }),
      }
    }

    // Parse results: extract the most recent year's annual average value
    for (const series of (data.Results?.series ?? [])) {
      const sid = series.seriesID
      // Extract SOC and datatype from series ID
      // Format: OEUS[2]state[8]zeros[6]soc[2]datatype  — total 23 chars
      const socDigits  = sid.slice(12, 18)              // 6-char SOC
      const socFormatted = `${socDigits.slice(0,2)}-${socDigits.slice(2)}` // "131161" → "13-1161"
      const datatype   = sid.slice(18, 20)              // "07", "08", or "09"

      // Get the most recent annual value
      const latestEntry = series.data?.find(d => d.period === 'M13') // M13 = annual average
        ?? series.data?.[0]

      if (!latestEntry?.value || latestEntry.value === '-') continue

      const wage = parseFloat(latestEntry.value)
      if (!allResults[socFormatted]) allResults[socFormatted] = {}

      for (const [level, dt] of Object.entries(DATATYPES)) {
        if (dt === datatype) allResults[socFormatted][level] = wage
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ wages: allResults }),
  }
}
