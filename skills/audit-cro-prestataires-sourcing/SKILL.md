---
name: audit-cro-prestataires-sourcing
description: Mandatory sourcing skill for finding and qualifying Audit CRO providers, CRO agencies, UX audit firms, landing page optimization providers, and conversion optimization consultants for the Prestataires_Audit_CRO tab. Enforces bounded Tavily discovery, MX/pattern detection, Hunter Free lookup, Prospeo fallback, and correct Prestataires_Audit_CRO mapping.
---

# Audit CRO Prestataires Sourcing

## Objective

Find and qualify CRO agencies, conversion optimization consultants, UX audit firms, landing page optimization providers, and funnel optimization specialists that could be relevant partners for the Audit CRO pilot.

This skill is used to source potential providers for the `Prestataires_Audit_CRO` tab only.

The goal is not to find final clients with CRO problems.

The goal is to find providers who may buy a pilot consisting of:

- 15 qualified final-client accounts
- activation of the top 5 accounts
- upfront fee
- success fee if a deal is signed with an introduced client

This skill must not write directly to the Google Sheet.  
Writing must go through the Audit CRO Sheet Writer only.

---

## When to use this skill

Use this skill when the user asks to:

- source Audit CRO providers
- find CRO agencies
- find conversion optimization agencies
- find UX audit providers
- find landing page optimization specialists
- find funnel optimization specialists
- find B2B CRO consultants
- build a list of prestataires Audit CRO
- qualify agencies for the Audit CRO pilot
- find agencies that could buy the Audit CRO pilot

---

## Do not use this skill for

Do not use this skill to:

- source final clients
- identify CRO frictions on client websites
- write into reporting tabs
- edit historical rows
- modify existing Google Sheet data
- create outreach messages unless explicitly asked
- invent emails, LinkedIn URLs, roles, pricing, team size, or sources

For final-client sourcing, use the client-facing Audit CRO sourcing skill instead.

---

## Target provider profile

Prioritize providers that match most of the following:

- CRO agency
- conversion optimization consultant
- UX audit provider
- landing page optimization agency
- funnel optimization specialist
- paid traffic landing page specialist
- B2B website optimization consultant
- founder-led or small team
- likely to work with high-ticket B2B services, SaaS, professional services, advisory, legal, accounting, consulting, or lead-generation websites
- able to benefit from qualified commercial introductions
- likely to have capacity to handle new audit opportunities
- likely to understand the value of qualified opportunities rather than raw lead lists

---

## Preferred markets

Primary markets:

- US
- UK

Use these values only in the `market` field unless the user explicitly requests another market:

- US
- UK

---

## Tool stack for provider sourcing

Use the following stack in this exact order:

1. Tavily for provider discovery and web verification
2. Official website review
3. MX lookup and email pattern detection
4. Hunter Free for conservative email lookup
5. Prospeo enrich-person as fallback only

Tavily is the primary discovery tool.

Hunter is not a sourcing tool. Hunter is only used after a provider is already qualified and when a reliable contact name plus domain are available.

Prospeo is not a sourcing tool. Prospeo is only used as fallback enrichment when:
- the provider is already qualified
- Hunter returned no usable result
- only weak email patterns exist
- a contact name exists but no reliable email is available

Do not use Prospeo before Tavily, official website review, MX check, and Hunter logic.

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
- qualified providers only
  
---

## Strong fit signals

A provider is a strong fit if several of these signals are visible:

- They explicitly offer CRO audits
- They mention conversion optimization
- They offer landing page audits
- They optimize lead-generation funnels
- They work with B2B, SaaS, service businesses, or high-ticket offers
- They show case studies around conversion, revenue, leads, demo bookings, signups, calls, or funnel performance
- They have a founder, managing partner, growth lead, CRO lead, or conversion strategist visible
- They are not too large or too enterprise-heavy
- Their offer appears compatible with a paid pilot and success-based upside
- Their site suggests they could handle qualified audit opportunities
- Their positioning is clear enough to match them with client-final opportunities

---

## Weak or reject signals

Reject or mark as low fit if:

- the provider is mostly SEO only
- the provider is mostly branding only
- the provider is mostly web design with no conversion angle
- the provider is ecommerce-only with no B2B or service business angle
- the provider is a huge enterprise agency with no clear founder access
- the provider is a freelance designer with no CRO evidence
- the provider is a generic digital agency with no audit, funnel, CRO, or conversion language
- the provider appears inactive
- the provider has no website or credible source
- the provider is another lead generation agency, staffing agency, recruitment firm, or marketplace
- the provider sells tools or software instead of services
- the provider appears too small or too weak to buy a pilot
- the provider has no clear decision maker and no useful contact path

When in doubt, skip or mark as `to_review`.

---

## Definition of a valid provider lead

A provider lead is valid only if all mandatory criteria are met:

- official website loads
- company is based in the US or UK unless the user explicitly requests another market
- company is a provider, not a final-client business
- provider clearly offers CRO, conversion optimization, UX audit, landing page optimization, funnel optimization, or website conversion audit
- provider appears commercially credible enough to buy or test the Audit CRO pilot
- source URL is available
- email enrichment status is captured
- no duplicate exists based on company name, website, LinkedIn URL, selected email, or visible email

A public email is preferred but not strictly mandatory if the provider is otherwise qualified and the row clearly sets:

- verification_status
- selected_email if available
- prospeo_needed
- source_tool
- email_source_url if available

If the provider looks relevant but needs human review, use:

`status = to_review`

If the provider does not clearly offer CRO, UX audit, conversion, funnel optimization, landing page optimization, or website conversion audit, skip it.

---

## Qualification logic

Use the existing structured fields to capture provider qualification.

Do not create or use generic provider signal fields.

Do not use:

- provider_signal_1
- provider_signal_2
- provider_signal_3
- provider_signal_4
- provider_signal_5

Provider qualification must be captured through:

- offer_type
- packaged_offer
- icp_fit
- why_fit
- founder_name
- team_size_estimate
- b2b_fit
- ecommerce_risk
- pricing_signal

The email enrichment workflow must be captured through:

- email_guess_1
- email_guess_2
- email_guess_3
- verification_status
- selected_email
- prospeo_needed
- source_tool
- email_source_url

---

## Email discovery rules

Never invent emails.

Use the following logic:

1. Check the official website first.
2. Look for the contact page, team page, founder page, footer, privacy page, about page, and case study pages.
3. If an email is visible on an official source, capture it in `email`.
4. If no direct email is visible, leave `email` blank.
5. Check MX only when the provider domain appears reliable and active.
6. If MX is valid, set `verification_status` to `domain_mx_ok` unless a stronger status applies.
7. If a reliable domain and contact name are available, infer likely patterns only when reasonable.
8. Store likely patterns in:
   - `email_guess_1`
   - `email_guess_2`
   - `email_guess_3`
9. Do not treat an inferred pattern as verified.
10. Use Hunter Free only when:
   - the provider is already qualified
   - the domain is reliable
   - MX appears valid
   - contact name is available
11. If Hunter returns a strong email with acceptable confidence, place it in `selected_email`.
12. If Hunter returns a weak, risky, or accept-all result, do not mark it as verified.
13. If Hunter returns no usable result, set `prospeo_needed` to `yes` when the provider is valuable enough.
14. Use Prospeo only as fallback enrichment.
15. If Prospeo returns a verified email, place it in `selected_email`.
16. If no reliable email can be selected, leave `selected_email` blank.
17. Always set `verification_status`.
18. Always set `source_tool`.
19. Always capture the URL supporting the email, contact page, domain, Hunter result, Prospeo result, or pattern evidence in `email_source_url` when available.

Accepted email sources:

- official website
- official contact page
- official team page
- official founder page
- official public profile
- trusted professional directory
- Hunter, only after provider qualification
- Prospeo, only as fallback
- MX or domain check, only for domain-level validation

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
- `verified`: the email appears directly verified or clearly published by the provider
- `risky`: the email is uncertain, weak, or generic
- `invalid`: the email or domain appears invalid
- `no_email_found`: no usable email or pattern was found

---

## Prospeo logic

Prospeo is fallback only.

Do not use Prospeo to source providers.

Do not use Prospeo for weak providers.

Set `prospeo_needed` to:

- `yes` if no reliable email is found
- `yes` if only weak pattern guesses exist
- `yes` if Hunter returns no usable result
- `yes` if contact name exists but email is missing
- `yes` if the provider is otherwise relevant and enrichment would be worth spending
- `no` if a reliable selected email exists
- `no` if the provider should be rejected and no enrichment is worth spending

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

- the provider is not qualified
- the ICP fit is low
- the CRO, UX audit, funnel optimization, landing page optimization, or conversion angle is weak
- the provider is outside the requested market
- the website does not load
- the provider is a duplicate
  
---

## Allowed values

Use only these values where applicable.

### market

- US
- UK

### icp_fit

- high
- medium
- low

### b2b_fit

- high
- medium
- low

### ecommerce_risk

- low
- medium
- high

### status

- new
- to_review
- qualified
- rejected
- contacted

### added_by

- openclaw

### source_tool

- tavily
- official_website
- google_search
- directory
- mx_lookup
- pattern_detection
- hunter
- prospeo
- manual

---

## Field order for Prestataires_Audit_CRO

When producing rows for the `Prestataires_Audit_CRO` tab, use this exact field order:

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
12. offer_type
13. packaged_offer
14. icp_fit
15. why_fit
16. source
17. date_added
18. added_by
19. status
20. founder_name
21. team_size_estimate
22. b2b_fit
23. ecommerce_risk
24. pricing_signal
25. email_guess_1
26. email_guess_2
27. email_guess_3
28. verification_status
29. selected_email
30. prospeo_needed
31. source_tool
32. email_source_url

Writable range:

`Prestataires_Audit_CRO!A:AF`

Manual columns after this point must not be filled by this skill unless explicitly requested by the user.

---

## Field guidance

### source_tool

Use the most relevant source or tool used for email discovery, contact evidence, or enrichment.

Allowed values:

- tavily
- official_website
- google_search
- directory
- mx_lookup
- pattern_detection
- hunter
- prospeo
- manual

If an email or contact was found, prioritize the tool/source that produced that email or contact evidence.

Examples:

- use `official_website` if the email was found directly on the provider website
- use `directory` if the email or contact evidence came from a trusted professional directory
- use `hunter` if Hunter provided the selected email
- use `prospeo` if Prospeo provided the selected email
- use `mx_lookup` if only domain-level validation was completed
- use `pattern_detection` if only pattern guesses were produced
- use `tavily` only if Tavily was the main discovery source and no stronger email or contact source exists
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

### id

Create a stable, readable id using:

- provider
- market
- company slug
- date or sequence if needed

Example:

`provider_us_conversionwise_20260427`

Do not use random IDs if a stable slug is possible.

### market

Use only:

- US
- UK

Unless the user explicitly requests another market.

### company_name

Use the official company name from the website or trusted source.

Do not invent or normalize too aggressively.

### website

Use the official website URL.

Do not use directory URLs as the company website.

### linkedin_url

Use the official company LinkedIn URL if found.

Leave blank if unknown.

Do not invent LinkedIn URLs.

### contact_name

Use the best decision maker if found.

Prioritize:

- founder
- co-founder
- managing partner
- CEO
- growth lead
- CRO lead
- conversion strategist
- head of strategy

Leave blank if unknown.

### contact_role

Use the exact role if visible.

Examples:

- Founder
- Co-Founder
- Managing Partner
- CEO
- Conversion Strategist
- CRO Lead
- Growth Lead

Leave blank if unknown.

### contact_linkedin

Use the decision maker LinkedIn URL if found.

Leave blank if unknown.

Do not invent LinkedIn URLs.

### email

Use only a visible public email.

Leave blank if no visible public email exists.

### city

Use only if reasonably available.

Leave blank if unknown.

### country

Use the country corresponding to the market.

Examples:

- United States
- United Kingdom

### offer_type

Use a short description.

Examples:

- CRO audit
- conversion optimization
- landing page optimization
- UX audit
- funnel optimization
- B2B website optimization
- website conversion audit
- growth audit

### packaged_offer

Describe the offer only if visible.

Examples:

- CRO audit for B2B SaaS
- landing page review
- website conversion audit
- funnel optimization sprint
- conversion research package
- UX and conversion audit
- lead-generation website audit

Leave blank if unknown.

### icp_fit

Use:

- `high` if the provider clearly matches the Audit CRO pilot
- `medium` if the provider has partial fit
- `low` if fit is weak but not fully rejected

Prefer skipping very weak providers instead of adding low-quality rows.

### why_fit

Keep it short, concrete, and evidence-based.

Good example:

`CRO-focused agency with B2B landing page audits and visible founder contact.`

Bad example:

`Great company that could be a good partner for us.`

### source

Use the main source URL used to qualify the provider.

Prefer the official website or relevant service page over a directory.

### date_added

Use ISO format only:

`YYYY-MM-DD`

### added_by

Always use:

`openclaw`

### status

Default status:

`new`

Use `to_review` if the provider looks interesting but needs human review.

Use `qualified` only if the user specifically asks for qualified status.

Use `rejected` only if the provider clearly does not fit.

### founder_name

Use only if reasonably visible from the website, LinkedIn, or trusted source.

Leave blank if unknown.

### team_size_estimate

Use only if reasonably inferable from the website, LinkedIn, or trusted source.

Examples:

- solo
- 2-5
- 6-10
- 11-25
- 26-50
- 50+

Leave blank if unknown.

Do not invent team size.

### b2b_fit

Use:

- `high` if the provider clearly works with B2B, SaaS, professional services, or lead-generation websites
- `medium` if B2B fit is possible but not obvious
- `low` if the provider appears mostly consumer, brand, or ecommerce oriented

### ecommerce_risk

Use:

- `low` if the provider is clearly B2B, SaaS, or services-oriented
- `medium` if ecommerce appears present but not dominant
- `high` if the provider appears ecommerce-first or ecommerce-only

Do not automatically reject ecommerce risk if the provider has strong B2B conversion work. Mark it clearly.

### pricing_signal

Capture only visible or strongly inferred pricing signal.

Examples:

- audit package visible
- pricing page visible
- high-ticket service positioning
- enterprise pricing
- no pricing visible
- retainer positioning
- project-based service

Do not invent prices.

### email_guess_1, email_guess_2, email_guess_3

Use only for plausible inferred email patterns.

Examples:

- firstname@domain.com
- hello@domain.com
- contact@domain.com

Do not put guesses in `email`.

Do not treat guesses as verified.

### selected_email

Use the email selected for outreach if reliable enough.

It can be:

- visible public email
- verified email
- best available generic email
- selected pattern only if the row clearly says `verification_status = pattern_guess`

Leave blank if no reliable email exists.

### prospeo_needed

Use:

- `yes` if further enrichment is needed
- `no` if a usable selected email exists
- `no` if the provider is not worth enriching

### source_tool

Follow the detailed `source_tool` guidance defined earlier in this Field guidance section.

Do not use a weaker or different interpretation of `source_tool`.

### email_source_url

Use the URL supporting the email, domain, contact page, or email pattern.

Leave blank only if no email evidence is available.

---

## Search workflow

For each sourcing run:

1. Define the target tab as `Prestataires_Audit_CRO`.
2. Define the market: US or UK.
3. Define the provider ICP or niche if specified by the user.
4. Use Tavily to search for CRO providers through targeted queries.
5. Open and verify the official website.
6. Check whether the provider clearly offers CRO, UX audit, conversion optimization, funnel optimization, landing page optimization, or website conversion audit.
7. Check whether the provider works with B2B, SaaS, services, professional services, high-ticket offers, or lead-generation websites.
8. Identify the best decision maker when possible.
9. Search the official website for visible email evidence.
10. Run MX or domain validation if the domain is reliable and no direct email is visible.
11. Produce email patterns only when name plus domain evidence is strong enough.
12. Use Hunter Free only if the provider is already qualified and contact name plus domain are available.
13. Use Prospeo only as fallback if Hunter is unavailable, empty, weak, or insufficient.
14. Fill the row fields in the exact order.
15. Do not include providers with unclear fit unless marked `to_review`.
16. Do not add duplicates.
17. Return the results in review mode unless writing was explicitly approved.

---

## Recommended search queries

Use combinations such as:

- CRO agency B2B SaaS US
- conversion optimization agency professional services US
- landing page optimization agency B2B US
- CRO consultant high ticket services US
- website conversion audit agency UK
- B2B conversion optimization consultant UK
- landing page audit consultant UK
- CRO agency lead generation websites UK
- conversion rate optimization consultant SaaS UK
- UX audit agency B2B services US
- website conversion audit consultant professional services UK
- B2B SaaS CRO consultant US
- lead generation website optimization agency UK

Do not rely only on generic directories.

Always verify through the official website when possible.

---

## Sourcing method

Use micro-batches.

Do not attempt large batches immediately.

Preferred batch size:

- check up to 20 provider candidates
- return or append up to 10 qualified provider rows

For highly specific niches:

- check up to 15 provider candidates
- return or append up to 5 qualified provider rows

If the user gives a specific limit, follow the user limit.

Never run open-ended searches.

---

## Cost discipline

Do not spend Hunter or Prospeo credits on weak providers.

Before using Hunter:

- the provider must be qualified
- the provider ICP must be confirmed
- the domain must be reliable
- MX should appear valid
- contact name must be available

Before using Prospeo:

- the provider must be qualified
- Hunter must be unavailable, empty, weak, or insufficient
- the provider must be worth paid fallback enrichment

A strong qualified provider with no verified email is better than a weak provider with an email.

Do not continue enriching once a reliable selected email exists.

---

## Duplicate prevention

Before adding a provider, check for duplicates if duplicate detection is available.

Use these duplicate keys:

- website
- company_name
- linkedin_url
- selected_email
- email
- contact_linkedin

If a provider already exists:

- do not create a new row
- return the company as skipped
- explain the duplicate reason

If new information is found for an existing provider:

- do not overwrite the sheet
- return the update suggestion to the user

---

## Review mode vs write mode

Default mode is review mode.

In review mode:

- search and validate providers
- do not write to the Sheet
- return qualified providers for user review
- include skipped providers and reasons when useful

Use review mode when the user says:

- source
- find
- cherche
- identify
- build a list
- review
- qualify
- shortlist

Write mode is allowed only when the user explicitly says:

- append
- write
- add to the sheet
- proceed
- yes
- go
- continue
- ajoute
- écris dans le sheet
- ajoute au sheet

When writing is approved:

- use the Audit CRO Sheet Writer only
- use the approved Railway endpoint only
- do not write directly to Google Sheets
- do not use local file write
- do not bypass the endpoint
- do not claim success unless the endpoint confirms success

---

## Output format

When asked to return results without writing to the sheet, output a table with the exact `Prestataires_Audit_CRO` fields.

When asked to write results, use the approved sheet writing mechanism only.

Never write to:

- README
- Business_Model
- Matching_Intro
- Outreach_Tracker
- Leads_Envoyés_au_Presta
- Revenue_Tracker
- Budget_Tracker
- Dashboard

---

## Review mode output

If the run is in review mode, return:

- target tab
- selected market
- selected provider ICP or niche
- candidate limit used
- qualified providers found
- skipped providers if useful
- reason each provider qualifies
- missing enrichment items, if any

Do not claim that rows were added.

Do not call the Sheet Writer.

---

## Write mode output

After writing rows, return only:

- exact rows added count
- companies successfully appended
- companies skipped or failed with reason

The count must match the number of companies listed.

If 9 companies were appended, say 9.

If 8 companies were appended, list only 8.

Never claim a row was added unless the write action returned success.

If there is any inconsistency between attempted rows and successfully written rows, clearly state it.

---

## Safety rules

- Do not invent companies.
- Do not invent contacts.
- Do not invent emails.
- Do not invent LinkedIn URLs.
- Do not invent pricing.
- Do not invent team size.
- Do not invent sources.
- Do not classify generic agencies as CRO providers without evidence.
- Do not spend Prospeo credits unless the provider is otherwise relevant.
- Do not write to the Sheet directly.
- Do not overwrite existing rows.
- Keep all justifications short and concrete.
