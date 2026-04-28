---
name: audit-cro-prestataires-sourcing
description: Mandatory sourcing skill for finding and qualifying Audit CRO providers, CRO agencies, UX audit firms, landing page optimization providers, and conversion optimization consultants for the Prestataires_Audit_CRO tab. Enforces bounded Tavily discovery, website validation, email evidence discipline, MX and email pattern detection, Hunter Free lookup, Prospeo fallback flagging, and correct handoff to the Audit CRO Sheet Writer.
---

# Audit CRO Prestataires Sourcing

## Quick critical rules

This skill is only for sourcing providers for the `Prestataires_Audit_CRO` tab.

A provider is a company, agency, consultant, studio, or boutique firm that sells CRO, UX audit, landing page optimization, funnel optimization, experimentation, or conversion optimization services.

This skill must never source final clients.

Writing must always go through `audit-cro-sheet-writer`.

Real writes must use the preferred named `row` object format.

Do not use a `values` array for real writes unless explicitly requested for a legacy diagnostic test.

For `Prestataires_Audit_CRO`, use the canonical 32-field schema defined in `audit-cro-sheet-writer`.

If a public email is selected for outreach, fill both:

- `email`
- `selected_email`

`why_fit` must explain why the provider may be relevant for the Audit CRO pilot offer, not merely why the company provides CRO services.

Do not infer extra fields.

Do not invent emails, contacts, LinkedIn URLs, companies, websites, roles, or sources.

---

## Objective

Find and qualify CRO providers that could buy or test the Audit CRO pilot offer.

This skill is used only to source potential providers for the `Prestataires_Audit_CRO` tab.

The goal is not to find final clients with CRO problems.

The goal is to find providers who may buy a pilot consisting of:

- 15 qualified final-client accounts
- activation of the top 5 accounts
- upfront fee
- success fee if a deal is signed with an introduced client

This skill must not write directly to Google Sheets.

Writing must always go through the `audit-cro-sheet-writer` skill.

---

## When to use this skill

Use this skill when the user asks to find, source, enrich, qualify, or prepare potential Audit CRO providers.

Examples:

- "Find CRO agencies in the US"
- "Source UK conversion optimization consultants"
- "Find prestataires CRO for Audit CRO"
- "Prepare provider leads for the Prestataires_Audit_CRO tab"
- "Find agencies that could buy the Audit CRO pilot"
- "Run provider sourcing for CRO agencies"

---

## When not to use this skill

Do not use this skill to source final-client companies.

For final clients, use:

`audit-cro-client-sourcing`

Do not use this skill to source:

- accounting firms as final clients
- CPA firms as final clients
- law firms as final clients
- architecture firms as final clients
- engineering firms as final clients
- professional services companies with CRO problems
- SaaS companies as final clients
- ecommerce brands as final clients

Those belong to the client-final sourcing workflow.

This skill is only for providers who sell CRO, UX, conversion, funnel, experimentation, or landing page optimization services.

---

## Market scope

Default markets:

- United States
- United Kingdom

Allowed markets:

- US
- UK

Do not source providers outside the US or UK unless the user explicitly asks for another market.

If a provider operates internationally but has a clear US or UK presence, it may be retained.

---

## Provider types to prioritize

Prioritize providers that are commercially aligned with the Audit CRO pilot.

| Priority | Provider type | Why it fits |
|---|---|---|
| High | Boutique CRO agencies | Likely to need qualified client accounts and sales activation |
| High | UX audit firms | Often close to CRO but may lack outbound lead generation |
| High | Landing page optimization providers | Strong fit for qualified final-client lead supply |
| High | Conversion consultants | Lean structure, often open to revenue-share or pilot models |
| Medium | Growth agencies with clear CRO offer | Fit only if CRO is a visible service, not a vague growth claim |
| Medium | Ecommerce CRO agencies | Fit if they sell audits, experimentation, funnel work |
| Medium | B2B SaaS conversion agencies | Fit if they target SaaS demos, calls, trials, or pipeline conversion |
| Low | Generic web agencies | Keep only if conversion optimization is clearly positioned |
| Low | SEO/PPC agencies | Keep only if CRO is a serious visible service |
| Exclude | Lead gen agencies | Not relevant unless CRO services are explicit |
| Exclude | Software vendors | Not service providers unless they also provide CRO consulting |

---

## Hard exclusions

Reject the provider if any of the following applies:

- no clear CRO, UX audit, funnel, experimentation, or landing page optimization service
- purely a software tool or vendor with no service offer
- generic digital agency with no serious conversion-focused positioning
- agency marketplace or directory rather than a provider
- freelancer profile with no website and no credible proof of activity
- no reliable website
- irrelevant geography
- duplicate of an already sourced provider
- no credible contact path after enrichment attempts
- suspicious, inactive, broken, or placeholder website
- provider appears too large, corporate, or unlikely to buy a small pilot
- provider is actually a final-client business, not a CRO-related provider

---

## Ideal provider profile

A strong provider lead should usually have several of these signals:

- clear CRO or conversion optimization positioning
- sells audits, experimentation, landing page improvement, or funnel optimization
- works with B2B, SaaS, ecommerce, professional services, or high-ticket services
- has a founder, principal, managing director, or head of growth identifiable
- has a small to mid-sized team
- appears commercially active
- has case studies, service pages, testimonials, or client examples
- has a public website
- has a valid domain with detectable MX records
- has a direct or likely professional email route
- could benefit from receiving qualified final-client accounts
- may be open to a pilot, revenue-share, partner deal, or success-based model

---

## Discovery strategy

Use bounded search.

Do not run endless browsing or broad scraping.

Recommended Tavily queries:

### US provider queries

- `site:.com CRO agency United States conversion rate optimization`
- `site:.com conversion optimization consultant USA`
- `site:.com landing page optimization agency USA`
- `site:.com UX audit agency conversion optimization USA`
- `site:.com B2B SaaS CRO agency USA`
- `site:.com ecommerce CRO agency USA`
- `site:.com funnel optimization consultant USA`

### UK provider queries

- `site:.co.uk CRO agency UK conversion rate optimization`
- `site:.co.uk conversion optimisation consultant UK`
- `site:.co.uk landing page optimisation agency UK`
- `site:.co.uk UX audit agency UK`
- `site:.co.uk ecommerce CRO agency UK`
- `site:.co.uk B2B SaaS CRO agency UK`
- `site:.co.uk funnel optimisation consultant UK`

### Founder or consultant queries

- `conversion rate optimisation consultant UK founder`
- `conversion optimization consultant USA founder`
- `CRO consultant founder United States`
- `CRO consultant founder UK`
- `landing page optimization consultant founder`

---

## Bounded execution rules

Default sourcing run:

- search up to 10 Tavily result pages or result groups
- visit only the most promising provider websites
- qualify up to 15 provider candidates
- retain only the best 5 to 10 qualified providers per run unless the user asks for more
- stop once enough high-quality providers have been found
- do not continue searching just to fill volume with weak leads

For each provider, inspect only the minimum pages needed:

- homepage
- services page
- about page
- contact page
- team page
- case studies page, if useful

Do not crawl the entire website.

---

## Provider validation checklist

Before retaining a provider, verify:

| Check | Required |
|---|---|
| Company or consultant name found | Yes |
| Website found | Yes |
| Market is US or UK | Yes |
| CRO or adjacent service is visible | Yes |
| Provider is not a final-client lead | Yes |
| Contact route exists or enrichment path is possible | Yes |
| Clear reason why they fit the Audit CRO pilot | Yes |
| Duplicate check performed if available | Yes |

---

## Contact enrichment logic

The goal is to identify the best available professional contact for the provider.

Priority contacts:

1. founder
2. co-founder
3. managing director
4. principal consultant
5. head of CRO
6. head of growth
7. head of strategy
8. partnerships contact
9. generic business email if no person is available

Do not invent names, roles, LinkedIn URLs, or emails.

---

## Email enrichment sequence

Follow this exact sequence.

### Step 1: Public email search

First, look for a public email on:

- homepage
- contact page
- about page
- team page
- privacy policy page
- footer
- agency directory profile, if high quality

If a public email is found, capture:

- `email`
- `selected_email`
- `email_source_url`
- `verification_status = verified`
- `prospeo_needed = no`
- `source_tool = official_website` or the actual source used

If a public email is found and selected for outreach, fill both `email` and `selected_email`.

Do not leave `email` blank when `selected_email` comes from a verified public source.

### Step 2: Domain and MX check

If no public email is found, identify the provider domain.

Check whether the domain has MX records.

If MX records are valid, use:

- `verification_status = domain_mx_ok`
- `source_tool = mx_lookup`

If MX records are missing or invalid, do not guess an email.

Use:

- `verification_status = invalid` or `no_email_found`
- `prospeo_needed = yes`

### Step 3: Pattern detection

If MX records are valid and a decision maker name is available, infer possible email patterns.

Allowed pattern examples:

- `firstname@domain.com`
- `firstnamelastname@domain.com`
- `firstname.lastname@domain.com`
- `firstinitiallastname@domain.com`
- `hello@domain.com`
- `contact@domain.com`
- `info@domain.com`

Use unverified pattern guesses only in:

- `email_guess_1`
- `email_guess_2`
- `email_guess_3`

Pattern detection is not final proof.

Do not put a guessed pattern in `email` unless it is verified or publicly supported.

Do not put a guessed pattern in `selected_email` unless it is the best available outreach email and clearly marked with `verification_status = pattern_guess`.

### Step 4: Hunter Free lookup

If no public email is found and pattern detection is uncertain, use Hunter Free lookup when available.

Use Hunter to find:

- company domain emails
- named decision-maker email
- generic business contact email
- confidence score, if available

If Hunter returns a usable email, record:

- `selected_email`
- `source_tool = hunter`
- `verification_status = verified`, `risky`, or `pattern_guess` depending on Hunter evidence
- `email_source_url` if available
- `prospeo_needed = no`

If Hunter provides a generic email that is reliable enough for outreach, it may also be copied into `email`.

### Step 5: Prospeo fallback flag

If public email, pattern detection, and Hunter do not provide a usable email, do not force enrichment.

Use:

- `email = ""`
- `selected_email = ""`
- `verification_status = no_email_found`
- `prospeo_needed = yes`

This keeps the provider usable for later paid enrichment without inventing data.

---

## Email selection rules

Use only one selected email per provider.

Email priority:

1. named decision-maker email verified or publicly visible
2. founder or leadership email from Hunter
3. generic business email publicly visible
4. generic business email from Hunter
5. blank with `prospeo_needed = yes`

Never select:

- guessed but unverified personal emails
- role emails from unrelated directories
- emails from another company
- outdated emails from suspicious sources
- scraped emails without a source
- malformed emails
- personal Gmail/Yahoo/Outlook emails unless clearly used professionally by the consultant

---

## LinkedIn rules

LinkedIn URLs are useful but not mandatory.

Capture LinkedIn only if found from a reliable source:

- official website
- founder profile linked from website
- company LinkedIn page
- reliable search result

Do not invent LinkedIn URLs.

Do not guess profile slugs.

If unsure, leave blank.

---

## Qualification scoring

Assign one of three priority scores in `icp_fit`:

| Score | Meaning |
|---|---|
| high | Strong CRO provider, clear services, credible, likely to understand the pilot offer, good contact route |
| medium | Relevant provider but less specialized, weaker contact data, or less obvious commercial fit |
| low | Marginal fit, generic agency, weak CRO positioning, or poor contactability |

Use `low` only if the user explicitly wants broader sourcing.

Default retained providers should be `high` or `medium`.

---

## Provider why_fit rule

For every retained provider, produce a short and concrete `why_fit`.

`why_fit` must explain why the provider may be relevant for the Audit CRO pilot offer.

It must not only describe that the company provides CRO services.

Good examples:

- `Boutique CRO consultancy with clear audit and landing page optimization offer; likely relevant for testing qualified account supply.`
- `Founder-led conversion agency with B2B focus and public contact route; good fit for a small pilot offer.`
- `UX/CRO provider serving high-value service businesses; relevant for a qualified lead activation pilot.`

Bad examples:

- `They offer CRO services.`
- `They are a strong CRO agency.`
- `They have guaranteed results.`
- `Their website looks professional.`
- `Could be relevant.`
- `Might need clients.`

---

## Duplicate prevention

Before handing a provider to the Sheet Writer, check for duplicates when duplicate detection is available.

Use the following duplicate keys:

- company name
- website domain
- LinkedIn company URL
- selected email
- founder email, if available

If duplicate risk exists, do not append blindly.

Mark the provider as duplicate risk and ask the Sheet Writer or run controller to skip or verify.

If the Railway endpoint returns duplicate or HTTP 409, treat it as authoritative and do not bypass the endpoint.

---

## Prestataires_Audit_CRO allowed row fields

For `Prestataires_Audit_CRO`, use only the canonical 32 fields defined in `audit-cro-sheet-writer`.

Allowed fields:

1. `id`
2. `market`
3. `company_name`
4. `website`
5. `linkedin_url`
6. `contact_name`
7. `contact_role`
8. `contact_linkedin`
9. `email`
10. `city`
11. `country`
12. `offer_type`
13. `packaged_offer`
14. `icp_fit`
15. `why_fit`
16. `source`
17. `date_added`
18. `added_by`
19. `status`
20. `founder_name`
21. `team_size_estimate`
22. `b2b_fit`
23. `ecommerce_risk`
24. `pricing_signal`
25. `email_guess_1`
26. `email_guess_2`
27. `email_guess_3`
28. `verification_status`
29. `selected_email`
30. `prospeo_needed`
31. `source_tool`
32. `email_source_url`

Do not add provider-specific fields not present in this schema.

Do not use:

- `provider_signal_1`
- `provider_signal_2`
- `provider_signal_3`
- `provider_signal_4`
- `provider_signal_5`
- `email_confidence`
- `enrichment_status`
- `mx_status`
- `email_type`
- `provider_role`
- `provider_specialty`
- `provider_revenue_range`
- `provider_geo_focus`
- `provider_client_fit`
- `provider_lead_gen_focus`
- `provider_paid_enrichment`
- `provider_last_contacted`

If a useful data point has no matching field, summarize it briefly inside an existing field such as `why_fit`, `pricing_signal`, or `source`.

---

## Required provider row before Sheet Writer handoff

For each retained provider, prepare a named `row` object.

The row object must use only the allowed `Prestataires_Audit_CRO` fields.

Minimum required fields before writing:

- `id`
- `market`
- `company_name`
- `website`
- `country`
- `offer_type`
- `icp_fit`
- `why_fit`
- `source`
- `date_added`
- `added_by`
- `status`
- `verification_status`
- `prospeo_needed`
- `source_tool`

Recommended fields when available:

- `linkedin_url`
- `contact_name`
- `contact_role`
- `contact_linkedin`
- `email`
- `city`
- `packaged_offer`
- `founder_name`
- `team_size_estimate`
- `b2b_fit`
- `ecommerce_risk`
- `pricing_signal`
- `email_guess_1`
- `email_guess_2`
- `email_guess_3`
- `selected_email`
- `email_source_url`

Unknown optional values may be omitted from the named `row` object.

Do not invent missing values.

Do not pass unordered free-form data as final row data.

Do not use a 32-value array for real writes unless the user explicitly asks for a legacy diagnostic test.

---

## Handoff to Sheet Writer

After preparing qualified provider rows, hand them to:

`audit-cro-sheet-writer`

The handoff payload must use the preferred named row object format:

```json
{
  "row": {
    "id": "...",
    "market": "US",
    "company_name": "...",
    "website": "...",
    "country": "US",
    "offer_type": "...",
    "icp_fit": "high",
    "why_fit": "...",
    "source": "...",
    "date_added": "YYYY-MM-DD",
    "added_by": "openclaw",
    "status": "new",
    "verification_status": "no_email_found",
    "prospeo_needed": "yes",
    "source_tool": "official_website"
  }
}

The Sheet Writer is responsible for:

selecting the correct endpoint
appending to Prestataires_Audit_CRO
using the Railway server mapping into the exact A:AF schema
preventing forbidden tab writes
handling duplicate responses
treating HTTP errors as authoritative

This skill must not call Google Sheets directly.

This skill must not write directly to the endpoint.

This skill must not send provider rows to the clients endpoint.

This skill must not use values arrays for real writes unless explicitly required by the user for a legacy diagnostic test.

Allowed values

Use only the following values where applicable.

market
US
UK
icp_fit
high
medium
low
b2b_fit
high
medium
low
ecommerce_risk
low
medium
high
verification_status
not_checked
domain_mx_ok
pattern_guess
verified
risky
invalid
no_email_found
prospeo_needed
yes
no
source_tool
tavily
official_website
google_search
directory
mx_lookup
pattern_detection
hunter
prospeo
manual
added_by
openclaw
status
new
to_review
qualified
rejected
contacted

Default status:

new
Source tool selection

If multiple tools were used, choose the strongest source in this order:

official_website
hunter
prospeo
directory
mx_lookup
pattern_detection
tavily
google_search
manual

Do not use tavily as the default value if another tool provided stronger email or contact evidence.

Use official_website if the email was found directly on the company website.

Use hunter only if Hunter provided the selected email.

Use prospeo only if Prospeo provided the selected email.

Use mx_lookup only if only domain-level validation was completed.

Use pattern_detection only if only pattern guesses were produced.

Run summary required

At the end of each provider sourcing run, summarize:

number of providers searched
number of providers retained
number of duplicates skipped
number of public emails found
number of Hunter lookups used
number of leads flagged for Prospeo
number of high, medium, and low priority leads
companies written
companies skipped
exact API responses if writing occurred
main observations
next recommended action

Example summary format:
Provider sourcing run complete.

Searched: 24 providers
Retained: 8 providers
Skipped duplicates: 2
Public emails found: 4
Hunter lookups used: 3
Prospeo needed: 1
Priority split: 5 high, 3 medium, 0 low
Rows added: 8

Main observation:
Most strong fits were boutique CRO and landing page optimization providers. Generic growth agencies were weaker unless CRO was clearly positioned.

Next action:
Review the added providers in Prestataires_Audit_CRO before launching outreach.

Non-negotiable rules
Do not source final clients with this skill.
Do not write directly to Google Sheets.
Do not invent emails.
Do not invent decision makers.
Do not invent LinkedIn URLs.
Do not retain weak generic agencies just to fill volume.
Do not run unbounded searches.
Do not use Prospeo automatically unless explicitly configured and authorized.
Do not mix provider rows with client-final rows.
Do not overwrite or edit existing Sheet rows.
Do not continue searching once the run has enough qualified providers.
Do not use a values array for real writes unless explicitly requested for a legacy diagnostic test.
Always prefer verified, sourced, and explainable data over volume.
Success condition

A successful run produces a small, clean, verified batch of Audit CRO provider leads that are commercially relevant, contactable or enrichable, and ready to be appended to the Prestataires_Audit_CRO tab through audit-cro-sheet-writer using the preferred named row object format.
