import { supabase } from '../lib/supabase'

// Derive subscription/trial state from the advisor profile.
// Subscription columns are written only by the Stripe webhook.
export function getSubscriptionState(profile) {
  if (!profile) {
    return { status: 'unknown', hasAccess: false, inTrial: false, trialDaysLeft: 0, trialEndsAt: null }
  }
  const status = profile.subscription_status || 'trialing'
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const inTrial = status === 'trialing' && trialEndsAt && trialEndsAt > new Date()
  const trialDaysLeft = inTrial
    ? Math.max(1, Math.ceil((trialEndsAt - new Date()) / 86_400_000))
    : 0

  return {
    status,                                    // 'trialing' | 'active' | 'past_due' | 'canceled' | …
    hasAccess: status === 'active' || inTrial, // can use the app
    inTrial,
    trialDaysLeft,
    trialEndsAt,
  }
}

async function billingRedirect(endpoint) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not signed in')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.url) throw new Error(json.error || 'Something went wrong — please try again')
  window.location.href = json.url
}

// Send the user to Stripe Checkout to start the $9/mo subscription
export const redirectToCheckout = () => billingRedirect('/api/create-checkout-session')

// Send the user to the Stripe Billing Portal (update card, cancel, invoices)
export const redirectToBillingPortal = () => billingRedirect('/api/create-portal-session')
