import { INDUSTRIES, DEFAULT_ALLOCATIONS } from '../../data/industries'

export default function Step3Industry({ data, updateData, next, prev }) {
  function selectIndustry(industry) {
    updateData({
      industryId:          industry.id,
      industryLabel:       industry.label,
      // Suggest default allocations for this industry
      categoryAllocations: DEFAULT_ALLOCATIONS[industry.id] ?? DEFAULT_ALLOCATIONS.other,
      // Clear previous task selections when industry changes
      taskSelections: { marketing: [], finance: [], hr: [], management: [], myBusiness: [] },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {INDUSTRIES.map(industry => (
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

      <div className="mt-8 flex justify-between">
        <button onClick={prev} className="btn-secondary">← Back</button>
        <button onClick={next} disabled={!data.industryId} className="btn-primary">Continue →</button>
      </div>
    </div>
  )
}
