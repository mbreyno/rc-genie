import { useState } from 'react'
import { CATEGORIES, getOccupationsForCategory, PROFICIENCY_LEVELS } from '../../data/occupations'

const CATEGORY_ORDER = ['marketing', 'finance', 'hr', 'management', 'myBusiness']

// Fetch location-adjusted wages from BLS API and apply to task selections.
// Falls back to existing static wage if the API has no data for a given SOC.
async function fetchAndApplyLiveWages(data) {
  const allTasks = CATEGORY_ORDER.flatMap(catId => data.taskSelections[catId] ?? [])
  const socCodes = [...new Set(allTasks.map(t => t.soc).filter(Boolean))]

  console.log('[BLS] stateFips:', data.stateFips, '| msaCode:', data.msaCode)
  console.log('[BLS] SOC codes to fetch:', socCodes)

  if (!socCodes.length) { console.warn('[BLS] No SOC codes — skipping'); return data.taskSelections }
  if (!data.stateFips)  { console.warn('[BLS] No stateFips — skipping'); return data.taskSelections }

  try {
    const res = await fetch('/api/bls-wages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        socCodes,
        stateFips: data.stateFips,
        msaCode:   data.msaCode || '',
      }),
    })

    console.log('[BLS] Response status:', res.status)
    if (!res.ok) {
      const text = await res.text()
      console.error('[BLS] API error response:', text)
      return data.taskSelections
    }

    const json = await res.json()
    console.log('[BLS] Response:', json)

    const { wages } = json
    if (!wages || !Object.keys(wages).length) {
      console.warn('[BLS] No wages returned — using fallback data')
      return data.taskSelections
    }

    // Apply live wages to each task, falling back to existing wage if not found
    const updated = {}
    for (const catId of CATEGORY_ORDER) {
      updated[catId] = (data.taskSelections[catId] ?? []).map(task => {
        const liveWage = wages[task.soc]?.[task.proficiency]
        console.log(`[BLS] ${task.title} (${task.soc}) ${task.proficiency}: ${liveWage ?? 'no data, using fallback'}`)
        return liveWage
          ? { ...task, hourlyWage: liveWage, wageSource: 'live' }
          : { ...task, wageSource: 'fallback' }
      })
    }
    return updated
  } catch (err) {
    console.error('[BLS] Fetch threw an error:', err)
    return data.taskSelections
  }
}

export default function Step5Tasks({ data, updateData, next, prev }) {
  const [activeCategory, setActiveCategory] = useState('marketing')
  const [fetchingWages,  setFetchingWages]  = useState(false)

  // Only show categories with time allocated
  const activeCategories = CATEGORY_ORDER.filter(id => (data.categoryAllocations[id] ?? 0) > 0)

  function getSelectedTasks(catId) {
    return data.taskSelections[catId] ?? []
  }

  function isSelected(catId, occId) {
    return getSelectedTasks(catId).some(t => t.occupationId === occId)
  }

  function toggleTask(catId, occupation) {
    const current = getSelectedTasks(catId)
    let updated
    if (isSelected(catId, occupation.id)) {
      updated = current.filter(t => t.occupationId !== occupation.id)
    } else {
      updated = [...current, {
        occupationId: occupation.id,
        title:        occupation.title,
        soc:          occupation.soc,
        description:  occupation.description,
        proficiency:  'average',
        hourlyWage:   occupation.wages.average,
        pctOfCategory: 0, // will be recalculated below
      }]
    }
    // Distribute category % evenly among selected tasks
    const redistributed = redistributePct(updated)
    updateData({ taskSelections: { ...data.taskSelections, [catId]: redistributed } })
  }

  function updateProficiency(catId, occId, proficiency) {
    const updated = getSelectedTasks(catId).map(t =>
      t.occupationId === occId
        ? { ...t, proficiency, hourlyWage: getOccupationsForCategory(catId, data.industryId)
            .find(o => o.id === occId)?.wages[proficiency] ?? t.hourlyWage }
        : t
    )
    updateData({ taskSelections: { ...data.taskSelections, [catId]: updated } })
  }

  function updatePct(catId, occId, pct) {
    const updated = getSelectedTasks(catId).map(t =>
      t.occupationId === occId ? { ...t, pctOfCategory: Math.max(0, Math.min(100, parseInt(pct) || 0)) } : t
    )
    updateData({ taskSelections: { ...data.taskSelections, [catId]: updated } })
  }

  function redistributePct(tasks) {
    if (tasks.length === 0) return tasks
    const evenPct = Math.floor(100 / tasks.length)
    const rem     = 100 - evenPct * tasks.length
    return tasks.map((t, i) => ({ ...t, pctOfCategory: evenPct + (i === 0 ? rem : 0) }))
  }

  function redistributeEvenly(catId) {
    const updated = redistributePct(getSelectedTasks(catId))
    updateData({ taskSelections: { ...data.taskSelections, [catId]: updated } })
  }

  // Validation: each active category must have at least 1 task, and task pcts must sum to ~100
  const isValid = activeCategories.every(catId => {
    const tasks = getSelectedTasks(catId)
    if (tasks.length === 0) return false
    const sum = tasks.reduce((s, t) => s + (t.pctOfCategory || 0), 0)
    return sum === 100
  })

  async function handleNext() {
    setFetchingWages(true)
    const updatedSelections = await fetchAndApplyLiveWages(data)
    updateData({ taskSelections: updatedSelections })
    setFetchingWages(false)
    next()
  }

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {activeCategories.map(catId => {
          const cat   = CATEGORIES[catId]
          const tasks = getSelectedTasks(catId)
          const valid = tasks.length > 0 && tasks.reduce((s, t) => s + (t.pctOfCategory || 0), 0) === 100
          return (
            <button
              key={catId}
              onClick={() => setActiveCategory(catId)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5
                ${activeCategory === catId
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: catId === activeCategory ? 'white' : cat.color }} />
              {cat.label}
              {tasks.length > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${valid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {valid ? '✓' : tasks.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeCategories.map(catId => (
        catId !== activeCategory ? null : (
          <div key={catId} className="space-y-4">
            {/* Category header */}
            <div className="card">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-gray-900">
                  {CATEGORIES[catId].label}
                  {catId === 'myBusiness' && <span className="text-brand-600 ml-1">({data.industryLabel})</span>}
                </h2>
                <span className="text-sm text-gray-500">
                  {data.categoryAllocations[catId]}% of total time
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Select all tasks this owner performs. Then allocate what % of their{' '}
                <strong>{CATEGORIES[catId].label}</strong> time is spent on each task.
              </p>
            </div>

            {/* Occupation list */}
            <div className="space-y-2">
              {getOccupationsForCategory(catId, data.industryId).map(occ => {
                const selected = isSelected(catId, occ.id)
                const task     = getSelectedTasks(catId).find(t => t.occupationId === occ.id)
                return (
                  <div key={occ.id}
                    className={`card transition-all ${selected ? 'ring-2 ring-brand-500 bg-brand-50/30' : ''}`}
                  >
                    {/* Header row */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 cursor-pointer"
                        checked={selected}
                        onChange={() => toggleTask(catId, occ)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-medium text-gray-900">{occ.title}</span>
                          <span className="text-xs text-gray-400">SOC {occ.soc}</span>
                          <span className="text-xs text-gray-500">
                            ${occ.wages.average.toFixed(2)}/hr (avg)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{occ.description}</p>
                      </div>
                    </div>

                    {/* Expanded controls */}
                    {selected && task && (
                      <div className="mt-4 ml-7 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Proficiency */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Proficiency level</label>
                          <div className="flex gap-2">
                            {PROFICIENCY_LEVELS.map(lvl => (
                              <button
                                key={lvl.value}
                                type="button"
                                onClick={() => updateProficiency(catId, occ.id, lvl.value)}
                                className={`flex-1 text-xs py-1.5 px-2 rounded-lg border transition-colors ${
                                  task.proficiency === lvl.value
                                    ? 'bg-brand-600 text-white border-brand-600'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                                title={lvl.description}
                              >
                                {lvl.label}
                                <div className="font-semibold">
                                  ${(task.proficiency === lvl.value && task.wageSource === 'live'
                                    ? task.hourlyWage
                                    : occ.wages[lvl.value]
                                  ).toFixed(2)}/hr
                                </div>
                                {task.proficiency === lvl.value && task.wageSource === 'live' && (
                                  <div className="text-[10px] opacity-80">location-adjusted</div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* % of category */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-gray-600">% of {CATEGORIES[catId].label} time</label>
                            <button
                              type="button"
                              onClick={() => redistributeEvenly(catId)}
                              className="text-xs text-brand-600 hover:text-brand-700"
                            >
                              Distribute evenly
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number" min="0" max="100"
                              value={task.pctOfCategory}
                              onChange={e => updatePct(catId, occ.id, e.target.value)}
                              className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <span className="text-xs text-gray-400">%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Category validation */}
            {getSelectedTasks(catId).length > 0 && (() => {
              const sum = getSelectedTasks(catId).reduce((s, t) => s + (t.pctOfCategory || 0), 0)
              return (
                <div className={`p-3 rounded-lg flex items-center justify-between text-sm font-medium
                  ${sum === 100 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  <span>Category total</span>
                  <span>{sum}% {sum === 100 ? '✓' : `(need ${100 - sum > 0 ? '+' : ''}${100 - sum}%)`}</span>
                </div>
              )
            })()}
          </div>
        )
      ))}

      <div className="mt-6 flex justify-between">
        <button onClick={prev} disabled={fetchingWages} className="btn-secondary">← Back</button>
        <button onClick={handleNext} disabled={!isValid || fetchingWages} className="btn-primary flex items-center gap-2">
          {fetchingWages ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Fetching location wages…
            </>
          ) : 'Review Report →'}
        </button>
      </div>
    </div>
  )
}
