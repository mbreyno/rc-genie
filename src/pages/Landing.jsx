import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'BLS-Backed Wage Data',
    description:
      'Every compensation figure is sourced directly from the Bureau of Labor Statistics Occupational Employment Statistics — the gold standard for reasonable compensation analysis.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'The Many Hats Approach',
    description:
      "S-Corp owners wear many hats. RC Genie's Cost Approach methodology breaks down each role the owner performs — marketing, finance, HR, management, and more — to build a defensible total compensation figure.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Branded PDF Reports',
    description:
      'Generate a polished, multi-page PDF report with your firm name and logo. Hand it directly to your client or include it in their tax file — professional and ready to go.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'State & County Specific',
    description:
      'Wage rates vary significantly by location. RC Genie pulls BLS data for the specific state and metro area where your client works, so the numbers actually reflect their market.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Enter client details',
    description: "Input the S-Corp owner's name, company, location, and hours worked per year.",
  },
  {
    number: '02',
    title: 'Select roles & allocate time',
    description: "Choose the job functions the owner performs and assign the percentage of time spent in each area.",
  },
  {
    number: '03',
    title: 'Generate a branded report',
    description: 'RC Genie calculates total reasonable compensation and produces a professional, client-ready PDF in seconds.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">RC Genie</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link to="/signup"
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pt-20 pb-24 px-6">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-24 w-72 h-72 bg-blue-100 rounded-full opacity-30 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Built for financial advisors &amp; tax professionals
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Reasonable compensation,{' '}
            <span className="text-brand-600">done right.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            RC Genie helps financial advisors and tax professionals establish a defensible reasonable salary
            for S-Corp owner-employees using the IRS-accepted Cost Approach and live BLS wage data —
            and delivers a branded, client-ready PDF report in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-base">
              Start for free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-7 py-3.5 rounded-xl shadow-sm hover:shadow transition-all text-base">
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Mock report stats card */}
        <div className="relative max-w-2xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Sample Report</p>
                <p className="font-bold text-gray-900 text-lg mt-0.5">Deanna Troi — Empathic Counseling Inc.</p>
              </div>
              <span className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">{new Date().getFullYear()}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Total Reasonable Compensation', value: '$127,430', color: 'text-brand-600' },
                { label: 'Hours Worked Per Year',         value: '2,080',    color: 'text-gray-800' },
                { label: 'Roles Analyzed',                value: '12',       color: 'text-gray-800' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'My Business Tasks',       pct: 55, color: 'bg-brand-500' },
                { label: 'Management & Operations', pct: 20, color: 'bg-brand-400' },
                { label: 'Marketing & Sales',       pct: 13, color: 'bg-brand-300' },
                { label: 'Finance & Accounting',    pct: 7,  color: 'bg-blue-300'  },
                { label: 'Human Resources',         pct: 5,  color: 'bg-slate-300' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <p className="text-xs text-gray-500 w-44 shrink-0">{row.label}</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`${row.color} h-2 rounded-full`} style={{ width: `${row.pct}%` }} />
                  </div>
                  <p className="text-xs font-medium text-gray-600 w-8 text-right">{row.pct}%</p>
                </div>
              ))}
            </div>
          </div>
          {/* Subtle shadow glow */}
          <div className="absolute inset-0 rounded-2xl bg-brand-600 opacity-5 blur-2xl -z-10 scale-95" />
        </div>
      </section>

      {/* ── Who it's for ────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Trusted by professionals who serve S-Corp owners
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '💼', title: 'Tax & Accounting Professionals', desc: 'Satisfy IRS reasonable compensation requirements with a documented, data-driven salary figure for every S-Corp client.' },
              { icon: '📊', title: 'Financial Advisors',   desc: 'Help clients understand the tax savings implications of their officer compensation and plan accordingly.' },
              { icon: '⚖️', title: 'Tax Attorneys',        desc: 'Build a defensible compensation record that holds up in audit or litigation with BLS-sourced documentation.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex gap-4">
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Everything you need to document<br className="hidden sm:block" /> reasonable compensation
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A streamlined workflow built around the methodology the IRS expects — no guesswork required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-5 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white">
                <div className="shrink-0 w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1.5">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-brand-600 to-brand-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">How it works</h2>
            <p className="text-brand-200 text-lg max-w-xl mx-auto">
              From client intake to finished report in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Connector line on desktop */}
            <div className="hidden sm:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-brand-400 opacity-50" />

            {STEPS.map((step, i) => (
              <div key={step.number} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-2xl font-extrabold text-white mb-5">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-brand-200 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Ready to generate your first report?
          </h2>
          <p className="text-gray-500 text-lg mb-8">
            Create a free account and produce a professional reasonable compensation report in minutes.
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-base">
            Get started — it's free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700 text-sm">RC Genie</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} RC Genie. Wage data sourced from the U.S. Bureau of Labor Statistics.
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/login"  className="text-gray-400 hover:text-gray-600 transition-colors">Sign in</Link>
            <Link to="/signup" className="text-gray-400 hover:text-gray-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
