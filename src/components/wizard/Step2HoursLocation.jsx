import { US_STATES, HOURS_OPTIONS } from '../../data/industries'

export default function Step2HoursLocation({ data, updateData, next, prev }) {
  const valid = data.stateName && data.county.trim() && data.hoursWorked

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Hours & Location</h2>
        <p className="text-gray-500 mt-1">
          The owner's work hours and location are used to find the appropriate BLS wage data.
        </p>
      </div>

      <div className="space-y-5">
        {/* Hours */}
        <div>
          <label className="form-label">Hours worked per year *</label>
          <select
            className="form-input"
            value={data.hoursWorked}
            onChange={e => updateData({ hoursWorked: parseInt(e.target.value) })}
          >
            {HOURS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            The BLS defines full-time as 2,080 hours/year. If 40+ hours are selected, 2,080 is used for wage calculations per IRS guidance.
          </p>
        </div>

        {/* State */}
        <div>
          <label className="form-label">State *</label>
          <select
            className="form-input"
            value={data.stateFips}
            onChange={e => {
              const state = US_STATES.find(s => s.fips === e.target.value)
              updateData({ stateFips: e.target.value, stateName: state?.name ?? '' })
            }}
          >
            <option value="">Select a state…</option>
            {US_STATES.map(s => (
              <option key={s.fips} value={s.fips}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* County */}
        <div>
          <label className="form-label">County *</label>
          <input
            type="text" className="form-input" placeholder="e.g. Johnson County"
            value={data.county}
            onChange={e => updateData({ county: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the county where the owner primarily performs their work.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={prev} className="btn-secondary">← Back</button>
        <button onClick={next} disabled={!valid} className="btn-primary">Continue →</button>
      </div>
    </div>
  )
}
