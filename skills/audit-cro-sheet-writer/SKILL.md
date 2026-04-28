---
name: audit-cro-sheet-writer
description: Mandatory writing skill for appending Audit CRO provider and final-client leads to the live Google Sheet via the approved Railway endpoints using exec curl POST only. Uses preferred named row payloads mapped by the Railway server into the exact A:AF schema.
---

# Audit CRO Sheet Writer

## Quick schema registry

Prestataires_Audit_CRO canonical field order found: yes.

Clients_Finaux_Audit_CRO canonical field order found: yes.

Expected field count: 32.

Target range for both writable tabs: `A:AF`.

Preferred write format: `{ "row": { ... } }`.

Real writes must use the named `row` object format.

Do not use a `values` array for real writes unless explicitly requested for a legacy diagnostic test.

The Railway server maps named `row` fields into the correct 32-column A:AF order.

Rule found: if a public email is selected for outreach, fill both `email` and `selected_email`.

Rule found: `why_fit` must explain relevance for the Audit CRO pilot, not only CRO activity.

---

## Objective

Use this skill only when the user asks to write already qualified Audit CRO leads to the live Google Sheet.

This skill is only for appending qualified rows into the two approved Audit CRO sourcing tabs:

- `Prestataires_Audit_CRO`
- `Clients_Finaux_Audit_CRO`

It must not be used for:

- sourcing
- enrichment
- strategy
- outreach
- reporting
- editing existing data

The Sheet Writer does not discover, qualify, enrich, or verify leads.

It only writes already prepared rows that comply with the approved schemas.

---

## Mandatory rules

- Use `exec curl POST` only to call the approved Railway endpoints when shell exec is available.
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
- Leave unknown optional values blank or omit them from the preferred `row` object.
- Use plain strings only.
- Use ISO dates only: `YYYY-MM-DD`.
- One company equals one POST request.
- One POST request must contain one `row` object only.
- Do not send nested arrays.
- Do not send batch payloads.
- Do not send provider rows to the clients endpoint.
- Do not send final-client rows to the providers endpoint.

---

## Email consistency rule

If a public email is found and selected for outreach, fill both:

- `email`
- `selected_email`

Do not leave `email` blank when `selected_email` comes from a verified public source.

If no public email is visible, leave `email` blank or omit it from `row`.

If reliable email patterns are inferred, put them only in:

- `email_guess_1`
- `email_guess_2`
- `email_guess_3`

Do not mark a guessed pattern as verified.

Do not mark MX validation as mailbox verification.

If no reliable email can be selected, leave `selected_email` blank or omit it from `row`.

If enrichment with Prospeo is needed, set:

- `prospeo_needed = yes`
- `verification_status = no_email_found`

---

## why_fit rule

For provider rows, `why_fit` must explain why the provider may be relevant for the Audit CRO pilot offer, not merely why the company provides CRO services.

Good provider `why_fit`:

- `Boutique CRO consultancy with clear audit and landing page optimization offer; likely relevant for testing qualified account supply.`
- `Founder-led conversion agency with B2B focus and public contact route; good fit for a small pilot offer.`
- `UX/CRO provider serving high-value service businesses; relevant for a qualified lead activation pilot.`

Bad provider `why_fit`:

- `They offer CRO services.`
- `They are a strong CRO agency.`
- `Their website looks professional.`
- `Could be relevant.`

For final-client rows, `why_fit` must explain why the company is a good Audit CRO final-client lead based on business value, visible website friction, and likelihood of conversion improvement.

---

## Canonical schema registry

The canonical field order must be explicitly defined in this skill.

The agent must never infer, guess, reconstruct, approximate, or create field names based on CRM conventions, prior context, common structures, or memory.

If the canonical field order is not explicitly available in this skill, the writer must stop and return:

`MAPPING_ERROR: canonical field order not found. Do not infer field order.`

Any answer containing phrases such as:

- inferred
- assuming
- based on common CRM structure
- likely field order
- estimated schema
- guessed order
- inferred field

must be treated as a mapping failure.

The canonical schema is used for:

- validating allowed field names
- checking the target A:AF mapping
- producing dry-run ordered row tests
- preventing shifted columns
- preventing invented fields

For real writes, use the preferred named `row` object format.

For dry-run mapping tests or legacy payloads, use `ordered_row_values`.

Do not use `ordered_row_values` for real writes unless explicitly required.

---

## Prestataires_Audit_CRO canonical field order

The canonical field order for `Prestataires_Audit_CRO` is explicitly defined below.

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

Expected field count: 32.

Target range: `A:AF`.

For real writes, the preferred payload is:

```json
{
  "row": {
    "id": "...",
    "market": "UK",
    "company_name": "...",
    "website": "...",
    "country": "UK",
    "offer_type": "...",
    "icp_fit": "high",
    "why_fit": "...",
    "source": "...",
    "date_added": "YYYY-MM-DD",
    "added_by": "openclaw",
    "status": "new",
    "b2b_fit": "high",
    "ecommerce_risk": "low",
    "verification_status": "no_email_found",
    "prospeo_needed": "yes",
    "source_tool": "official_website"
  }
}
```

The Railway server maps named fields into the correct 32-column A:AF order.

Unknown optional values may be omitted from `row`; the server fills missing schema fields as empty strings.

Do not add fields outside the canonical schema.

Do not manually build 32-value arrays unless explicitly required for a dry-run or legacy diagnostic test.

---

## Clients_Finaux_Audit_CRO canonical field order

The canonical field order for `Clients_Finaux_Audit_CRO` is explicitly defined below.

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
12. `industry`
13. `employee_range`
14. `cro_friction_summary`
15. `icp_fit`
16. `why_fit`
17. `source`
18. `date_added`
19. `added_by`
20. `cro_signal_1`
21. `cro_signal_2`
22. `cro_signal_3`
23. `cro_signal_4`
24. `cro_signal_5`
25. `email_guess_1`
26. `email_guess_2`
27. `email_guess_3`
28. `verification_status`
29. `selected_email`
30. `prospeo_needed`
31. `source_tool`
32. `email_source_url`

Expected field count: 32.

Target range: `A:AF`.

For real writes, the preferred payload is:

```json
{
  "row": {
    "id": "...",
    "market": "UK",
    "company_name": "...",
    "website": "...",
    "country": "UK",
    "industry": "...",
    "employee_range": "...",
    "cro_friction_summary": "...",
    "icp_fit": "high",
    "why_fit": "...",
    "source": "...",
    "date_added": "YYYY-MM-DD",
    "added_by": "openclaw",
    "cro_signal_1": "...",
    "verification_status": "no_email_found",
    "prospeo_needed": "yes",
    "source_tool": "official_website"
  }
}
```

The Railway server maps named fields into the correct 32-column A:AF order.

Unknown optional values may be omitted from `row`; the server fills missing schema fields as empty strings.

Do not add fields outside the canonical schema.

Do not manually build 32-value arrays unless explicitly required for a dry-run or legacy diagnostic test.

---

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

---

## Approved endpoints

### Providers endpoint

Use only for `Prestataires_Audit_CRO`.

```text
POST https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/prestataires
```

### Clients endpoint

Use only for `Clients_Finaux_Audit_CRO`.

```text
POST https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/clients
```

---

## Write ranges

The OpenClaw writable zone is A:AF for both tabs.

- `Prestataires_Audit_CRO!A:AF`
- `Clients_Finaux_Audit_CRO!A:AF`

Manual columns after AF must not be filled by OpenClaw.

The server mapping controls the exact A:AF order.

Do not add fields silently.

If new enrichment fields are needed, first update:

1. Google Sheet columns
2. server.js field mapping
3. Sheet Writer instructions
4. single-row test

---

## Provider row fields

For `Prestataires_Audit_CRO`, use only these field names in the preferred `row` object:

- `id`
- `market`
- `company_name`
- `website`
- `linkedin_url`
- `contact_name`
- `contact_role`
- `contact_linkedin`
- `email`
- `city`
- `country`
- `offer_type`
- `packaged_offer`
- `icp_fit`
- `why_fit`
- `source`
- `date_added`
- `added_by`
- `status`
- `founder_name`
- `team_size_estimate`
- `b2b_fit`
- `ecommerce_risk`
- `pricing_signal`
- `email_guess_1`
- `email_guess_2`
- `email_guess_3`
- `verification_status`
- `selected_email`
- `prospeo_needed`
- `source_tool`
- `email_source_url`

Do not use:

- `provider_signal_1`
- `provider_signal_2`
- `provider_signal_3`
- `provider_signal_4`
- `provider_signal_5`
- `provider_role`
- `provider_specialty`
- `provider_revenue_range`
- `provider_geo_focus`
- `provider_client_fit`
- `provider_lead_gen_focus`
- `provider_paid_enrichment`
- `provider_last_contacted`
- `mx_status`
- `email_type`
- `email_confidence`
- `enrichment_status`

Provider qualification must use the existing structured fields:

- `offer_type`
- `packaged_offer`
- `icp_fit`
- `why_fit`
- `founder_name`
- `team_size_estimate`
- `b2b_fit`
- `ecommerce_risk`
- `pricing_signal`

---

## Final-client row fields

For `Clients_Finaux_Audit_CRO`, use only these field names in the preferred `row` object:

- `id`
- `market`
- `company_name`
- `website`
- `linkedin_url`
- `contact_name`
- `contact_role`
- `contact_linkedin`
- `email`
- `city`
- `country`
- `industry`
- `employee_range`
- `cro_friction_summary`
- `icp_fit`
- `why_fit`
- `source`
- `date_added`
- `added_by`
- `cro_signal_1`
- `cro_signal_2`
- `cro_signal_3`
- `cro_signal_4`
- `cro_signal_5`
- `email_guess_1`
- `email_guess_2`
- `email_guess_3`
- `verification_status`
- `selected_email`
- `prospeo_needed`
- `source_tool`
- `email_source_url`

Final-client qualification must use:

- `industry`
- `employee_range`
- `cro_friction_summary`
- `icp_fit`
- `why_fit`
- `cro_signal_1`
- `cro_signal_2`
- `cro_signal_3`
- `cro_signal_4`
- `cro_signal_5`

Do not use the old field name `pain_signal`.

Use `cro_friction_summary` instead.

Do not use `employees_range`.

Use `employee_range`.

Do not add `status` to the final-client schema unless the Google Sheet and server mapping have a matching OpenClaw column for it.

---

## Required before writing provider leads

For each provider lead, the following fields must be known or intentionally prepared:

- `company_name`
- `website`
- `market`
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

---

## Required before writing final-client leads

For each final-client lead, the following fields must be known or intentionally prepared:

- `company_name`
- `website`
- `market`
- `country`
- `industry`
- `cro_friction_summary`
- `icp_fit`
- `why_fit`
- `source`
- `date_added`
- `added_by`
- at least one `cro_signal` field
- `verification_status`
- `prospeo_needed`
- `source_tool`

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

---

## Allowed values

### market

Use only:

- `US`
- `UK`

### icp_fit

Use only:

- `high`
- `medium`
- `low`

### b2b_fit

Use only:

- `high`
- `medium`
- `low`

### ecommerce_risk

Use only:

- `low`
- `medium`
- `high`

### verification_status

Use only:

- `not_checked`
- `domain_mx_ok`
- `pattern_guess`
- `verified`
- `risky`
- `invalid`
- `no_email_found`

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

- `yes`
- `no`

### source_tool

Use only:

- `tavily`
- `official_website`
- `google_search`
- `directory`
- `mx_lookup`
- `pattern_detection`
- `hunter`
- `prospeo`
- `manual`

### added_by

Use only:

- `openclaw`

### provider status

For `Prestataires_Audit_CRO`, use only:

- `new`
- `to_review`
- `qualified`
- `rejected`
- `contacted`

Default value:

- `new`

---

## Source tool selection

If multiple tools were used, choose the strongest source in this order:

1. `official_website`
2. `hunter`
3. `prospeo`
4. `directory`
5. `mx_lookup`
6. `pattern_detection`
7. `tavily`
8. `google_search`
9. `manual`

Do not use `tavily` as the default value if another tool provided stronger email or contact evidence.

Use `official_website` if the email was found directly on the company website.

Use `hunter` only if Hunter provided the selected email.

Use `prospeo` only if Prospeo provided the selected email.

Use `mx_lookup` only if only domain-level validation was completed.

Use `pattern_detection` only if only pattern guesses were produced.

---

## Duplicate prevention

Before writing, check for duplicates if duplicate detection is available.

Use the following duplicate keys:

- `company_name`
- `website`
- `linkedin_url`
- `contact_linkedin`
- `email`
- `selected_email`

If a duplicate exists:

- do not append the row
- return the company as skipped
- explain the duplicate reason

If new information is found for an existing company:

- do not overwrite the sheet
- return the update suggestion to the user

The Railway endpoint also performs duplicate detection when available.

If the endpoint returns duplicate or HTTP 409, report the row as skipped.

Do not bypass the endpoint.

---

## Empty write rule

Never call the Railway endpoint with empty rows.

A write request is allowed only when at least one qualified `row` object is ready.

Unknown optional fields may be omitted from `row`; the server fills missing schema fields as empty strings.

If no qualified lead is prepared for writing:

- do not call exec curl
- do not call the Railway endpoint
- return rows added: 0
- explain that no qualified candidates were found

---

## One-row-per-request rule

The Railway endpoints accept one row per POST request only.

Each POST request must contain:

- one JSON object
- one `row` object
- one company only
- no nested arrays
- no batch of multiple rows

Correct:

```json
{
  "row": {
    "id": "...",
    "company_name": "..."
  }
}
```

Incorrect:

```json
{
  "rows": [
    { "company_name": "A" },
    { "company_name": "B" }
  ]
}
```

For multiple rows, send one POST request per row.

---

## Legacy values payload rule

Legacy payload is accepted only when explicitly required:

```json
{
  "values": [
    "value_1",
    "value_2",
    "value_3"
  ]
}
```

If using legacy values:

- `values` must be a flat array
- `values.length` must equal 32
- every blank field must be included as `""`
- no field position may be omitted
- no nested arrays may be sent

Do not use legacy values by default.

Prefer `row`.

---

## Curl execution rule

When writing, call the correct Railway endpoint using exec curl POST.

Use the approved endpoint for the target tab.

Use the preferred `row` object payload.

Do not send provider rows to the clients endpoint.

Do not send final-client rows to the providers endpoint.

If a write payload fails:

1. rebuild it as `{ "row": { "field": "value" } }`
2. do not manually guess a 32-value array
3. do not bypass Railway
4. if it fails again, return the failed payload and API error

If exec curl is truly unavailable in the current environment, return the exact curl commands for the user to execute manually.

The returned curl commands must use the preferred `{ "row": { "field": "value" } }` format unless the user explicitly asks for legacy values.

---

## Output after writing

After writing, return only:

- exact rows added count
- companies added
- skipped or failed companies with reason
- exact API response

The count must match the number of companies listed.

Never claim that rows were added unless the Railway endpoint confirms success.

If the endpoint returns partial success, report only the successfully appended companies as added.

If attempted rows and successfully appended rows differ, state the difference clearly.

---

## Success condition

A successful write uses the approved Railway endpoint, sends one named `row` object, appends only to the correct approved tab, respects the exact A:AF schema, and reports success only after the Railway API confirms the row was added.
