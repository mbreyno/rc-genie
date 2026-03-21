import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [ready,     setReady]     = useState(false)  // true once recovery session is detected
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  // Supabase fires PASSWORD_RECOVERY when the user arrives via the reset link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm)   { setError('Passwords do not match.'); return }
    if (password.length < 8)    { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      // Sign out the recovery session so user logs in fresh
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">RC Genie</h1>
        </div>

        <div className="card">
          {done ? (
            /* ── Success state ── */
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Password updated!</h2>
              <p className="text-gray-500 text-sm mb-4">
                Your password has been reset. Redirecting you to sign in…
              </p>
              <Link to="/login" className="text-brand-600 font-medium hover:underline text-sm">
                Go to sign in now
              </Link>
            </div>
          ) : !ready ? (
            /* ── Waiting for recovery session ── */
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Verifying your reset link…</p>
              <p className="text-gray-400 text-xs mt-2">
                If this takes too long, your link may have expired.{' '}
                <Link to="/forgot-password" className="text-brand-600 hover:underline">Request a new one</Link>.
              </p>
            </div>
          ) : (
            /* ── New password form ── */
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose a new password</h2>
              <p className="text-gray-500 text-sm mb-6">Must be at least 8 characters.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">New password</label>
                  <input
                    type="password" required className="form-input" placeholder="At least 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Confirm new password</label>
                  <input
                    type="password" required className="form-input" placeholder="Re-enter password"
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
