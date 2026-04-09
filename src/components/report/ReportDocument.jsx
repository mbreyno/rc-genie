/**
 * Reasonable Compensation Report — RC Genie layout
 *
 * html2pdf pagination strategy:
 *  - Each Page div is EXACTLY 1056px tall (height, not minHeight) with overflow:hidden.
 *    html2pdf slices the rendered content every 1056px — pages align perfectly.
 *  - No pageBreakBefore/pageBreakAfter needed; exact height IS the page break.
 *  - Footer is a flex item (not position:absolute) so it stays inside the 1056px boundary.
 *  - Outer container has NO padding — any top offset shifts all pages out of alignment.
 *  - Charts use <canvas> + useEffect so html2canvas copies pixel data directly.
 */
import { useEffect, useRef } from 'react'
import { CATEGORIES } from '../../data/occupations'
import { formatCurrency } from '../../utils/calculations'

const CATEGORY_ORDER = ['myBusiness', 'management', 'marketing', 'finance', 'hr']

const DEFAULT_BRAND = '#1a3de8'

/** Blend hex color with white by `factor` (0=original, 1=white). Returns #rrggbb. */
function tintHex(hex, factor) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const tr = Math.round(r + (255 - r) * factor)
  const tg = Math.round(g + (255 - g) * factor)
  const tb = Math.round(b + (255 - b) * factor)
  return '#' + [tr, tg, tb].map(v => v.toString(16).padStart(2, '0')).join('')
}

function makeBrandColors(hex) {
  const base = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : DEFAULT_BRAND
  return {
    brand:    base,
    brandLt:  tintHex(base, 0.88),  // ~eef0fd equivalent
    brandXl:  tintHex(base, 0.95),  // ~f5f6fe equivalent
  }
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
function Page({ children, logoUrl, firmName, clientName, companyName, reportYear, pageNum, totalPages, brand, brandLt, brandXl }) {
  return (
    <div style={{
      width: '816px',
      height: '1056px',
      overflow: 'hidden',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '12px',
      color: '#1a1a1a',
    }}>

      {/* Full-width header band */}
      <div style={{
        backgroundColor: 'white',
        padding: '0 56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '88px',
        flexShrink: 0,
        borderBottom: `3px solid ${brand}`,
      }}>
        {/* Logo / firm name — full color, no filter */}
        <div style={{ maxWidth: '180px', maxHeight: '56px' }}>
          {logoUrl
            ? <img src={logoUrl} alt={firmName} style={{ maxWidth: '180px', maxHeight: '56px', objectFit: 'contain' }} />
            : <div style={{ fontSize: '20px', fontWeight: 700, color: brand, letterSpacing: '-0.3px' }}>{firmName}</div>
          }
        </div>
        {/* Metadata — dark text on white background */}
        <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#6b7280', lineHeight: 2.0 }}>
          <div><strong style={{ color: '#111827' }}>Year:</strong> {reportYear} &nbsp;·&nbsp; <strong style={{ color: '#111827' }}>Approach:</strong> Cost Approach</div>
          <div><strong style={{ color: '#111827' }}>Report:</strong> S-Corporation Reasonable Compensation</div>
          <div><strong style={{ color: '#111827' }}>Prepared for:</strong> {clientName} · {companyName}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '28px 48px 20px', overflow: 'hidden' }}>{children}</div>

      {/* Footer */}
      <div style={{
        flexShrink: 0,
        padding: '7px 48px',
        borderTop: `2px solid ${brand}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: brandXl,
        fontSize: '9.5px',
        color: '#6b7280',
      }}>
        <span>
          All compensation figures in this report are expressed as annual amounts in U.S. dollars.
          "Annual Salary" and "Reasonable Compensation" are used interchangeably throughout.
        </span>
        <span style={{ color: brand, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '16px', fontSize: '10px' }}>
          {pageNum} / {totalPages}
        </span>
      </div>
    </div>
  )
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutCanvas({ segments, size = 160 }) {
  const ref = useRef(null)
  const total = segments.reduce((s, g) => s + g.value, 0) || 1

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width  = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2, cy = size / 2
    const outerR = size * 0.42
    const innerR = size * 0.26

    let startAngle = -Math.PI / 2
    for (const seg of segments) {
      const angle    = (seg.value / total) * 2 * Math.PI
      const endAngle = startAngle + angle
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, startAngle, endAngle)
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      const pct = Math.round(seg.value / total * 100)
      if (pct >= 5) {
        const midA = startAngle + angle / 2
        const lr   = (outerR + innerR) / 2
        ctx.fillStyle    = 'white'
        ctx.font         = `bold ${Math.round(size * 0.065)}px Arial`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${pct}%`, cx + lr * Math.cos(midA), cy + lr * Math.sin(midA))
      }
      startAngle = endAngle
    }
  }, [segments, size, total])

  return (
    <canvas ref={ref} width={size} height={size}
      style={{ display: 'block', margin: '0 auto', width: size + 'px', height: size + 'px' }} />
  )
}

function ChartWithLegend({ title, segments, brand }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '8px', color: brand, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px 8px', marginBottom: '8px' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10.5px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: seg.color, borderRadius: '50%' }} />
            <span style={{ color: '#4b5563' }}>{seg.label}</span>
          </div>
        ))}
      </div>
      <DonutCanvas segments={segments} size={155} />
    </div>
  )
}

const CATS_PER_PAGE = 5

// ─── Page 1: Cover ───────────────────────────────────────────────────────────
function Page1({ report, advisor, totalCompensation, categoryTotals, totalPages }) {
  const { brand, brandLt, brandXl } = advisor
  const timeSegments = CATEGORY_ORDER
    .filter(id => categoryTotals[id])
    .map(id => ({ label: CATEGORIES[id].label, value: categoryTotals[id].pctOfTotal, color: CATEGORIES[id].color }))
  const compSegments = CATEGORY_ORDER
    .filter(id => categoryTotals[id])
    .map(id => ({ label: CATEGORIES[id].label, value: categoryTotals[id].pctOfCompensation, color: CATEGORIES[id].color }))

  const dateStr  = new Date().toISOString().split('T')[0]
  const location = report.msa_name ? `${report.msa_name}, ${report.state_name}` : report.state_name

  return (
    <Page {...advisor}
      clientName={`${report.client_first_name} ${report.client_last_name}`}
      companyName={report.company_name}
      reportYear={report.report_year}
      pageNum={1} totalPages={totalPages}>

      {/* Compensation callout — solid brand background */}
      <div style={{
        textAlign: 'center',
        backgroundColor: brand,
        borderRadius: '8px',
        padding: '16px 24px',
        marginBottom: '18px',
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
          Estimated Annual Reasonable Compensation
        </div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'white', lineHeight: 1 }}>
          {formatCurrency(totalCompensation)}
        </div>
      </div>

      {/* Charts — appear before text on this layout */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', padding: '0 12px 0 0' }}>
              <ChartWithLegend title="Time Allocation" segments={timeSegments} brand={brand} />
            </td>
            <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', padding: '0 0 0 12px' }}>
              <ChartWithLegend title="Compensation Allocation" segments={compSegments} brand={brand} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Intro paragraphs */}
      <p style={{ lineHeight: 1.65, marginBottom: '9px' }}>
        <strong>{advisor.advisorName}</strong> of <strong>{advisor.firmName}</strong> has prepared this
        Reasonable Compensation analysis on your behalf. This report estimates the fair market value of
        the services you contribute to your S Corporation, based on the scope and nature of your annual
        duties. Per IRS guidance, Reasonable Compensation is &ldquo;the value that would ordinarily be paid
        for like services by like enterprises under like circumstances.&rdquo;
      </p>
      <p style={{ lineHeight: 1.65, marginBottom: '9px' }}>
        The annual compensation figure of <strong>{formatCurrency(totalCompensation)}</strong> reflects
        the type of work you perform, your skill and experience level, and the volume of hours you
        dedicate to those duties each year. Based on your input of{' '}
        <strong>{report.hours_worked.toLocaleString()} hours per year</strong> in{' '}
        <strong>{location}</strong>, this figure represents a reasonable cost to engage qualified
        workers to carry out the same responsibilities you currently handle.
      </p>
      <p style={{ lineHeight: 1.65, marginBottom: '16px' }}>
        {advisor.firmName} recommends refreshing this analysis each year to keep pace with current
        wage data and any changes in your duties.
      </p>

      {/* Report details — simple two-column grid */}
      <div style={{ borderTop: `1px solid #e5e7eb`, paddingTop: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: brand, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
          Report Details
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '2px 0', width: '50%', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>Client: </span><strong>{report.client_first_name} {report.client_last_name}</strong>
              </td>
              <td style={{ padding: '2px 0', width: '50%', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>Company: </span><strong>{report.company_name}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>Location: </span><strong>{location}</strong>
              </td>
              <td style={{ padding: '2px 0', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>Annual Hours: </span><strong>{report.hours_worked.toLocaleString()}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>Tax Year: </span><strong>{report.report_year}</strong>
              </td>
              <td style={{ padding: '2px 0', color: '#374151' }}>
                <span style={{ color: '#9ca3af' }}>Date Completed: </span><strong>{dateStr}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Page>
  )
}

// ─── Pages 2+: Task Breakdowns ────────────────────────────────────────────────
function TaskBreakdownPages({ report, advisor, tasks, categoryTotals, startPage, totalPages }) {
  const { brand } = advisor
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
    totalPages,
  }

  const catList = CATEGORY_ORDER.filter(id => tasksByCategory[id])
  const pages   = []
  for (let i = 0; i < catList.length; i += CATS_PER_PAGE) pages.push(catList.slice(i, i + CATS_PER_PAGE))

  return pages.map((catIds, pageIdx) => (
    <Page key={pageIdx} {...pageProps} pageNum={startPage + pageIdx}>
      {catIds.map(catId => {
        const cat      = CATEGORIES[catId]
        const catTot   = categoryTotals[catId]
        const catTasks = tasksByCategory[catId] ?? []
        const catColor = cat.color ?? brand
        return (
          <div key={catId} style={{ marginBottom: '26px' }}>
            {/* Category header — uses each category's own color */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              borderLeft: `5px solid ${catColor}`,
              paddingLeft: '10px', marginBottom: '4px',
            }}>
              <strong style={{ fontSize: '13px', color: '#111827' }}>{cat.label}</strong>
              <span style={{ fontSize: '10.5px', color: '#6b7280' }}>
                {catTot?.pctOfTotal}% of time &nbsp;·&nbsp; {catTot?.hoursPerYear.toLocaleString()} hrs/yr &nbsp;·&nbsp; {catTot?.pctOfCompensation}% of compensation
              </span>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1f2937' }}>
                  {['Task', 'Proficiency', '% of Category', '% of Total Hours', 'Hours / Year', 'Hourly Rate', 'Annual Total'].map(h => (
                    <th key={h} style={{
                      padding: '6px 9px',
                      textAlign: (h === 'Task' || h === 'Proficiency') ? 'left' : 'right',
                      fontWeight: 600, color: 'white', fontSize: '10.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catTasks.map((task, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: i % 2 === 0 ? 'white' : '#f9fafb',
                  }}>
                    <td style={{ padding: '6px 9px' }}>{task.title}</td>
                    <td style={{ padding: '6px 9px', textTransform: 'capitalize', color: '#4b5563' }}>{task.proficiency}</td>
                    <td style={{ padding: '6px 9px', textAlign: 'right' }}>{task.pctOfCategory}%</td>
                    <td style={{ padding: '6px 9px', textAlign: 'right' }}>{task.pctOfTotal}%</td>
                    <td style={{ padding: '6px 9px', textAlign: 'right' }}>{task.hoursPerYear.toLocaleString()}</td>
                    <td style={{ padding: '6px 9px', textAlign: 'right' }}>${task.hourlyWage.toFixed(2)}</td>
                    <td style={{ padding: '6px 9px', textAlign: 'right', fontWeight: 700, color: brand }}>{formatCurrency(task.annualWage)}</td>
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

// ─── Methodology ──────────────────────────────────────────────────────────────
function Page5Methodology({ report, advisor, pageNum, totalPages }) {
  return (
    <Page {...advisor}
      clientName={`${report.client_first_name} ${report.client_last_name}`}
      companyName={report.company_name}
      reportYear={report.report_year}
      pageNum={pageNum} totalPages={totalPages}>

      <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px', color: '#111827' }}>
        How Is This Compensation Figure Calculated?
      </p>

      <p style={{ lineHeight: 1.75, marginBottom: '11px' }}>
        {advisor.firmName} determines your Reasonable Compensation figure using objective,
        third-party wage information published by the Bureau of Labor Statistics (BLS). The analysis
        is based on your responses to a structured interview along with current BLS Occupational
        Employment and Wage Statistics data for your specific occupation and location.
      </p>

      <p style={{ lineHeight: 1.75, marginBottom: '11px' }}>
        For purposes of this analysis, the BLS definition of full-time employment&mdash;2,080 hours
        per year (40 hours per week)&mdash;is used as the benchmark. This standard has been
        recognized by the Tax Court and IRS expert witnesses in <em>McAlary v. IRS</em>. Where an
        owner works more than 40 hours per week, the Reasonable Compensation figure reflects
        what a full-time employee would earn in that role rather than an overtime-adjusted amount.
      </p>

      <p style={{ lineHeight: 1.75, marginBottom: '11px' }}>
        The analysis accounts for the full range of duties you perform across your business,
        assigning an appropriate market wage to each function and combining them into a single
        annual figure that reflects what it would cost to replace you across all of your roles.
      </p>

      <p style={{ lineHeight: 1.75, marginBottom: '8px' }}>
        The compensation estimate is derived from:
      </p>
      <ul style={{ paddingLeft: '22px', lineHeight: 2.0, marginBottom: '14px' }}>
        <li>Your responses to the intake interview</li>
        <li>Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) data</li>
      </ul>

      <p style={{ lineHeight: 1.75, marginBottom: '16px' }}>
        This figure encompasses taxable Medicare wages and flexible spending contributions. It
        excludes non-taxable fringe benefits&mdash;such as employer-paid health coverage, vehicle
        allowances, stock options, and any items not reflected on a W-2 as Medicare wages.
      </p>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
        <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '9px', color: '#111827' }}>About the Cost Approach</p>
        <p style={{ lineHeight: 1.75, marginBottom: '10px' }}>
          This report applies the Cost Approach to valuing reasonable compensation. Under this
          methodology, each distinct function the owner performs is identified, assigned a
          market-based hourly rate corresponding to the owner's proficiency level, and weighted
          by the proportion of time spent on that function. The weighted amounts are then summed
          to produce a total replacement cost.
        </p>
        <p style={{ lineHeight: 1.75, marginBottom: '10px' }}>
          Unlike approaches that focus solely on the owner's primary role, the Cost Approach
          captures the full economic contribution of an owner who wears multiple hats&mdash;handling
          not just their core professional duties but also management, finance, marketing, and
          other operational functions.
        </p>
        <p style={{ lineHeight: 1.75 }}>
          This approach is especially well-suited to closely-held businesses where the owner
          serves in several capacities simultaneously, and is widely recognized by the IRS and
          Tax Court for S-corporation reasonable compensation determinations.
        </p>
      </div>
    </Page>
  )
}

// ─── Other Considerations ─────────────────────────────────────────────────────
function Page6Considerations({ report, advisor, pageNum, totalPages }) {
  return (
    <Page {...advisor}
      clientName={`${report.client_first_name} ${report.client_last_name}`}
      companyName={report.company_name}
      reportYear={report.report_year}
      pageNum={pageNum} totalPages={totalPages}>

      <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '14px', color: '#111827' }}>
        Factors That May Warrant Adjusting the Compensation Figure
      </p>

      <p style={{ lineHeight: 1.75, marginBottom: '10px' }}>
        For most shareholder-employees, the figure produced by this analysis will serve as a reliable
        starting point without further modification. That said, {advisor.firmName} may consider
        additional context before arriving at a final recommendation. The following factors are
        illustrative, not exhaustive, and {advisor.firmName} reserves the right to apply judgment
        in circumstances not listed here:
      </p>

      <ul style={{ paddingLeft: '22px', lineHeight: 2.1, marginBottom: '16px' }}>
        {[
          'Compensation paid to non-owner employees performing similar duties',
          'The owner\'s compensation history in prior years',
          'Significant travel demands associated with the role',
          'Personal guarantees of company debt by the owner',
          'Client relationships or key contracts that depend on the owner personally',
          'Overall financial health and profitability of the business',
          'History and pattern of distributions relative to salary',
        ].map(item => <li key={item} style={{ color: '#374151' }}>{item}</li>)}
      </ul>

      <p style={{ lineHeight: 1.75, marginBottom: '10px' }}>
        Courts have applied a range of multi-factor tests when evaluating reasonable compensation
        in disputed cases. {advisor.firmName} may benchmark the figure in this report against
        one or more of these recognized frameworks:
      </p>

      <ol style={{ paddingLeft: '22px', lineHeight: 2.1, marginBottom: '16px' }}>
        <li style={{ color: '#374151' }}>Nine-Factor Analysis Applied by the IRS &mdash; IRS Fact Sheet 2008-25</li>
        <li style={{ color: '#374151' }}>Five-Factor Test &mdash; <em>LabelGraphics, Inc. v. Commissioner</em>, T.C. Memo 1998&ndash;343</li>
        <li style={{ color: '#374151' }}>Ten-Factor Test &mdash; <em>Brewer Quality Homes, Inc. v. Commissioner</em>, T.C. Memo 2003-200</li>
        <li style={{ color: '#374151' }}>Consolidated Court Factor Summary for Reasonable Compensation Review</li>
      </ol>

      <p style={{ lineHeight: 1.75, marginBottom: '8px' }}>
        For further reference on S-corporation compensation requirements:
      </p>
      <ul style={{ paddingLeft: '22px', lineHeight: 2.0 }}>
        <li style={{ color: '#374151' }}>IRS Guidance: S Corporation Compensation and Medical Insurance Issues</li>
        <li style={{ color: '#374151' }}>IRS Guidance: S Corporation Employees, Shareholders and Corporate Officers</li>
        <li style={{ color: '#374151' }}>IRS Fact Sheet 2008-25: Wage Compensation for S Corporation Officers</li>
      </ul>
    </Page>
  )
}

// ─── Task Descriptions ────────────────────────────────────────────────────────
function TaskDescriptionPages({ report, advisor, tasks, startPage, totalPages }) {
  const { brand } = advisor
  const pageProps = {
    ...advisor,
    clientName: `${report.client_first_name} ${report.client_last_name}`,
    companyName: report.company_name,
    reportYear: report.report_year,
    totalPages,
  }

  const unique = []
  const seen   = new Set()
  for (const t of tasks) {
    if (!seen.has(t.title)) { seen.add(t.title); unique.push(t) }
  }
  const half  = Math.ceil(unique.length / 2)
  const pages = [unique.slice(0, half), unique.slice(half)]

  return pages.map((pageTasks, i) => (
    <Page key={i} {...pageProps} pageNum={startPage + i}>
      {i === 0 && (
        <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '18px', color: '#111827' }}>
          Appendix A &mdash; Role Descriptions
        </p>
      )}
      {pageTasks.map((task, j) => (
        <div key={j} style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <div style={{
              width: '10px', height: '10px',
              backgroundColor: CATEGORIES[task.categoryId]?.color ?? brand,
              borderRadius: '50%', flexShrink: 0,
            }} />
            <p style={{ fontWeight: 700, fontSize: '12.5px', margin: 0, color: '#111827' }}>{task.title}</p>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic' }}>SOC {task.soc}</span>
          </div>
          <p style={{ lineHeight: 1.7, color: '#4b5563', margin: 0, paddingLeft: '20px' }}>{task.description}</p>
        </div>
      ))}
    </Page>
  ))
}

// ─── Corporate Minutes ────────────────────────────────────────────────────────
function Page9Minutes({ report, advisor, totalCompensation, pageNum, totalPages }) {
  return (
    <Page {...advisor}
      clientName={`${report.client_first_name} ${report.client_last_name}`}
      companyName={report.company_name}
      reportYear={report.report_year}
      pageNum={pageNum} totalPages={totalPages}>

      <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#111827' }}>
        Suggested Language for Corporate Minutes
      </p>
      <p style={{ lineHeight: 1.75, marginBottom: '20px' }}>
        To maintain a complete compliance record, {advisor.firmName} recommends that the
        Reasonable Compensation figure established by this report be formally adopted in the
        S Corporation&rsquo;s board of directors minutes. The following template may be adapted
        for that purpose:
      </p>

      <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '12.5px', marginBottom: '16px', letterSpacing: '0.03em' }}>
        ACTION BY WRITTEN CONSENT OF THE BOARD OF DIRECTORS OF {report.company_name.toUpperCase()}
      </p>

      <p style={{ lineHeight: 1.75, marginBottom: '6px' }}>
        The undersigned, constituting all of the directors of {report.company_name} (the
        &ldquo;Corporation&rdquo;), hereby waive any required notice and consent to the following
        corporate action as of:
      </p>
      <p style={{ marginBottom: '22px' }}>______________________ , 20___ :</p>
      <p style={{ lineHeight: 1.75, marginBottom: '28px' }}>
        <strong>RESOLVED,</strong> that the Corporation hereby adopts the Reasonable Compensation
        analysis prepared by {advisor.firmName}, a copy of which is incorporated herein by
        reference, and that {report.client_first_name} {report.client_last_name} shall receive
        annual salary compensation of <strong>{formatCurrency(totalCompensation)}</strong> for
        the services described therein.
      </p>

      <div style={{ border: '1px solid #d97706', borderLeft: '5px solid #d97706', borderRadius: '4px', padding: '14px 16px', backgroundColor: '#fffbeb' }}>
        <p style={{ fontWeight: 700, color: '#92400e', marginBottom: '8px', fontSize: '12px' }}>Important Notice</p>
        <p style={{ lineHeight: 1.7, marginBottom: '8px', color: '#374151' }}>
          This template is provided for general reference only. It illustrates the type of
          resolution a board of directors might adopt when formally approving a compensation
          figure supported by an independent analysis.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '8px', color: '#374151' }}>
          {advisor.firmName} does not practice law and makes no representation that this
          language satisfies the procedural or substantive requirements of any particular state
          regarding board actions or the content of corporate minutes.
        </p>
        <p style={{ fontWeight: 600, color: '#374151' }}>
          The Corporation should consult qualified legal counsel before finalizing and executing
          any corporate minutes.
        </p>
      </div>
    </Page>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ReportDocument({ report, advisorProfile, tasks, totalCompensation, categoryTotals }) {
  const { brand, brandLt, brandXl } = makeBrandColors(advisorProfile?.brand_color)
  const advisor = {
    logoUrl:     advisorProfile?.logo_url     ?? null,
    firmName:    advisorProfile?.firm_name    ?? 'Your Firm',
    advisorName: advisorProfile?.advisor_name ?? 'Your Advisor',
    brand,
    brandLt,
    brandXl,
  }

  const activeCats    = CATEGORY_ORDER.filter(id => categoryTotals[id])
  const numTaskPages  = Math.ceil(activeCats.length / CATS_PER_PAGE)
  const methodPage    = 2 + numTaskPages
  const considPage    = methodPage + 1
  const descStartPage = considPage + 1
  const minutesPage   = descStartPage + 2
  const totalPages    = minutesPage

  return (
    <div id="report-document" style={{ backgroundColor: '#e5e7eb' }}>
      <Page1
        report={report} advisor={advisor}
        totalCompensation={totalCompensation} categoryTotals={categoryTotals}
        totalPages={totalPages}
      />
      <TaskBreakdownPages
        report={report} advisor={advisor}
        tasks={tasks} categoryTotals={categoryTotals}
        startPage={2} totalPages={totalPages}
      />
      <Page5Methodology report={report} advisor={advisor} pageNum={methodPage} totalPages={totalPages} />
      <Page6Considerations report={report} advisor={advisor} pageNum={considPage} totalPages={totalPages} />
      <TaskDescriptionPages report={report} advisor={advisor} tasks={tasks} startPage={descStartPage} totalPages={totalPages} />
      <Page9Minutes report={report} advisor={advisor} totalCompensation={totalCompensation} pageNum={minutesPage} totalPages={totalPages} />
    </div>
  )
}
