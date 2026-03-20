import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    advisor_name: profile?.advisor_name ?? '',
    firm_name:    profile?.firm_name    ?? '',
    advisor_email: profile?.advisor_email ?? user?.email ?? '',
  })
  const [logoPreview, setLogoPreview] = useState(profile?.logo_url ?? null)
  const [logoFile,    setLogoFile]    = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [success,     setSuccess]     = useState(false)
  const [error,       setError]       = useState('')

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Logo must be smaller than 2 MB.'); return }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setError('')
  }

  async function uploadLogo() {
    if (!logoFile || !user) return null
    const ext  = logoFile.name.split('.').pop()
    const path = `${user.id}/logo.${ext}`
    const { error } = await supabase.storage.from('advisor-logos').upload(path, logoFile, { upsert: true })
    if (error) throw new Error('Logo upload failed: ' + error.message)
    const { data } = supabase.storage.from('advisor-logos').getPublicUrl(path)
    return { url: data.publicUrl, path }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      let logoUrl  = profile?.logo_url  ?? null
      let logoPath = profile?.logo_path ?? null

      if (logoFile) {
        const result = await uploadLogo()
        if (result) { logoUrl = result.url; logoPath = result.path }
      }

      const upsertData = {
        id:            user.id,
        advisor_name:  form.advisor_name.trim(),
        firm_name:     form.firm_name.trim(),
        advisor_email: form.advisor_email.trim(),
        logo_url:      logoUrl,
        logo_path:     logoPath,
      }

      const { error: dbError } = await supabase
        .from('advisor_profiles')
        .upsert(upsertData, { onConflict: 'id' })

      if (dbError) throw new Error(dbError.message)

      await refreshProfile()
      setSuccess(true)
      setLogoFile(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function removeLogo() {
    if (!profile?.logo_path) return
    await supabase.storage.from('advisor-logos').remove([profile.logo_path])
    await supabase.from('advisor_profiles').update({ logo_url: null, logo_path: null }).eq('id', user.id)
    await refreshProfile()
    setLogoPreview(null)
    setLogoFile(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-semibold text-gray-900">Firm Profile</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Firm Profile</h1>
          <p className="text-gray-500 mt-1">This information appears on every report you generate.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Logo section */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Firm Logo</h2>
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Firm logo"
                    className="w-32 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50 p-2"
                  />
                ) : (
                  <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">
                  Upload your firm's logo (PNG, JPG, or SVG). Max 2 MB. Recommended size: 300×100 px or wider.
                </p>
                <input
                  ref={fileInputRef}
                  type="file" accept="image/*" onChange={handleLogoChange}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm py-1.5 px-3">
                    {logoPreview ? 'Change logo' : 'Upload logo'}
                  </button>
                  {logoPreview && (
                    <button type="button" onClick={removeLogo} className="text-sm text-red-600 hover:text-red-700 px-2">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Firm details */}
          <div className="card space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Firm Details</h2>
            <div>
              <label className="form-label">Advisor / Your name</label>
              <input type="text" className="form-input" placeholder="Michael Reynolds"
                value={form.advisor_name} onChange={set('advisor_name')} required />
            </div>
            <div>
              <label className="form-label">Firm name</label>
              <input type="text" className="form-input" placeholder="Elevation Financial"
                value={form.firm_name} onChange={set('firm_name')} required />
              <p className="text-xs text-gray-500 mt-1">This appears in the report header and body text.</p>
            </div>
            <div>
              <label className="form-label">Contact email</label>
              <input type="email" className="form-input"
                value={form.advisor_email} onChange={set('advisor_email')} />
            </div>
          </div>

          {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">Profile saved successfully!</div>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save profile'}
            </button>
            <Link to="/dashboard" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
