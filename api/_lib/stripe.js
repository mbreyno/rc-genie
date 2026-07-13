import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const ALLOWED_ORIGINS = new Set([
  'https://rcgenie.app',
  'https://www.rcgenie.app',
  'http://localhost:5173',
  'http://localhost:3000',
])

// Redirect targets must stay on our own site
export function siteOrigin(req) {
  const origin = req.headers.origin
  return ALLOWED_ORIGINS.has(origin) ? origin : 'https://rcgenie.app'
}
