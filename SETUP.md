# RC Genie — Setup Guide

A web application for financial advisors to generate branded Reasonable Compensation reports for S-Corp owners. Hosted at **rcgenie.app**. Built with React + Vite, Supabase, and Netlify.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 + Vite + Tailwind CSS |
| Auth & DB  | Supabase (PostgreSQL + Auth + Storage) |
| Hosting    | Netlify (static site + serverless functions) |
| PDF        | html2pdf.js (client-side) |
| Wage Data  | BLS OES API (via Netlify Function proxy) |

---

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free project.

2. In the Supabase **SQL Editor**, run the entire contents of `supabase/schema.sql`. This creates:
   - `advisor_profiles` table (firm name, advisor name, logo URL)
   - `reports` table (all report data stored as JSON)
   - Row Level Security policies (advisors only see their own data)

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

## Step 2: BLS API Key (Optional but Recommended)

Without a key you get 50 requests/day. With a key: 500/day.

1. Register free at [data.bls.gov/registrationEngine](https://data.bls.gov/registrationEngine/)
2. You'll receive a key by email. Save it for Step 4.

> **Note:** Even without a BLS key, the app works — wage calculations use the embedded 2024 BLS OES fallback data. The API provides state-level geographic adjustments when available.

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

---

## Step 4: Deploy to Netlify

### Option A: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init       # connect to your Netlify account
netlify deploy --prod
```

### Option B: GitHub Integration (Recommended)

1. Push this project to a GitHub repository
2. In Netlify: **Add new site → Import from Git → Select your repo**
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Environment Variables in Netlify

Go to **Site configuration → Environment variables** and add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `BLS_API_KEY` | Your BLS API registration key |

> `BLS_API_KEY` is only used server-side in the Netlify Function — never exposed to the browser.

---

## How It Works

### Report Generation Flow

1. **Advisor signs up** → profile created in Supabase with firm name
2. **Upload logo** → stored in Supabase Storage, public URL saved to profile
3. **New Report wizard** (6 steps):
   - Step 1: Client name & company
   - Step 2: Hours worked/year + state + county
   - Step 3: Industry type (determines "My Business" job titles)
   - Step 4: Time allocation across 5 categories (must total 100%)
   - Step 5: Task selection within each category + proficiency level + time split
   - Step 6: Review with live cost calculation → Save to Supabase
4. **Report view** → Full 9-page report rendered in browser, PDF download via html2pdf.js

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

### BLS API Integration

The Netlify Function at `/.netlify/functions/bls-wages` proxies requests to the BLS OES API, keeping the API key server-side. It fetches state-level wages for each selected occupation's SOC code.

If the API is unavailable or returns no data, the app falls back to the embedded 2024 national BLS OES data in `src/data/occupations.js`.

---

## Project Structure

```
rc-genie/
├── src/
│   ├── data/
│   │   ├── occupations.js      # ~150 BLS job titles with SOC codes & fallback wages
│   │   └── industries.js       # 12 industry types + US states + default allocations
│   ├── utils/
│   │   └── calculations.js     # Cost Approach math
│   ├── context/
│   │   └── AuthContext.jsx     # Supabase auth + advisor profile state
│   ├── pages/
│   │   ├── Login.jsx / Signup.jsx
│   │   ├── Dashboard.jsx       # Report list
│   │   ├── Profile.jsx         # Firm name + logo upload
│   │   ├── NewReport.jsx       # 6-step wizard orchestrator
│   │   └── ReportView.jsx      # Report preview + PDF download
│   └── components/
│       ├── wizard/             # Steps 1–6
│       └── report/
│           ├── ReportDocument.jsx  # Full 9-page report layout
│           └── DonutChart.jsx      # SVG donut chart (works in PDF)
├── netlify/functions/
│   └── bls-wages.js            # BLS API proxy (keeps key server-side)
├── supabase/
│   └── schema.sql              # Run this in Supabase SQL Editor
├── netlify.toml                # Build + function config
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

### Adding Industries

Edit `src/data/industries.js` to add new industry types, and add a corresponding occupation list in `src/data/occupations.js` under `INDUSTRY_OCCUPATIONS`.

### Updating BLS Wage Data

BLS publishes updated OES data annually (typically May). To update:
1. Go to [bls.gov/oes/tables.htm](https://www.bls.gov/oes/tables.htm)
2. Download the national estimates
3. Update the `wages` objects in `src/data/occupations.js`

---

## Updating Wages via BLS API (Future Enhancement)

To fetch fresh wages automatically when generating a report, call the Netlify Function before saving:

```js
const response = await fetch('/.netlify/functions/bls-wages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    socCodes: ['13-1161', '41-4012', ...],  // SOC codes from selected tasks
    stateFips: '18',                          // Indiana = 18
  })
})
const { wages } = await response.json()
// wages['13-1161'] = { entry: 20.97, average: 33.08, experienced: 51.84 }
```

This can be wired into Step 5 or Step 6 of the wizard to replace the hardcoded fallback wages with live state-level data.
