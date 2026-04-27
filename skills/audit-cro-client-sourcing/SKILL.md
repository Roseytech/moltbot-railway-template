---
name: audit-cro-client-sourcing
description: Mandatory controller for Audit CRO final-client sourcing runs. Enforces bounded execution, exact ICP discipline, Tavily discovery, MX/pattern checks, Hunter Free email lookup, Prospeo fallback, and correct Clients_Finaux_Audit_CRO mapping.
---

# Audit CRO Client Sourcing

Use this skill to find and verify final-client leads for the Audit CRO side business.

This skill is only for sourcing final-client companies that could benefit from a packaged CRO / conversion audit.

It must not be used to source:
- CRO agencies
- marketing agencies
- growth agencies
- web agencies
- lead-generation agencies
- funnel consultants
- conversion consultants
- software vendors selling conversion, demo, sales, analytics, or funnel tools

For sourcing CRO providers, use the Audit CRO provider sourcing skill.

The goal is not to find “ugly websites”.

The goal is to find credible, established professional businesses with high-value services, visible trust, and a website that likely does not convert enough visitors into qualified enquiries, calls, consultations, demos, or appointments.

Strategic logic:

Good business + high client value + under-actionable website = strong Audit CRO final-client lead.

---

## Market scope

Only source final-client leads in:

- United States
- United Kingdom

Do not source France, Belgium, Switzerland, UAE, Canada, Australia, or other markets unless the user explicitly asks.

Use these market values only:

- US
- UK

---

---

## Tool stack for final-client sourcing

Use the following stack in this exact order:

1. Tavily for discovery and web verification
2. Official website review
3. MX lookup and email pattern detection
4. Hunter Free for conservative email lookup
5. Prospeo enrich-person as fallback only

Tavily is the primary sourcing and verification tool.

Hunter is not a sourcing tool. Hunter is only used after a company is already qualified and when a reliable contact name plus domain are available.

Prospeo is not a sourcing tool. Prospeo is only used as fallback enrichment when:
- the lead is already qualified
- Hunter returned no usable result
- only weak email patterns exist
- a contact name exists but no reliable email is available

Do not use Prospeo before Tavily, website review, MX check, and Hunter logic.

Do not use deprecated Prospeo endpoints.

Allowed Prospeo endpoint:
- /enrich-person

Forbidden Prospeo endpoints:
- /email-finder
- /domain-search
- /email-verifier
- /social-url-enrichment

Default enrichment mode:
- conservative
- low volume
- qualified leads only
  
## Priority ICP

### Priority 1

- UK accounting firms
- UK tax advisory firms
- US CPA firms
- US accounting firms
- US tax advisory firms

These are the best first segments because they often have:
- high-value services
- visible public emails or identifiable email patterns
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
- directories as standalone leads
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
- businesses outside the US or UK
- companies already present in the sheet

---

## Definition of a valid final-client lead

A final-client lead is valid only if all mandatory criteria are met:

- official website loads
- company is based in the US or UK
- company is a final-client business, not a provider, vendor, agency, consultant, marketplace, or software tool
- sector matches the selected ICP
- website shows observable CRO friction
- company looks established enough to potentially pay for a professional audit or service improvement
- source URL is available
- email enrichment status is captured
- no duplicate exists based on company name, website, LinkedIn URL, selected email, or visible email

A public email is preferred but not strictly mandatory if the lead is otherwise qualified and the row clearly sets:
- verification_status
- selected_email if available
- prospeo_needed
- source_tool
- email_source_url if available

If the user explicitly asks for public-email-only leads, then skip any lead without a visible public email.

---

## Email enrichment rule

Do not invent emails.

Use this workflow:

1. Check the official website first.
2. Check the contact page, team page, footer, privacy page, terms page, and about page.
3. If a public email is visible on an official source, capture it in `email`.
4. If no public email is visible, leave `email` blank.
5. Check MX only when the domain appears reliable and active.
6. If MX is valid, set `verification_status` to `domain_mx_ok` unless a stronger status applies.
7. If a reliable contact name and domain are available, infer possible email patterns only when there is enough evidence.
8. Inferred email patterns may be placed in:
   - `email_guess_1`
   - `email_guess_2`
   - `email_guess_3`
9. Do not treat an inferred pattern as verified.
10. Use Hunter Free only when:
   - the company is already qualified
   - the domain is reliable
   - MX appears valid
   - contact name is available
11. If Hunter returns a strong email with acceptable confidence, place it in `selected_email`.
12. If Hunter returns a weak, risky, or accept-all result, do not mark it as verified.
13. If Hunter returns no usable result, set `prospeo_needed` to `yes` when the lead is valuable enough.
14. Use Prospeo only as fallback enrichment.
15. If Prospeo returns a verified email, place it in `selected_email`.
16. If no reliable email can be selected, leave `selected_email` blank.
17. Always set `verification_status`.
18. Always set `source_tool`.
19. Add `email_source_url` when an email, contact page, domain source, Hunter source, Prospeo source, or pattern source is available.

Accepted email sources:
- official website
- official contact page
- official team page
- official public profile
- trusted professional directory
- Hunter, only after qualification
- Prospeo, only as fallback
- MX/domain check, only for domain-level validation

Do not use emails from suspicious, scraped, or low-quality sources.

---

## Verification status values

Use only these values for `verification_status`:

- not_checked
- domain_mx_ok
- pattern_guess
- verified
- risky
- invalid
- no_email_found

Definitions:

- `not_checked`: no email verification has been performed
- `domain_mx_ok`: the domain appears able to receive email, but the exact mailbox is not confirmed
- `pattern_guess`: the email is inferred from a pattern, not directly verified
- `verified`: the email appears directly verified or clearly published by the company
- `risky`: the email is uncertain or weak
- `invalid`: the email or domain appears invalid
- `no_email_found`: no usable email or pattern was found

---

## Prospeo logic

Prospeo is fallback only.

Do not use Prospeo to source companies.

Do not use Prospeo for weak leads.

Set `prospeo_needed` to:

- `yes` if no reliable email is found
- `yes` if only weak pattern guesses exist
- `yes` if Hunter returns no usable result
- `yes` if a contact name exists but email is missing
- `no` if a reliable selected email exists
- `no` if the lead should be rejected and no enrichment is worth spending

Use only:

- yes
- no

When Prospeo is used, use only:

- endpoint: /enrich-person
- only_verified_email: true
- company_website when available
- full_name when available
- first_name and last_name when available

Do not enrich phone numbers.

Do not enrich mobile numbers.

Do not use Prospeo if:
- the company is not qualified
- the CRO friction is weak or unclear
- the ICP fit is low
- the company is outside US or UK
- the website does not load
- the lead is a duplicate

---

## Mandatory CRO friction rule

Observable CRO friction is mandatory for every final-client lead.

A public email alone is not enough to qualify a lead.

If CRO friction is none, unclear, or not observed:
- do not append the lead
- skip the company
- report reason: no observable CRO friction

A final-client lead is eligible for append only if:
- official website is available
- final-client business is confirmed
- selected ICP is confirmed
- observable CRO friction is present
- no duplicate exists
- email enrichment fields are correctly populated

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
- for easy ICPs: check up to 20 candidates, return or append up to 10
- for difficult ICPs: check up to 15 candidates, return or append up to 5

Never run open-ended searches.

Before writing:
- check whether the company already exists in the sheet if duplicate detection is available
- compare company_name, website, LinkedIn URL, email, and selected_email
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

Do not source all ICPs at once.

Follow the exact segment requested by the user.

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

## Scoring

Use `high`, `medium`, or `low`.

### high

Use when:
- company is clearly established
- services are high-value
- website has clear conversion friction
- firm has team, partners, accreditations, or credibility signals
- fit for Audit CRO is obvious
- email or email enrichment path is usable

### medium

Use when:
- company fits the sector
- some CRO friction is visible
- value or company size is less clear
- email path may require Prospeo

### low

Use only if:
- company technically fits
- but business value, maturity, or CRO need is weak

Prefer skipping low-quality leads rather than adding weak rows.

---

## Data to collect

Collect the following whenever available:

- company_name
- country
- city / state
- sector / industry
- website
- public email if visible
- email source URL if available
- source directory URL if applicable
- company LinkedIn URL if found
- decision maker name if found
- decision maker role if found
- decision maker LinkedIn URL if found
- estimated company size if found
- high-value services
- CRO friction summary
- CRO friction signals
- why_fit
- icp_fit
- email guesses if reliable enough
- verification_status
- selected_email if reliable enough
- prospeo_needed
- source_tool
- email_source_url

Do not invent missing data.

If a non-mandatory field is unknown, leave it blank.

---

## Mapping to Clients_Finaux_Audit_CRO

When writing to `Clients_Finaux_Audit_CRO`, use the exact sheet column order required by the Audit CRO Sheet Writer.

Use this exact field order:

1. id
2. market
3. company_name
4. website
5. linkedin_url
6. contact_name
7. contact_role
8. contact_linkedin
9. email
10. city
11. country
12. industry
13. employee_range
14. cro_friction_summary
15. icp_fit
16. why_fit
17. source
18. date_added
19. added_by
20. cro_signal_1
21. cro_signal_2
22. cro_signal_3
23. cro_signal_4
24. cro_signal_5
25. email_guess_1
26. email_guess_2
27. email_guess_3
28. verification_status
29. selected_email
30. prospeo_needed
31. source_tool
32. email_source_url

Do not use the old field name `pain_signal`.

Do not use `employees_range`.

Use `employee_range`.

Do not add `status` to the client-final schema unless the Google Sheet has a matching OpenClaw column for it.

---

## Field mapping rules

Map fields as follows:

- public email -> email
- city / state -> city
- country -> country
- sector -> industry
- estimated company size -> employee_range
- summary of the main conversion problem -> cro_friction_summary
- specific friction point 1 -> cro_signal_1
- specific friction point 2 -> cro_signal_2
- specific friction point 3 -> cro_signal_3
- specific friction point 4 -> cro_signal_4
- specific friction point 5 -> cro_signal_5
- priority score -> icp_fit
- short business rationale -> why_fit
- main qualification URL -> source
- current ISO date -> date_added
- openclaw -> added_by
- first likely email -> email_guess_1
- second likely email -> email_guess_2
- third likely email -> email_guess_3
- email verification result -> verification_status
- final email selected for outreach -> selected_email
- whether Prospeo is needed -> prospeo_needed
- tool or source used for email discovery -> source_tool
- email or contact source URL -> email_source_url

If multiple source URLs are useful:
- put the most important business / CRO qualification source in `source`
- put the email or contact evidence source in `email_source_url`

---

## Default values

Use:

- added_by: openclaw
- date_added: YYYY-MM-DD
- market: US or UK only
- icp_fit: high, medium, or low only
- prospeo_needed: yes or no only

Use only these values for `source_tool`:

- tavily
- official_website
- google_search
- directory
- mx_lookup
- pattern_detection
- hunter
- prospeo
- manual

`source_tool` should reflect the most relevant source or tool used for email discovery, contact evidence, or enrichment.

If an email or contact was found, prioritize the tool/source that produced that email or contact evidence.

Examples:
- use `official_website` if the email was found directly on the company website
- use `directory` if the email or contact evidence came from a trusted professional directory
- use `hunter` if Hunter provided the selected email
- use `prospeo` if Prospeo provided the selected email
- use `mx_lookup` if only domain-level validation was completed
- use `pattern_detection` if only pattern guesses were produced
- use `tavily` only if Tavily was the main discovery source and no stronger email/contact source exists
- use `manual` only if the user manually provided or confirmed the source

If multiple tools were used, choose the strongest source in this order:

1. official_website
2. hunter
3. prospeo
4. directory
5. mx_lookup
6. pattern_detection
7. tavily
8. google_search
9. manual

Do not use `tavily` as the default value if another tool provided stronger email or contact evidence.

---

## Cost discipline

Do not spend Hunter or Prospeo credits on weak leads.

Before using Hunter:
- the company must be qualified
- the ICP must be confirmed
- CRO friction must be observed
- the domain must be reliable
- contact name must be available

Before using Prospeo:
- the company must be qualified
- Hunter must be unavailable, empty, weak, or insufficient
- the lead must be worth paid fallback enrichment

A strong qualified lead with no verified email is better than a weak lead with an email.

Do not continue enriching once a reliable selected email exists.

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
