/**
 * Vercel API Route: /api/bls-wages
 *
 * Looks up hourly wage data from the pre-built BLS OEWS dataset (api/blsWages.json).
 * Priority: MSA (metro area) → state → national.
 *
 * POST /api/bls-wages
 * Body: { socCodes: string[], stateFips: string, msaCode?: string }
 * Returns: { wages: { [soc]: { entry, average, experienced } }, geoLevel: string }
 *
 * To refresh BLS data (run annually each May after BLS releases new OEWS data):
 *   npm run fetch-bls
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load pre-built wage data at cold-start (cached in memory across warm invocations)
let BLS
try {
  BLS = JSON.parse(readFileSync(resolve(__dirname, 'blsWages.json'), 'utf8'))
} catch {
  BLS = null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' })

  if (!BLS) {
    return res.status(503).json({
      error: 'Wage data not available. Run "npm run fetch-bls" to generate api/blsWages.json.',
    })
  }

  // Parse body (Vercel plain functions don't auto-parse JSON)
  let body = {}
  try {
    body = typeof req.body === 'string'       ? JSON.parse(req.body)
         : Buffer.isBuffer(req.body)          ? JSON.parse(req.body.toString())
         : req.body ?? {}
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const { socCodes = [], stateFips = '', msaCode = '' } = body

  if (!socCodes.length) {
    return res.status(400).json({ error: 'socCodes array is required' })
  }

  // ── Resolve area data: MSA → state → national ────────────────────────────
  const fips = String(stateFips).padStart(2, '0')
  const cbsa = String(msaCode).padStart(5, '0')

  const stateData    = (fips !== '00') ? (BLS.states?.[fips]  ?? null) : null
  const msaData      = msaCode          ? (BLS.msas?.[cbsa]   ?? null) : null

  // RSE threshold: BLS considers >50% unreliable; we use 30% to be conservative.
  // When an MSA's RSE for an occupation exceeds this, we fall back to state/national.
  const RSE_THRESHOLD = 30

  // ── Build wages response — per-occupation geographic fallback ────────────
  // Each SOC is resolved independently so that high-RSE occupations can fall
  // back to state/national while well-sampled occupations use the MSA figure.
  const wages    = {}
  const geoLevels = {}

  for (const soc of socCodes) {
    const msaWage   = msaData?.[soc]   ?? null
    const stateWage = stateData?.[soc] ?? null
    const natWage   = BLS.national?.[soc] ?? null

    // Use MSA wage only when RSE is acceptable (or RSE not available)
    const msaReliable = msaWage && (msaWage.rse == null || msaWage.rse <= RSE_THRESHOLD)

    let w, geo
    if (msaReliable) {
      w = msaWage;   geo = 'msa'
    } else if (stateWage) {
      w = stateWage; geo = 'state'
    } else if (natWage) {
      w = natWage;   geo = 'national'
    }

    if (w) {
      wages[soc]     = w
      geoLevels[soc] = geo
    }
  }

  // Overall geoLevel = most specific level used across all occupations
  const levels  = Object.values(geoLevels)
  const geoLevel = levels.includes('msa')      ? 'msa'
                 : levels.includes('state')    ? 'state'
                 : levels.includes('national') ? 'national'
                 : 'national'

  return res.status(200).json({
    wages,
    geoLevel,
    geoLevels,  // per-occupation breakdown (useful for debugging)
    dataYear: BLS.year ?? 'unknown',
  })
}
