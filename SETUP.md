# RC Genie — Setup Guide

A web application for financial advisors to generate branded Reasonable Compensation reports for S-Corp owners. Hosted at **rcgenie.app**. Built with React + Vite, Supabase, and Vercel.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 + Vite + Tailwind CSS |
| Auth & DB  | Supabase (PostgreSQL + Auth + Storage) |
| Hosting    | Vercel (static site + serverless API routes) |
| PDF        | html2pdf.js (client-side) |
| Wage Data  | Pre-built BLS OEWS dataset served by a Vercel API route |
| Billing    | Stripe (Checkout + Billing Portal + webhooks) |

---

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free project.

2. In the Supabase **SQL Editor**, run the entire contents of `supabase/schema.sql`. This creates:
   - `advisor_profiles` table (firm name, advisor name, logo URL, brand color)
   - `reports` table (all report data stored as JSON)
   - Row Level Security policies (advisors only see their own data)

   Incremental changes since the initial schema live in `supabase/migrations/` — apply any that postdate your schema.

3. Create a **Storage bucket** for logos:
   - Go to **Storage** → **New bucket**
   - Name: `advisor-logos`
   - Public: **ON** (logos need to be publicly readable for PDF rendering)

4. Add a storage policy for uploads:
   - Go to Storage → `advisor-logos` → **Policies** → New policy
   - For INSERT: `auth.uid()::text = (storage.foldername(name))[1]`
   - This lets advisors only upload to their own folder

5. Get your credentials from **Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon / public` key → `VITE_SUPABASE_ANON_KEY`

---

## Step 2: BLS Wage Data

Wage data is **pre-built into the repo** at `api/blsWages.json` — no API key or external service is needed at runtime. The Vercel API route reads this file directly.

To refresh the dataset (BLS releases new OEWS data annually, typically each May):

```bash
npm run fetch-bls
```

This downloads the BLS OEWS flat file (~330 MB), extracts hourly wages (25th percentile / median / 75th percentile) for every occupation in `src/data/occupations.js` at national, state, and MSA level, and regenerates `api/blsWages.json`. No registration or API key is required.

---

## Step 3: Local Development

```bash
# Install dependencies
npm install

# Copy the environment file
cp .env.example .env

# Fill in your Supabase credentials in .env:
# VITE_SUPABASE_URL=https://your-project-id.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start dev server
npm run dev
```

The app will be at `http://localhost:5173`.

> **Note:** the `api/` routes (wage lookups, Stripe checkout/portal/webhook) are served by
> Vercel, not Vite. For full local testing run both: `vercel dev --listen 3000` in one
> terminal and `npm run dev` in another — Vite proxies `/api/*` to port 3000 (see
> `vite.config.js`). Without `vercel dev`, wage lookups fall back to embedded national
> data and billing calls fail. To test webhooks locally, also run
> `stripe listen --forward-to localhost:3000/api/stripe-webhook` and put its `whsec_…`
> signing secret in `.env` as `STRIPE_WEBHOOK_SECRET` (with test-mode values for
> `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID`).

---

## Step 4: Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel link       # connect to your Vercel project
vercel --prod
```

### Option B: GitHub Integration (Recommended)

1. Push this project to a GitHub repository
2. In Vercel: **Add New → Project → Import your repo**
3. Vercel auto-detects Vite:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Functions in `api/` are deployed automatically as serverless routes. SPA routing is handled by the rewrite rule in `vercel.json`.

### Environment Variables in Vercel

Go to **Project → Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Settings → API) — server-side only |
| `STRIPE_SECRET_KEY` | Stripe secret key (Dashboard → Developers → API keys) |
| `STRIPE_PRICE_ID` | Price ID of the $9/mo subscription price |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the `/api/stripe-webhook` endpoint |

---

## Step 5: Stripe Subscription Setup

RC Genie is subscription-based: **7-day free trial (no credit card), then $9/month.**

How it works:

- **Trial** — every new advisor profile gets `subscription_status = 'trialing'` and
  `trial_ends_at = now + 7 days` (database defaults; no Stripe objects exist yet).
- **Paywall** — when the trial expires, the app routes to `/subscribe`, which starts a
  Stripe Checkout session (`api/create-checkout-session.js`). Subscribing mid-trial
  credits the remaining trial days (card isn't charged until the trial would have ended).
- **Self-management** — the Profile page's "Manage subscription" button opens the Stripe
  Billing Portal (`api/create-portal-session.js`) where advisors update their payment
  method, view invoices, or cancel.
- **Sync** — `api/stripe-webhook.js` is the only writer of subscription state. It handles
  `checkout.session.completed`, `customer.subscription.updated`, and
  `customer.subscription.deleted`, mapping Stripe's status (`active`, `past_due`,
  `canceled`, …) onto `advisor_profiles`. Failed payments flip the account to `past_due`,
  which routes the advisor to a fix-payment screen.
- **Enforcement** — access checks live in `src/utils/subscription.js` +
  `SubscribedRoute` in `App.jsx`; the database also refuses new report INSERTs without
  an active trial/subscription (RLS policy), and subscription columns are not writable
  by clients (column-level grants).

Stripe-side objects (product, $9/mo price, webhook endpoint pointing at
`https://rcgenie.app/api/stripe-webhook`, billing portal configuration) are created
once per mode (test/live) via the Stripe CLI or dashboard.

---

## How It Works

### Report Generation Flow

1. **Advisor signs up** → profile created in Supabase with firm name
2. **Upload logo** → stored in Supabase Storage, public URL saved to profile
3. **New Report wizard** (6 steps):
   - Step 1: Client name & company
   - Step 2: Hours worked/year + state + county/metro area
   - Step 3: Industry type (determines "My Business" job titles)
   - Step 4: Time allocation across 5 categories (must total 100%)
   - Step 5: Task selection within each category + proficiency level + time split
   - Step 6: Review with live cost calculation → Save to Supabase (draft auto-saved)
4. **Report view** → Full report rendered in browser with the advisor's brand color, PDF download via html2pdf.js

### Wage Calculation (Cost Approach)

For each task:
```
Annual Wage = (% of total hours / 100) × Total Hours Worked × BLS Hourly Wage
```

Total Reasonable Compensation = sum of all task annual wages.

BLS wage levels by proficiency:
- **Entry**: 25th percentile hourly wage
- **Average**: Median hourly wage
- **Experienced**: 75th percentile hourly wage

### Location-Adjusted Wages

In Step 5, the wizard POSTs the selected SOC codes plus the client's state and metro area to `/api/bls-wages`:

```js
const res = await fetch('/api/bls-wages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    socCodes: ['13-1161', '41-4012'],
    stateFips: '18',        // Indiana
    msaCode: '26900',       // Indianapolis-Carmel metro (optional)
  }),
})
const { wages, geoLevel } = await res.json()
// wages['13-1161'] = { entry: 20.97, average: 33.08, experienced: 51.84 }
// geoLevel = 'msa' | 'state' | 'national'
```

The route looks up wages in `api/blsWages.json` with priority **MSA → state → national**. If the request fails (e.g. running under plain Vite locally), the app falls back to the embedded national wages in `src/data/occupations.js`.

---

## Project Structure

```
rc-genie/
├── api/
│   ├── bls-wages.js            # Vercel API route: location-adjusted wage lookup
│   └── blsWages.json           # Pre-built BLS OEWS dataset (regenerate via npm run fetch-bls)
├── scripts/
│   └── fetch-bls-data.js       # Downloads BLS flat files and rebuilds api/blsWages.json
├── src/
│   ├── data/
│   │   ├── occupations.js      # ~150 BLS job titles with SOC codes & fallback wages
│   │   ├── industries.js       # 12 industry types + US states + default allocations
│   │   ├── msas.js             # Metro areas (MSA codes) by state
│   │   └── blsOccupations.js   # Full BLS occupation reference
│   ├── utils/
│   │   └── calculations.js     # Cost Approach math
│   ├── context/
│   │   └── AuthContext.jsx     # Supabase auth + advisor profile state
│   ├── pages/
│   │   ├── Landing.jsx         # Public landing page
│   │   ├── Login.jsx / Signup.jsx
│   │   ├── ForgotPassword.jsx / ResetPassword.jsx
│   │   ├── Dashboard.jsx       # Report list
│   │   ├── Profile.jsx         # Firm name, logo upload, brand color
│   │   ├── Docs.jsx            # In-app documentation
│   │   ├── NewReport.jsx       # 6-step wizard orchestrator
│   │   └── ReportView.jsx      # Report preview + PDF download
│   └── components/
│       ├── wizard/             # Steps 1–6
│       └── report/
│           ├── ReportDocument.jsx  # Full report layout
│           └── DonutChart.jsx      # SVG donut chart (works in PDF)
├── supabase/
│   ├── schema.sql              # Run this in Supabase SQL Editor
│   └── migrations/             # Incremental schema changes
├── vercel.json                 # SPA rewrite rule (all non-/api routes → index.html)
└── .env.example                # Copy to .env for local dev
```

---

## Customization

### Adding Occupations

Edit `src/data/occupations.js` to add job titles. Each occupation needs:
```js
{
  id: 'unique_id',
  title: 'Job Title',
  soc: 'XX-XXXX',        // BLS SOC code
  description: '...',     // From BLS O*NET
  wages: {
    entry: 00.00,          // BLS 25th pct hourly
    average: 00.00,        // BLS median hourly
    experienced: 00.00,    // BLS 75th pct hourly
  }
}
```

After adding occupations, run `npm run fetch-bls` to pull their state/MSA wage data into `api/blsWages.json`.

### Adding Industries

Edit `src/data/industries.js` to add new industry types, and add a corresponding occupation list in `src/data/occupations.js` under `INDUSTRY_OCCUPATIONS`.

### Updating BLS Wage Data

Run `npm run fetch-bls` annually (each May, after BLS publishes new OEWS data). This rebuilds `api/blsWages.json`; commit and redeploy to pick up the new wages. Update the fallback `wages` objects in `src/data/occupations.js` at the same time if desired.
