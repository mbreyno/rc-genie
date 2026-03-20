export default function Step1ClientInfo({ data, updateData, next }) {
  const valid = data.clientFirstName.trim() && data.clientLastName.trim() && data.companyName.trim()

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Client Information</h2>
        <p className="text-gray-500 mt-1">Enter the S-Corp owner's name and company details.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">First name *</label>
            <input
              type="text" className="form-input" placeholder="Jennifer"
              value={data.clientFirstName}
              onChange={e => updateData({ clientFirstName: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Last name *</label>
            <input
              type="text" className="form-input" placeholder="Denney"
              value={data.clientLastName}
              onChange={e => updateData({ clientLastName: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="form-label">Company / S-Corp name *</label>
          <input
            type="text" className="form-input" placeholder="Elevated Marketing Solutions"
            value={data.companyName}
            onChange={e => updateData({ companyName: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={next} disabled={!valid}
          className="btn-primary"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
