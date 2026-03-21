import { INDUSTRIES, DEFAULT_ALLOCATIONS } from '../../data/industries'

// Group industries into logical sectors for easier scanning
const INDUSTRY_GROUPS = [
  {
    label: 'Financial Services',
    ids: ['financial_planning', 'accounting_cpa', 'insurance'],
  },
  {
    label: 'Healthcare & Wellness',
    ids: ['medical_practice', 'dental', 'chiropractic_rehab', 'veterinary', 'mental_health'],
  },
  {
    label: 'Professional & Legal',
    ids: ['law_firm', 'consulting', 'architecture_engineering', 'it_technology'],
  },
  {
    label: 'Business & Trade',
    ids: ['marketing_agency', 'construction', 'real_estate', 'restaurant_food', 'retail'],
  },
  {
    label: 'Other',
    ids: ['other'],
  },
]

// Build a lookup map for quick access
const INDUSTRY_BY_ID = Object.fromEntries(INDUSTRIES.map(i => [i.id, i]))

export default function Step3Industry({ data, updateData, next, prev }) {
  function selectIndustry(industry) {
    const isChanging = industry.id !== data.industryId
    updateData({
      industryId:    industry.id,
      industryLabel: industry.label,
      // Only reset allocations and tasks when the industry actually changes
      ...(isChanging ? {
        categoryAllocations: DEFAULT_ALLOCATIONS[industry.id] ?? DEFAULT_ALLOCATIONS.other,
        taskSelections: { marketing: [], finance: [], hr: [], management: [], myBusiness: [] },
      } : {}),
    })
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Business / Industry Type</h2>
        <p className="text-gray-500 mt-1">
          Select the industry that best describes the S-Corp owner's business. This determines the
          job titles available under the <strong>"My Business"</strong> category.
        </p>
      </div>

      <div className="space-y-6">
        {INDUSTRY_GROUPS.map(group => {
          const groupIndustries = group.ids.map(id => INDUSTRY_BY_ID[id]).filter(Boolean)
          return (
            <div key={group.label}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groupIndustries.map(industry => (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => selectIndustry(industry)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      data.industryId === industry.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{industry.icon}</span>
                      <div>
                        <div className={`font-medium text-sm ${data.industryId === industry.id ? 'text-brand-700' : 'text-gray-900'}`}>
                          {industry.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{industry.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={prev} className="btn-secondary">← Back</button>
        <button onClick={next} disabled={!data.industryId} className="btn-primary">Continue →</button>
      </div>
    </div>
  )
}
