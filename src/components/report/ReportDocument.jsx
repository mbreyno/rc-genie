/**
 * Full Reasonable Compensation Report document.
 * Modern redesign: brand blue accents, bold cover callout, clean tables.
 */
import { CATEGORIES } from '../../data/occupations'
import { formatCurrency } from '../../utils/calculations'

// ─── Brand / Design tokens ──────────────────────────────────────────────────
const B = {
  blue:       '#1a3de8',   // brand-600
  blueDark:   '#1230b8',
  blueLight:  '#eef0fd',
  blueXLight: '#f5f6fe',
  slate:      '#111827',
  slateM:     '#374151',
  slateL:     '#6b7280',
  border:     '#e5e7eb',
  borderL:    '#f3f4f6',
  white:      '#ffffff',
  amber:      '#d97706',
  amberBg:    '#fffbeb',
  amberBdr:   '#fcd34d',
}

const CATEGORY_ORDER = ['marketing', 'finance', 'hr', 'management', 'myBusiness']

// ─── Page wrapper ────────────────────────────────────────────────────────────
function Page({ children, logoUrl, firmName, clientName, companyName, reportYear, pageNum, totalPages }) {
  return (
    <div style={{
      width: '816px',
      minHeight: '1056px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: B.white,
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '11px',
      color: B.slate,
      pageBreakAfter: 'always',
      position: 'relative',
    }}>
      {/* Accent strip at top */}
      <div style={{ height: '5px', backgroundColor: B.blue, flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 56px',
        borderBottom: `1px solid ${B.border}`,
        flexShrink: 0,
      }}>
        {/* Logo / firm name */}
        <div style={{ maxWidth: '150px', maxHeight: '48px' }}>
          {logoUrl
            ? <img src={logoUrl} alt={firmName} style={{ maxWidth: '150px', maxHeight: '48px', objectFit: 'contain' }} />
            : <div style={{ fontSize: '15px', fontWeight: 700, color: B.blue, letterSpacing: '-0.3px' }}>{firmName}</div>
          }
        </div>

        {/* Meta chips */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { label: 'Year', value: reportYear },
            { label: 'For', value: `${clientName} · ${companyName}` },
            { label: 'Method', value: 'Cost Approach' },
          ].map(chip => (
            <div key={chip.label} style={{
              backgroundColor: B.blueXLight,
              border: `1px solid ${B.blueLight}`,
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '10px',
              color: B.slateM,
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: B.blue, fontWeight: 700 }}>{chip.label}: </span>{chip.value}
            </div>
          ))}
        </div>
      </div>

      {/* Page body */}
      <div style={{ flex: 1, padding: '32px 56px' }}>{children}</div>

      {/* Footer */}
      <div style={{
        padding: '10px 56px 14px',
        borderTop: `1px solid ${B.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: B.slateL, fontSize: '8.5px', maxWidth: '620px', lineHeight: 1.4 }}>
          Annual Salary and Reasonable Compensation are used interchangeably. All figures are expressed annually in U.S. dollars. Prepared by {firmName}.
        </span>
        <span style={{
          color: B.blue, fontSize: '9px', fontWeight: 700,
          whiteSpace: 'nowrap', marginLeft: '12px',
        }}>
          {pageNum} / {totalPages}
        </span>
      </div>
    </div>
  )
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ children, accent = B.blue }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      marginBottom: '14px',
    }}>
      <div style={{ width: '4px', height: '22px', backgroundColor: accent, borderRadius: '2px', flexShrink: 0 }} />
      <span style={{ fontSize: '13px', fontWeight: 700, color: B.slate, letterSpacing: '-0.2px' }}>{children}</span>
    </div>
  )
}

// ─── Page 1: Cover / Summary ─────────────────────────────────────────────────
function Page1({ report, advisor, tasks, totalCompensation, categoryTotals }) {
  const timeSegments = CATEGORY_ORDER
    .filter(id => categoryTotals[id])
    .map(id => ({ label: CATEGORIES[id].label, value: categoryTotals[id].pctOfTotal, color: CATEGORIES[id].color }))

  const compSegments = CATEGORY_ORDER
    .filter(id => categoryTotals[id])
    .map(id => ({ label: CATEGORIES[id].label, value: categoryTotals[id].pctOfCompensation, color: CATEGORIES[id].color }))

  const pageProps = {
    ...advisor,
    clientName: `${report.client_first_name} ${report.client_last_name}`,
    companyName: report.company_name,
    reportYear: report.report_year,
    pageNum: 1, totalPages: 9,
  }

  return (
    <Page {...pageProps}>
      {/* Compensation callout card */}
      <div style={{
        backgroundColor: B.blue,
        borderRadius: '12px',
        padding: '24px 32px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Estimated Annual Reasonable Compensation
          </div>
          <div style={{ color: B.white, fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1 }}>
            {formatCurrency(totalCompensation)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '8px' }}>
            {report.hours_worked.toLocaleString()} hrs/yr &nbsp;·&nbsp;{' '}
            {report.msa_name ? `${report.msa_name}, ` : ''}{report.state_name}
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '12px 20px',
          textAlign: 'center',
          color: B.white,
          fontSize: '10px',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>{report.report_year}</div>
          <div style={{ opacity: 0.8 }}>Tax Year</div>
        </div>
      </div>

      {/* Intro text */}
      <p style={{ lineHeight: 1.7, marginBottom: '10px', color: B.slateM, fontSize: '11px' }}>
        Thank you for entrusting <strong style={{ color: B.slate }}>{advisor.advisorName}</strong> of{' '}
        <strong style={{ color: B.slate }}>{advisor.firmName}</strong> with your Reasonable Compensation
        analysis. This report provides a reasonable estimate of the value of services rendered to your
        S Corporation based on the duties and responsibilities you perform annually. Reasonable
        Compensation is defined by the IRS as &ldquo;The value that would ordinarily be paid for like
        services by like enterprises under like circumstances.&rdquo;
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '10px', color: B.slateM, fontSize: '11px' }}>
        The calculated salary of <strong style={{ color: B.slate }}>{formatCurrency(totalCompensation)}</strong>{' '}
        was determined based on the type of work performed, the skill level, and the number of hours
        worked annually. Our analysis indicates this amount would be a reasonable cost to hire
        employee(s) to perform the duties you currently perform.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '24px', color: B.slateM, fontSize: '11px' }}>
        {advisor.firmName} recommends completing a Reasonable Compensation report annually.
      </p>

      {/* Charts */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <ChartCard title="Time Allocation" segments={timeSegments} />
        <ChartCard title="Compensation Allocation" segments={compSegments} />
      </div>
    </Page>
  )
}

function ChartCard({ title, segments }) {
  return (
    <div style={{
      flex: 1,
      border: `1px solid ${B.border}`,
      borderRadius: '10px',
      padding: '16px',
      backgroundColor: B.blueXLight,
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: B.slate, marginBottom: '12px', textAlign: 'center' }}>
        {title}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 10px', marginBottom: '10px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', color: B.slateM }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: seg.color, borderRadius: '2px' }} />
            <span>{seg.label}</span>
          </div>
        ))}
      </div>
      <DonutChartWithLabels segments={segments} />
    </div>
  )
}

function DonutChartWithLabels({ segments }) {
  const size = 170
  const cx = size / 2, cy = size / 2
  const r = 54, stroke = 26
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return null

  let cumAngle = -Math.PI / 2
  const arcs = segments.map(seg => {
    const angle = (seg.value / total) * 2 * Math.PI
    const midA  = cumAngle + angle / 2
    const x1 = cx + r * Math.cos(cumAngle)
    const y1 = cy + r * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + r * Math.cos(cumAngle)
    const y2 = cy + r * Math.sin(cumAngle)
    return { ...seg, x1, y1, x2, y2, large: angle > Math.PI ? 1 : 0,
      lx: cx + r * Math.cos(midA), ly: cy + r * Math.sin(midA) }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {arcs.map((arc, i) => (
        <path key={i}
          d={`M ${arc.x1} ${arc.y1} A ${r} ${r} 0 ${arc.large} 1 ${arc.x2} ${arc.y2}`}
          fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt" />
      ))}
      {/* White inner circle */}
      <circle cx={cx} cy={cy} r={r - stroke / 2} fill={B.white} />
      {arcs.map((arc, i) => (
        arc.value >= 5 ? (
          <text key={i} x={arc.lx} y={arc.ly} textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fontWeight="700" fill="white">
            {Math.round(arc.value)}%
          </text>
        ) : null
      ))}
    </svg>
  )
}

// ─── Pages 2–3: Task Breakdowns ──────────────────────────────────────────────
function TaskBreakdownPages({ report, advisor, tasks, categoryTotals, startPage }) {
  const tasksByCategory = {}
  for (const task of tasks) {
    if (!tasksByCategory[task.categoryId]) tasksByCategory[task.categoryId] = []
    tasksByCategory[task.categoryId].push(task)
  }

  const pageProps = {
    ...advisor,
    clientName: `${report.client_first_name} ${report.client_last_name}`,
    companyName: report.company_name,
    reportYear: report.report_year,
    totalPages: 9,
  }

  const catList = CATEGORY_ORDER.filter(id => tasksByCategory[id])
  const pages = []
  for (let i = 0; i < catList.length; i += 2) {
    pages.push(catList.slice(i, i + 2))
  }

  return pages.map((catIds, pageIdx) => (
    <Page key={pageIdx} {...pageProps} pageNum={startPage + pageIdx}>
      {catIds.map(catId => {
        const cat      = CATEGORIES[catId]
        const catTot   = categoryTotals[catId]
        const catTasks = tasksByCategory[catId] ?? []
        return (
          <div key={catId} style={{ marginBottom: '28px' }}>
            {/* Category header strip */}
            <div style={{
              backgroundColor: B.blue,
              borderRadius: '8px 8px 0 0',
              padding: '9px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: B.white }}>{cat.label}</span>
              <div style={{ display: 'flex', gap: '16px', fontSize: '9.5px', color: 'rgba(255,255,255,0.8)' }}>
                <span>{catTot?.pctOfTotal}% of total hours</span>
                <span>{catTot?.hoursPerYear.toLocaleString()} hrs/yr</span>
                <span>{catTot?.pctOfCompensation}% of compensation</span>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: `1px solid ${B.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: B.blueLight }}>
                  {['Task', 'Proficiency', '% of Cat.', '% of Total', 'Hours/Yr', 'Hourly Rate', 'Annual Value'].map(h => (
                    <th key={h} style={{
                      padding: '7px 10px',
                      textAlign: (h === 'Task' || h === 'Proficiency') ? 'left' : 'right',
                      fontWeight: 700,
                      color: B.blue,
                      fontSize: '10px',
                      borderBottom: `1px solid ${B.border}`,
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catTasks.map((task, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? B.white : B.blueXLight }}>
                    <td style={{ padding: '7px 10px', fontWeight: 500 }}>{task.title}</td>
                    <td style={{ padding: '7px 10px', textTransform: 'capitalize', color: B.slateM }}>{task.proficiency}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: B.slateM }}>{task.pctOfCategory}%</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: B.slateM }}>{task.pctOfTotal}%</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: B.slateM }}>{task.hoursPerYear.toLocaleString()}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: B.slateM }}>${task.hourlyWage.toFixed(2)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: B.slate }}>{formatCurrency(task.annualWage)}</td>
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

// ─── Page 4: Business Summary ────────────────────────────────────────────────
function Page4BusinessSummary({ report, advisor }) {
  const pageProps = {
    ...advisor,
    clientName: `${report.client_first_name} ${report.client_last_name}`,
    companyName: report.company_name,
    reportYear: report.report_year,
    pageNum: 4, totalPages: 9,
  }
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const fields = [
    { label: 'Prepared For',    value: `${report.client_first_name} ${report.client_last_name}` },
    { label: 'Company',         value: report.company_name },
    { label: 'Report Year',     value: report.report_year },
    { label: 'Location',        value: report.msa_name ? `${report.msa_name}, ${report.state_name}` : report.state_name },
    { label: 'Hours Worked',    value: `${report.hours_worked.toLocaleString()} hours per year` },
    { label: 'Report Approach', value: 'Cost Approach (BLS OES Data)' },
    { label: 'Date Finalized',  value: dateStr },
    { label: 'Prepared By',     value: `${advisor.advisorName}, ${advisor.firmName}` },
  ]

  return (
    <Page {...pageProps}>
      <SectionHeading>Business Summary</SectionHeading>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {fields.map(f => (
          <div key={f.label} style={{
            backgroundColor: B.blueXLight,
            border: `1px solid ${B.blueLight}`,
            borderRadius: '8px',
            padding: '12px 16px',
          }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: B.blue, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
              {f.label}
            </div>
            <div style={{ fontSize: '11.5px', color: B.slate, fontWeight: 500 }}>{f.value}</div>
          </div>
        ))}
      </div>

      <p style={{ lineHeight: 1.7, color: B.slateM, fontSize: '10.5px' }}>
        This summary documents the client and engagement details used in preparing this Reasonable
        Compensation analysis. Please retain this report as part of your S Corporation tax records.
        {advisor.firmName} recommends reviewing and updating this analysis annually.
      </p>
    </Page>
  )
}

// ─── Page 5: Methodology ─────────────────────────────────────────────────────
function Page5Methodology({ report, advisor, totalCompensation }) {
  const pageProps = {
    ...advisor,
    clientName: `${report.client_first_name} ${report.client_last_name}`,
    companyName: report.company_name,
    reportYear: report.report_year,
    pageNum: 5, totalPages: 9,
  }
  return (
    <Page {...pageProps}>
      <SectionHeading>How Was My Reasonable Compensation Calculated?</SectionHeading>

      <p style={{ lineHeight: 1.7, marginBottom: '12px', color: B.slateM }}>
        {advisor.firmName} relies on data provided by the Bureau of Labor Statistics (BLS) and U.S.
        Census data to calculate a concise, independent, unbiased Reasonable Compensation figure.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '12px', color: B.slateM }}>
        The Bureau of Labor Statistics defines &ldquo;year-round, full-time&rdquo; employment as 2,080 hours per
        year (40 hours per week). The BLS definition is adhered to by the Court and IRS Expert in{' '}
        <em>McAlary v. IRS</em>. If you selected 40+ hours per week, your Reasonable Compensation
        figure will reflect a reasonable salary for someone working year-round, full-time.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '12px', color: B.slateM }}>
        This report blends and weights the duties and responsibilities you perform annually in common
        categories with the duties specific to your business, generating an annual salary that would
        be reasonable to &ldquo;replace&rdquo; you within your company.
      </p>

      {/* Inputs box */}
      <div style={{ backgroundColor: B.blueXLight, border: `1px solid ${B.blueLight}`, borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '10.5px', fontWeight: 700, color: B.blue, marginBottom: '10px' }}>
          Your annual Reasonable Compensation is based on:
        </div>
        {['Your answers to our interview', 'Bureau of Labor Statistics (BLS OES) wage data', 'U.S. Census geographic data'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '10.5px', color: B.slateM }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: B.blue, flexShrink: 0 }} />
            {item}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: B.slate }}>Methodology: Cost Approach</span>
      </div>
      <p style={{ lineHeight: 1.7, marginBottom: '10px', color: B.slateM }}>
        This report uses the Cost Approach to determine a Reasonable Compensation figure. The Cost
        Approach (also referred to as the Many Hats Approach) takes into consideration all the tasks a
        business owner provides to their company, such as administration, accounting, marketing, and
        purchasing.
      </p>
      <p style={{ lineHeight: 1.7, marginBottom: '10px', color: B.slateM }}>
        The Cost Approach breaks down the time spent by the owner into the various tasks performed;
        wage levels are assigned for each task based on the owner's proficiency, and then added
        together to obtain a hypothetical Replacement Cost for the owner.
      </p>
      <p style={{ lineHeight: 1.7, color: B.slateM }}>
        Reasonable Compensation figures include taxable Medicare wages and flexible spending accounts.
        They do not include non-taxable fringe benefits such as health insurance, vehicle allowances,
        stock options, or company loans not reported on a W-2 as Medicare wages.
      </p>
    </Page>
  )
}

// ─── Page 6: Other Considerations ───────────────────────────────────────────
function Page6Considerations({ report, advisor }) {
  const pageProps = {
    ...advisor,
    clientName: `${report.client_first_name} ${report.client_last_name}`,
    companyName: report.company_name,
    reportYear: report.report_year,
    pageNum: 6, totalPages: 9,
  }

  const considerations = [
    'Compensation of Non-Owner Employees',
    'Salary History',
    'Travel Requirements',
    'Personal Guarantee of Debt',
    'Key Relationships and/or Contracts',
    'Financial Condition of Company',
    'Distribution History',
  ]

  const courtTests = [
    { num: '01', title: 'IRS Nine Factors', cite: 'IRS Fact Sheet 2008-25' },
    { num: '02', title: "Tax Court's Five-Factor Test", cite: 'LabelGraphics, Inc. v. Commissioner, T.C. Memo 1998-343' },
    { num: '03', title: "Tax Court's Ten-Factor Test", cite: 'Brewer Quality Homes, Inc. v. Commissioner, T.C. Memo 2003-200' },
    { num: '04', title: 'Summary of Court Factors', cite: 'Used to "Stress Test" Reasonable Compensation Figures' },
  ]

  return (
    <Page {...pageProps}>
      <SectionHeading>Other Considerations Before Finalizing</SectionHeading>

      <p style={{ lineHeight: 1.7, marginBottom: '16px', color: B.slateM }}>
        For the majority of shareholder-employees, the Reasonable Compensation figure in this report
        should not require adjustments. However, {advisor.firmName} may take the following
        circumstances into consideration before recommending a final figure:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
        {considerations.map(item => (
          <div key={item} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px',
            backgroundColor: B.blueXLight,
            border: `1px solid ${B.blueLight}`,
            borderRadius: '6px',
            fontSize: '10.5px',
            color: B.slateM,
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: B.blue, flexShrink: 0 }} />
            {item}
          </div>
        ))}
      </div>

      <p style={{ lineHeight: 1.7, marginBottom: '14px', color: B.slateM }}>
        The courts have used a variety of factors to &ldquo;Stress Test&rdquo; Reasonable Compensation figures.
        Four well-recognized frameworks are listed below. {advisor.firmName} may stress-test your
        figure against some or all of these factors.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {courtTests.map(t => (
          <div key={t.num} style={{
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            padding: '10px 14px',
            border: `1px solid ${B.border}`,
            borderRadius: '6px',
            backgroundColor: B.white,
          }}>
            <div style={{
              backgroundColor: B.blue, color: B.white,
              borderRadius: '4px', width: '24px', height: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 700, flexShrink: 0,
            }}>{t.num}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '10.5px', color: B.slate }}>{t.title}</div>
              <div style={{ color: B.slateL, fontSize: '10px', marginTop: '2px' }}>{t.cite}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ lineHeight: 1.7, marginBottom: '10px', color: B.slateM, fontSize: '10.5px' }}>
        Additional IRS resources on Reasonable Compensation for S Corporation owners:
      </p>
      {[
        'IRS: S Corporation Compensation and Medical Insurance Issues',
        'IRS: S Corporation Employees, Shareholders and Corporate Officers',
        'IRS Fact Sheet 2008-25: Wage Compensation for S Corporation Officers',
      ].map(item => (
        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '10.5px', color: B.slateM }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: B.blue, flexShrink: 0 }} />
          {item}
        </div>
      ))}
    </Page>
  )
}

// ─── Pages 7–8: Task Descriptions ───────────────────────────────────────────
function TaskDescriptionPages({ report, advisor, tasks }) {
  const pageProps = {
    ...advisor,
    clientName: `${report.client_first_name} ${report.client_last_name}`,
    companyName: report.company_name,
    reportYear: report.report_year,
    totalPages: 9,
  }

  // De-duplicate
  const unique = []
  const seen = new Set()
  for (const t of tasks) {
    if (!seen.has(t.title)) { seen.add(t.title); unique.push(t) }
  }

  const half = Math.ceil(unique.length / 2)
  const pages = [unique.slice(0, half), unique.slice(half)]

  return pages.map((pageTasks, i) => (
    <Page key={i} {...pageProps} pageNum={7 + i}>
      {i === 0 && <SectionHeading>Appendix A — Task Descriptions</SectionHeading>}
      {pageTasks.map((task, j) => (
        <div key={j} style={{
          marginBottom: '14px',
          paddingBottom: '14px',
          borderBottom: `1px solid ${B.borderL}`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px',
          }}>
            <div style={{ width: '3px', height: '16px', backgroundColor: CATEGORIES[task.categoryId]?.color ?? B.blue, borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: '11px', color: B.slate }}>{task.title}</span>
            <span style={{ fontSize: '9.5px', color: B.slateL, marginLeft: '2px' }}>SOC {task.soc}</span>
          </div>
          <p style={{ lineHeight: 1.65, color: B.slateM, paddingLeft: '11px' }}>{task.description}</p>
        </div>
      ))}
    </Page>
  ))
}

// ─── Page 9: Corporate Minutes ───────────────────────────────────────────────
function Page9Minutes({ report, advisor, totalCompensation }) {
  const pageProps = {
    ...advisor,
    clientName: `${report.client_first_name} ${report.client_last_name}`,
    companyName: report.company_name,
    reportYear: report.report_year,
    pageNum: 9, totalPages: 9,
  }
  return (
    <Page {...pageProps}>
      <SectionHeading>Sample Language for Corporate Minutes</SectionHeading>

      <p style={{ lineHeight: 1.7, marginBottom: '20px', color: B.slateM }}>
        {advisor.firmName} recommends incorporating the results of this report into the Corporate
        Minutes of your S Corporation. Below is sample language for that purpose:
      </p>

      {/* Minutes document */}
      <div style={{
        border: `1px solid ${B.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <div style={{ backgroundColor: B.blue, padding: '12px 20px' }}>
          <div style={{ color: B.white, fontWeight: 700, fontSize: '11.5px', textAlign: 'center', letterSpacing: '0.5px' }}>
            CONSENT AND MINUTES OF MEETING OF DIRECTORS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', textAlign: 'center', marginTop: '2px' }}>
            {report.company_name.toUpperCase()}
          </div>
        </div>
        <div style={{ padding: '20px 24px', backgroundColor: B.white }}>
          <p style={{ lineHeight: 1.8, marginBottom: '10px', color: B.slateM }}>
            The undersigned, being all of the directors of {report.company_name} (the &ldquo;Company&rdquo;),
            waive any rights to notice, and consent to the following action, taken on
          </p>
          <p style={{ marginBottom: '20px', color: B.slateM }}>
            ______________________ , 20___ :
          </p>
          <p style={{ lineHeight: 1.8, color: B.slateM }}>
            <strong style={{ color: B.slate }}>RESOLVED,</strong> that the Company adopt the report
            of {advisor.firmName}, a copy of which is attached and, in reliance on such report, pay
            to {report.client_first_name} {report.client_last_name} the sum of{' '}
            <strong style={{ color: B.blue, fontSize: '12px' }}>{formatCurrency(totalCompensation)}</strong>{' '}
            per year as salary for the duties set forth in such report.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        border: `1px solid ${B.amberBdr}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <div style={{ backgroundColor: '#fef3c7', padding: '8px 16px', borderBottom: `1px solid ${B.amberBdr}` }}>
          <span style={{ fontWeight: 700, color: B.amber, fontSize: '10.5px' }}>⚠ DISCLAIMER NOTICE</span>
        </div>
        <div style={{ padding: '14px 16px', backgroundColor: B.amberBg }}>
          <p style={{ lineHeight: 1.65, marginBottom: '8px', color: B.slateM, fontSize: '10.5px' }}>
            This document is provided as a sample of the type of language an S Corporation may consider
            using in connection with minutes of the board of directors. {advisor.firmName} does not provide
            legal services and does not represent that this sample will comply with state laws regarding
            procedures for actions of the board of directors.
          </p>
          <p style={{ fontWeight: 600, color: B.slateM, fontSize: '10.5px' }}>
            {advisor.firmName} recommends the S Corporation consult its attorney for legal advice.
          </p>
        </div>
      </div>
    </Page>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function ReportDocument({ report, advisorProfile, tasks, totalCompensation, categoryTotals }) {
  const advisor = {
    logoUrl:     advisorProfile?.logo_url    ?? null,
    firmName:    advisorProfile?.firm_name   ?? 'Your Firm',
    advisorName: advisorProfile?.advisor_name ?? 'Your Advisor',
  }

  return (
    <div id="report-document" style={{ backgroundColor: '#e5e7eb', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
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
