/**
 * Vercel API Route: /api/create-portal-session
 *
 * Creates a Stripe Billing Portal session so advisors can self-manage
 * their subscription: update payment method, cancel, view invoices.
 * Auth: Supabase access token in the Authorization header.
 */

import { stripe, siteOrigin } from './_lib/stripe.js'
import { supabaseAdmin, getUserFromRequest } from './_lib/supabaseAdmin.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const { data: profile } = await supabaseAdmin
    .from('advisor_profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()
  if (!profile?.stripe_customer_id) {
    return res.status(400).json({ error: 'No billing account yet — subscribe first' })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteOrigin(req)}/profile`,
    })
    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-portal-session error:', err)
    return res.status(500).json({ error: 'Could not open billing portal' })
  }
}
