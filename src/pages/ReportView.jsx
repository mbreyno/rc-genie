import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { computeReport, formatCurrency } from '../utils/calculations'
import ReportDocument from '../components/report/ReportDocument'

export default function ReportView() {
  const { id }   = useParams()
  const { user, profile } = useAuth()
  const reportRef = useRef(null)

  const [report,      setReport]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    loadReport()
  }, [id, user])

  async function loadReport() {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('advisor_id', user.id)
      .single()
    if (error) { setError('Report not found or access denied.'); setLoading(false); return }
    setReport(data)
    setLoading(false)
  }

  async function downloadPDF() {
    setDownloading(true)
    try {
      // Dynamically import html2pdf to keep initial bundle small
      const html2pdf = (await import('html2pdf.js')).default
      const el = document.getElementById('report-document')
      if (!el) throw new Error('Report element not found')

      const clientName = `${report.client_first_name} ${report.client_last_name}`
      const filename   = `RC-Report-${clientName.replace(/\s+/g, '-')}-${report.report_year}.pdf`

      await html2pdf().set({
        margin:      0,
        filename,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale:        2,
          useCORS:      true,
          letterRendering: true,
        },
        jsPDF: {
          unit:      'in',
          format:    'letter',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['css', 'legacy'] },
      }).from(el).save()
    } catch (err) {
      setError('PDF generation failed: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading report…</div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card text-center">
          <p className="text-red-600 mb-4">{error || 'Report not found.'}</p>
          <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  // Re-compute calculations from saved tasks
  const tasks = report.tasks ?? []
  const totalCompensation = report.total_compensation
  const categoryTotals = {}

  // Rebuild categoryTotals from saved tasks
  for (const task of tasks) {
    const catId = task.categoryId
    if (!categoryTotals[catId]) {
      categoryTotals[catId] = {
        pctOfTotal:        report.category_allocations?.[catId] ?? 0,
        hoursPerYear:      0,
        annualTotal:       0,
        pctOfCompensation: 0,
      }
    }
    categoryTotals[catId].hoursPerYear += task.hoursPerYear
    categoryTotals[catId].annualTotal  += task.annualWage
  }
  // Fill pctOfCompensation
  for (const cat of Object.values(categoryTotals)) {
    cat.pctOfCompensation = totalCompensation > 0
      ? parseFloat(((cat.annualTotal / totalCompensation) * 100).toFixed(2))
      : 0
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky action bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {report.client_first_name} {report.client_last_name} — {report.company_name}
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(totalCompensation)} · {report.report_year}
              </div>
            </div>
          </div>

          <Link to={`/report/${id}/edit`} className="btn-secondary">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>

          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="btn-primary"
          >
            {downloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating PDF…
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report preview */}
      <div className="py-8 overflow-x-auto">
        <div style={{ minWidth: '856px' }} ref={reportRef}>
          <ReportDocument
            report={report}
            advisorProfile={profile}
            tasks={tasks}
            totalCompensation={totalCompensation}
            categoryTotals={categoryTotals}
          />
        </div>
      </div>
    </div>
  )
}
