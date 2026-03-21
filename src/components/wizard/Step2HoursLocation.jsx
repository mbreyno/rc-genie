import { US_STATES, HOURS_OPTIONS } from '../../data/industries'
import { MSAS_BY_STATE } from '../../data/msas'

export default function Step2HoursLocation({ data, updateData, next, prev }) {
  const msaOptions = data.stateFips ? (MSAS_BY_STATE[data.stateFips] ?? []) : []
  const valid = data.stateName && data.hoursWorked

  function handleStateChange(e) {
    const state = US_STATES.find(s => s.fips === e.target.value)
    // Reset MSA when state changes
    updateData({
      stateFips: e.target.value,
      stateName: state?.name ?? '',
      msaCode:   '',
      msaName:   '',
    })
  }

  function handleMsaChange(e) {
    const msa = msaOptions.find(m => m.cbsa === e.target.value)
    updateData({
      msaCode: e.target.value,
      msaName: msa?.name ?? '',
    })
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Hours &amp; Location</h2>
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
            onChange={handleStateChange}
          >
            <option value="">Select a state…</option>
            {US_STATES.map(s => (
              <option key={s.fips} value={s.fips}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Metropolitan Area */}
        {data.stateFips && (
          <div>
            <label className="form-label">Metropolitan area</label>
            <select
              className="form-input"
              value={data.msaCode}
              onChange={handleMsaChange}
              disabled={msaOptions.length === 0}
            >
              <option value="">Statewide (no specific metro)</option>
              {msaOptions.map(m => (
                <option key={m.cbsa} value={m.cbsa}>{m.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {data.msaCode
                ? 'BLS wage data will be pulled for this metro area, with statewide data as a fallback.'
                : 'Select a metro area for more location-specific wage data, or leave blank to use statewide averages.'}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={prev} className="btn-secondary">← Back</button>
        <button onClick={next} disabled={!valid} className="btn-primary">Continue →</button>
      </div>
    </div>
  )
}
