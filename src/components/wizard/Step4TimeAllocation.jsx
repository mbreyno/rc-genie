import { CATEGORIES } from '../../data/occupations'

const CATEGORY_ORDER = ['marketing', 'finance', 'hr', 'management', 'myBusiness']

export default function Step4TimeAllocation({ data, updateData, next, prev }) {
  const allocs = data.categoryAllocations
  const total  = Object.values(allocs).reduce((s, v) => s + (Number(v) || 0), 0)
  const valid  = total === 100

  function setAlloc(catId, value) {
    const num = Math.max(0, Math.min(100, parseInt(value) || 0))
    updateData({ categoryAllocations: { ...allocs, [catId]: num } })
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Time Allocation</h2>
        <p className="text-gray-500 mt-1">
          Estimate the percentage of the owner's time spent in each category. Values must total 100%.
        </p>
      </div>

      <div className="space-y-4">
        {CATEGORY_ORDER.map(catId => {
          const cat = CATEGORIES[catId]
          const val = allocs[catId] ?? 0

          return (
            <div key={catId} className="flex items-center gap-4">
              {/* Color indicator */}
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-900">
                    {cat.label}
                    {catId === 'myBusiness' && (
                      <span className="ml-1 text-xs text-brand-600">({data.industryLabel})</span>
                    )}
                  </label>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">{val}%</span>
                </div>

                {/* Slider */}
                <input
                  type="range" min="0" max="100" step="1"
                  value={val}
                  onChange={e => setAlloc(catId, e.target.value)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: cat.color }}
                />

                {/* Numeric input */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number" min="0" max="100"
                    value={val}
                    onChange={e => setAlloc(catId, e.target.value)}
                    className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-xs text-gray-400">% of total hours</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className={`mt-6 p-3 rounded-lg flex items-center justify-between text-sm font-semibold
        ${valid ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
        <span>Total</span>
        <span>{total}% {valid ? '✓' : `(need ${100 - total > 0 ? '+' : ''}${100 - total}%)`}</span>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={prev} className="btn-secondary">← Back</button>
        <button onClick={next} disabled={!valid} className="btn-primary">Continue →</button>
      </div>
    </div>
  )
}
