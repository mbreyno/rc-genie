/**
 * BLS Occupation data with SOC codes and fallback wage data (2024 BLS OES).
 * Wages are hourly: { entry: 25th pct, average: median, experienced: 75th pct }
 * SOC codes used to fetch live data from BLS API via Netlify Function.
 */

export const CATEGORIES = {
  marketing: {
    id: 'marketing',
    label: 'Marketing',
    color: '#f4a261',
    description: 'Sales, market research, advertising, and customer-facing activities',
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    color: '#457b9d',
    description: 'Accounting, bookkeeping, billing, payroll, and financial management',
  },
  hr: {
    id: 'hr',
    label: 'Human Resources',
    color: '#2a9d8f',
    description: 'Hiring, training, employee management, and HR administration',
  },
  management: {
    id: 'management',
    label: 'Management',
    color: '#e9c46a',
    description: 'General operations, strategic planning, and business oversight',
  },
  myBusiness: {
    id: 'myBusiness',
    label: 'My Business',
    color: '#e76f51',
    description: 'Duties specific to your industry and core business activities',
  },
};

// Proficiency wage multiplier descriptions
export const PROFICIENCY_LEVELS = [
  { value: 'entry',       label: 'Entry',       description: 'Less than 2 years experience / below average skill', wageKey: 'entry' },
  { value: 'average',     label: 'Average',     description: '2–5 years experience / typical proficiency',          wageKey: 'average' },
  { value: 'experienced', label: 'Experienced', description: '5+ years experience / high proficiency',              wageKey: 'experienced' },
];

// ─── MARKETING OCCUPATIONS ─────────────────────────────────────────────────
export const MARKETING_OCCUPATIONS = [
  {
    id: 'market_research_analyst',
    title: 'Market Research Analyst',
    soc: '13-1161',
    description: 'Research market conditions in local, regional, or national areas. Gather data on competitors, prices, and methods of marketing and distribution.',
    wages: { entry: 20.97, average: 33.08, experienced: 51.84 },
  },
  {
    id: 'sales_representative',
    title: 'Sales Representative',
    soc: '41-4012',
    description: 'Sell goods for wholesalers or manufacturers to businesses or groups of individuals. Work requires substantial knowledge of items sold.',
    wages: { entry: 17.98, average: 32.80, experienced: 56.37 },
  },
  {
    id: 'sales_rep_technical',
    title: 'Sales Representative – Technical',
    soc: '41-4011',
    description: 'Sell goods where technical or scientific knowledge is required (biology, engineering, chemistry, electronics). Typically requires 2+ years of post-secondary education.',
    wages: { entry: 29.77, average: 50.51, experienced: 82.56 },
  },
  {
    id: 'marketing_manager',
    title: 'Marketing Manager',
    soc: '11-2021',
    description: 'Plan, direct, or coordinate marketing policies and programs. Determine demand for products, identify potential customers, and develop pricing strategies.',
    wages: { entry: 39.94, average: 64.32, experienced: 100.00 },
  },
  {
    id: 'advertising_promotions_manager',
    title: 'Advertising & Promotions Manager',
    soc: '11-2011',
    description: 'Plan, direct, or coordinate advertising policies and programs. Prepare advertising campaigns and promotional activities for products and services.',
    wages: { entry: 37.23, average: 61.54, experienced: 98.25 },
  },
  {
    id: 'public_relations_manager',
    title: 'Public Relations Manager',
    soc: '11-2031',
    description: 'Plan, direct, or coordinate activities designed to create or maintain a favorable public image for employer or client.',
    wages: { entry: 37.50, average: 62.02, experienced: 97.18 },
  },
  {
    id: 'marketing_consultant',
    title: 'Marketing Consultant',
    soc: '13-1161',
    description: 'Provide expert advice on marketing strategies, campaigns, and brand positioning. Research market conditions and advise on best approaches.',
    wages: { entry: 20.97, average: 33.08, experienced: 51.84 },
  },
  {
    id: 'digital_marketing_specialist',
    title: 'Digital Marketing Specialist',
    soc: '13-1199',
    description: 'Plan and execute digital marketing campaigns across web, email, social media, and other digital channels.',
    wages: { entry: 22.50, average: 38.50, experienced: 60.10 },
  },
  {
    id: 'graphic_designer',
    title: 'Graphic Designer',
    soc: '27-1024',
    description: 'Create visual concepts to communicate ideas that inspire, inform, and captivate consumers. Develop layouts and production design for advertisements, brochures, and reports.',
    wages: { entry: 18.25, average: 27.38, experienced: 40.10 },
  },
];

// ─── FINANCE OCCUPATIONS ───────────────────────────────────────────────────
export const FINANCE_OCCUPATIONS = [
  {
    id: 'accountant_auditor',
    title: 'Accountant / Auditor',
    soc: '13-2011',
    description: 'Examine, analyze, and interpret accounting records to prepare financial statements, give advice, or audit and evaluate statements prepared by others.',
    wages: { entry: 27.23, average: 40.26, experienced: 59.28 },
  },
  {
    id: 'bookkeeper',
    title: 'Bookkeeper',
    soc: '43-3031',
    description: 'Compute, classify, and record numerical data to keep financial records complete. Perform any combination of routine calculating, posting, and verifying duties.',
    wages: { entry: 16.32, average: 22.87, experienced: 31.25 },
  },
  {
    id: 'payroll_clerk',
    title: 'Payroll Clerk',
    soc: '43-3051',
    description: "Compile and record employee time and payroll data. May compute employees\' time worked, production, and commission. May compute and post wages and deductions.",
    wages: { entry: 18.92, average: 25.84, experienced: 35.11 },
  },
  {
    id: 'billing_invoice_clerk',
    title: 'Billing and Invoice Clerk',
    soc: '43-3021',
    description: 'Compile, compute, and record billing, accounting, and statistical data for billing purposes. Prepare billing invoices for services rendered or for delivery of goods.',
    wages: { entry: 16.58, average: 23.04, experienced: 31.42 },
  },
  {
    id: 'financial_analyst',
    title: 'Financial Analyst',
    soc: '13-2051',
    description: 'Conduct quantitative analyses of information affecting investment programs of public or private institutions. Provide guidance on investment decisions.',
    wages: { entry: 31.57, average: 47.76, experienced: 74.50 },
  },
  {
    id: 'financial_manager',
    title: 'Financial Manager',
    soc: '11-3031',
    description: 'Plan, direct, or coordinate accounting, investing, banking, insurance, and other financial activities of a branch, office, or department.',
    wages: { entry: 46.26, average: 71.68, experienced: 114.24 },
  },
  {
    id: 'tax_preparer',
    title: 'Tax Preparer',
    soc: '13-2082',
    description: 'Prepare tax returns for individuals or small businesses. Verify and review completed documentation for accuracy and compliance.',
    wages: { entry: 16.40, average: 27.27, experienced: 45.63 },
  },
  {
    id: 'budget_analyst',
    title: 'Budget Analyst',
    soc: '13-2031',
    description: 'Examine budget estimates for completeness, accuracy, and conformance with procedures and regulations. Analyze budgeting and accounting reports.',
    wages: { entry: 29.58, average: 40.59, experienced: 54.58 },
  },
];

// ─── HUMAN RESOURCES OCCUPATIONS ──────────────────────────────────────────
export const HR_OCCUPATIONS = [
  {
    id: 'hr_manager',
    title: 'Human Resources Manager',
    soc: '11-3121',
    description: 'Plan, direct, and coordinate the administrative functions of an organization. Oversee the recruiting, interviewing, and hiring of new staff.',
    wages: { entry: 41.39, average: 62.98, experienced: 98.52 },
  },
  {
    id: 'hr_specialist',
    title: 'Human Resources Specialist',
    soc: '13-1071',
    description: 'Perform activities in the human resource area. Recruit and place workers. May perform employer-employee relations work.',
    wages: { entry: 22.10, average: 33.29, experienced: 49.53 },
  },
  {
    id: 'training_development',
    title: 'Employee Training and Development',
    soc: '13-1151',
    description: 'Design or conduct work-related training and development programs to improve individual skills or organizational performance. May analyze training needs or evaluate effectiveness.',
    wages: { entry: 24.70, average: 36.83, experienced: 55.37 },
  },
  {
    id: 'training_manager',
    title: 'Training & Development Manager',
    soc: '11-3131',
    description: 'Plan, direct, or coordinate the training and development activities and staff of an organization.',
    wages: { entry: 38.40, average: 58.49, experienced: 88.72 },
  },
  {
    id: 'benefits_administrator',
    title: 'Benefits Administrator',
    soc: '13-1141',
    description: 'Research, analyze, and administer employee benefit programs including health, dental, retirement, and other insurance programs.',
    wages: { entry: 21.46, average: 31.76, experienced: 46.78 },
  },
  {
    id: 'recruiter',
    title: 'Recruiter / Employment Specialist',
    soc: '13-1071',
    description: 'Recruit, screen, interview, and place workers. Consult with employers to identify employment needs and determine qualifications.',
    wages: { entry: 22.10, average: 33.29, experienced: 49.53 },
  },
];

// ─── MANAGEMENT OCCUPATIONS ────────────────────────────────────────────────
export const MANAGEMENT_OCCUPATIONS = [
  {
    id: 'general_operations_manager',
    title: 'General and Operations Manager',
    soc: '11-1021',
    description: 'Plan, direct, or coordinate the operations of public or private sector organizations. Duties include formulating policies, managing daily operations, and planning the use of materials and human resources.',
    wages: { entry: 36.25, average: 62.21, experienced: 108.75 },
  },
  {
    id: 'chief_executive',
    title: 'Chief Executive Officer (CEO)',
    soc: '11-1011',
    description: 'Determine and formulate policies and provide overall direction of companies or private sector organizations within the guidelines set up by a board of directors or similar governing body.',
    wages: { entry: 64.42, average: 100.00, experienced: 100.00 },
  },
  {
    id: 'administrative_services_manager',
    title: 'Administrative Services Manager',
    soc: '11-3011',
    description: 'Plan, direct, or coordinate one or more administrative services of an organization, such as records and information management, mail distribution, and other office support services.',
    wages: { entry: 30.96, average: 50.83, experienced: 80.28 },
  },
  {
    id: 'business_operations_specialist',
    title: 'Business Operations Specialist',
    soc: '13-1198',
    description: 'Examine and evaluate business procedures and recommend improvements. Coordinate activities of diverse departments or staff.',
    wages: { entry: 27.36, average: 40.77, experienced: 60.49 },
  },
];

// ─── INDUSTRY-SPECIFIC OCCUPATION SETS (My Business) ──────────────────────
// Each industry provides a curated list of relevant BLS occupations

export const INDUSTRY_OCCUPATIONS = {
  marketing_agency: [
    {
      id: 'internet_marketing_manager',
      title: 'Internet Marketing Manager',
      soc: '11-2021',
      description: 'Plan, direct, or coordinate online marketing policies and programs. Determine demand for digital products/services. Develop digital pricing and campaign strategies.',
      wages: { entry: 39.94, average: 64.32, experienced: 100.00 },
    },
    {
      id: 'marketing_consultant_agency',
      title: 'Marketing Consultant',
      soc: '13-1161',
      description: 'Research market conditions and gather information to determine potential sales of a product or service. May employ search marketing tactics and analyze web metrics.',
      wages: { entry: 20.97, average: 33.08, experienced: 51.84 },
    },
    {
      id: 'marketing_manager_agency',
      title: 'Marketing Manager',
      soc: '11-2021',
      description: 'Plan, direct, or coordinate marketing campaigns, brand strategy, and client accounts.',
      wages: { entry: 39.94, average: 64.32, experienced: 100.00 },
    },
    {
      id: 'search_marketing_strategist',
      title: 'Search Marketing Strategist',
      soc: '13-1161',
      description: 'Employ search marketing tactics, analyze web metrics, and develop recommendations to increase search engine ranking and visibility to target markets.',
      wages: { entry: 20.97, average: 33.08, experienced: 51.84 },
    },
    {
      id: 'social_media_manager',
      title: 'Social Media Manager',
      soc: '13-1199',
      description: 'Develop and implement social media strategy across platforms. Create content calendars, manage brand presence, and track engagement metrics.',
      wages: { entry: 22.50, average: 38.50, experienced: 60.10 },
    },
    {
      id: 'content_creator',
      title: 'Content Creator / Copywriter',
      soc: '27-3043',
      description: 'Write copy for advertisements, websites, and other marketing materials. Develop engaging content strategies for clients.',
      wages: { entry: 19.23, average: 31.25, experienced: 49.08 },
    },
    {
      id: 'account_manager_agency',
      title: 'Account Manager',
      soc: '11-2021',
      description: 'Manage client relationships, oversee campaign delivery, and ensure client satisfaction and retention.',
      wages: { entry: 39.94, average: 64.32, experienced: 100.00 },
    },
  ],

  financial_planning: [
    {
      id: 'personal_financial_advisor',
      title: 'Personal Financial Advisor',
      soc: '13-2052',
      description: "Advise clients on financial plans and strategies. Assess clients\' financial situations and recommend investments, insurance, and tax planning approaches.",
      wages: { entry: 26.82, average: 46.50, experienced: 80.02 },
    },
    {
      id: 'wealth_manager',
      title: 'Wealth Manager / Financial Planner',
      soc: '13-2052',
      description: 'Provide comprehensive financial planning services including investment management, estate planning, retirement planning, and tax optimization for high-net-worth clients.',
      wages: { entry: 26.82, average: 46.50, experienced: 80.02 },
    },
    {
      id: 'investment_advisor',
      title: 'Investment Advisor / Portfolio Manager',
      soc: '13-2099',
      description: 'Manage client investment portfolios, conduct security analysis, and provide investment recommendations. May oversee asset allocation strategies.',
      wages: { entry: 32.00, average: 55.00, experienced: 95.00 },
    },
    {
      id: 'securities_sales_agent',
      title: 'Securities / Financial Services Sales Agent',
      soc: '41-3031',
      description: 'Buy and sell securities or commodities in investment and trading firms. Advise clients on financial products and market conditions.',
      wages: { entry: 28.40, average: 60.40, experienced: 119.00 },
    },
    {
      id: 'financial_planning_director',
      title: 'Financial Planning Practice Manager',
      soc: '11-3031',
      description: 'Plan, direct, or coordinate the financial planning practice. Oversee advisors, manage compliance, and guide overall business strategy.',
      wages: { entry: 46.26, average: 71.68, experienced: 114.24 },
    },
  ],

  mental_health: [
    {
      id: 'mental_health_counselor',
      title: 'Mental Health Counselor / Therapist',
      soc: '21-1014',
      description: 'Counsel clients with mental and emotional disorders and provide mental health services. Use various therapeutic techniques to treat mental and emotional disorders.',
      wages: { entry: 21.06, average: 29.50, experienced: 44.00 },
    },
    {
      id: 'marriage_family_therapist',
      title: 'Marriage and Family Therapist',
      soc: '21-1013',
      description: 'Diagnose and treat mental and emotional disorders in the context of marriage, couples, and family systems. Apply psychotherapeutic and family systems theories.',
      wages: { entry: 23.00, average: 32.23, experienced: 48.73 },
    },
    {
      id: 'clinical_social_worker',
      title: 'Clinical Social Worker (LCSW)',
      soc: '21-1023',
      description: 'Assess and treat individuals, families, and groups to improve mental health and overall wellbeing. Provide psychotherapy and connect clients to community resources.',
      wages: { entry: 21.00, average: 30.54, experienced: 44.15 },
    },
    {
      id: 'psychologist',
      title: 'Psychologist / Clinical Psychologist',
      soc: '19-3031',
      description: 'Diagnose and treat mental, behavioral, and emotional disorders. Use assessment methods and evidence-based psychotherapeutic techniques.',
      wages: { entry: 37.22, average: 54.00, experienced: 78.36 },
    },
    {
      id: 'substance_abuse_counselor',
      title: 'Substance Abuse / Addiction Counselor',
      soc: '21-1011',
      description: 'Counsel clients to help them recover from addiction to alcohol, tobacco, or other substances. May counsel clients who are experiencing behavioral issues.',
      wages: { entry: 18.10, average: 26.50, experienced: 38.50 },
    },
    {
      id: 'behavioral_health_director',
      title: 'Behavioral Health Practice Director',
      soc: '11-9111',
      description: 'Plan, direct, or coordinate the operations of a mental health or behavioral health practice. Oversee clinical staff, ensure quality of care, and manage operations.',
      wages: { entry: 50.13, average: 76.48, experienced: 114.06 },
    },
  ],

  accounting_cpa: [
    {
      id: 'cpa_tax',
      title: 'Certified Public Accountant (CPA)',
      soc: '13-2011',
      description: 'Examine and prepare financial records, ensure accuracy and compliance with laws and regulations. Provide tax advice and planning services.',
      wages: { entry: 27.23, average: 40.26, experienced: 59.28 },
    },
    {
      id: 'tax_advisor',
      title: 'Tax Advisor / Tax Examiner',
      soc: '13-2081',
      description: 'Examine tax returns, detect errors, and advise clients on tax planning strategies. Review financial information for accuracy.',
      wages: { entry: 19.86, average: 31.56, experienced: 48.45 },
    },
    {
      id: 'financial_advisor_cpa',
      title: 'CPA with Financial Advisory Services',
      soc: '13-2052',
      description: 'CPA who also provides integrated financial planning, investment guidance, and wealth management advice alongside tax and accounting services. (For a dedicated financial planning firm, select that industry instead.)',
      wages: { entry: 26.82, average: 46.50, experienced: 80.02 },
    },
    {
      id: 'forensic_accountant',
      title: 'Forensic Accountant',
      soc: '13-2011',
      description: 'Investigate financial records for use in legal proceedings. Detect and deter fraud and white-collar crime.',
      wages: { entry: 27.23, average: 40.26, experienced: 59.28 },
    },
    {
      id: 'audit_manager',
      title: 'Audit Manager',
      soc: '13-2011',
      description: 'Supervise and coordinate audits of financial records. Ensure compliance with accounting standards and regulatory requirements.',
      wages: { entry: 27.23, average: 40.26, experienced: 59.28 },
    },
  ],

  medical_practice: [
    {
      id: 'physician',
      title: 'Physician / Doctor (General Practice)',
      soc: '29-1062',
      description: 'Diagnose and treat injuries or illnesses. Examine patients, take medical histories, prescribe medications, and order diagnostic tests.',
      wages: { entry: 80.00, average: 119.00, experienced: 119.00 },
    },
    {
      id: 'medical_director',
      title: 'Medical Director',
      soc: '11-9111',
      description: 'Plan, direct, and coordinate medical programs and activities of a health care facility. Oversee staff, ensure quality of care, and manage operations.',
      wages: { entry: 60.00, average: 94.00, experienced: 119.00 },
    },
    {
      id: 'nurse_practitioner',
      title: 'Nurse Practitioner',
      soc: '29-1171',
      description: 'Diagnose and treat acute, episodic, or chronic illness. Independently or as part of a healthcare team.',
      wages: { entry: 45.80, average: 59.00, experienced: 76.32 },
    },
    {
      id: 'physician_assistant',
      title: 'Physician Assistant',
      soc: '29-1071',
      description: 'Provide healthcare services typically performed by a physician. Examine patients, diagnose injuries and illnesses, and provide treatment.',
      wages: { entry: 44.58, average: 58.35, experienced: 74.25 },
    },
    {
      id: 'clinical_manager',
      title: 'Medical and Health Services Manager',
      soc: '11-9111',
      description: 'Plan, direct, or coordinate medical and health services. Manage clinics, public health organizations, or health departments.',
      wages: { entry: 50.13, average: 76.48, experienced: 114.06 },
    },
  ],

  dental: [
    {
      id: 'dentist_general',
      title: 'Dentist (General Practice)',
      soc: '29-1021',
      description: 'Diagnose and treat problems with teeth and tissues in the mouth. Provide preventive care, perform restorations, and educate patients on oral health.',
      wages: { entry: 67.00, average: 108.00, experienced: 119.00 },
    },
    {
      id: 'orthodontist',
      title: 'Orthodontist',
      soc: '29-1023',
      description: 'Examine, diagnose, and treat dental malocclusions and oral cavity anomalies. Design and fabricate appliances to realign teeth and jaw.',
      wages: { entry: 100.00, average: 119.00, experienced: 119.00 },
    },
    {
      id: 'oral_surgeon',
      title: 'Oral and Maxillofacial Surgeon',
      soc: '29-1022',
      description: 'Perform surgery on the hard and soft tissues of the oral and maxillofacial regions to treat diseases, injuries, and defects.',
      wages: { entry: 100.00, average: 119.00, experienced: 119.00 },
    },
    {
      id: 'dental_hygienist',
      title: 'Dental Hygienist',
      soc: '29-2021',
      description: 'Clean teeth and examine oral areas, head, and neck for signs of oral disease. Provide preventive dental care and oral health education.',
      wages: { entry: 30.49, average: 43.32, experienced: 59.51 },
    },
    {
      id: 'dental_practice_manager',
      title: 'Dental Practice Manager',
      soc: '11-9111',
      description: 'Manage the daily operations of a dental practice. Oversee scheduling, billing, staff management, and compliance with dental regulations.',
      wages: { entry: 50.13, average: 76.48, experienced: 114.06 },
    },
  ],

  chiropractic_rehab: [
    {
      id: 'chiropractor',
      title: 'Chiropractor',
      soc: '29-1011',
      description: 'Assess, diagnose, and treat patients with health problems related to the musculoskeletal system. Manipulate or adjust the spine or other joints.',
      wages: { entry: 31.25, average: 49.93, experienced: 85.00 },
    },
    {
      id: 'physical_therapist',
      title: 'Physical Therapist',
      soc: '29-1123',
      description: 'Assess, plan, organize, and participate in rehabilitative programs that improve mobility, relieve pain, increase strength, and improve function.',
      wages: { entry: 35.77, average: 48.49, experienced: 64.75 },
    },
    {
      id: 'occupational_therapist',
      title: 'Occupational Therapist',
      soc: '29-1122',
      description: 'Assess, plan, and organize rehabilitative programs that help people regain or develop functional skills necessary for daily living and work.',
      wages: { entry: 34.47, average: 46.31, experienced: 60.45 },
    },
    {
      id: 'rehabilitation_specialist',
      title: 'Rehabilitation Specialist',
      soc: '29-1123',
      description: 'Develop and implement individualized rehabilitation programs. Coordinate care across disciplines to optimize patient recovery outcomes.',
      wages: { entry: 35.77, average: 48.49, experienced: 64.75 },
    },
    {
      id: 'clinic_director_rehab',
      title: 'Clinic Director / Practice Owner',
      soc: '11-9111',
      description: 'Lead and manage a chiropractic or rehabilitation practice. Responsible for clinical quality, staff supervision, patient outcomes, and business performance.',
      wages: { entry: 50.13, average: 76.48, experienced: 114.06 },
    },
  ],

  veterinary: [
    {
      id: 'veterinarian',
      title: 'Veterinarian',
      soc: '29-1131',
      description: 'Diagnose and treat diseases, disorders, and injuries in animals. Perform surgeries, prescribe medications, and advise owners on animal care.',
      wages: { entry: 40.89, average: 58.71, experienced: 84.10 },
    },
    {
      id: 'veterinary_specialist',
      title: 'Veterinary Specialist (Surgery / Internal Medicine)',
      soc: '29-1131',
      description: 'Provide specialty veterinary care in areas such as surgery, oncology, cardiology, or internal medicine. Treat complex or critical cases.',
      wages: { entry: 52.00, average: 75.00, experienced: 105.00 },
    },
    {
      id: 'veterinary_technician',
      title: 'Veterinary Technician / Technologist',
      soc: '29-2056',
      description: 'Perform medical tests in a laboratory environment for use in the treatment and diagnosis of diseases in animals. Assist veterinarians during procedures.',
      wages: { entry: 16.37, average: 22.32, experienced: 30.18 },
    },
    {
      id: 'veterinary_practice_manager',
      title: 'Veterinary Practice Manager',
      soc: '11-9111',
      description: 'Oversee the daily operations of a veterinary clinic. Manage staff scheduling, inventory, client relations, and regulatory compliance.',
      wages: { entry: 50.13, average: 76.48, experienced: 114.06 },
    },
  ],

  architecture_engineering: [
    {
      id: 'architect_ae',
      title: 'Architect',
      soc: '17-1011',
      description: 'Plan and design structures such as private residences, office buildings, theaters, and government buildings. Coordinate with engineers and clients.',
      wages: { entry: 31.25, average: 47.62, experienced: 70.04 },
    },
    {
      id: 'civil_engineer_ae',
      title: 'Civil Engineer',
      soc: '17-2051',
      description: 'Design, construct, and supervise infrastructure projects including roads, bridges, water systems, and buildings.',
      wages: { entry: 33.27, average: 47.70, experienced: 67.75 },
    },
    {
      id: 'structural_engineer',
      title: 'Structural Engineer',
      soc: '17-2051',
      description: 'Analyze and design the structural components of buildings and infrastructure. Ensure structural integrity, safety, and compliance with building codes.',
      wages: { entry: 33.27, average: 47.70, experienced: 67.75 },
    },
    {
      id: 'mechanical_engineer',
      title: 'Mechanical Engineer',
      soc: '17-2141',
      description: 'Research, design, develop, build, and test mechanical and thermal sensors and devices including tools, engines, and machines.',
      wages: { entry: 37.31, average: 53.55, experienced: 76.10 },
    },
    {
      id: 'electrical_engineer',
      title: 'Electrical Engineer',
      soc: '17-2071',
      description: 'Design, develop, test, and supervise the manufacture of electrical equipment. Conduct research, evaluate systems, and recommend design modifications.',
      wages: { entry: 40.62, average: 58.89, experienced: 84.17 },
    },
    {
      id: 'project_manager_ae',
      title: 'Project Manager (A/E)',
      soc: '11-9021',
      description: 'Plan, direct, and coordinate architecture or engineering projects. Manage timelines, budgets, client relationships, and cross-disciplinary teams.',
      wages: { entry: 35.50, average: 52.47, experienced: 80.19 },
    },
  ],

  law_firm: [
    {
      id: 'attorney',
      title: 'Lawyer / Attorney',
      soc: '23-1011',
      description: 'Advise and represent individuals, businesses, and government agencies on legal issues and disputes. Research and analyze legal problems.',
      wages: { entry: 43.47, average: 79.83, experienced: 119.00 },
    },
    {
      id: 'paralegal',
      title: 'Paralegal / Legal Assistant',
      soc: '23-2011',
      description: 'Assist lawyers by researching legal precedent, investigating facts, and preparing documents. Conduct research on relevant legal articles and judicial decisions.',
      wages: { entry: 19.16, average: 29.58, experienced: 44.47 },
    },
    {
      id: 'legal_researcher',
      title: 'Legal Researcher',
      soc: '23-2099',
      description: 'Conduct legal research, analyze case law, and prepare memoranda summarizing findings for attorney review.',
      wages: { entry: 22.10, average: 35.00, experienced: 52.00 },
    },
    {
      id: 'managing_attorney',
      title: 'Managing Attorney / Law Firm Administrator',
      soc: '11-1021',
      description: 'Manage the business operations of a law firm. Oversee staff, finances, client intake, and strategic direction.',
      wages: { entry: 36.25, average: 62.21, experienced: 108.75 },
    },
  ],

  it_technology: [
    {
      id: 'software_developer',
      title: 'Software Developer',
      soc: '15-1252',
      description: 'Research, design, and develop computer and network software or specialized utility programs. Analyze user needs and develop software solutions.',
      wages: { entry: 40.26, average: 58.34, experienced: 82.25 },
    },
    {
      id: 'it_manager',
      title: 'IT Manager / CTO',
      soc: '11-3021',
      description: 'Plan, direct, or coordinate activities in information technology departments. Determine organizational technology needs and recommend technical solutions.',
      wages: { entry: 52.65, average: 77.66, experienced: 112.52 },
    },
    {
      id: 'systems_analyst',
      title: 'Systems Analyst',
      soc: '15-1211',
      description: 'Research problems and design solutions. Analyze science, engineering, business, and other data processing problems to implement and improve computer systems.',
      wages: { entry: 34.40, average: 50.60, experienced: 73.85 },
    },
    {
      id: 'it_project_manager',
      title: 'IT Project Manager',
      soc: '15-1299',
      description: 'Plan, initiate, and manage information technology projects. Lead and guide the work of technical staff. Monitor progress and report to stakeholders.',
      wages: { entry: 40.26, average: 58.34, experienced: 82.25 },
    },
    {
      id: 'cybersecurity_analyst',
      title: 'Cybersecurity Analyst',
      soc: '15-1212',
      description: 'Plan, implement, and upgrade security measures and controls. Protect computer networks and systems from hacking and cyberattacks.',
      wages: { entry: 38.47, average: 56.50, experienced: 80.73 },
    },
    {
      id: 'web_developer',
      title: 'Web Developer',
      soc: '15-1254',
      description: 'Design, create, and modify web sites. Analyze user needs and implement websites to meet the needs of clients.',
      wages: { entry: 24.75, average: 41.87, experienced: 66.63 },
    },
  ],

  construction: [
    {
      id: 'construction_manager',
      title: 'Construction Manager',
      soc: '11-9021',
      description: 'Plan, direct, or coordinate activities concerned with the construction and maintenance of structures, facilities, and systems.',
      wages: { entry: 35.50, average: 52.47, experienced: 80.19 },
    },
    {
      id: 'cost_estimator',
      title: 'Cost Estimator / Project Estimator',
      soc: '13-1051',
      description: 'Prepare cost estimates for product manufacturing, construction projects, or services to aid management in bidding on or determining price of product or service.',
      wages: { entry: 25.30, average: 37.40, experienced: 56.72 },
    },
    {
      id: 'civil_engineer',
      title: 'Civil Engineer',
      soc: '17-2051',
      description: 'Perform engineering duties in planning, designing, and overseeing construction and maintenance of building structures and facilities.',
      wages: { entry: 33.27, average: 47.70, experienced: 67.75 },
    },
    {
      id: 'architect',
      title: 'Architect',
      soc: '17-1011',
      description: 'Plan and design structures, including houses, office buildings, and other structures. Coordinate with engineers, urban planners, interior designers, and landscape architects.',
      wages: { entry: 31.25, average: 47.62, experienced: 70.04 },
    },
    {
      id: 'project_superintendent',
      title: 'Project Superintendent',
      soc: '47-1011',
      description: 'Directly supervise and coordinate activities of construction or extraction workers. Ensure all construction work meets specifications and safety standards.',
      wages: { entry: 28.50, average: 42.65, experienced: 61.85 },
    },
  ],

  real_estate: [
    {
      id: 'real_estate_broker',
      title: 'Real Estate Broker',
      soc: '41-9021',
      description: 'Operate real estate offices, or work for commercial real estate firms, overseeing real estate transactions. Sell, exchange, rent or lease property for clients.',
      wages: { entry: 22.43, average: 37.81, experienced: 71.25 },
    },
    {
      id: 'real_estate_agent',
      title: 'Real Estate Sales Agent',
      soc: '41-9022',
      description: 'Rent, buy, or sell property for clients. Perform duties such as study property listings, interview prospective clients, and accompany clients to property sites.',
      wages: { entry: 16.59, average: 29.86, experienced: 52.81 },
    },
    {
      id: 'property_manager',
      title: 'Property Manager',
      soc: '11-9141',
      description: 'Plan, direct, or coordinate the selling, buying, leasing, or governance activities of commercial, industrial, or residential real estate properties.',
      wages: { entry: 20.32, average: 33.31, experienced: 55.97 },
    },
    {
      id: 'mortgage_loan_officer',
      title: 'Mortgage Loan Officer',
      soc: '13-2072',
      description: 'Evaluate, authorize, or recommend approval of commercial, real estate, or credit loans. Advise borrowers on financial status and methods of payments.',
      wages: { entry: 21.35, average: 36.07, experienced: 69.68 },
    },
  ],

  restaurant_food: [
    {
      id: 'restaurant_manager',
      title: 'Restaurant Manager',
      soc: '11-9051',
      description: 'Plan, direct, or coordinate activities of an organization or department that serves food and beverages. Manage staff, inventory, and customer experience.',
      wages: { entry: 19.73, average: 30.13, experienced: 47.23 },
    },
    {
      id: 'executive_chef',
      title: 'Chef / Executive Chef',
      soc: '35-1011',
      description: 'Direct and may participate in the preparation, seasoning, and cooking of salads, soups, fish, meats, vegetables, desserts, or other foods.',
      wages: { entry: 18.10, average: 27.66, experienced: 41.92 },
    },
    {
      id: 'food_service_manager',
      title: 'Food Service Manager',
      soc: '11-9051',
      description: 'Plan, direct, or coordinate activities of an organization or department that serves food and beverages.',
      wages: { entry: 19.73, average: 30.13, experienced: 47.23 },
    },
    {
      id: 'catering_manager',
      title: 'Catering Manager',
      soc: '11-9051',
      description: 'Plan and manage catering operations, coordinate events, manage staff, and ensure food quality and service excellence.',
      wages: { entry: 19.73, average: 30.13, experienced: 47.23 },
    },
  ],

  retail: [
    {
      id: 'retail_store_manager',
      title: 'Retail Store Manager',
      soc: '41-1011',
      description: 'Directly supervise and coordinate activities of retail sales workers. May perform management functions such as purchasing, budgeting, accounting, and personnel work.',
      wages: { entry: 16.11, average: 23.26, experienced: 35.82 },
    },
    {
      id: 'buyer_purchasing_agent',
      title: 'Buyer / Purchasing Agent',
      soc: '13-1022',
      description: 'Buy merchandise or commodities, other than farm products, for resale to consumers at wholesale or retail level.',
      wages: { entry: 24.03, average: 37.20, experienced: 57.19 },
    },
    {
      id: 'merchandise_manager',
      title: 'Merchandise / Retail Manager',
      soc: '11-9081',
      description: 'Plan, direct, and coordinate the activities of buyers, purchasing officers, and related workers involved in purchasing materials, products, and services.',
      wages: { entry: 37.50, average: 62.06, experienced: 101.21 },
    },
    {
      id: 'ecommerce_manager',
      title: 'E-Commerce Manager',
      soc: '11-2021',
      description: 'Oversee the online sales channel, manage product listings, optimize conversion, and coordinate digital marketing efforts for retail operations.',
      wages: { entry: 39.94, average: 64.32, experienced: 100.00 },
    },
  ],

  insurance: [
    {
      id: 'insurance_agent',
      title: 'Insurance Agent',
      soc: '41-3021',
      description: 'Sell life, property, casualty, health, automotive, or other types of insurance. May refer clients to independent brokers or sell other financial products.',
      wages: { entry: 20.05, average: 34.35, experienced: 58.83 },
    },
    {
      id: 'claims_adjuster',
      title: 'Claims Adjuster',
      soc: '13-1031',
      description: 'Review settled claims to determine that payments and settlements are made in accordance with company practices and procedures.',
      wages: { entry: 22.84, average: 34.85, experienced: 52.17 },
    },
    {
      id: 'insurance_underwriter',
      title: 'Insurance Underwriter',
      soc: '13-2053',
      description: 'Review insurance applications and decide if they should be approved. Analyze risk information to determine coverage and premiums.',
      wages: { entry: 26.94, average: 40.17, experienced: 59.95 },
    },
    {
      id: 'financial_advisor_ins',
      title: 'Financial Services Representative',
      soc: '13-2052',
      description: 'Advise clients on financial plans, insurance needs, and investment strategies.',
      wages: { entry: 26.82, average: 46.50, experienced: 80.02 },
    },
  ],

  consulting: [
    {
      id: 'management_consultant',
      title: 'Management Consultant',
      soc: '13-1111',
      description: 'Analyze and recommend ways to help organizations improve efficiency and profitability through reduced costs and increased revenues.',
      wages: { entry: 30.36, average: 50.48, experienced: 85.58 },
    },
    {
      id: 'business_analyst_consulting',
      title: 'Business Analyst',
      soc: '13-1198',
      description: 'Analyze business processes and systems to identify improvements. Bridge the gap between business needs and technical solutions.',
      wages: { entry: 27.36, average: 40.77, experienced: 60.49 },
    },
    {
      id: 'strategy_consultant',
      title: 'Strategy Consultant',
      soc: '13-1111',
      description: 'Advise organizations on high-level strategic direction, market positioning, and growth opportunities.',
      wages: { entry: 30.36, average: 50.48, experienced: 85.58 },
    },
    {
      id: 'it_consultant',
      title: 'IT / Technology Consultant',
      soc: '15-1299',
      description: 'Advise clients on technology strategies, system implementations, and digital transformation initiatives.',
      wages: { entry: 40.26, average: 58.34, experienced: 82.25 },
    },
    {
      id: 'hr_consultant',
      title: 'HR Consultant',
      soc: '13-1071',
      description: 'Advise organizations on human resources strategy, policy, compliance, and organizational effectiveness.',
      wages: { entry: 22.10, average: 33.29, experienced: 49.53 },
    },
  ],

  // ─── TRADES & CONSTRUCTION ────────────────────────────────────────────────
  trades: [
    {
      id: 'plumber',
      title: 'Plumber',
      soc: '47-2152',
      description: 'Assemble, install, and repair pipes, fittings, and fixtures of heating, water, and drainage systems according to specifications and plumbing codes.',
      wages: { entry: 26.43, average: 30.53, experienced: 51.20 },
    },
    {
      id: 'hvac_technician',
      title: 'HVAC Technician',
      soc: '49-9021',
      description: 'Install, service, and repair heating, ventilation, air conditioning, and refrigeration systems in residential and commercial buildings.',
      wages: { entry: 22.50, average: 27.84, experienced: 42.56 },
    },
    {
      id: 'electrician',
      title: 'Electrician',
      soc: '47-2111',
      description: 'Install, maintain, and repair electrical wiring, equipment, and fixtures. Ensure that work is in accordance with relevant codes.',
      wages: { entry: 23.11, average: 30.64, experienced: 47.99 },
    },
    {
      id: 'pipefitter_steamfitter',
      title: 'Pipefitter / Steamfitter',
      soc: '47-2152',
      description: 'Lay out, assemble, install, and maintain pipe systems, pipe supports, and related hydraulic and pneumatic equipment.',
      wages: { entry: 28.00, average: 36.94, experienced: 56.00 },
    },
    {
      id: 'trades_owner_operator',
      title: 'Trades Business Owner / Operator',
      soc: '11-1021',
      description: 'Own and operate a skilled trades contracting business. Oversee job bidding, project scheduling, crew management, and quality control.',
      wages: { entry: 36.25, average: 55.00, experienced: 90.00 },
    },
  ],

  landscaping: [
    {
      id: 'landscape_architect',
      title: 'Landscape Architect',
      soc: '17-1012',
      description: 'Plan and design land areas for projects such as parks, recreational facilities, and commercial developments.',
      wages: { entry: 26.25, average: 37.39, experienced: 54.78 },
    },
    {
      id: 'landscaping_supervisor',
      title: 'Landscaping / Groundskeeping Supervisor',
      soc: '37-1012',
      description: 'Directly supervise and coordinate activities of workers engaged in landscaping or groundskeeping activities.',
      wages: { entry: 18.85, average: 24.75, experienced: 35.58 },
    },
    {
      id: 'tree_trimmer',
      title: 'Tree Trimmer / Arborist',
      soc: '37-3013',
      description: 'Cut, trim, and remove trees and branches using hand tools and power equipment. May also diagnose and treat tree diseases.',
      wages: { entry: 16.33, average: 22.73, experienced: 33.94 },
    },
    {
      id: 'landscaping_owner',
      title: 'Landscaping Business Owner',
      soc: '11-1021',
      description: 'Own and operate a landscaping or lawn care business. Manage client accounts, crew scheduling, equipment, and seasonal service contracts.',
      wages: { entry: 28.00, average: 45.00, experienced: 72.00 },
    },
  ],

  cleaning_services: [
    {
      id: 'janitor_cleaner',
      title: 'Janitor / Cleaner',
      soc: '37-2011',
      description: 'Keep buildings in clean and orderly condition. Perform heavy cleaning duties such as cleaning floors, shampooing rugs, and washing walls.',
      wages: { entry: 12.00, average: 15.65, experienced: 21.79 },
    },
    {
      id: 'maid_housekeeping',
      title: 'Maid / Housekeeping Cleaner',
      soc: '37-2012',
      description: 'Perform any combination of light cleaning duties to maintain private households or commercial establishments.',
      wages: { entry: 11.98, average: 14.89, experienced: 19.98 },
    },
    {
      id: 'cleaning_supervisor',
      title: 'Cleaning Supervisor',
      soc: '37-1011',
      description: 'Directly supervise and coordinate work activities of janitors, maids, housekeeping cleaners, and window washers.',
      wages: { entry: 17.09, average: 22.81, experienced: 32.36 },
    },
    {
      id: 'cleaning_business_owner',
      title: 'Cleaning Services Owner / Operator',
      soc: '11-1021',
      description: 'Own and operate a cleaning or janitorial services business. Manage client contracts, scheduling, and cleaning crews.',
      wages: { entry: 25.00, average: 40.00, experienced: 65.00 },
    },
  ],

  auto_repair: [
    {
      id: 'automotive_service_tech',
      title: 'Automotive Service Technician',
      soc: '49-3023',
      description: 'Inspect, maintain, and repair automobiles, buses, and light trucks. Use diagnostic equipment and technical knowledge to fix problems.',
      wages: { entry: 18.05, average: 23.72, experienced: 38.84 },
    },
    {
      id: 'auto_body_repairer',
      title: 'Auto Body / Collision Repairer',
      soc: '49-3021',
      description: 'Repair and refinish automotive vehicle bodies and straighten vehicle frames. Restore vehicles to original condition after damage.',
      wages: { entry: 18.48, average: 25.13, experienced: 37.89 },
    },
    {
      id: 'service_advisor',
      title: 'Automotive Service Advisor',
      soc: '41-3041',
      description: 'Advise customers on automotive service needs, prepare work orders, and ensure customer satisfaction with repair results.',
      wages: { entry: 18.00, average: 28.00, experienced: 45.00 },
    },
    {
      id: 'auto_shop_owner',
      title: 'Auto Repair Shop Owner / Operator',
      soc: '11-1021',
      description: 'Own and operate an automotive repair shop. Oversee technicians, manage customer relationships, and handle shop operations.',
      wages: { entry: 30.00, average: 50.00, experienced: 82.00 },
    },
  ],

  // ─── REAL ESTATE & PROPERTY ──────────────────────────────────────────────
  property_management: [
    {
      id: 'property_manager',
      title: 'Property Manager',
      soc: '11-9141',
      description: 'Plan, direct, or coordinate the selling, buying, leasing, or governance activities of commercial, industrial, or residential real estate properties.',
      wages: { entry: 22.37, average: 33.55, experienced: 53.48 },
    },
    {
      id: 'leasing_agent',
      title: 'Leasing Agent / Consultant',
      soc: '41-9021',
      description: 'Rent properties to prospective tenants. Show properties, screen applicants, prepare lease agreements, and manage tenant relationships.',
      wages: { entry: 16.00, average: 24.00, experienced: 38.00 },
    },
    {
      id: 'hoa_manager',
      title: 'HOA / Community Association Manager',
      soc: '11-9141',
      description: 'Manage the day-to-day operations of homeowner or condominium associations. Oversee maintenance, finances, and vendor contracts.',
      wages: { entry: 22.00, average: 34.00, experienced: 55.00 },
    },
    {
      id: 'maintenance_coordinator',
      title: 'Maintenance Coordinator',
      soc: '11-3012',
      description: 'Coordinate maintenance and repair activities for managed properties. Liaise with tenants, vendors, and contractors.',
      wages: { entry: 19.00, average: 28.00, experienced: 43.00 },
    },
  ],

  // ─── FINANCIAL SERVICES ───────────────────────────────────────────────────
  bookkeeping: [
    {
      id: 'bookkeeper',
      title: 'Bookkeeper',
      soc: '43-3031',
      description: 'Compute, classify, and record numerical data to keep financial records complete. Perform any combination of routine calculating, posting, and verifying duties.',
      wages: { entry: 17.27, average: 21.94, experienced: 29.97 },
    },
    {
      id: 'full_charge_bookkeeper',
      title: 'Full-Charge Bookkeeper',
      soc: '43-3031',
      description: 'Manage complete bookkeeping cycle through financial statement preparation. Oversee accounts payable, accounts receivable, payroll, and reconciliations.',
      wages: { entry: 20.00, average: 27.00, experienced: 40.00 },
    },
    {
      id: 'payroll_specialist',
      title: 'Payroll Specialist',
      soc: '43-3051',
      description: 'Compile and process payroll data such as hours worked, taxes, and insurance to be withheld, and employee identification number.',
      wages: { entry: 18.72, average: 25.60, experienced: 36.48 },
    },
    {
      id: 'accounting_technician',
      title: 'Accounting Technician',
      soc: '13-2011',
      description: 'Assist accountants and auditors in preparing financial reports, reconciling accounts, and maintaining ledgers.',
      wages: { entry: 22.00, average: 32.00, experienced: 48.00 },
    },
  ],

  mortgage_lending: [
    {
      id: 'mortgage_loan_officer',
      title: 'Mortgage Loan Officer',
      soc: '13-2072',
      description: 'Evaluate, authorize, or recommend approval of commercial, real estate, or credit loans. Advise borrowers on financial status and methods of payments.',
      wages: { entry: 21.50, average: 37.42, experienced: 68.06 },
    },
    {
      id: 'mortgage_broker',
      title: 'Mortgage Broker',
      soc: '13-2072',
      description: 'Act as an intermediary between borrowers and lenders. Source mortgage products, compare rates, and guide clients through the loan process.',
      wages: { entry: 25.00, average: 45.00, experienced: 85.00 },
    },
    {
      id: 'loan_processor',
      title: 'Loan Processor',
      soc: '43-4131',
      description: 'Process mortgage applications, verify information, order appraisals, and coordinate with underwriters to ensure timely loan closings.',
      wages: { entry: 18.00, average: 25.00, experienced: 38.00 },
    },
    {
      id: 'loan_originator',
      title: 'Mortgage Loan Originator',
      soc: '13-2072',
      description: 'Originate residential mortgage loans by developing referral networks, evaluating borrower qualifications, and structuring loan applications.',
      wages: { entry: 28.00, average: 52.00, experienced: 100.00 },
    },
  ],

  // ─── HEALTHCARE & WELLNESS ───────────────────────────────────────────────
  optometry: [
    {
      id: 'optometrist',
      title: 'Optometrist',
      soc: '29-1041',
      description: 'Diagnose, manage, and treat conditions and diseases of the human eye and visual system. Prescribe and fit corrective lenses.',
      wages: { entry: 54.60, average: 65.12, experienced: 100.00 },
    },
    {
      id: 'optician',
      title: 'Optician / Dispensing Optician',
      soc: '29-2081',
      description: 'Design, measure, fit, and adapt lenses and frames for client according to written optical prescription or specification.',
      wages: { entry: 16.68, average: 22.50, experienced: 32.21 },
    },
    {
      id: 'ophthalmic_technician',
      title: 'Ophthalmic Technician',
      soc: '29-2057',
      description: 'Assist ophthalmologists and optometrists by performing diagnostic tests and patient screenings.',
      wages: { entry: 16.00, average: 21.00, experienced: 30.00 },
    },
    {
      id: 'vision_therapy_tech',
      title: 'Vision Therapy Technician',
      soc: '29-2057',
      description: 'Conduct vision therapy programs under supervision of optometrist to treat binocular vision disorders and visual processing issues.',
      wages: { entry: 15.00, average: 20.00, experienced: 29.00 },
    },
  ],

  pharmacy: [
    {
      id: 'pharmacist',
      title: 'Pharmacist',
      soc: '29-1051',
      description: 'Dispense prescription medications and provide expertise in safe medication use. Counsel patients and answer questions about drug interactions and side effects.',
      wages: { entry: 58.65, average: 66.22, experienced: 77.19 },
    },
    {
      id: 'compounding_pharmacist',
      title: 'Compounding Pharmacist',
      soc: '29-1051',
      description: 'Prepare customized medications by combining, mixing, or altering ingredients to meet specific patient needs not available commercially.',
      wages: { entry: 60.00, average: 70.00, experienced: 82.00 },
    },
    {
      id: 'pharmacy_technician',
      title: 'Pharmacy Technician',
      soc: '29-2052',
      description: 'Prepare medications under the direction of pharmacists. May measure, mix, count, label, and record amounts and dosages.',
      wages: { entry: 14.11, average: 18.37, experienced: 25.55 },
    },
    {
      id: 'pharmacy_manager',
      title: 'Pharmacy Manager / Director',
      soc: '11-9111',
      description: 'Manage the overall operations of the pharmacy including staff, inventory, compliance, and patient care services.',
      wages: { entry: 60.00, average: 80.00, experienced: 110.00 },
    },
  ],

  // ─── RETAIL, FOOD & LOGISTICS ────────────────────────────────────────────
  ecommerce: [
    {
      id: 'ecommerce_manager',
      title: 'E-Commerce Manager',
      soc: '11-2021',
      description: 'Manage online sales channels including website, marketplace listings, digital advertising, and fulfillment operations.',
      wages: { entry: 28.00, average: 45.00, experienced: 72.00 },
    },
    {
      id: 'online_merchandise_buyer',
      title: 'Online Merchandise Buyer / Sourcing Manager',
      soc: '13-1022',
      description: 'Source, evaluate, and purchase merchandise for online retail. Manage supplier relationships and negotiate pricing and terms.',
      wages: { entry: 22.00, average: 34.00, experienced: 54.00 },
    },
    {
      id: 'fulfillment_operations_mgr',
      title: 'Fulfillment / Operations Manager',
      soc: '11-1021',
      description: 'Oversee order fulfillment, warehouse operations, inventory management, and shipping processes for e-commerce business.',
      wages: { entry: 25.00, average: 42.00, experienced: 68.00 },
    },
    {
      id: 'digital_marketing_specialist',
      title: 'Digital Marketing Specialist',
      soc: '13-1161',
      description: 'Plan and execute digital marketing campaigns across email, social media, search, and display advertising channels.',
      wages: { entry: 20.97, average: 33.08, experienced: 51.84 },
    },
    {
      id: 'ecommerce_owner',
      title: 'E-Commerce Business Owner',
      soc: '11-1021',
      description: 'Own and operate an online retail business. Manage product sourcing, digital marketing, customer service, and logistics.',
      wages: { entry: 28.00, average: 48.00, experienced: 80.00 },
    },
  ],

  trucking: [
    {
      id: 'truck_driver_heavy',
      title: 'Truck Driver (Heavy/Tractor-Trailer)',
      soc: '53-3032',
      description: 'Drive a tractor-trailer or tanker truck to transport freight and other materials over long distances.',
      wages: { entry: 20.85, average: 25.28, experienced: 37.17 },
    },
    {
      id: 'dispatcher',
      title: 'Transportation Dispatcher',
      soc: '43-5032',
      description: 'Schedule and dispatch workers, equipment, or service vehicles to appropriate locations. Relay work orders or messages.',
      wages: { entry: 16.64, average: 22.88, experienced: 33.76 },
    },
    {
      id: 'freight_broker',
      title: 'Freight Broker',
      soc: '11-3071',
      description: 'Arrange transportation of goods by connecting shippers with carriers. Negotiate rates, coordinate logistics, and manage shipping documentation.',
      wages: { entry: 25.00, average: 40.00, experienced: 65.00 },
    },
    {
      id: 'trucking_owner_operator',
      title: 'Trucking Owner-Operator',
      soc: '53-3032',
      description: 'Own and operate a commercial trucking business. Drive routes, manage fuel and maintenance costs, and handle client accounts.',
      wages: { entry: 28.00, average: 45.00, experienced: 75.00 },
    },
  ],

  // ─── PERSONAL SERVICES & EDUCATION ───────────────────────────────────────
  salon_spa: [
    {
      id: 'hairdresser_cosmetologist',
      title: 'Hairdresser / Cosmetologist',
      soc: '39-5012',
      description: 'Provide beauty services such as shampooing, cutting, coloring, and styling hair. May also apply makeup and perform skin care treatments.',
      wages: { entry: 12.06, average: 16.07, experienced: 26.32 },
    },
    {
      id: 'barber',
      title: 'Barber',
      soc: '39-5011',
      description: 'Cut, trim, and groom hair for male clients. May also shave and trim beards, and provide scalp treatments.',
      wages: { entry: 12.00, average: 16.29, experienced: 26.60 },
    },
    {
      id: 'esthetician',
      title: 'Esthetician / Skin Care Specialist',
      soc: '39-5094',
      description: "Cleanse and beautify the face and body to enhance a client's appearance through treatments such as facials, waxing, and exfoliation.",
      wages: { entry: 12.63, average: 18.84, experienced: 31.22 },
    },
    {
      id: 'nail_technician',
      title: 'Nail Technician / Manicurist',
      soc: '39-5092',
      description: "Clean and shape customers' nails, and apply polish. May also perform nail art, nail extensions, and hand/foot treatments.",
      wages: { entry: 11.78, average: 15.46, experienced: 22.50 },
    },
    {
      id: 'massage_therapist',
      title: 'Massage Therapist',
      soc: '31-9011',
      description: 'Assess soft tissue and joint dysfunction to determine the best technique to alleviate pain and improve function. Apply pressure to muscles and soft tissue.',
      wages: { entry: 16.89, average: 26.03, experienced: 44.22 },
    },
    {
      id: 'salon_owner',
      title: 'Salon / Spa Owner',
      soc: '11-1021',
      description: 'Own and manage a salon, barbershop, or spa. Oversee staff, client experience, booking, inventory, and business development.',
      wages: { entry: 22.00, average: 38.00, experienced: 62.00 },
    },
  ],

  fitness: [
    {
      id: 'personal_trainer',
      title: 'Personal Trainer',
      soc: '39-9031',
      description: 'Instruct or coach groups or individuals in exercise activities. Demonstrate activities, observe clients, explain instructions, and motivate participants.',
      wages: { entry: 13.30, average: 22.01, experienced: 38.39 },
    },
    {
      id: 'group_fitness_instructor',
      title: 'Group Fitness Instructor',
      soc: '39-9031',
      description: 'Lead group fitness classes such as yoga, aerobics, cycling, or strength training. Design class programming and motivate participants.',
      wages: { entry: 13.00, average: 20.00, experienced: 34.00 },
    },
    {
      id: 'yoga_pilates_instructor',
      title: 'Yoga / Pilates Instructor',
      soc: '39-9031',
      description: 'Teach yoga, Pilates, or mindfulness practices to individuals or groups. Design sequences, demonstrate poses, and offer modifications.',
      wages: { entry: 14.00, average: 22.50, experienced: 38.00 },
    },
    {
      id: 'fitness_studio_owner',
      title: 'Fitness Studio Owner / Director',
      soc: '11-1021',
      description: 'Own and operate a fitness studio, gym, or health coaching business. Manage trainers, class schedules, memberships, and marketing.',
      wages: { entry: 25.00, average: 42.00, experienced: 70.00 },
    },
  ],

  event_planning: [
    {
      id: 'event_planner',
      title: 'Meeting / Event Planner',
      soc: '13-1121',
      description: 'Coordinate activities of staff and convention personnel to make arrangements for group meetings and conventions.',
      wages: { entry: 19.19, average: 27.43, experienced: 42.64 },
    },
    {
      id: 'wedding_planner',
      title: 'Wedding Planner / Coordinator',
      soc: '13-1121',
      description: 'Plan and coordinate all aspects of wedding ceremonies and receptions including venue, catering, vendors, and logistics.',
      wages: { entry: 18.00, average: 26.00, experienced: 40.00 },
    },
    {
      id: 'event_producer',
      title: 'Event Producer',
      soc: '13-1121',
      description: 'Produce and manage large-scale corporate or entertainment events. Oversee production teams, budgets, timelines, and vendor relationships.',
      wages: { entry: 22.00, average: 35.00, experienced: 58.00 },
    },
    {
      id: 'event_business_owner',
      title: 'Event Planning Business Owner',
      soc: '11-1021',
      description: 'Own and operate an event planning or coordination business. Manage client relationships, vendor contracts, and event logistics.',
      wages: { entry: 25.00, average: 42.00, experienced: 70.00 },
    },
  ],

  childcare_education: [
    {
      id: 'childcare_director',
      title: 'Childcare / Daycare Director',
      soc: '11-9031',
      description: 'Plan, direct, or coordinate the academic and nonacademic activities of preschool and childcare centers or programs.',
      wages: { entry: 17.91, average: 24.51, experienced: 37.45 },
    },
    {
      id: 'preschool_teacher',
      title: 'Preschool / Daycare Teacher',
      soc: '25-2011',
      description: 'Teach and care for children from infancy through age 5 who have not yet entered kindergarten. Develop lesson plans and age-appropriate activities.',
      wages: { entry: 11.78, average: 16.82, experienced: 24.77 },
    },
    {
      id: 'tutor',
      title: 'Private Tutor / Academic Coach',
      soc: '25-3031',
      description: 'Provide individualized instruction in academic subjects. Assess student needs, develop study plans, and monitor progress.',
      wages: { entry: 14.00, average: 22.00, experienced: 38.00 },
    },
    {
      id: 'education_program_director',
      title: 'Education Program Director',
      soc: '11-9032',
      description: 'Plan, direct, and administer educational programs. Develop curriculum, manage staff, and ensure regulatory compliance.',
      wages: { entry: 28.00, average: 44.00, experienced: 70.00 },
    },
  ],

  // ─── PROFESSIONAL & LEGAL ─────────────────────────────────────────────────
  photography_creative: [
    {
      id: 'photographer',
      title: 'Photographer',
      soc: '27-4021',
      description: 'Photograph subjects or newsworthy events using digital or film cameras and equipment. May specialize in commercial, portrait, or editorial work.',
      wages: { entry: 13.83, average: 21.02, experienced: 37.30 },
    },
    {
      id: 'videographer',
      title: 'Videographer / Video Producer',
      soc: '27-4032',
      description: 'Photograph or video-record corporate events, ceremonies, interviews, or other subjects. Edit footage for final delivery.',
      wages: { entry: 15.00, average: 25.00, experienced: 45.00 },
    },
    {
      id: 'graphic_designer',
      title: 'Graphic Designer',
      soc: '27-1024',
      description: 'Design or create graphics to meet specific commercial or promotional needs. May use a variety of mediums to achieve artistic or decorative effects.',
      wages: { entry: 17.69, average: 26.57, experienced: 41.00 },
    },
    {
      id: 'creative_director',
      title: 'Creative Director / Art Director',
      soc: '27-1011',
      description: 'Formulate design concepts and presentation approaches for visual communications including websites, advertising, and branding materials.',
      wages: { entry: 31.96, average: 53.36, experienced: 86.94 },
    },
    {
      id: 'photo_video_business_owner',
      title: 'Photography / Videography Business Owner',
      soc: '11-1021',
      description: 'Own and operate a photography or videography business. Manage client bookings, post-production, equipment, and marketing.',
      wages: { entry: 22.00, average: 38.00, experienced: 65.00 },
    },
  ],

  other: [
    {
      id: 'general_manager_other',
      title: 'General Manager',
      soc: '11-1021',
      description: 'Plan, direct, or coordinate the operations of the business. Primary responsibilities include managing daily operations and planning use of materials and personnel.',
      wages: { entry: 36.25, average: 62.21, experienced: 108.75 },
    },
    {
      id: 'business_owner_operator',
      title: 'Business Owner / Operator',
      soc: '11-1021',
      description: 'Own and operate a business. Responsible for all aspects of the business including strategy, operations, finance, and customer service.',
      wages: { entry: 36.25, average: 62.21, experienced: 108.75 },
    },
    {
      id: 'operations_specialist',
      title: 'Operations Specialist',
      soc: '13-1198',
      description: 'Coordinate and oversee operational activities. Ensure efficient business processes and resource utilization.',
      wages: { entry: 27.36, average: 40.77, experienced: 60.49 },
    },
  ],
};

// Helper: get all occupations for a category
// For 'myBusiness', industryId is now a BLS group id like 'grp_29'.
// Falls back to legacy INDUSTRY_OCCUPATIONS for any old custom industry ids still in use.
import { BLS_OCCUPATIONS } from './blsOccupations.js'

export function getOccupationsForCategory(categoryId, industryId = null) {
  switch (categoryId) {
    case 'marketing':   return MARKETING_OCCUPATIONS;
    case 'finance':     return FINANCE_OCCUPATIONS;
    case 'hr':          return HR_OCCUPATIONS;
    case 'management':  return MANAGEMENT_OCCUPATIONS;
    case 'myBusiness': {
      // New BLS group ids (grp_11, grp_13, etc.)
      if (industryId && BLS_OCCUPATIONS[industryId]) return BLS_OCCUPATIONS[industryId];
      // Legacy custom industry fallback
      return INDUSTRY_OCCUPATIONS[industryId] || INDUSTRY_OCCUPATIONS.other;
    }
    default:            return [];
  }
}

// Helper: get hourly wage for an occupation based on proficiency
export function getWage(occupation, proficiency = 'average') {
  return occupation.wages[proficiency] ?? occupation.wages.average;
}
