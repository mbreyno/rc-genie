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

  let geoLevel  = 'national'
  let areaData  = BLS.national ?? {}

  if (fips !== '00' && BLS.states?.[fips]) {
    areaData = BLS.states[fips]
    geoLevel = 'state'
  }

  if (msaCode && BLS.msas?.[cbsa]) {
    areaData = BLS.msas[cbsa]
    geoLevel = 'msa'
  }

  // ── Build wages response ─────────────────────────────────────────────────
  const wages = {}
  for (const soc of socCodes) {
    // Use area data if available, fall back to national for occupations not
    // sampled at that geography (common for smaller metros)
    const w = areaData[soc] ?? BLS.national?.[soc]
    if (w) wages[soc] = w
  }

  return res.status(200).json({
    wages,
    geoLevel,
    dataYear: BLS.year ?? 'unknown',
  })
}
