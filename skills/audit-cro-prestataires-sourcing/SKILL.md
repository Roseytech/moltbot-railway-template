---
name: audit-cro-prestataires-sourcing
description: Mandatory sourcing skill for finding and qualifying Audit CRO providers, CRO agencies, UX audit firms, landing page optimization providers, and conversion optimization consultants for the Prestataires_Audit_CRO tab. Enforces bounded Tavily discovery, website validation, MX and email pattern detection, Hunter Free lookup, Prospeo fallback flagging, and correct handoff to the Audit CRO Sheet Writer.
---

# Audit CRO Prestataires Sourcing

## Objective

Find and qualify CRO providers that could buy or test the Audit CRO pilot offer.

This skill is used only to source potential providers for the `Prestataires_Audit_CRO` tab.

A provider is a company, agency, consultant, studio, or boutique firm that sells services related to:

- conversion rate optimization
- CRO audit
- landing page optimization
- UX audit
- funnel optimization
- website conversion improvement
- experimentation
- A/B testing strategy
- ecommerce conversion optimization
- B2B SaaS conversion optimization

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

Allowed countries:

- US
- UK

Do not source providers outside the US or UK unless the user explicitly asks for another market.

If a provider operates internationally but has a clear US or UK presence, it may be retained.

---

## Provider types to prioritize

Prioritize providers that are commercially aligned with the Audit CRO pilot.

Best-fit provider categories:

| Priority | Provider type | Why it fits |
|---|---|---|
| High | Boutique CRO agencies | Likely to need qualified client accounts and sales activation |
| High | UX audit firms | Often close to CRO but may lack outbound lead generation |
| High | Landing page optimization providers | Strong fit for qualified final-client lead supply |
| High | Conversion consultants | Lean structure, often open to revenue-sharing or pilot models |
| Medium | Growth agencies with clear CRO offer | Fit only if CRO is a visible service, not a vague growth claim |
| Medium | Ecommerce CRO agencies | Fit if they sell audits, experimentation, funnel work |
| Medium | B2B SaaS conversion agencies | Fit if they target SaaS demos, calls, trials, pipeline conversion |
| Low | Generic web agencies | Keep only if conversion optimization is clearly positioned |
| Low | SEO/PPC agencies | Keep only if CRO is a serious visible service |
| Exclude | Lead gen agencies | Not relevant unless CRO services are explicit |
| Exclude | Software vendors | Not service providers unless they also provide CRO consulting |

---

## Hard exclusions

Reject the provider if any of the following applies:

- no clear CRO, UX audit, funnel, experimentation, or landing page optimization service
- purely a software tool/vendor with no service offer
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
| Country is US or UK | Yes |
| CRO or adjacent service is visible | Yes |
| Provider is not a final-client lead | Yes |
| Contact route exists or enrichment path is possible | Yes |
| Clear reason why they fit the Audit CRO pilot | Yes |
| Duplicate check performed | Yes |

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

- email
- source URL
- email type: public
- confidence: high

### Step 2: Domain and MX check

If no public email is found, identify the provider domain.

Check whether the domain has MX records.

If MX records are valid, record:

- domain
- MX status: valid
- email enrichment route: pattern_detection

If MX records are missing or invalid, do not guess an email.

Record:

- MX status: invalid or not_found
- email enrichment route: blocked
- enrichment note explaining why

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

Pattern detection is not final proof.

Only use a pattern email as selected email if it is verified or strongly supported by public evidence.

Do not write guessed emails as confirmed emails.

### Step 4: Hunter Free lookup

If no public email is found and pattern detection is uncertain, use Hunter Free lookup when available.

Use Hunter to find:

- company domain emails
- named decision-maker email
- generic business contact email
- confidence score, if available

If Hunter returns a usable email, record:

- selected email
- source: Hunter
- confidence: medium or high depending on Hunter evidence
- enrichment route: hunter

### Step 5: Prospeo fallback flag

If public email, pattern detection, and Hunter do not provide a usable email, do not force enrichment.

Flag the lead as:

- `prospeo_needed = yes`
- `selected_email = blank`
- `email_confidence = low`
- `enrichment_status = pending_prospeo`

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

Assign one of three priority scores:

| Score | Meaning |
|---|---|
| high | Strong CRO provider, clear services, credible, likely to understand the pilot offer, good contact route |
| medium | Relevant provider but less specialized, weaker contact data, or less obvious commercial fit |
| low | Marginal fit, generic agency, weak CRO positioning, or poor contactability |

Use `low` only if the user explicitly wants broader sourcing.

Default retained providers should be `high` or `medium`.

---

## Fit assessment

For every retained provider, produce a short and concrete `why_fit`.

Good examples:

- `Boutique CRO agency focused on landing page and funnel optimization; likely fit for qualified account supply.`
- `UK conversion consultant with clear audit and experimentation offer; could use sourced client accounts for business development.`
- `B2B SaaS CRO agency with conversion audit services and founder-led structure; good fit for pilot outreach.`

Bad examples:

- `Looks good.`
- `Interesting agency.`
- `Could be relevant.`
- `Website seems nice.`
- `Might need clients.`

---

## Duplicate prevention

Before handing a provider to the Sheet Writer, check for duplicates using:

- company name
- website domain
- LinkedIn company URL
- selected email
- founder email, if available

If duplicate risk exists, do not append blindly.

Mark the provider as duplicate risk and ask the Sheet Writer or run controller to skip or verify.

---

## Required output before Sheet Writer handoff

For each retained provider, prepare a structured object with the fields required by the `Prestataires_Audit_CRO` tab.

Use the current column schema defined in the Audit CRO Google Sheet and the `audit-cro-sheet-writer` skill.

Do not reorder columns manually unless the Sheet Writer explicitly requires it.

Minimum provider data should include, when available:

- provider_name
- country
- city_state
- provider_type
- website
- domain
- linkedin_company_url
- decision_maker_first_name
- decision_maker_last_name
- decision_maker_full_name
- decision_maker_role
- decision_maker_linkedin_url
- selected_email
- email_type
- email_source
- email_source_url
- email_confidence
- mx_status
- email_pattern_detected
- hunter_used
- hunter_result
- prospeo_needed
- enrichment_status
- services_offered
- target_clients
- cro_specialization
- proof_points
- why_fit
- priority_score
- source_query
- source_url
- qualification_notes
- duplicate_check_status

If a value is unknown, leave it blank.

Do not invent missing values.

---

## Handoff to Sheet Writer

After preparing qualified provider rows, hand them to:

`audit-cro-sheet-writer`

The Sheet Writer is responsible for:

- selecting the correct endpoint
- appending to `Prestataires_Audit_CRO`
- enforcing the exact column order
- preventing forbidden tab writes
- handling duplicate responses
- treating HTTP errors as authoritative

This skill must not call Google Sheets directly.

This skill must not write to:

- `Clients_Finaux_Audit_CRO`
- `README`
- `Business_Model`
- `Matching_Intro`
- `Outreach_Tracker`
- `Leads_Envoyés_au_Presta`
- `Revenue_Tracker`
- `Budget_Tracker`
- `Dashboard`

---

## Run summary required

At the end of each provider sourcing run, summarize:

- number of providers searched
- number of providers retained
- number of duplicates skipped
- number of public emails found
- number of Hunter lookups used
- number of leads flagged for Prospeo
- number of high, medium, and low priority leads
- main observations
- next recommended action

Example summary format:

```text
Provider sourcing run complete.

Searched: 24 providers
Retained: 8 providers
Skipped duplicates: 2
Public emails found: 4
Hunter lookups used: 3
Prospeo needed: 1
Priority split: 5 high, 3 medium, 0 low

Main observation:
Most strong fits were boutique CRO and landing page optimization providers. Generic growth agencies were weaker unless CRO was clearly positioned.

Next action:
Send retained rows to audit-cro-sheet-writer for append into Prestataires_Audit_CRO.

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
Always prefer verified, sourced, and explainable data over volume.
Success condition

A successful run produces a small, clean, verified batch of Audit CRO provider leads that are commercially relevant, contactable or enrichable, and ready to be appended to the Prestataires_Audit_CRO tab through the Sheet Writer.
