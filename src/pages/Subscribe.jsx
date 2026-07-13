import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSubscriptionState, redirectToCheckout, redirectToBillingPortal } from '../utils/subscription'

const PLAN_FEATURES = [
  'Unlimited reasonable compensation reports',
  'Location-specific BLS wage data (state & metro)',
  'Branded, client-ready PDF reports',
  'Your firm logo and brand color on every report',
  'Cancel anytime — no long-term commitment',
]

export default function Subscribe() {
  const { profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  const checkoutSuccess = searchParams.get('checkout') === 'success'
  const sub = getSubscriptionState(profile)
  const pollCount = useRef(0)

  // After Checkout success, poll until the webhook flips the profile to active
  useEffect(() => {
    if (!checkoutSuccess || sub.status === 'active') return
    if (pollCount.current >= 15) return
    const t = setTimeout(() => {
      pollCount.current += 1
      refreshProfile()
    }, 1500)
    return () => clearTimeout(t)
  }, [checkoutSuccess, sub.status, profile])

  // Active subscribers don't belong here
  useEffect(() => {
    if (sub.status === 'active' && !checkoutSuccess) navigate('/dashboard', { replace: true })
    if (sub.status === 'active' && checkoutSuccess) {
      const t = setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
      return () => clearTimeout(t)
    }
  }, [sub.status])

  async function handle(action) {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  // ── Post-checkout states ──────────────────────────────────────────────
  if (checkoutSuccess) {
    const activated = sub.status === 'active'
    const gaveUp = pollCount.current >= 15 && !activated
    return (
      <Shell>
        <div className="card text-center py-12">
          {activated ? (
            <>
              <div className="w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">You're subscribed!</h1>
              <p className="text-gray-500">Taking you to your dashboard…</p>
            </>
          ) : gaveUp ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Almost there</h1>
              <p className="text-gray-500 mb-6">
                Your payment went through, but activation is taking longer than usual.
                Give it a minute, then refresh this page.
              </p>
              <button onClick={() => window.location.reload()} className="btn-primary">Refresh</button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 mx-auto mb-4 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Activating your subscription…</h1>
              <p className="text-gray-500">This usually takes a few seconds.</p>
            </>
          )}
        </div>
      </Shell>
    )
  }

  // ── Headline copy by state ────────────────────────────────────────────
  const headline =
    sub.status === 'past_due' ? 'There was a problem with your payment'
    : sub.status === 'canceled' ? 'Your subscription is canceled'
    : sub.inTrial ? `${sub.trialDaysLeft} day${sub.trialDaysLeft === 1 ? '' : 's'} left in your free trial`
    : 'Your free trial has ended'

  const subcopy =
    sub.status === 'past_due'
      ? 'Your last payment didn’t go through. Update your payment method to restore access — your reports are safe and waiting.'
    : sub.status === 'canceled'
      ? 'Resubscribe to pick up right where you left off. All of your reports are still here.'
    : sub.inTrial
      ? 'Subscribe now and your card won’t be charged until your trial ends.'
      : 'Subscribe to keep generating reasonable compensation reports. Everything you’ve created is saved.'

  return (
    <Shell>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{headline}</h1>
        <p className="text-gray-500 max-w-md mx-auto">{subcopy}</p>
      </div>

      <div className="card max-w-md mx-auto">
        <div className="text-center pb-6 border-b border-gray-100">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wide mb-2">RC Genie Pro</p>
          <p>
            <span className="text-4xl font-extrabold text-gray-900">$9</span>
            <span className="text-gray-500 font-medium">/month</span>
          </p>
        </div>
        <ul className="py-6 space-y-3">
          {PLAN_FEATURES.map(f => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {sub.status === 'past_due' ? (
          <button onClick={() => handle(redirectToBillingPortal)} disabled={busy} className="btn-primary w-full justify-center">
            {busy ? 'Opening billing portal…' : 'Update payment method'}
          </button>
        ) : (
          <button onClick={() => handle(redirectToCheckout)} disabled={busy} className="btn-primary w-full justify-center">
            {busy ? 'Redirecting to checkout…' : sub.status === 'canceled' ? 'Resubscribe — $9/month' : 'Subscribe — $9/month'}
          </button>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Secure checkout powered by Stripe. Cancel anytime from your profile.
        </p>
      </div>

      <div className="text-center mt-8 space-x-6">
        {sub.hasAccess && (
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Back to dashboard</Link>
        )}
        <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
      </div>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">RC Genie</span>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">{children}</div>
    </div>
  )
}
