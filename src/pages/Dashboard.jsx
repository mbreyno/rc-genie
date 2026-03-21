import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../utils/calculations'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadReports()
  }, [user])

  async function loadReports() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('id, client_first_name, client_last_name, company_name, state_name, msa_name, total_compensation, report_year, created_at')
      .eq('advisor_id', user.id)
      .order('created_at', { ascending: false })
    setReports(data ?? [])
    setLoading(false)
  }

  async function deleteReport(id) {
    if (!window.confirm('Delete this report? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('reports').delete().eq('id', id)
    setReports(r => r.filter(x => x.id !== id))
    setDeleting(null)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">RC Genie</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile?.firm_name || 'My Profile'}
            </Link>
            <button onClick={handleSignOut} className="btn-secondary text-sm py-1.5 px-3">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{profile?.advisor_name ? `, ${profile.advisor_name}` : ''}
            </h1>
            <p className="text-gray-500 mt-1">Manage your clients' Reasonable Compensation reports</p>
          </div>
          <Link to="/report/new" className="btn-primary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Report
          </Link>
        </div>

        {/* Profile setup nudge */}
        {profile && (!profile.firm_name || !profile.logo_url) && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Complete your firm profile</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Add your firm logo and name so they appear on every generated report.
              </p>
            </div>
            <Link to="/profile" className="btn-secondary text-sm py-1.5 px-3 text-amber-800 border-amber-300 hover:bg-amber-50">
              Set up profile →
            </Link>
          </div>
        )}

        {/* Reports list */}
        {loading ? (
          <div className="card flex items-center justify-center h-48">
            <div className="text-gray-400">Loading reports…</div>
          </div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-16">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
            <p className="text-gray-500 mb-6">Create your first Reasonable Compensation report for a client.</p>
            <Link to="/report/new" className="btn-primary">Create your first report</Link>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3.5 font-medium text-gray-500">Client</th>
                  <th className="text-left px-6 py-3.5 font-medium text-gray-500 hidden sm:table-cell">Company</th>
                  <th className="text-left px-6 py-3.5 font-medium text-gray-500 hidden md:table-cell">Location</th>
                  <th className="text-left px-6 py-3.5 font-medium text-gray-500 hidden lg:table-cell">Year</th>
                  <th className="text-right px-6 py-3.5 font-medium text-gray-500">Compensation</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {r.client_first_name} {r.client_last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden sm:table-cell">{r.company_name}</td>
                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                      {r.msa_name ? `${r.msa_name}, ` : ''}{r.state_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">{r.report_year}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(r.total_compensation)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/report/${r.id}`}
                          className="text-brand-600 hover:text-brand-700 font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => deleteReport(r.id)}
                          disabled={deleting === r.id}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete report"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
