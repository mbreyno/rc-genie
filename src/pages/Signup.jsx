import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [form,      setForm]      = useState({ email: '', password: '', confirm: '', advisorName: '', firmName: '' })
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 8)      { setError('Password must be at least 8 characters.'); return }

    setLoading(true)

    // Sign up — store advisor/firm name in user metadata so we can create
    // the profile after email confirmation when a session is first established
    const { error: signUpError } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          advisor_name: form.advisorName.trim(),
          firm_name:    form.firmName.trim(),
        },
      },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    // Show "check your email" screen
    setConfirmed(true)
  }

  // ── Check-your-email screen ──────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 mb-1">
            We sent a confirmation link to <span className="font-medium text-gray-700">{form.email}</span>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Click the link in the email to activate your account, then come back here to sign in.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  // ── Sign-up form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">RC Genie</h1>
          <p className="text-gray-500 mt-1">Create your advisor account</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Get started</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="form-label">Your name</label>
                <input type="text" required className="form-input" placeholder="Michael Reynolds"
                  value={form.advisorName} onChange={set('advisorName')} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="form-label">Firm name</label>
                <input type="text" required className="form-input" placeholder="Elevation Financial"
                  value={form.firmName} onChange={set('firmName')} />
              </div>
            </div>
            <div>
              <label className="form-label">Email address</label>
              <input type="email" required className="form-input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" required className="form-input" placeholder="At least 8 characters"
                value={form.password} onChange={set('password')} />
            </div>
            <div>
              <label className="form-label">Confirm password</label>
              <input type="password" required className="form-input" placeholder="Re-enter password"
                value={form.confirm} onChange={set('confirm')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
