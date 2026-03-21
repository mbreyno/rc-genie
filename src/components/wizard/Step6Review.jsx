import { useMemo } from 'react'
import { computeReport, formatCurrency } from '../../utils/calculations'
import { CATEGORIES } from '../../data/occupations'

const CATEGORY_ORDER = ['marketing', 'finance', 'hr', 'management', 'myBusiness']

export default function Step6Review({ data, prev, onGenerate, generating }) {
  const { tasks, totalCompensation, categoryTotals } = useMemo(
    () => computeReport(data),
    [data]
  )

  // Group tasks by category for display
  const tasksByCategory = {}
  for (const task of tasks) {
    if (!tasksByCategory[task.categoryId]) tasksByCategory[task.categoryId] = []
    tasksByCategory[task.categoryId].push(task)
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="card bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="text-brand-200 text-sm font-medium mb-1">Estimated Annual Reasonable Compensation</div>
        <div className="text-4xl font-bold">{formatCurrency(totalCompensation)}</div>
        <div className="mt-3 text-brand-200 text-sm">
          For {data.clientFirstName} {data.clientLastName} of {data.companyName} —{' '}
          {data.hoursWorked.toLocaleString()} hours/yr in {data.msaName ? `${data.msaName}, ` : ''}{data.stateName}
        </div>
      </div>

      {/* Client info */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Report Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            ['Client',    `${data.clientFirstName} ${data.clientLastName}`],
            ['Company',   data.companyName],
            ['Location',  data.msaName ? `${data.msaName}, ${data.stateName}` : data.stateName],
            ['Industry',  data.industryLabel],
            ['Hours/yr',  data.hoursWorked.toLocaleString()],
            ['Year',      new Date().getFullYear()],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-gray-500">{k}</div>
              <div className="font-medium text-gray-900">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      {CATEGORY_ORDER.filter(id => tasksByCategory[id]).map(catId => {
        const cat    = CATEGORIES[catId]
        const catTot = categoryTotals[catId]
        const catTasks = tasksByCategory[catId] ?? []
        return (
          <div key={catId} className="card p-0 overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: cat.color + '22' }}>
              <div>
                <span className="font-semibold text-gray-900">{cat.label}</span>
                {catId === 'myBusiness' && <span className="text-brand-600 ml-1 text-sm">({data.industryLabel})</span>}
                <span className="ml-2 text-sm text-gray-500">
                  {catTot?.pctOfTotal}% of time · {catTot?.hoursPerYear.toLocaleString()} hrs/yr
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{formatCurrency(catTot?.annualTotal)}</div>
                <div className="text-xs text-gray-500">{catTot?.pctOfCompensation}% of total</div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Task</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 hidden sm:table-cell">Proficiency</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">% of cat.</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Hrs/yr</th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">$/hr</th>
                  <th className="text-right px-5 py-2 text-xs font-medium text-gray-500">Annual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {catTasks.map((task, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-900">{task.title}</td>
                    <td className="px-3 py-3 text-gray-500 capitalize hidden sm:table-cell">{task.proficiency}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{task.pctOfCategory}%</td>
                    <td className="px-3 py-3 text-right text-gray-600">{task.hoursPerYear.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-gray-600">${task.hourlyWage.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(task.annualWage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}

      {/* Total */}
      <div className="flex justify-end">
        <div className="bg-gray-900 text-white px-6 py-3 rounded-xl inline-flex items-center gap-6">
          <span className="font-medium">Total Reasonable Compensation</span>
          <span className="text-2xl font-bold">{formatCurrency(totalCompensation)}</span>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={prev} className="btn-secondary">← Back</button>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="btn-primary px-8"
        >
          {generating ? 'Generating…' : '✓ Generate Report & PDF'}
        </button>
      </div>
    </div>
  )
}
