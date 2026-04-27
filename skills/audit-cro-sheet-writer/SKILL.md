---
name: audit-cro-sheet-writer
description: Mandatory writing skill for appending Audit CRO provider and final-client leads to the live Google Sheet via the approved Railway endpoints using exec curl POST only.
---

# Audit CRO Sheet Writer

Use this skill only when the user asks to write qualified Audit CRO leads to the live Google Sheet.

This skill is only for writing already qualified rows into the two approved Audit CRO sourcing tabs.

It must not be used for sourcing, enrichment, strategy, outreach, reporting, or editing existing data.

## Mandatory rules

- Use exec curl POST only to call the approved Railway endpoints.
- Never write directly to Google Sheets.
- Never use local file write.
- Append only.
- Never overwrite or edit existing rows.
- Never write to forbidden tabs.
- Never bypass the Railway endpoint.
- Never call the endpoint with empty rows.
- Never claim success unless the Railway API returns success.
- If the endpoint returns an error, duplicate response, or HTTP 409, do not retry elsewhere.
- Never invent companies, websites, LinkedIn URLs, contacts, roles, emails, pricing, team size, or sources.
- Never write duplicate companies, websites, LinkedIn URLs, or emails if duplicate detection is available.
- Leave unknown optional values blank.
- Use plain strings only.
- Use ISO dates only: YYYY-MM-DD.

## Approved write tabs

OpenClaw may write only into:

- `Prestataires_Audit_CRO`
- `Clients_Finaux_Audit_CRO`

OpenClaw must never write into:

- `README`
- `Business_Model`
- `Matching_Intro`
- `Outreach_Tracker`
- `Leads_Envoyés_au_Presta`
- `Revenue_Tracker`
- `Budget_Tracker`
- `Dashboard`

## Approved endpoints

### Clients endpoint

POST:

https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/clients

### Providers endpoint

POST:

https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/prestataires

## Write ranges

The OpenClaw writable zone is A:AF for both tabs.

- `Prestataires_Audit_CRO!A:AF`
- `Clients_Finaux_Audit_CRO!A:AF`

Manual columns after AF must not be filled by OpenClaw.

## Prestataires_Audit_CRO schema order

When appending provider rows, use this exact field order:

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

Do not use:

- provider_signal_1
- provider_signal_2
- provider_signal_3
- provider_signal_4
- provider_signal_5

Provider qualification must use the existing structured fields:

- offer_type
- packaged_offer
- icp_fit
- why_fit
- founder_name
- team_size_estimate
- b2b_fit
- ecommerce_risk
- pricing_signal

## Clients_Finaux_Audit_CRO schema order

When appending final-client rows, use this exact field order:

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

Final-client qualification must use:

- industry
- employee_range
- cro_friction_summary
- icp_fit
- why_fit
- cro_signal_1
- cro_signal_2
- cro_signal_3
- cro_signal_4
- cro_signal_5

Do not use the old field name `pain_signal`.

Use `cro_friction_summary` instead.

Do not add `status` to the client-final schema unless the Google Sheet has a matching OpenClaw column for it.

## Required before writing provider leads

For each provider lead, the following fields must be present:

- company_name
- website
- market
- country
- offer_type
- icp_fit
- why_fit
- source
- date_added
- added_by
- status

The provider business must be confirmed.

The provider must clearly offer at least one of the following:

- CRO
- conversion optimization
- UX audit
- landing page optimization
- funnel optimization
- website conversion audit
- lead-generation website optimization

The provider must not be:

- a staffing agency
- a recruitment firm
- a lead-gen agency selling generic leads
- a marketplace
- a generic web agency with no CRO or conversion evidence
- an ecommerce-only agency unless the user explicitly accepts ecommerce risk

## Required before writing final-client leads

For each final-client lead, the following fields must be present:

- company_name
- website
- market
- country
- industry
- cro_friction_summary
- icp_fit
- why_fit
- source
- date_added
- added_by
- at least one cro_signal field

The final-client business must be confirmed.

The final-client lead must have observable CRO friction.

The final-client lead must not be:

- a marketing agency
- a CRO agency
- a lead-gen agency
- a funnel agency
- a web agency
- a consultant selling CRO or marketing services
- another provider candidate

## Email enrichment rules

Email enrichment is useful but must not lead to invented data.

Use the following rules for both provider and final-client rows:

- If a public email is visible, capture it in `email`.
- If no public email is visible, leave `email` blank.
- If reliable email patterns are inferred, put them in `email_guess_1`, `email_guess_2`, and `email_guess_3`.
- If one email is selected for outreach, put it in `selected_email`.
- If no reliable email can be selected, leave `selected_email` blank.
- If enrichment with Prospeo is needed, set `prospeo_needed` to `yes`.
- If no enrichment is needed, set `prospeo_needed` to `no`.
- Always set `verification_status`.
- Always set `source_tool`.
- Add `email_source_url` when an email, domain, or pattern source is available.

A row may be written without `selected_email` only if:

- the company is otherwise qualified
- the source is reliable
- `verification_status` explains the situation
- `prospeo_needed` is set to `yes`

Do not write a row with no website and no source.

## Allowed values

### market

Use only:

- US
- UK

### icp_fit

Use only:

- high
- medium
- low

### b2b_fit

Use only:

- high
- medium
- low

### ecommerce_risk

Use only:

- low
- medium
- high

### verification_status

Use only:

- not_checked
- domain_mx_ok
- pattern_guess
- verified
- risky
- invalid
- no_email_found

Definitions:

- `not_checked`: no email verification has been performed
- `domain_mx_ok`: the domain appears able to receive email, but the mailbox is not confirmed
- `pattern_guess`: the email is inferred from a pattern, not directly verified
- `verified`: the email appears directly verified or clearly published by the company
- `risky`: the email is uncertain or weak
- `invalid`: the email or domain appears invalid
- `no_email_found`: no usable email or pattern was found

### prospeo_needed

Use only:

- yes
- no

### source_tool

Use only:

- tavily
- official_website
- google_search
- mx_lookup
- prospeo
- manual

### added_by

Use only:

- openclaw

### provider status

For `Prestataires_Audit_CRO`, use only:

- new
- to_review
- qualified
- rejected
- contacted

Default value:

- new

## Duplicate prevention

Before writing, check for duplicates if duplicate detection is available.

Use the following duplicate keys:

- company_name
- website
- linkedin_url
- contact_linkedin
- email
- selected_email

If a duplicate exists:

- do not append the row
- return the company as skipped
- explain the duplicate reason

If new information is found for an existing company:

- do not overwrite the sheet
- return the update suggestion to the user

## Empty write rule

Never call the Railway endpoint with empty rows or empty values.

If no qualified lead is prepared for writing:

- do not call exec curl
- do not call the Railway endpoint
- return rows added: 0
- explain that no qualified candidates were found

A write request is allowed only when at least one complete values array is ready.

## Curl execution rule

When writing, call the correct Railway endpoint using exec curl POST.

Use the approved endpoint for the target tab.

Do not send provider rows to the clients endpoint.

Do not send final-client rows to the providers endpoint.

The values array must follow the exact schema order for the relevant tab.

## Output after writing

After writing, return only:

- exact rows added count
- companies added
- skipped or failed companies with reason

The count must match the number of companies listed.

Never claim that rows were added unless the Railway endpoint confirms success.
