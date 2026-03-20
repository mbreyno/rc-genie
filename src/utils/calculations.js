/**
 * Core calculation utilities for Reasonable Compensation reports.
 * Uses the Cost Approach (Many Hats Approach) as described in the report.
 */

/**
 * Calculate the annual wage for a single task.
 * @param {number} totalHours - Total hours worked per year
 * @param {number} pctOfTotal - Percentage of total hours for this task (0–100)
 * @param {number} hourlyWage - BLS hourly wage for this occupation
 * @returns {{ hoursPerYear: number, annualWage: number }}
 */
export function calcTaskWage(totalHours, pctOfTotal, hourlyWage) {
  const hoursPerYear = (pctOfTotal / 100) * totalHours
  const annualWage   = hoursPerYear * hourlyWage
  return { hoursPerYear, annualWage }
}

/**
 * Compute all task-level calculations from the wizard state.
 *
 * @param {object} wizardData - Complete wizard state
 * @param {number} wizardData.hoursWorked
 * @param {object} wizardData.categoryAllocations - { marketing: 17, finance: 3, ... }
 * @param {object} wizardData.taskSelections - { marketing: [...tasks], finance: [...], ... }
 * @returns {object} - { tasks, totalCompensation, categoryTotals }
 */
export function computeReport(wizardData) {
  const { hoursWorked, categoryAllocations, taskSelections } = wizardData
  const allTasks = []
  const categoryTotals = {}

  for (const [categoryId, pctOfTotal] of Object.entries(categoryAllocations)) {
    if (!pctOfTotal || pctOfTotal === 0) continue

    const tasks = taskSelections[categoryId] ?? []
    let categoryAnnualTotal = 0

    const resolvedTasks = tasks.map(task => {
      // pctOfCategory: how much of this category's time this task takes
      const pctOfCategory = task.pctOfCategory ?? (100 / tasks.length)
      // pctOfTotal: share of all hours
      const computedPctOfTotal = (pctOfTotal * pctOfCategory) / 100
      const { hoursPerYear, annualWage } = calcTaskWage(
        hoursWorked,
        computedPctOfTotal,
        task.hourlyWage
      )
      categoryAnnualTotal += annualWage

      return {
        ...task,
        categoryId,
        pctOfCategory: Math.round(pctOfCategory),
        pctOfTotal:    parseFloat(computedPctOfTotal.toFixed(1)),
        hoursPerYear:  parseFloat(hoursPerYear.toFixed(2)),
        annualWage:    Math.round(annualWage),
      }
    })

    allTasks.push(...resolvedTasks)
    categoryTotals[categoryId] = {
      pctOfTotal,
      hoursPerYear: parseFloat(((pctOfTotal / 100) * hoursWorked).toFixed(2)),
      annualTotal:  Math.round(categoryAnnualTotal),
      pctOfCompensation: 0, // filled in below
    }
  }

  const totalCompensation = allTasks.reduce((sum, t) => sum + t.annualWage, 0)

  // Back-fill pctOfCompensation
  for (const cat of Object.values(categoryTotals)) {
    cat.pctOfCompensation = totalCompensation > 0
      ? parseFloat(((cat.annualTotal / totalCompensation) * 100).toFixed(2))
      : 0
  }

  return { tasks: allTasks, totalCompensation, categoryTotals }
}

/** Format a number as USD */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(value)
}

/** Format a number as a percentage string */
export function formatPct(value) {
  return `${parseFloat(value).toFixed(0)}%`
}
