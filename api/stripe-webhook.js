/**
 * Vercel API Route: /api/stripe-webhook
 *
 * Syncs Stripe subscription state into advisor_profiles (service role).
 * This is the ONLY writer of subscription columns — clients cannot set them.
 *
 * Uses the Web handler signature (not Node's req/res) because signature
 * verification needs the raw request body, and Vercel's Node helpers
 * pre-parse JSON bodies with no way to disable it.
 *
 * Events handled:
 *   checkout.session.completed      → link customer/subscription, set status
 *   customer.subscription.updated   → status changes (active, past_due, …)
 *   customer.subscription.deleted   → mark canceled
 */

import { stripe } from './_lib/stripe.js'
import { supabaseAdmin } from './_lib/supabaseAdmin.js'

// current_period_end lives on the subscription in older Stripe API versions
// and on subscription items in newer ones — check both
function periodEnd(sub) {
  const ts = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end
  return ts ? new Date(ts * 1000).toISOString() : null
}

function customerId(sub) {
  return typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
}

// Match by advisor_id metadata when present, else by Stripe customer id
async function updateProfile(advisorId, custId, fields) {
  let query = supabaseAdmin.from('advisor_profiles').update(fields)
  query = advisorId ? query.eq('id', advisorId) : query.eq('stripe_customer_id', custId)
  const { error } = await query
  if (error) throw new Error(`Supabase update failed: ${error.message}`)
}

async function syncSubscription(sub) {
  await updateProfile(sub.metadata?.advisor_id, customerId(sub), {
    stripe_customer_id: customerId(sub),
    stripe_subscription_id: sub.id,
    subscription_status: sub.status,
    current_period_end: periodEnd(sub),
    ...(sub.trial_end ? { trial_ends_at: new Date(sub.trial_end * 1000).toISOString() } : {}),
  })
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export async function POST(request) {
  let event
  try {
    const body = await request.text()
    event = await stripe.webhooks.constructEventAsync(
      body,
      request.headers.get('stripe-signature'),
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('stripe-webhook signature verification failed:', err.message)
    return json({ error: 'Webhook signature verification failed' }, 400)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription)
          await syncSubscription(sub)
        }
        break
      }
      case 'customer.subscription.updated':
        await syncSubscription(event.data.object)
        break
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await updateProfile(sub.metadata?.advisor_id, customerId(sub), {
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          current_period_end: null,
        })
        break
      }
      default:
        break
    }
    return json({ received: true })
  } catch (err) {
    console.error('stripe-webhook handler error:', err)
    // Non-2xx makes Stripe retry — desired for transient DB failures
    return json({ error: 'Webhook handler failed' }, 500)
  }
}
