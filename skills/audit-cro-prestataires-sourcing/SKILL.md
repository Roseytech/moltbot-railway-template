# Audit CRO Prestataires Sourcing

## Objective

Find and qualify CRO agencies, conversion optimization consultants, UX audit firms, and landing page optimization providers that could be relevant partners for the Audit CRO pilot.

This skill is used to source potential providers for the `Prestataires_Audit_CRO` tab only.

The goal is not to find final clients with CRO problems.  
The goal is to find providers who may buy a pilot consisting of:
- 15 qualified final-client accounts
- activation of the top 5 accounts
- upfront fee
- success fee if a deal is signed with an introduced client

## When to use this skill

Use this skill when the user asks to:
- source Audit CRO providers
- find CRO agencies
- find conversion optimization agencies
- find UX audit providers
- find landing page optimization specialists
- find B2B CRO consultants
- build a list of prestataires Audit CRO
- qualify agencies for the Audit CRO pilot

## Do not use this skill for

Do not use this skill to:
- source final clients
- identify CRO frictions on client websites
- write into reporting tabs
- edit historical rows
- modify existing Google Sheet data
- create outreach messages unless explicitly asked
- invent emails, LinkedIn URLs, roles, pricing, or team size

For final-client sourcing, use the client-facing Audit CRO sourcing skill instead.

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
- likely to work with high-ticket B2B services, SaaS, professional services, advisory, legal, accounting, consulting, or lead generation businesses
- able to benefit from qualified commercial introductions
- likely to have capacity to handle new audit opportunities

## Preferred markets

Primary markets:
- US
- UK

Secondary markets only if explicitly requested:
- Canada
- Ireland
- Australia
- Europe

## Strong fit signals

A provider is a strong fit if several of these signals are visible:

- They explicitly offer CRO audits
- They mention conversion optimization
- They offer landing page audits
- They optimize lead generation funnels
- They work with B2B, SaaS, service businesses, or high-ticket offers
- They show case studies around conversion, revenue, leads, demo bookings, signups, or funnel performance
- They have a founder, managing partner, growth lead, or CRO lead visible
- They are not too large or too enterprise-heavy
- Their offer appears compatible with a paid pilot and success-based upside

## Weak or reject signals

Reject or mark as low fit if:

- The provider is mostly SEO only
- The provider is mostly branding only
- The provider is mostly web design with no conversion angle
- The provider is ecommerce-only with no B2B or service business angle
- The provider is a huge enterprise agency with no clear founder access
- The provider is a freelance designer with no CRO evidence
- The provider is a generic digital agency with no audit, funnel, CRO, or conversion language
- The provider appears inactive
- The provider has no website or credible source
- The provider is another lead generation agency, staffing agency, recruitment firm, or marketplace

## Qualification logic

Use the existing structured fields to capture provider qualification.

Do not create or use generic provider_signal_1, provider_signal_2, provider_signal_3, provider_signal_4, or provider_signal_5 fields.

Provider qualification must be captured through:

- offer_type
- packaged_offer
- icp_fit
- why_fit
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

## Email discovery rules

Never invent emails.

Use the following logic:

1. Check the official website first.
2. Look for contact page, team page, founder page, footer, privacy page, and about page.
3. If an email is visible, capture it in `email`.
4. If no direct email is visible, infer likely patterns only when the domain and contact name are reliable.
5. Store likely patterns in `email_guess_1`, `email_guess_2`, and `email_guess_3`.
6. Use MX/domain verification where available.
7. If a reliable email cannot be selected, leave `selected_email` blank and set `prospeo_needed` to `yes`.
8. If a reliable email is selected, set `prospeo_needed` to `no`.
9. Always capture the source or tool used in `source_tool`.
10. Always capture the URL supporting the email or domain in `email_source_url` when available.

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

- `not_checked`: no verification has been performed
- `domain_mx_ok`: the domain appears able to receive email, but the mailbox is not confirmed
- `pattern_guess`: email is inferred from a pattern, not directly verified
- `verified`: email appears directly verified or clearly published by the provider
- `risky`: email may be uncertain or generic
- `invalid`: email or domain appears invalid
- `no_email_found`: no usable email or pattern was found

## Prospeo logic

Set `prospeo_needed` to:

- `yes` if no reliable email is found
- `yes` if only weak pattern guesses exist
- `yes` if contact name exists but email is missing
- `no` if a reliable selected email exists
- `no` if the provider should be rejected and no enrichment is worth spending

## Allowed values

Use only these values where applicable:

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
- mx_lookup
- prospeo
- manual

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

Manual columns after this point must not be filled by this skill unless explicitly requested by the user.

## Field guidance

### id
Create a stable, readable id using:
- provider
- market
- company slug
- date or sequence if needed

Example:
`provider_us_conversionwise_20260427`

### offer_type
Use a short description.

Examples:
- CRO audit
- conversion optimization
- landing page optimization
- UX audit
- funnel optimization
- B2B website optimization

### packaged_offer
Describe the offer only if visible.

Examples:
- CRO audit for B2B SaaS
- landing page review
- website conversion audit
- funnel optimization sprint
- conversion research package

Leave blank if unknown.

### icp_fit
Use:
- `high` if the provider clearly matches the Audit CRO pilot
- `medium` if the provider has partial fit
- `low` if fit is weak but not fully rejected

### why_fit
Keep it short, concrete, and evidence-based.

Good example:
`CRO-focused agency with B2B landing page audits and visible founder contact.`

Bad example:
`Great company that could be a good partner for us.`

### source
Use the main source URL used to qualify the provider.

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

Use `rejected` only if the provider clearly does not fit.

### team_size_estimate
Use only if reasonably inferable from the website or LinkedIn.

Examples:
- solo
- 2-5
- 6-10
- 11-25
- 26-50
- 50+

Leave blank if unknown.

### pricing_signal
Capture only visible or strongly inferred pricing signal.

Examples:
- audit package visible
- pricing page visible
- high-ticket service positioning
- enterprise pricing
- no pricing visible

Do not invent prices.

## Search workflow

For each sourcing run:

1. Define the market: US or UK.
2. Search for CRO providers using targeted queries.
3. Open and verify the official website.
4. Check whether the provider clearly offers CRO, UX audit, conversion, funnel, or landing page optimization.
5. Check whether the provider works with B2B, SaaS, services, or high-ticket clients.
6. Identify the best decision maker when possible.
7. Search for email or email pattern.
8. Fill the row fields in the exact order.
9. Do not include providers with unclear fit unless marked `to_review`.
10. Do not add duplicates.

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

## Duplicate prevention

Before adding a provider, check for duplicates using:

- website
- company_name
- linkedin_url
- selected_email
- contact_linkedin

If a provider already exists, do not create a new row.  
If new information is found for an existing provider, return the update suggestion to the user instead of overwriting the sheet.

## Output format

When asked to return results without writing to the sheet, output a table with the exact Prestataires_Audit_CRO fields.

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

## Safety rules

- Do not invent contacts.
- Do not invent emails.
- Do not invent LinkedIn URLs.
- Do not invent pricing.
- Do not invent team size.
- Do not classify generic agencies as CRO providers without evidence.
- Do not spend Prospeo credits unless the provider is otherwise relevant.
- Keep all justifications short and concrete.
