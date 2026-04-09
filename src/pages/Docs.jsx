import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const ARTICLES = [
  { id: 'getting-started',        title: 'Getting Started' },
  { id: 'creating-a-report',      title: 'Creating a Report' },
  { id: 'understanding-results',  title: 'Understanding Your Results' },
  { id: 'downloading-sharing',    title: 'Downloading & Sharing' },
]

// ── Article content ────────────────────────────────────────────────────────────

function GettingStarted() {
  return (
    <article>
      <h1>Getting Started</h1>
      <p className="lead">
        RC Genie is a tool for tax advisors and CPAs that generates IRS-defensible
        reasonable compensation reports for S-corporation owner-employees. This guide
        walks you through creating an account and navigating the dashboard.
      </p>

      <h2>What is Reasonable Compensation?</h2>
      <p>
        The IRS requires S-corporation owner-employees to pay themselves a "reasonable
        salary" before taking distributions. Reasonable compensation is defined as the
        amount a similar business would pay an unrelated employee to perform the same
        duties. RC Genie uses the Cost Approach — the same methodology accepted by the
        IRS and Tax Court — to calculate that figure based on Bureau of Labor Statistics
        wage data.
      </p>

      <h2>Creating Your Account</h2>
      <ol>
        <li>
          Go to the RC Genie homepage and click <strong>Get started free</strong>.
        </li>
        <li>
          Enter your name, email address, firm name, and a password, then click
          <strong> Create account</strong>.
        </li>
        <li>
          Check your inbox for a confirmation email from RC Genie and click
          <strong> Confirm my account</strong>. You will not be able to log in until
          your email address is verified.
        </li>
        <li>
          Once confirmed, log in at the RC Genie homepage and you will be taken to
          your dashboard.
        </li>
      </ol>

      <h2>The Dashboard</h2>
      <p>
        The dashboard is your home base inside RC Genie. From here you can:
      </p>
      <ul>
        <li>Start a new reasonable compensation report for a client</li>
        <li>View, edit, or download any previously created report</li>
        <li>Access your firm profile settings</li>
      </ul>
      <p>
        Each report card on the dashboard shows the client's name, company, report year,
        location, and the calculated reasonable compensation figure. Reports are listed
        most recently created first.
      </p>

      <h2>Firm Profile</h2>
      <p>
        Click <strong>My Profile</strong> in the top navigation to update your firm
        information. Your firm name and advisor name appear in the header of every
        report you generate, so it is worth filling these out before creating your
        first report.
      </p>

      <h2>Getting Help</h2>
      <p>
        If you run into any issues, click the <strong>Help</strong> link in the
        navigation bar to send an email to our support team at{' '}
        <a href="mailto:support@rcgenie.app">support@rcgenie.app</a>. We typically
        respond within one business day.
      </p>
    </article>
  )
}

function CreatingAReport() {
  return (
    <article>
      <h1>Creating a Report</h1>
      <p className="lead">
        RC Genie walks you through a six-step wizard to gather the information needed
        to calculate a defensible reasonable compensation figure. Each step is
        explained below.
      </p>

      <h2>Starting a New Report</h2>
      <p>
        From the dashboard, click <strong>New Report</strong>. This opens the wizard.
        You can navigate back to any previous step using the numbered progress bar at
        the top of the page. Your progress is not saved until you complete the final
        step and generate the report.
      </p>

      <h2>Step 1 — Client Information</h2>
      <p>
        Enter the S-corporation owner's first and last name, the company name, and the
        report year. The report year is typically the tax year for which you are
        documenting reasonable compensation. RC Genie supports up to six years of
        lookback, so you can create prior-year reports as needed.
      </p>

      <h2>Step 2 — Hours & Location</h2>
      <p>
        Select how many hours per year the owner works in the business. The IRS and Tax
        Court use 2,080 hours (40 hours per week) as the definition of full-time
        employment, and this is the default. If the owner works significantly more or
        fewer hours, select the appropriate option.
      </p>
      <p>
        Next, select the owner's state and, if applicable, their metropolitan area
        (MSA). Selecting a metro area unlocks location-specific wage data from the BLS
        Occupational Employment and Wage Statistics survey, which improves accuracy
        significantly for most occupations. If no metro area is selected, RC Genie uses
        statewide BLS wage data instead.
      </p>

      <h2>Step 3 — Industry</h2>
      <p>
        Select the industry that best describes the owner's business. RC Genie organizes
        industries into sectors such as Financial Services, Healthcare, Professional
        Services, Trades, Real Estate, and others. The industry you select determines
        which job titles are available in the "My Business" category in Step 5.
      </p>
      <p>
        Choose the industry that most closely matches the primary work the business
        performs — not the legal entity type. For example, a financial advisor who
        happens to operate as a holding company should still select Financial Services.
      </p>

      <h2>Step 4 — Time Allocation</h2>
      <p>
        Estimate how the owner splits their working time across five categories:
      </p>
      <ul>
        <li><strong>My Business</strong> — The core work of the business (e.g., seeing patients, advising clients, performing services)</li>
        <li><strong>Management</strong> — Running and overseeing the company</li>
        <li><strong>Marketing</strong> — Business development, client acquisition, social media</li>
        <li><strong>Finance</strong> — Bookkeeping, invoicing, payroll</li>
        <li><strong>Human Resources</strong> — Hiring, managing employees, HR compliance</li>
      </ul>
      <p>
        The five percentages must add up to exactly 100%. Use the sliders or type values
        directly into the input fields. For most sole practitioners, the majority of
        time (often 70–90%) goes to My Business, with small amounts allocated to the
        remaining categories.
      </p>

      <h2>Step 5 — Tasks & Proficiency</h2>
      <p>
        For each category that has allocated time, select the specific job task or tasks
        the owner performs. If the owner spends time on more than one task within a
        category, you can select multiple tasks and split the percentage of time
        between them.
      </p>
      <p>
        For each task, choose a <strong>proficiency level</strong>:
      </p>
      <ul>
        <li><strong>Entry</strong> — Less than two years of experience or below-average skill level (25th percentile BLS wage)</li>
        <li><strong>Average</strong> — Typical proficiency for the occupation (50th percentile BLS wage)</li>
        <li><strong>Experienced</strong> — Five or more years of experience or above-average skill level (75th percentile BLS wage)</li>
      </ul>
      <p>
        Wage figures shown alongside each proficiency level are pulled in real time from
        BLS data for the location selected in Step 2. The geographic level used (metro
        area, state, or national) is shown next to each task so you can see exactly
        where the data comes from.
      </p>
      <p>
        When you click <strong>Review Report</strong>, RC Genie fetches the latest
        location-adjusted BLS wages and applies them to your selections before
        proceeding.
      </p>

      <h2>Step 6 — Review & Generate</h2>
      <p>
        The review screen shows a full breakdown of the calculated reasonable
        compensation figure before you generate the report. You will see:
      </p>
      <ul>
        <li>The total estimated annual reasonable compensation</li>
        <li>A summary of client information and inputs</li>
        <li>Each category with its time allocation, hours per year, and total compensation</li>
        <li>Every task with its proficiency level, hours, hourly wage, and annual wage contribution</li>
      </ul>
      <p>
        If anything looks incorrect, use the back button to return to the relevant step
        and make adjustments. When you are satisfied, click{' '}
        <strong>Generate Report &amp; PDF</strong> to save the report and produce the
        PDF document.
      </p>
    </article>
  )
}

function UnderstandingResults() {
  return (
    <article>
      <h1>Understanding Your Results</h1>
      <p className="lead">
        Once a report is generated, RC Genie produces a detailed PDF that you can
        review with your client and attach to their tax file. Here is what each
        section of the report contains and how to interpret it.
      </p>

      <h2>The Reasonable Compensation Figure</h2>
      <p>
        The top of the report displays the calculated annual reasonable compensation
        figure. This represents what it would cost to hire one or more employees to
        perform all of the duties the owner performs for the business, based on
        current BLS wage data and the owner's specific location, hours, and
        proficiency levels.
      </p>
      <p>
        This figure is the recommended minimum salary for the S-corporation
        owner-employee. The IRS expects the owner to take at least this amount as
        W-2 wages before taking any distributions from the company.
      </p>

      <h2>The Time and Compensation Charts</h2>
      <p>
        Two donut charts appear on the cover page of the report:
      </p>
      <ul>
        <li>
          <strong>Your Time</strong> — Shows what percentage of working hours is
          spent in each category. This mirrors the allocation entered in Step 4 of
          the wizard.
        </li>
        <li>
          <strong>Your Compensation</strong> — Shows what percentage of total
          reasonable compensation comes from each category. These percentages often
          differ from the time allocation because some job roles command higher wages
          than others.
        </li>
      </ul>

      <h2>The Task Breakdown Table</h2>
      <p>
        The body of the report contains a detailed table for each category, showing
        every task selected. Each row includes:
      </p>
      <ul>
        <li><strong>Task</strong> — The job title (e.g., Certified Financial Planner, Marketing Manager)</li>
        <li><strong>Proficiency</strong> — The level selected (Entry, Average, or Experienced)</li>
        <li><strong>% of Category</strong> — What portion of that category's time goes to this task</li>
        <li><strong>% of Total Hours</strong> — What portion of all working hours goes to this task</li>
        <li><strong>Hours per Year</strong> — Calculated from total annual hours and the percentages above</li>
        <li><strong>Hourly Wage</strong> — The BLS median wage for this occupation at the selected location and proficiency level</li>
        <li><strong>Annual Wage</strong> — Hours per year multiplied by the hourly wage</li>
      </ul>
      <p>
        The sum of all annual wage figures across every task equals the total
        reasonable compensation shown on the cover page.
      </p>

      <h2>Wage Data Source</h2>
      <p>
        All wage figures come from the Bureau of Labor Statistics Occupational
        Employment and Wage Statistics (OEWS) survey, published annually each spring.
        RC Genie uses the median hourly wage (50th percentile) for "Average" proficiency,
        the 25th percentile for "Entry," and the 75th percentile for "Experienced."
        Location-specific data is used when available — metro area first, then
        statewide, then national.
      </p>

      <h2>Methodology Page</h2>
      <p>
        Every report includes a methodology page explaining the Cost Approach and
        citing the BLS data used. This page is important for IRS defensibility — it
        demonstrates that the figure was calculated using an objective, third-party
        wage data source and a recognized valuation methodology.
      </p>
      <p>
        The report also references relevant IRS guidance including IRS Fact Sheet
        2008-25 and the McAlary v. IRS case, which established how courts evaluate
        reasonable compensation for S-corporation owners.
      </p>

      <h2>Other Considerations</h2>
      <p>
        The report includes a section listing factors that may warrant adjusting the
        calculated figure up or down, including:
      </p>
      <ul>
        <li>Compensation of non-owner employees at the company</li>
        <li>The owner's salary history</li>
        <li>Personal guarantees of business debt</li>
        <li>Key client relationships or contracts tied to the owner</li>
        <li>The financial condition of the company</li>
        <li>Distribution history relative to salary</li>
      </ul>
      <p>
        These factors are drawn from the IRS Nine Factors and Tax Court tests used
        to stress-test reasonable compensation figures in audits and litigation.
        Review these with your client and document any adjustments you make to the
        calculated figure.
      </p>

      <h2>Task Descriptions (Appendix A)</h2>
      <p>
        The appendix includes the full BLS job description for every occupation
        selected in the wizard. These descriptions explain what each role entails and
        can help justify why a particular job title was chosen to represent the
        owner's duties.
      </p>
    </article>
  )
}

function DownloadingSharing() {
  return (
    <article>
      <h1>Downloading &amp; Sharing</h1>
      <p className="lead">
        Once a report is generated, RC Genie gives you several ways to use and share
        the results with your client.
      </p>

      <h2>Downloading the PDF</h2>
      <p>
        From the report view, click <strong>Download PDF</strong> in the top action
        bar. The report will download as a PDF file named with the client's name and
        report year, making it easy to file and identify.
      </p>
      <p>
        The PDF is print-ready and formatted for professional presentation to clients.
        It includes your firm's name in the report header, which is pulled from your
        Firm Profile settings.
      </p>

      <h2>Editing a Report</h2>
      <p>
        If you need to make changes after generating a report — for example, if the
        client's time allocation was entered incorrectly — click the <strong>Edit</strong>{' '}
        button in the top action bar. This reopens the wizard pre-populated with the
        existing data. Step through the wizard and re-generate the report when done.
      </p>
      <p>
        You can also access any report for editing from the dashboard by clicking the
        three-dot menu on a report card and selecting <strong>Edit</strong>.
      </p>

      <h2>Corporate Minutes Language</h2>
      <p>
        The last page of every report contains sample language for incorporating the
        reasonable compensation figure into the S-corporation's board of directors
        minutes. Most tax professionals recommend documenting the adoption of the
        reasonable compensation figure in corporate minutes each year as part of a
        complete compliance record.
      </p>
      <p>
        The sample resolution reads approximately:
      </p>
      <blockquote>
        RESOLVED, that the Company adopt the report of [Your Firm], a copy of which
        is attached and, in reliance on such report, pay to [Owner Name] the sum of
        $[Amount] per year as salary for the duties set forth in such report.
      </blockquote>
      <p>
        Fill in the date and have the director(s) sign the minutes. RC Genie
        recommends consulting the client's attorney to confirm the minutes comply
        with state law requirements for the corporation.
      </p>

      <h2>Updating Wages Annually</h2>
      <p>
        The BLS updates its Occupational Employment and Wage Statistics data each
        spring, typically in April or May. RC Genie's wage data is refreshed at that
        time to reflect the latest survey results. Because wages change year to year,
        we recommend generating a fresh reasonable compensation report for each client
        annually — typically when preparing their S-corporation tax return.
      </p>

      <h2>Prior-Year Reports</h2>
      <p>
        If a client needs a reasonable compensation study for a prior tax year —
        for example, in connection with an IRS inquiry or an amended return — you can
        create a report for up to six prior years using the report year selector in
        Step 1 of the wizard. Note that wage data in RC Genie reflects the most
        recent BLS survey; prior-year wage figures are not separately stored.
      </p>
    </article>
  )
}

const ARTICLE_COMPONENTS = {
  'getting-started':       GettingStarted,
  'creating-a-report':     CreatingAReport,
  'understanding-results': UnderstandingResults,
  'downloading-sharing':   DownloadingSharing,
}

// ── Docs page ──────────────────────────────────────────────────────────────────

export default function Docs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const articleId = searchParams.get('article') || 'getting-started'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [articleId])

  const ArticleComponent = ARTICLE_COMPONENTS[articleId] ?? GettingStarted

  function selectArticle(id) {
    setSearchParams({ article: id })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Top nav ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">RC Genie</span>
            </Link>
            <span className="text-gray-300 hidden sm:block">|</span>
            <span className="text-sm font-medium text-gray-500 hidden sm:block">Documentation</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link to="/signup"
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">

          {/* ── Sidebar ── */}
          <aside>
            {/* Mobile article picker */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setMobileMenuOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
              >
                <span>{ARTICLES.find(a => a.id === articleId)?.title}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileMenuOpen && (
                <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden">
                  {ARTICLES.map(a => (
                    <button key={a.id} onClick={() => selectArticle(a.id)}
                      className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 last:border-0 transition-colors
                        ${a.id === articleId ? 'bg-brand-50 text-brand-700 font-medium' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                      {a.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop sidebar */}
            <nav className="hidden lg:block sticky top-24">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Articles
              </p>
              <ul className="space-y-1">
                {ARTICLES.map(a => (
                  <li key={a.id}>
                    <button onClick={() => selectArticle(a.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${a.id === articleId
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium'}`}>
                      {a.title}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Support
                </p>
                <a href="mailto:support@rcgenie.app"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email support
                </a>
              </div>
            </nav>
          </aside>

          {/* ── Article content ── */}
          <main className="docs-content min-w-0">
            <ArticleComponent />

            {/* Article navigation */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between">
              {(() => {
                const idx = ARTICLES.findIndex(a => a.id === articleId)
                const prev = ARTICLES[idx - 1]
                const next = ARTICLES[idx + 1]
                return (
                  <>
                    <div>
                      {prev && (
                        <button onClick={() => selectArticle(prev.id)}
                          className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          {prev.title}
                        </button>
                      )}
                    </div>
                    <div>
                      {next && (
                        <button onClick={() => selectArticle(next.id)}
                          className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
                          {next.title}
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}
