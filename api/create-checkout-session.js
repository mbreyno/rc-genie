/**
 * Vercel API Route: /api/create-checkout-session
 *
 * Creates a Stripe Checkout session for the $9/mo subscription.
 * Auth: Supabase access token in the Authorization header.
 *
 * If the advisor subscribes while their in-app trial still has 2+ days left,
 * the remaining trial time is credited (card charged when the trial ends).
 */

import { stripe, siteOrigin } from './_lib/stripe.js'
import { supabaseAdmin, getUserFromRequest } from './_lib/supabaseAdmin.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })

  const { data: profile } = await supabaseAdmin
    .from('advisor_profiles')
    .select('stripe_customer_id, subscription_status, trial_ends_at, advisor_name')
    .eq('id', user.id)
    .single()
  if (!profile) return res.status(404).json({ error: 'Profile not found' })
  if (profile.subscription_status === 'active') {
    return res.status(400).json({ error: 'You already have an active subscription' })
  }

  try {
    // Reuse the Stripe customer if one exists, otherwise create it now
    let customerId = profile.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile.advisor_name || undefined,
        metadata: { advisor_id: user.id },
      })
      customerId = customer.id
      await supabaseAdmin
        .from('advisor_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Credit remaining trial days when subscribing early
    // (Stripe requires trial_end ≥ ~48h out, so skip when less remains)
    const trialEnd =
      profile.subscription_status === 'trialing' && profile.trial_ends_at
        ? Math.floor(new Date(profile.trial_ends_at).getTime() / 1000)
        : null
    const minTrialEnd = Math.floor(Date.now() / 1000) + 49 * 3600
    const origin = siteOrigin(req)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      client_reference_id: user.id,
      subscription_data: {
        metadata: { advisor_id: user.id },
        ...(trialEnd && trialEnd > minTrialEnd ? { trial_end: trialEnd } : {}),
      },
      allow_promotion_codes: true,
      success_url: `${origin}/subscribe?checkout=success`,
      cancel_url: `${origin}/subscribe?checkout=canceled`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return res.status(500).json({ error: 'Could not start checkout' })
  }
}
