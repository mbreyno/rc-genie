/**
 * Full 9-page Reasonable Compensation Report document.
 * This component renders the complete report HTML that is then converted to PDF.
 * It closely mirrors the sample report's layout and content.
 */
import DonutChart from './DonutChart'
import { CATEGORIES } from '../../data/occupations'
import { formatCurrency } from '../../utils/calculations'

const CATEGORY_ORDER = ['marketing', 'finance', 'hr', 'management', 'myBusiness']

// ─── Helper: Page wrapper ───────────────────────────────────────────────────
function Page({ children, logoUrl, firmName, advisorName, clientName, companyName, reportYear, pageNum, totalPages }) {
  return (
    <div style={{
      width: '816px',        // Letter width at 96 DPI
      minHeight: '1056px',   // Letter height at 96 DPI
      padding: '48px 64px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '11px',
      color: '#1a1a1a',
      pageBreakAfter: 'always',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
        {/* Logo */}
        <div style={{ maxWidth: '140px', maxHeight: '55px' }}>
          {logoUrl ? (
            <img src={logoUrl} alt={firmName} style={{ maxWidth: '140px', maxHeight: '55px', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a5f' }}>{firmName}</div>
          )}
        </div>
        {/* Report metadata box */}
        <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '12px 16px', fontSize: '12px', minWidth: '280px' }}>
          <div><strong>Year:</strong> {reportYear}</div>
          <div style={{ marginTop: '4px' }}><strong>Report:</strong> Tax Compliance for S Corp</div>
          <div style={{ marginTop: '4px' }}><strong>Approach:</strong> Cost Approach</div>
          <div style={{ marginTop: '4px' }}><strong>For:</strong> {clientName} of {companyName}</div>
        </div>
      </div>

      {/* Page body */}
      <div style={{ flex: 1 }}>{children}</div>

      {/* Footer */}
      <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '9px' }}>
        <span>Annual Salary and Reasonable Compensation are used interchangeably in this report. All salary and Reasonable Compensation figures are expressed annually and in U.S. dollars.</span>
        <span style={{ whiteSpace: 'nowrap', marginLeft: '16px' }}>Page {pageNum} of {totalPages}</span>
      </div>
    </div>
  )
}

// ─── Page 1: Cover / Summary ────────────────────────────────────────────────
function Page1({ report, advisor, tasks, totalCompensation, categoryTotals }) {
  const timeSegments = CATEGORY_ORDER
    .filter(id => categoryTotals[id])
    .map(id => ({
      label: CATEGORIES[id].label,
      value: categoryTotals[id].pctOfTotal,
      color: CATEGORIES[id].color,
    }))

  const compSegments = CATEGORY_ORDER
    .filter(id => categoryTotals[id])
    .map(id => ({
      label: CATEGORIES[id].label,
      value: categoryTotals[id].pctOfCompensation,
      color: CATEGORIES[id].color,
    }))

  const pageProps = { ...advisor, clientName: `${report.client_first_name} ${report.client_last_name}`, companyName: report.company_name, reportYear: report.report_year, pageNum: 1, totalPages: 9 }

  return (
    <Page {...pageProps}>
      {/* Main compensation figure */}
      <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>
        Your estimated annual Reasonable Compensation: {formatCurrency(totalCompensation)}
      </p>

      {/* Introduction paragraph */}
      <p style={{ lineHeight: 1.6, marginBottom: '12px' }}>
        Thank you for entrusting <strong>{advisor.advisorName}</strong> of{' '}
        <strong>{advisor.firmName}</strong> with your Reasonable Compensation analysis. This report
        provides a reasonable estimate of the value of services rendered to your S Corporation based
        on the duties and responsibilities that you perform annually. Reasonable Compensation is
        defined by the IRS as &ldquo;The value that would ordinarily be paid for like services by like
        enterprises under like circumstances.&rdquo;
      </p>
      <p style={{ lineHeight: 1.6, marginBottom: '12px' }}>
        The calculated salary of{' '}
        <strong>{formatCurrency(totalCompensation)}</strong> was determined to be Reasonable
        Compensation based on the type of work performed, the skill level of the work performed and
        the number of hours the work is performed annually. You told us that you work{' '}
        <strong>{report.hours_worked.toLocaleString()}</strong> hours per year in{' '}
        <strong>{report.msa_name ? `${report.msa_name}, ` : ''}{report.state_name}</strong>. Our analysis indicates the annual salary of{' '}
        <strong>{formatCurrency(totalCompensation)}</strong> would be a reasonable cost to hire
        employee(s) to perform the duties and responsibilities that you currently perform.
      </p>
      <p style={{ lineHeight: 1.6, marginBottom: '32px' }}>
        {advisor.firmName} recommends completing a Reasonable Compensation report annually.
      </p>

      {/* Donut charts */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start' }}>
        {/* Time chart */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>Your Time</div>
          <ChartWithLegend segments={timeSegments} />
        </div>
        {/* Compensation chart */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>Your Compensation</div>
          <ChartWithLegend segments={compSegments} />
        </div>
      </div>
    </Page>
  )
}

function ChartWithLegend({ segments }) {
  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 12px', marginBottom: '8px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: seg.color, borderRadius: '2px' }} />
            <span>{seg.label}</span>
          </div>
        ))}
      </div>
      {/* SVG donut with percentage labels */}
      <DonutChartWithLabels segments={segments} />
    </div>
  )
}

function DonutChartWithLabels({ segments }) {
  const size = 180
  const cx = size / 2, cy = size / 2
  const r  = 58, stroke = 28
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return null

  let cumAngle = -Math.PI / 2
  const arcs = segments.map(seg => {
    const angle = (seg.value / total) * 2 * Math.PI
    const midA  = cumAngle + angle / 2
    const x1    = cx + r * Math.cos(cumAngle)
    const y1    = cy + r * Math.sin(cumAngle)
    cumAngle   += angle
    const x2    = cx + r * Math.cos(cumAngle)
    const y2    = cy + r * Math.sin(cumAngle)
    const large = angle > Math.PI ? 1 : 0
    const lx    = cx + (r) * Math.cos(midA)
    const ly    = cy + (r) * Math.sin(midA)
    return { ...seg, x1, y1, x2, y2, large, lx, ly }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {arcs.map((arc, i) => (
        <path key={i}
          d={`M ${arc.x1} ${arc.y1} A ${r} ${r} 0 ${arc.large} 1 ${arc.x2} ${arc.y2}`}
          fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt" />
      ))}
      <circle cx={cx} cy={cy} r={r - stroke / 2} fill="white" />
      {arcs.map((arc, i) => (
        arc.value >= 5 ? (
          <text key={i} x={arc.lx} y={arc.ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill="white">
            {Math.round(arc.value)}%
          </text>
        ) : null
      ))}
    </svg>
  )
}

// ─── Pages 2–3: Task breakdowns per category ────────────────────────────────
function TaskBreakdownPages({ report, advisor, tasks, categoryTotals, startPage }) {
  const tasksByCategory = {}
  for (const task of tasks) {
    if (!tasksByCategory[task.categoryId]) tasksByCategory[task.categoryId] = []
    tasksByCategory[task.categoryId].push(task)
  }

  const pageProps = { ...advisor, clientName: `${report.client_first_name} ${report.client_last_name}`, companyName: report.company_name, reportYear: report.report_year, totalPages: 9 }

  // Split categories across pages (roughly 2 categories per page)
  const CATS_PER_PAGE = 2
  const catList = CATEGORY_ORDER.filter(id => tasksByCategory[id])
  const pages = []
  for (let i = 0; i < catList.length; i += CATS_PER_PAGE) {
    pages.push(catList.slice(i, i + CATS_PER_PAGE))
  }

  return pages.map((catIds, pageIdx) => (
    <Page key={pageIdx} {...pageProps} pageNum={startPage + pageIdx}>
      {catIds.map(catId => {
        const cat    = CATEGORIES[catId]
        const catTot = categoryTotals[catId]
        const catTasks = tasksByCategory[catId] ?? []
        return (
          <div key={catId} style={{ marginBottom: '24px' }}>
            {/* Category header */}
            <div style={{ backgroundColor: '#1e3a5f', color: 'white', padding: '8px 12px', borderRadius: '4px 4px 0 0' }}>
              <strong style={{ fontSize: '12px' }}>{cat.label}</strong>
            </div>
            <div style={{ backgroundColor: '#f3f4f6', padding: '5px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280' }}>
              {catTot?.pctOfTotal}% of total hours | {catTot?.hoursPerYear.toLocaleString()} hours per year | {catTot?.pctOfCompensation}% of total compensation
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  {['Task', 'Proficiency', '% of Category', '% of Total Hours', 'Hours per Year', 'Hourly Wage', 'Annual Wage'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: h === 'Task' || h === 'Proficiency' ? 'left' : 'right', fontWeight: 600, borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catTasks.map((task, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '8px 10px' }}>{task.title}</td>
                    <td style={{ padding: '8px 10px', textTransform: 'capitalize' }}>{task.proficiency}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{task.pctOfCategory}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{task.pctOfTotal}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{task.hoursPerYear.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>${task.hourlyWage.toFixed(2)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(task.annualWage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </Page>
  ))
}

// ─── Page 4: Business Summary ───────────────────────────────────────────────
function Page4BusinessSummary({ report, advisor }) {
  const pageProps = { ...advisor, clientName: `${report.client_first_name} ${report.client_last_name}`, companyName: report.company_name, reportYear: report.report_year, pageNum: 4, totalPages: 9 }
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  return (
    <Page {...pageProps}>
      <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>Business Summary:</p>
      <div style={{ lineHeight: 2.0, fontSize: '11px' }}>
        <div>Calculated For: {report.client_first_name} {report.client_last_name}</div>
        <div>Company: {report.company_name}</div>
        <div>Report Year: {report.report_year}</div>
        <div>Location: {report.msa_name ? `${report.msa_name}, ` : ''}{report.state_name}</div>
        <div>Hours Worked: {report.hours_worked.toLocaleString()}</div>
        <div>Report Finalized: {dateStr}</div>
      </div>
    </Page>
  )
}

// ─── Page 5: Methodology ────────────────────────────────────────────────────
function Page5Methodology({ report, advisor, totalCompensation }) {
  const pageProps = { ...advisor, clientName: `${report.client_first_name} ${report.client_last_name}`, companyName: report.company_name, reportYear: report.report_year, pageNum: 5, totalPages: 9 }
  return (
    <Page {...pageProps}>
      <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>How was my &ldquo;Annual Salary&rdquo; or &ldquo;Reasonable Compensation&rdquo; calculated?</p>
      <p style={{ lineHeight: 1.7, marginBottom: '10px' }}>
        {advisor.firmName} relies on data provided by Bureau of Labor Statistics (BLS) and U.S. Census
        data to calculate a concise, independent, unbiased, Reasonable Compensation figure.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '10px' }}>
        The Bureau of Labor Statistics defines &ldquo;year-round, full-time&rdquo; employment as 2,080 hours per
        year (40 hours per week). The BLS definition is adhered to by the Court and IRS Expert in{' '}
        <em>McAlary v. IRS</em>. If you selected 40+ hours per week your Reasonable Compensation
        figure will reflect a reasonable salary for someone working year-round, full-time, even if you
        work more than 40 hours per week.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '10px' }}>
        This report blends and weights the duties and responsibilities you perform annually in common
        categories with the duties and responsibilities you perform specific to your business,
        generating an annual salary that would be reasonable to &ldquo;replace&rdquo; yourself within your company.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '6px' }}>
        Your annual salary or Reasonable Compensation represents an estimate of the amount it would
        cost to &ldquo;replace&rdquo; you, based on:
      </p>
      <ul style={{ paddingLeft: '20px', lineHeight: 1.8, marginBottom: '10px' }}>
        <li>Your answers to our interview</li>
        <li>Bureau of Labor Statistics data</li>
        <li>Census data</li>
      </ul>
      <p style={{ lineHeight: 1.7, marginBottom: '16px' }}>
        Reasonable Compensation figures include taxable Medicare wages and flexible spending accounts.
        Reasonable Compensation figures do not include non-taxable fringe benefits such as health
        insurance, vehicle or vehicle allowance, stock options, company loans and other items not
        reported on a W-2 as Medicare wages.
      </p>
      <p style={{ fontWeight: 700, fontSize: '12px', marginBottom: '8px' }}>Methodology</p>
      <p style={{ lineHeight: 1.7, marginBottom: '10px' }}>
        This report uses the Cost Approach to determine a Reasonable Compensation figure. The Cost
        Approach takes into consideration all the tasks a business owner provides to their company,
        such as administration, accounting, marketing, purchasing etc. (also referred to as the Many
        Hats Approach).
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '10px' }}>
        The Cost Approach breaks down the time spent by the owner into the various tasks performed;
        wage levels are assigned for each task based on the owner's proficiency, and then added back
        together to obtain a hypothetical Replacement Cost for the owner.
      </p>
      <p style={{ lineHeight: 1.7 }}>
        The Cost approach is most accurate when used to determine Reasonable Compensation for owners
        of a closely-held business where the owner performs multiple job duties (wears many hats).
      </p>
    </Page>
  )
}

// ─── Page 6: Other Considerations ───────────────────────────────────────────
function Page6Considerations({ report, advisor }) {
  const pageProps = { ...advisor, clientName: `${report.client_first_name} ${report.client_last_name}`, companyName: report.company_name, reportYear: report.report_year, pageNum: 6, totalPages: 9 }
  return (
    <Page {...pageProps}>
      <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>
        Other considerations before deciding on a final Reasonable Compensation figure
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '10px' }}>
        For the majority of shareholder-employees, the Reasonable Compensation figure calculated in
        this report should not require adjustments. However there are circumstances, rules and
        situations {advisor.firmName} may take into consideration before recommending a final
        Reasonable Compensation figure. The list below is not exhaustive and {advisor.firmName} may
        make adjustments for circumstances and situations not listed:
      </p>
      <ul style={{ paddingLeft: '20px', lineHeight: 2.0, marginBottom: '16px' }}>
        {['Compensation of Non-Owner Employees', 'Salary History', 'Travel Requirements',
          'Personal Guarantee of Debt', 'Key Relationships and/or Contracts',
          'Financial Condition of Company', 'Distribution History'].map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p style={{ lineHeight: 1.7, marginBottom: '10px' }}>
        The courts have used a variety of factors to &ldquo;Stress Test&rdquo; Reasonable Compensation
        figures. Four well recognized lists of factors are below. {advisor.firmName} may stress test
        your Reasonable Compensation figure against some or all of the factors used by the courts and
        the IRS and recommend adjustments.
      </p>
      <ol style={{ paddingLeft: '20px', lineHeight: 2.0, marginBottom: '16px' }}>
        <li>The IRS Nine Factors Considered by Tax Courts: IRS Fact Sheet 2008-25</li>
        <li>The Tax Court&rsquo;s Five–Factor Test: LabelGraphics, Inc. v. Commissioner, T.C. Memo 1998–343</li>
        <li>The Tax Court&rsquo;s Ten–Factor Test: Brewer Quality Homes, Inc. v. Commissioner, T.C. Memo 2003-200</li>
        <li>Summary of Court Factors used to &ldquo;Stress Test&rdquo; Reasonable Compensation Figures</li>
      </ol>
      <p style={{ lineHeight: 1.7, marginBottom: '8px' }}>
        Additional information on the issue of Reasonable Compensation for S Corporation owners:
      </p>
      <ul style={{ paddingLeft: '20px', lineHeight: 2.0 }}>
        <li>IRS: S Corporation Compensation and Medical Insurance Issues</li>
        <li>IRS: S Corporation Employees, Shareholders and Corporate Officers</li>
        <li>IRS Fact Sheet 2008-25: Wage Compensation for S Corporation Officers</li>
      </ul>
    </Page>
  )
}

// ─── Pages 7–8: Task Descriptions ───────────────────────────────────────────
function TaskDescriptionPages({ report, advisor, tasks }) {
  const pageProps = { ...advisor, clientName: `${report.client_first_name} ${report.client_last_name}`, companyName: report.company_name, reportYear: report.report_year, totalPages: 9 }

  // De-duplicate tasks by title
  const unique = []
  const seen = new Set()
  for (const t of tasks) {
    if (!seen.has(t.title)) { seen.add(t.title); unique.push(t) }
  }

  // Split across 2 pages
  const half = Math.ceil(unique.length / 2)
  const pages = [unique.slice(0, half), unique.slice(half)]

  return pages.map((pageTasks, i) => (
    <Page key={i} {...pageProps} pageNum={7 + i}>
      {i === 0 && (
        <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>
          Appendix A — Descriptions of Tasks Selected
        </p>
      )}
      {pageTasks.map((task, j) => (
        <div key={j} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <p style={{ fontWeight: 700, fontSize: '11.5px', marginBottom: '4px' }}>{task.title}</p>
          <p style={{ lineHeight: 1.65, color: '#374151' }}>{task.description}</p>
        </div>
      ))}
    </Page>
  ))
}

// ─── Page 9: Corporate Minutes ───────────────────────────────────────────────
function Page9Minutes({ report, advisor, totalCompensation }) {
  const pageProps = { ...advisor, clientName: `${report.client_first_name} ${report.client_last_name}`, companyName: report.company_name, reportYear: report.report_year, pageNum: 9, totalPages: 9 }
  return (
    <Page {...pageProps}>
      <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>
        Sample Language for Your Corporate Minutes
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '20px' }}>
        {advisor.firmName} recommends incorporating the results of this report into the Corporate
        Minutes of your S Corporation. Here is a sample document for that purpose:
      </p>
      <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '12px', marginBottom: '16px' }}>
        CONSENT AND MINUTES OF MEETING OF DIRECTORS OF {report.company_name.toUpperCase()}
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '6px' }}>
        The undersigned, being all of the directors of {report.company_name} (the &ldquo;Company&rdquo;),
        waive any rights to notice, and consent to the following action, taken on
      </p>
      <p style={{ marginBottom: '20px' }}>
        ______________________ , 20___ :
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '24px' }}>
        <strong>RESOLVED,</strong> that the Company adopt the report of {advisor.firmName}, a copy of
        which is attached and, in reliance on such report, pay to{' '}
        {report.client_first_name} {report.client_last_name} the sum of{' '}
        <strong>{formatCurrency(totalCompensation)}</strong> per year as salary for the duties set
        forth in such report.
      </p>

      {/* Disclaimer box */}
      <div style={{ border: '1px solid #f59e0b', borderRadius: '6px', padding: '14px 16px', backgroundColor: '#fffbeb' }}>
        <p style={{ fontWeight: 700, color: '#d97706', marginBottom: '8px' }}>DISCLAIMER NOTICE!</p>
        <p style={{ lineHeight: 1.65, marginBottom: '8px', color: '#374151' }}>
          This document is being provided merely as a sample of the type of language that the S
          Corporation may consider using in connection with minutes of the board of directors adopting
          the amounts determined by {advisor.firmName} as Reasonable Compensation for its employees.
        </p>
        <p style={{ lineHeight: 1.65, marginBottom: '8px', color: '#374151' }}>
          {advisor.firmName} does not provide legal services, and does not represent that this sample
          will comply with state laws regarding the procedure for actions of the S Corporation&rsquo;s board
          of directors or the form or content of the minutes memorializing such actions.
        </p>
        <p style={{ fontWeight: 600, color: '#374151' }}>
          {advisor.firmName} recommends that the S Corporation consult its attorney for legal advice
          regarding such matters.
        </p>
      </div>
    </Page>
  )
}

// ─── Main Report Document ────────────────────────────────────────────────────
export default function ReportDocument({ report, advisorProfile, tasks, totalCompensation, categoryTotals }) {
  const advisor = {
    logoUrl:     advisorProfile?.logo_url   ?? null,
    firmName:    advisorProfile?.firm_name  ?? 'Your Firm',
    advisorName: advisorProfile?.advisor_name ?? 'Your Advisor',
  }

  return (
    <div id="report-document" style={{ backgroundColor: '#f3f4f6', padding: '20px 0' }}>
      <Page1
        report={report} advisor={advisor}
        tasks={tasks} totalCompensation={totalCompensation} categoryTotals={categoryTotals}
      />
      <TaskBreakdownPages
        report={report} advisor={advisor}
        tasks={tasks} categoryTotals={categoryTotals} startPage={2}
      />
      <Page4BusinessSummary report={report} advisor={advisor} />
      <Page5Methodology report={report} advisor={advisor} totalCompensation={totalCompensation} />
      <Page6Considerations report={report} advisor={advisor} />
      <TaskDescriptionPages report={report} advisor={advisor} tasks={tasks} />
      <Page9Minutes report={report} advisor={advisor} totalCompensation={totalCompensation} />
    </div>
  )
}
