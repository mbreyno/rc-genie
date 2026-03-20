import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { computeReport } from '../utils/calculations'

import Step1ClientInfo     from '../components/wizard/Step1ClientInfo'
import Step2HoursLocation  from '../components/wizard/Step2HoursLocation'
import Step3Industry       from '../components/wizard/Step3Industry'
import Step4TimeAllocation from '../components/wizard/Step4TimeAllocation'
import Step5Tasks          from '../components/wizard/Step5Tasks'
import Step6Review         from '../components/wizard/Step6Review'

const STEPS = [
  { id: 1, label: 'Client Info'   },
  { id: 2, label: 'Hours & Location' },
  { id: 3, label: 'Industry'     },
  { id: 4, label: 'Time Allocation' },
  { id: 5, label: 'Tasks'        },
  { id: 6, label: 'Review'       },
]

const INITIAL_STATE = {
  // Step 1
  clientFirstName: '',
  clientLastName:  '',
  companyName:     '',
  // Step 2
  hoursWorked: 2080,
  stateName:   '',
  stateFips:   '',
  county:      '',
  // Step 3
  industryId:    '',
  industryLabel: '',
  // Step 4
  categoryAllocations: { marketing: 17, finance: 3, hr: 5, management: 20, myBusiness: 55 },
  // Step 5
  taskSelections: { marketing: [], finance: [], hr: [], management: [], myBusiness: [] },
}

export default function NewReport() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const { id }     = useParams()          // present when editing an existing report
  const isEditing  = Boolean(id)

  const [step,        setStep]        = useState(1)
  const [data,        setData]        = useState(INITIAL_STATE)
  const [saving,      setSaving]      = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(isEditing)
  const [error,       setError]       = useState('')

  // When editing, load the existing report and pre-populate the wizard
  useEffect(() => {
    if (!isEditing || !user) return
    async function loadExisting() {
      const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .eq('advisor_id', user.id)
        .single()
      if (error || !report) { setError('Report not found.'); setLoadingEdit(false); return }

      // Rebuild taskSelections grouped by category from the flat tasks array
      const taskSelections = { marketing: [], finance: [], hr: [], management: [], myBusiness: [] }
      for (const task of (report.tasks ?? [])) {
        const cat = task.categoryId
        if (taskSelections[cat]) taskSelections[cat].push(task)
      }

      setData({
        clientFirstName:     report.client_first_name,
        clientLastName:      report.client_last_name,
        companyName:         report.company_name,
        hoursWorked:         report.hours_worked,
        stateName:           report.state_name,
        stateFips:           report.state_fips,
        county:              report.county,
        industryId:          report.industry_id,
        industryLabel:       report.industry_label,
        categoryAllocations: report.category_allocations,
        taskSelections,
      })
      setLoadingEdit(false)
    }
    loadExisting()
  }, [isEditing, id, user])

  function updateData(partial) {
    setData(prev => ({ ...prev, ...partial }))
  }

  function next() { setStep(s => Math.min(s + 1, STEPS.length)) }
  function prev() { setStep(s => Math.max(s - 1, 1)) }

  async function handleGenerate() {
    setSaving(true)
    setError('')
    try {
      const { tasks, totalCompensation } = computeReport(data)

      const reportData = {
        client_first_name:    data.clientFirstName,
        client_last_name:     data.clientLastName,
        company_name:         data.companyName,
        state_name:           data.stateName,
        state_fips:           data.stateFips,
        county:               data.county,
        hours_worked:         data.hoursWorked,
        industry_id:          data.industryId,
        industry_label:       data.industryLabel,
        category_allocations: data.categoryAllocations,
        tasks,
        total_compensation:   totalCompensation,
        report_year:          new Date().getFullYear(),
      }

      let savedId = id
      if (isEditing) {
        // Update existing report
        const { error: dbError } = await supabase
          .from('reports')
          .update(reportData)
          .eq('id', id)
          .eq('advisor_id', user.id)
        if (dbError) throw new Error(dbError.message)
      } else {
        // Insert new report
        const { data: saved, error: dbError } = await supabase
          .from('reports')
          .insert({ ...reportData, advisor_id: user.id })
          .select('id')
          .single()
        if (dbError) throw new Error(dbError.message)
        savedId = saved.id
      }

      navigate(`/report/${savedId}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const stepProps = { data, updateData, next, prev }

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading report…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link to={isEditing ? `/report/${id}` : '/dashboard'} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-semibold text-gray-900">
            {isEditing ? 'Edit Report' : 'New Reasonable Compensation Report'}
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress bar background */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-brand-600 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map(s => (
              <div key={s.id} className="flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${s.id < step  ? 'bg-brand-600 text-white' :
                    s.id === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
                                    'bg-white border-2 border-gray-300 text-gray-400'}`}>
                  {s.id < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.id}
                </div>
                <span className={`mt-2 text-xs font-medium hidden sm:block ${s.id === step ? 'text-brand-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {/* Step content */}
        {step === 1 && <Step1ClientInfo     {...stepProps} />}
        {step === 2 && <Step2HoursLocation  {...stepProps} />}
        {step === 3 && <Step3Industry       {...stepProps} />}
        {step === 4 && <Step4TimeAllocation {...stepProps} />}
        {step === 5 && <Step5Tasks          {...stepProps} />}
        {step === 6 && (
          <Step6Review
            {...stepProps}
            onGenerate={handleGenerate}
            generating={saving}
          />
        )}
      </div>
    </div>
  )
}
