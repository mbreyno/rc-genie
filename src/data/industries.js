/**
 * Industry definitions for the "My Business" category.
 * Each industry maps to a set of pre-defined BLS occupations
 * and provides a suggested default time allocation.
 */

export const INDUSTRIES = [
  {
    id: 'marketing_agency',
    label: 'Marketing / Advertising Agency',
    icon: '📣',
    description: 'Digital marketing, advertising, social media, SEO/SEM, branding, and public relations',
    defaultMyBusinessPct: 55,
  },
  {
    id: 'accounting_cpa',
    label: 'Accounting / CPA Firm',
    icon: '📊',
    description: 'Tax preparation, bookkeeping, auditing, financial consulting, and advisory services',
    defaultMyBusinessPct: 60,
  },
  {
    id: 'medical_practice',
    label: 'Medical / Healthcare Practice',
    icon: '⚕️',
    description: 'Medical, dental, veterinary, chiropractic, or other healthcare services',
    defaultMyBusinessPct: 65,
  },
  {
    id: 'law_firm',
    label: 'Law Firm / Legal Services',
    icon: '⚖️',
    description: 'Legal representation, litigation, contracts, estate planning, and compliance',
    defaultMyBusinessPct: 65,
  },
  {
    id: 'it_technology',
    label: 'IT / Technology',
    icon: '💻',
    description: 'Software development, IT services, consulting, cybersecurity, and technology products',
    defaultMyBusinessPct: 60,
  },
  {
    id: 'construction',
    label: 'Construction / Contracting',
    icon: '🏗️',
    description: 'General contracting, specialty trades, architecture, and engineering services',
    defaultMyBusinessPct: 55,
  },
  {
    id: 'real_estate',
    label: 'Real Estate',
    icon: '🏘️',
    description: 'Residential or commercial real estate sales, brokerage, property management, and investment',
    defaultMyBusinessPct: 60,
  },
  {
    id: 'restaurant_food',
    label: 'Restaurant / Food Service',
    icon: '🍽️',
    description: 'Restaurants, catering, food trucks, and food production/distribution businesses',
    defaultMyBusinessPct: 55,
  },
  {
    id: 'retail',
    label: 'Retail',
    icon: '🛍️',
    description: 'Brick-and-mortar or e-commerce retail, consumer products, and merchandise',
    defaultMyBusinessPct: 55,
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: '🛡️',
    description: 'Insurance sales, underwriting, claims management, and financial services',
    defaultMyBusinessPct: 60,
  },
  {
    id: 'consulting',
    label: 'Consulting / Professional Services',
    icon: '💼',
    description: 'Management consulting, business advisory, strategy, and specialized professional services',
    defaultMyBusinessPct: 60,
  },
  {
    id: 'other',
    label: 'Other / General Business',
    icon: '🏢',
    description: 'Businesses not listed above — select tasks will be generic business operations roles',
    defaultMyBusinessPct: 50,
  },
];

// Default category time allocations (percentages) by industry
// These are starting suggestions; users adjust them in the wizard
export const DEFAULT_ALLOCATIONS = {
  marketing_agency:  { marketing: 17, finance: 3,  hr: 5,  management: 20, myBusiness: 55 },
  accounting_cpa:    { marketing: 5,  finance: 20, hr: 5,  management: 10, myBusiness: 60 },
  medical_practice:  { marketing: 5,  finance: 10, hr: 10, management: 10, myBusiness: 65 },
  law_firm:          { marketing: 5,  finance: 10, hr: 10, management: 10, myBusiness: 65 },
  it_technology:     { marketing: 10, finance: 10, hr: 5,  management: 15, myBusiness: 60 },
  construction:      { marketing: 10, finance: 10, hr: 5,  management: 20, myBusiness: 55 },
  real_estate:       { marketing: 15, finance: 10, hr: 5,  management: 10, myBusiness: 60 },
  restaurant_food:   { marketing: 10, finance: 10, hr: 10, management: 15, myBusiness: 55 },
  retail:            { marketing: 15, finance: 10, hr: 10, management: 10, myBusiness: 55 },
  insurance:         { marketing: 15, finance: 10, hr: 5,  management: 10, myBusiness: 60 },
  consulting:        { marketing: 10, finance: 10, hr: 10, management: 10, myBusiness: 60 },
  other:             { marketing: 15, finance: 10, hr: 10, management: 15, myBusiness: 50 },
};

// Standard US states with FIPS codes (for BLS API queries)
export const US_STATES = [
  { fips: '01', abbr: 'AL', name: 'Alabama' },
  { fips: '02', abbr: 'AK', name: 'Alaska' },
  { fips: '04', abbr: 'AZ', name: 'Arizona' },
  { fips: '05', abbr: 'AR', name: 'Arkansas' },
  { fips: '06', abbr: 'CA', name: 'California' },
  { fips: '08', abbr: 'CO', name: 'Colorado' },
  { fips: '09', abbr: 'CT', name: 'Connecticut' },
  { fips: '10', abbr: 'DE', name: 'Delaware' },
  { fips: '12', abbr: 'FL', name: 'Florida' },
  { fips: '13', abbr: 'GA', name: 'Georgia' },
  { fips: '15', abbr: 'HI', name: 'Hawaii' },
  { fips: '16', abbr: 'ID', name: 'Idaho' },
  { fips: '17', abbr: 'IL', name: 'Illinois' },
  { fips: '18', abbr: 'IN', name: 'Indiana' },
  { fips: '19', abbr: 'IA', name: 'Iowa' },
  { fips: '20', abbr: 'KS', name: 'Kansas' },
  { fips: '21', abbr: 'KY', name: 'Kentucky' },
  { fips: '22', abbr: 'LA', name: 'Louisiana' },
  { fips: '23', abbr: 'ME', name: 'Maine' },
  { fips: '24', abbr: 'MD', name: 'Maryland' },
  { fips: '25', abbr: 'MA', name: 'Massachusetts' },
  { fips: '26', abbr: 'MI', name: 'Michigan' },
  { fips: '27', abbr: 'MN', name: 'Minnesota' },
  { fips: '28', abbr: 'MS', name: 'Mississippi' },
  { fips: '29', abbr: 'MO', name: 'Missouri' },
  { fips: '30', abbr: 'MT', name: 'Montana' },
  { fips: '31', abbr: 'NE', name: 'Nebraska' },
  { fips: '32', abbr: 'NV', name: 'Nevada' },
  { fips: '33', abbr: 'NH', name: 'New Hampshire' },
  { fips: '34', abbr: 'NJ', name: 'New Jersey' },
  { fips: '35', abbr: 'NM', name: 'New Mexico' },
  { fips: '36', abbr: 'NY', name: 'New York' },
  { fips: '37', abbr: 'NC', name: 'North Carolina' },
  { fips: '38', abbr: 'ND', name: 'North Dakota' },
  { fips: '39', abbr: 'OH', name: 'Ohio' },
  { fips: '40', abbr: 'OK', name: 'Oklahoma' },
  { fips: '41', abbr: 'OR', name: 'Oregon' },
  { fips: '42', abbr: 'PA', name: 'Pennsylvania' },
  { fips: '44', abbr: 'RI', name: 'Rhode Island' },
  { fips: '45', abbr: 'SC', name: 'South Carolina' },
  { fips: '46', abbr: 'SD', name: 'South Dakota' },
  { fips: '47', abbr: 'TN', name: 'Tennessee' },
  { fips: '48', abbr: 'TX', name: 'Texas' },
  { fips: '49', abbr: 'UT', name: 'Utah' },
  { fips: '50', abbr: 'VT', name: 'Vermont' },
  { fips: '51', abbr: 'VA', name: 'Virginia' },
  { fips: '53', abbr: 'WA', name: 'Washington' },
  { fips: '54', abbr: 'WV', name: 'West Virginia' },
  { fips: '55', abbr: 'WI', name: 'Wisconsin' },
  { fips: '56', abbr: 'WY', name: 'Wyoming' },
  { fips: '11', abbr: 'DC', name: 'District of Columbia' },
];

// Hours worked per year options
export const HOURS_OPTIONS = [
  { value: 520,  label: '520 hours (10 hrs/week — Part-time)' },
  { value: 1040, label: '1,040 hours (20 hrs/week — Half-time)' },
  { value: 1560, label: '1,560 hours (30 hrs/week — Three-quarter time)' },
  { value: 2080, label: '2,080 hours (40 hrs/week — Full-time)' },
  { value: 2600, label: '2,600 hours (50 hrs/week — Full-time+)' },
  { value: 3120, label: '3,120 hours (60 hrs/week — Full-time+)' },
];

export const REPORT_YEAR = new Date().getFullYear();
