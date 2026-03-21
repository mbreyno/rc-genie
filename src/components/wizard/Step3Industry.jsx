import { useState, useMemo } from 'react'
import { BLS_MAJOR_GROUPS, BLS_OCCUPATIONS } from '../../data/blsOccupations'
import { DEFAULT_ALLOCATIONS } from '../../data/industries'

// Build a default-allocations lookup that works for both BLS group ids and legacy ids
function getAllocations(id) {
  // BLS groups store defaultAllocations directly on the group object
  const grp = BLS_MAJOR_GROUPS.find(g => g.id === id)
  if (grp) return grp.defaultAllocations
  // Legacy fallback
  return DEFAULT_ALLOCATIONS[id] ?? DEFAULT_ALLOCATIONS.other
}

export default function Step3Industry({ data, updateData, next, prev }) {
  const [search, setSearch] = useState('')

  const selectedGroup = BLS_MAJOR_GROUPS.find(g => g.id === data.industryId) ?? null

  // Occupations for the selected group, filtered by search
  const groupOccs = useMemo(() => {
    if (!selectedGroup) return []
    const occs = BLS_OCCUPATIONS[selectedGroup.id] ?? []
    if (!search.trim()) return occs
    const q = search.toLowerCase()
    return occs.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.soc.includes(q) ||
      (o.description ?? '').toLowerCase().includes(q)
    )
  }, [selectedGroup, search])

  function selectGroup(grp) {
    const isChanging = grp.id !== data.industryId
    setSearch('')
    updateData({
      industryId:    grp.id,
      industryLabel: grp.title,
      ...(isChanging ? {
        categoryAllocations: grp.defaultAllocations,
        taskSelections: { marketing: [], finance: [], hr: [], management: [], myBusiness: [] },
      } : {}),
    })
  }

  // Count of how many occupations are pre-selected for My Business
  const selectedOccCount = (data.taskSelections?.myBusiness ?? []).length

  const canContinue = !!data.industryId

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Occupation Group</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Select the BLS occupational group that best fits this business. This determines which of the
          {' '}<strong>837 BLS occupations</strong> appear under <strong>"My Business"</strong> in the next step.
        </p>
      </div>

      {/* Phase 1 — Group grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {BLS_MAJOR_GROUPS.map(grp => {
          const isSelected = data.industryId === grp.id
          const occCount = BLS_OCCUPATIONS[grp.id]?.length ?? 0
          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => selectGroup(grp)}
              className={`text-left p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl leading-none mt-0.5">{grp.icon}</span>
                <div className="min-w-0">
                  <div className={`font-medium text-xs leading-tight ${isSelected ? 'text-brand-700' : 'text-gray-900'}`}>
                    {grp.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{occCount} occupations</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Phase 2 — Occupation preview panel (shown once a group is selected) */}
      {selectedGroup && (
        <div className="border border-brand-200 rounded-xl bg-brand-50/40 p-4">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div>
              <span className="font-semibold text-brand-800 text-sm">{selectedGroup.icon} {selectedGroup.title}</span>
              <span className="ml-2 text-xs text-gray-500">— {BLS_OCCUPATIONS[selectedGroup.id]?.length} occupations available in Step 5</span>
            </div>
            {selectedOccCount > 0 && (
              <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
                {selectedOccCount} pre-selected
              </span>
            )}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search occupations by title or SOC code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {/* Occupation list — scrollable preview */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {groupOccs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No occupations match your search.</p>
            ) : groupOccs.map(occ => (
              <div key={occ.id} className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-900">{occ.title}</span>
                    <span className="text-xs text-gray-400">SOC {occ.soc}</span>
                    <span className="text-xs text-gray-500">${occ.wages.average.toFixed(2)}/hr avg</span>
                  </div>
                  {occ.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{occ.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            You'll select which specific occupations apply in <strong>Step 5</strong> under the "My Business" tab.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button onClick={prev} className="btn-secondary">← Back</button>
        <button onClick={next} disabled={!canContinue} className="btn-primary">Continue →</button>
      </div>
    </div>
  )
}
