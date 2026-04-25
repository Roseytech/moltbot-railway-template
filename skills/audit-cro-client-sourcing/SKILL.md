---
name: audit-cro-client-sourcing
description: Mandatory controller for every Audit CRO sourcing run. Prevents silent background tasks, enforces bounded execution, and requires exact write summaries.
---

# Audit CRO Client Sourcing

Use this skill to find and verify client-final leads for the Audit CRO side business.

This skill is only for sourcing client-final companies that could benefit from a packaged CRO / conversion audit.

It must not be used to source:
- CRO agencies
- marketing agencies
- growth agencies
- web agencies
- lead-generation agencies
- funnel consultants
- conversion consultants
- software vendors selling conversion, demo, sales, analytics, or funnel tools

The goal is not to find “ugly websites”.

The goal is to find credible, established professional businesses with high-value services, visible trust, and a website that likely does not convert enough visitors into qualified enquiries, calls, consultations, demos, or appointments.

Strategic logic:

Good business + high client value + under-actionable website = strong Audit CRO lead.

---

## Market scope

Only source client-final leads in:

- United States
- United Kingdom

Do not source France, Belgium, Switzerland, UAE, Canada, Australia, or other markets unless the user explicitly asks.

---

## Priority ICP

### Priority 1

- UK accounting firms
- UK tax advisory firms
- US CPA firms
- US accounting firms
- US tax advisory firms

These are the best first segments because they often have:
- high-value services
- visible public emails
- established credibility
- under-actionable websites
- clear need for better lead conversion

### Priority 2

- US law firms / attorneys
- UK solicitors
- specialist legal practices

Prefer law firms with high-value services:
- business law
- corporate law
- immigration law
- employment law
- tax law
- estate planning
- commercial litigation
- real estate law

### Priority 3

- architecture firms
- engineering firms
- design-build firms
- construction advisory firms

Only keep them if the business appears established and the conversion issue is clear.

### Secondary ICP

Use only if the user asks to expand:

- HR consulting firms
- business advisory firms
- professional services firms
- high-ticket B2B service businesses
- B2B SaaS with demo, trial, or pricing friction

---

## Segment discipline

Always follow the exact segment requested by the user.

If the user asks for UK accounting / tax firms:
- source only UK accounting / tax firms
- do not include law firms
- do not include HR firms
- do not include generic advisory firms unless clearly accounting / tax-related
- do not include CRO, marketing, web, growth, SEO, PPC, or lead-generation providers

If the user asks for US CPA / accounting firms:
- source only CPA, accounting, bookkeeping, payroll, or tax advisory firms
- do not include unrelated professional services

If the user asks for law firms:
- source only law firms
- do not include accounting firms or other businesses

If the user asks for architecture / engineering / design-build firms:
- source only architecture, engineering, design-build, or closely related professional firms
- do not include cleaning, property maintenance, building services, or general construction service companies unless explicitly requested

Do not expand the ICP unless the user explicitly asks.

When in doubt, skip.

---

## Avoid

Do not retain:

- CRO agencies
- marketing agencies
- growth agencies
- web agencies
- lead-gen agencies
- funnel consultants
- SEO agencies
- PPC agencies
- software vendors
- directories
- marketplaces
- media websites
- course sellers
- dropshipping stores
- generic Shopify micro-stores
- cleaning companies
- building services companies
- property services companies
- unrelated construction services companies
- very small solo operators with weak commercial value
- inactive or suspicious websites
- very large corporate firms with long enterprise sales cycles
- businesses with no public email visible
- businesses outside the US or UK
- companies already present in the sheet

---

## Definition of a valid lead

A lead is valid only if all mandatory criteria are met:

- official website loads
- company is based in the US or UK
- company is a client-final business, not a provider / vendor / agency
- public email is visible, unless the user explicitly relaxes this rule
- email source URL is available
- sector matches the selected ICP
- website shows observable CRO friction
- company looks established enough to potentially pay for an audit
- no duplicate exists based on company name, website, LinkedIn URL, or email

If any mandatory criterion is missing, skip the lead.

---

## Email rule

Public email is mandatory by default.

Only accept an email if it is visible on at least one of these sources:

- official website
- official contact page
- official team page
- trusted professional directory
- official public profile

Do not invent emails.

Do not guess emails.

Do not infer formats such as firstname@company.com.

Do not use emails from suspicious, scraped, or low-quality sources.

If no public email is visible, skip the lead.

For law firms, if the user explicitly allows contact forms, email may be left blank. Otherwise, public email remains mandatory.

---

## CRO friction signals

A valid lead should show at least 2 observable CRO friction signals.

Examples:

- no booking link
- no Calendly or direct appointment flow
- generic “Contact us” CTA only
- phone / email only conversion path
- contact form hidden or weak
- no clear consultation CTA
- services are numerous but poorly structured
- pages are text-heavy and hard to scan
- weak homepage value proposition
- no service-specific landing pages
- trust signals exist but are poorly used
- testimonials, accreditations, or awards are not placed near conversion points
- no clear “why choose us” section
- old or institutional design
- mobile experience appears weak
- no clear next step for a warm visitor

Do not describe the site as simply “ugly”.

Explain the friction in practical conversion terms.

---

## High-value service signals

Prioritize firms offering high-value services such as:

For accounting / tax:
- tax advisory
- international tax
- cross-border tax
- audit
- payroll
- accounting
- business advisory
- CFO services
- compliance
- expatriate tax
- corporate tax

For law firms:
- business law
- corporate law
- immigration law
- employment law
- tax law
- commercial litigation
- estate planning
- real estate law

For architecture / engineering / design-build:
- commercial projects
- high-end residential
- project management
- design-build
- engineering consulting
- planning / permitting
- multi-service project delivery

---

## Company size

Ideal size:

- 10 to 150 employees

Accept up to 250 employees if the business has strong signals:
- multiple partners
- multiple locations
- high-value services
- visible team
- strong credibility
- poor conversion flow

Avoid:
- one-person micro firms unless the signal is very strong
- very large corporate firms
- national enterprise firms with complex buying processes

---

## Sourcing method

Use micro-batches.

Do not attempt large batches immediately.

Preferred batch size:
- 5 leads for difficult segments
- 10 leads for easier segments like UK accounting or US CPA firms

Default sourcing limits:
- for easy ICPs: check up to 20 candidates, append up to 10
- for difficult ICPs: check up to 15 candidates, append up to 5

Never run open-ended searches.

Before writing:
- check whether the company already exists in the sheet
- compare company_name, website, LinkedIn URL, and email
- skip duplicates

---

## Recommended sourcing order

Default order:

1. UK accounting / tax firms
2. US CPA / accounting / tax advisory firms
3. US specialist law firms
4. UK specialist law firms
5. architecture / engineering / design-build firms
6. HR consulting firms
7. business advisory / consulting firms

Do not source all ICPs at once. Follow the exact segment requested by the user.

---

## Preferred sources

### UK accounting / tax

Use:
- ACCA Find an Accountant
- ICAEW Find a Chartered Accountant
- official firm websites
- Google search
- Google Maps when useful
- trusted accounting directories

Search patterns:
- site:.co.uk "chartered accountants" "tax advisory" "contact"
- site:.co.uk "international tax" "chartered accountants" "contact"
- site:.co.uk "accountants" "tax advisory" "info@"
- site:.co.uk "chartered accountants" "payroll" "contact"
- site:.co.uk "business advisory" "accountants" "contact"

### US CPA / accounting

Do not rely only on IRS directories.

Use:
- state CPA directories
- CPA association directories
- official firm websites
- Google search
- Google Maps when useful

Search patterns:
- "Miami CPA firm" "info@" "contact"
- "Tampa CPA firm" "Email:" "Contact"
- "Florida accounting firm" "info@"
- "CPA firm Florida" "Email:"
- "CPA firm" "tax advisory" "contact us"
- "CPA firm" "international tax" "contact"
- "accounting firm" "payroll" "info@"

### US law firms

Use:
- state bar directories
- FindLaw
- Justia
- Avvo if useful
- official firm websites
- Google search
- specialist legal directories

Search patterns:
- "business law firm" "consultation" "contact" "info@"
- "immigration law firm" "consultation" "contact" "info@"
- "employment law firm" "contact" "email"
- "estate planning attorney" "contact" "email"
- "corporate law firm" "contact us" "info@"

### UK law firms

Use:
- Law Society
- SRA
- official firm websites
- specialist law firm directories
- Google search

Search patterns:
- site:.co.uk "employment law" "solicitors" "contact"
- site:.co.uk "business law" "solicitors" "contact"
- site:.co.uk "immigration solicitors" "contact" "email"
- site:.co.uk "commercial law" "solicitors" "info@"

### Architecture / engineering / design-build

Use:
- official websites
- professional directories
- local business directories
- Google Maps
- association directories if relevant

Search patterns:
- "architecture firm" "contact" "info@" "Florida"
- "engineering firm" "contact" "info@" "Florida"
- "design build firm" "contact" "email"
- "commercial architecture firm" "contact us"

---

## Validation rules

A lead is valid only if:

- official website loads
- public email is visible, unless the user explicitly relaxes this rule
- email source URL is provided
- company is based in the US or UK
- client-final business is confirmed
- sector matches the selected ICP
- observable CRO friction exists
- company appears established
- no duplicate exists in the current sheet

If the source is only a directory, verify through the official website when possible.

If the company does not clearly match the requested ICP, skip it.

---

## Scoring

Use `high`, `medium`, or `low`.

### high

Use when:
- public email is visible
- company is clearly established
- services are high-value
- website has clear conversion friction
- firm has team, partners, accreditations, or credibility signals
- fit for Audit CRO is obvious

### medium

Use when:
- public email is visible
- company fits the sector
- some CRO friction is visible
- value or company size is less clear

### low

Use only if:
- email is visible
- company technically fits
- but the business value, maturity, or CRO need is weak

Prefer skipping low-quality leads rather than adding weak rows.

---

## Data to collect

Collect the following whenever available:

- company_name
- country
- city / state
- sector / industry
- website
- public email
- email source URL
- source directory URL if applicable
- company LinkedIn URL if found
- decision maker name if found
- decision maker role if found
- decision maker LinkedIn URL if found
- estimated company size if found
- high-value services
- CRO friction signals
- why_fit
- priority score
- notes if useful

Do not invent missing data.

If a non-mandatory field is unknown, leave it blank.

---

## Mapping to Clients_Finaux_Audit_CRO

When writing to `Clients_Finaux_Audit_CRO`, use the exact sheet column order required by the Audit CRO Sheet Writer.

Map fields as follows:

- public email -> email
- city / state -> city
- country -> country
- sector -> industry
- estimated company size -> employees_range
- CRO friction signals -> pain_signal
- priority score -> icp_fit
- short business rationale -> why_fit
- email source URL and/or source directory URL -> source
- openclaw -> added_by
- new -> status

If multiple source URLs are useful, put the most important verification source first.

---

## Writing rule

Return candidates for review before writing unless the user explicitly approves writing.

If the user says “append”, “write”, “add to the sheet”, “proceed”, “yes”, “go”, “continue”, or gives direct approval, then append directly using the Audit CRO Sheet Writer / Railway endpoint.

Do not ask for approval again once the user has approved writing.

Do not return another review list before writing if the user already approved writing.

Do not say that rows were added unless the write action returned success.

If the endpoint returns duplicate, HTTP 409, or any error:
- do not retry elsewhere
- do not bypass the endpoint
- report the skipped or failed row

---

## Output after writing

After writing rows, return only:

- exact rows added count
- companies added
- skipped companies with reason

The count must match the number of companies listed.

Bad output example:
- Rows added: 8
- then listing 9 companies

This is forbidden.

If 9 companies were appended, say 9.

If 8 companies were appended, list only 8.

If there is any inconsistency between attempted rows and successfully written rows, clearly state it.

---

## Background / async behavior

Do not say:
- “I will notify you”
- “I will update you later”
- “please hold on”
- “the sub-agent is running”
- “I will report upon completion”

Do not run silent background-style tasks.

Complete the task in the current session as far as possible and return the result immediately.

If a task is still in progress, report current progress instead of waiting silently.

---

## Core reminder

We are not looking for ugly websites.

We are looking for credible professional firms with strong services and trust signals, but whose websites are under-actionable and likely under-converting.
