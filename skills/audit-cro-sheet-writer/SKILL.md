---
name: audit-cro-sheet-writer
description: Mandatory writing skill for appending Audit CRO provider and final-client leads to the live Google Sheet via the approved Railway endpoints using exec curl POST only. Uses preferred named row payloads mapped by the Railway server into the exact A:AF schema.
---

# Audit CRO Sheet Writer

Use this skill only when the user asks to write qualified Audit CRO leads to the live Google Sheet.

This skill is only for writing already qualified rows into the two approved Audit CRO sourcing tabs.

It must not be used for sourcing, enrichment, strategy, outreach, reporting, or editing existing data.

The Sheet Writer does not discover, qualify, enrich, or verify leads. It only writes already prepared rows that comply with the approved schemas.

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

---

## Preferred write payload format

Use the named `row` object format by default.

Preferred payload:

```json
{
  "row": {
    "id": "...",
    "market": "UK",
    "company_name": "...",
    "website": "...",
    "country": "United Kingdom",
    "offer_type": "...",
    "icp_fit": "high",
    "why_fit": "...",
    "source": "...",
    "date_added": "YYYY-MM-DD",
    "added_by": "openclaw",
    "status": "to_review",
    "b2b_fit": "high",
    "ecommerce_risk": "low",
    "verification_status": "no_email_found",
    "prospeo_needed": "yes",
    "source_tool": "official_website"
  }
}

The Railway server maps named fields into the correct 32-column A:AF order.

Unknown schema fields may be omitted from row; the server fills missing fields as empty strings.

Do not manually build 32-value arrays unless explicitly required.

Legacy payload { "values": [32 ordered values] } is still accepted, but it should not be used by the agent by default.

Never send multiple row objects in one request.

Never send nested arrays.

Never send batch payloads.

Exec curl capability rule

If shell execution is available, HTTP POST through curl is allowed and required.

The Sheet Writer must use exec curl POST to call the approved Railway endpoints.

Do not say that HTTP POST is impossible if shell execution is available.

If exec curl is truly unavailable in the current environment, return the exact curl commands for the user to execute manually.

The returned curl commands must use the preferred { "row": { field: value } } format unless the user explicitly asks for legacy values.

Approved write tabs

OpenClaw may write only into:

Prestataires_Audit_CRO
Clients_Finaux_Audit_CRO

OpenClaw must never write into:

README
Business_Model
Matching_Intro
Outreach_Tracker
Leads_Envoyés_au_Presta
Revenue_Tracker
Budget_Tracker
Dashboard
Approved endpoints
Providers endpoint

POST:

https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/prestataires

Use only for:

Prestataires_Audit_CRO

Clients endpoint

POST:

https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/clients

Use only for:

Clients_Finaux_Audit_CRO

Write ranges

The OpenClaw writable zone is A:AF for both tabs.

Prestataires_Audit_CRO!A:AF
Clients_Finaux_Audit_CRO!A:AF

Manual columns after AF must not be filled by OpenClaw.

The server mapping controls the exact A:AF order.

Do not add fields silently.

If new enrichment fields are needed, first update:

Google Sheet columns
server.js field mapping
Sheet Writer instructions
single-row test
Provider row fields

For Prestataires_Audit_CRO, use only these field names in the preferred row object:

id
market
company_name
website
linkedin_url
contact_name
contact_role
contact_linkedin
email
city
country
offer_type
packaged_offer
icp_fit
why_fit
source
date_added
added_by
status
founder_name
team_size_estimate
b2b_fit
ecommerce_risk
pricing_signal
email_guess_1
email_guess_2
email_guess_3
verification_status
selected_email
prospeo_needed
source_tool
email_source_url

Do not use:

provider_signal_1
provider_signal_2
provider_signal_3
provider_signal_4
provider_signal_5

Provider qualification must use the existing structured fields:

offer_type
packaged_offer
icp_fit
why_fit
founder_name
team_size_estimate
b2b_fit
ecommerce_risk
pricing_signal
Final-client row fields

For Clients_Finaux_Audit_CRO, use only these field names in the preferred row object:

id
market
company_name
website
linkedin_url
contact_name
contact_role
contact_linkedin
email
city
country
industry
employee_range
cro_friction_summary
icp_fit
why_fit
source
date_added
added_by
cro_signal_1
cro_signal_2
cro_signal_3
cro_signal_4
cro_signal_5
email_guess_1
email_guess_2
email_guess_3
verification_status
selected_email
prospeo_needed
source_tool
email_source_url

Final-client qualification must use:

industry
employee_range
cro_friction_summary
icp_fit
why_fit
cro_signal_1
cro_signal_2
cro_signal_3
cro_signal_4
cro_signal_5

Do not use the old field name pain_signal.

Use cro_friction_summary instead.

Do not use employees_range.

Use employee_range.

Do not add status to the final-client schema unless the Google Sheet and server mapping have a matching OpenClaw column for it.

Required before writing provider leads

For each provider lead, the following fields must be known or intentionally prepared:

company_name
website
market
country
offer_type
icp_fit
why_fit
source
date_added
added_by
status

The provider business must be confirmed.

The provider must clearly offer at least one of the following:

CRO
conversion optimization
UX audit
landing page optimization
funnel optimization
website conversion audit
lead-generation website optimization

The provider must not be:

a staffing agency
a recruitment firm
a lead-gen agency selling generic leads
a marketplace
a generic web agency with no CRO or conversion evidence
an ecommerce-only agency unless the user explicitly accepts ecommerce risk
Required before writing final-client leads

For each final-client lead, the following fields must be known or intentionally prepared:

company_name
website
market
country
industry
cro_friction_summary
icp_fit
why_fit
source
date_added
added_by
at least one cro_signal field

The final-client business must be confirmed.

The final-client lead must have observable CRO friction.

The final-client lead must not be:

a marketing agency
a CRO agency
a lead-gen agency
a funnel agency
a web agency
a consultant selling CRO or marketing services
another provider candidate
Email enrichment fields

Email enrichment is useful but must not lead to invented data.

The Sheet Writer does not perform enrichment. It only validates and writes the enrichment fields already prepared by the sourcing skill.

Use the following rules for both provider and final-client rows:

If a public email is visible, capture it in email.
If no public email is visible, leave email blank or omit it from row.
If reliable email patterns are inferred, put them in email_guess_1, email_guess_2, and email_guess_3.
If one email is selected for outreach, put it in selected_email.
If no reliable email can be selected, leave selected_email blank or omit it from row.
If enrichment with Prospeo is needed, set prospeo_needed to yes.
If no enrichment is needed, set prospeo_needed to no.
Always set verification_status.
Always set source_tool.
Add email_source_url when an email, contact page, domain, Hunter result, Prospeo result, or pattern source is available.

A row may be written without selected_email only if:

the company is otherwise qualified
the source is reliable
verification_status explains the situation
prospeo_needed is set to yes

Do not write a row with no website and no source.

Email enrichment source logic

Use the following stack logic when interpreting email fields:

Official website evidence
Trusted directory evidence
MX lookup
Pattern detection
Hunter Free lookup
Prospeo fallback

Do not mark a guessed pattern as verified.

Do not mark MX validation as mailbox verification.

Do not mark Hunter or Prospeo as source unless they actually provided or confirmed the selected email.

Do not use Prospeo as a generic source if Prospeo was not actually used.

Allowed values
market

Use only:

US
UK
icp_fit

Use only:

high
medium
low
b2b_fit

Use only:

high
medium
low
ecommerce_risk

Use only:

low
medium
high
verification_status

Use only:

not_checked
domain_mx_ok
pattern_guess
verified
risky
invalid
no_email_found

Definitions:

not_checked: no email verification has been performed
domain_mx_ok: the domain appears able to receive email, but the mailbox is not confirmed
pattern_guess: the email is inferred from a pattern, not directly verified
verified: the email appears directly verified or clearly published by the company
risky: the email is uncertain or weak
invalid: the email or domain appears invalid
no_email_found: no usable email or pattern was found
prospeo_needed

Use only:

yes
no
source_tool

Use only:

tavily
official_website
google_search
directory
mx_lookup
pattern_detection
hunter
prospeo
manual

source_tool should reflect the most relevant source or tool used for email discovery, contact evidence, or enrichment.

If an email or contact was found, prioritize the tool or source that produced that email or contact evidence.

Examples:

use official_website if the email was found directly on the company website
use directory if the email or contact evidence came from a trusted professional directory
use hunter if Hunter provided the selected email
use prospeo if Prospeo provided the selected email
use mx_lookup if only domain-level validation was completed
use pattern_detection if only pattern guesses were produced
use tavily only if Tavily was the main discovery source and no stronger email or contact source exists
use manual only if the user manually provided or confirmed the source

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

added_by

Use only:

openclaw
provider status

For Prestataires_Audit_CRO, use only:

new
to_review
qualified
rejected
contacted

Default value:

new
Duplicate prevention

Before writing, check for duplicates if duplicate detection is available.

Use the following duplicate keys:

company_name
website
linkedin_url
contact_linkedin
email
selected_email

If a duplicate exists:

do not append the row
return the company as skipped
explain the duplicate reason

If new information is found for an existing company:

do not overwrite the sheet
return the update suggestion to the user

The Railway endpoint also performs duplicate detection when available.

If the endpoint returns duplicate or HTTP 409, report the row as skipped. Do not bypass the endpoint.

Empty write rule

Never call the Railway endpoint with empty rows.

A write request is allowed only when at least one qualified row object is ready.

Unknown optional fields may be omitted from row; the server fills missing schema fields as empty strings.

If no qualified lead is prepared for writing:

do not call exec curl
do not call the Railway endpoint
return rows added: 0
explain that no qualified candidates were found
One-row-per-request rule

The Railway endpoints accept one row per POST request only.

Each POST request must contain:

one JSON object
one row object
one company only
no nested arrays
no batch of multiple rows

Correct:
{
  "row": {
    "id": "...",
    "company_name": "..."
  }
}

Incorrect:
{
  "rows": [
    { "company_name": "A" },
    { "company_name": "B" }
  ]
}
For multiple rows, send one POST request per row.

Legacy values payload rule

Legacy payload is accepted only when explicitly required:

{
  "values": [32 ordered values]
}

If using legacy values:

values must be a flat array
values.length must equal 32
every blank field must be included as ""
no field position may be omitted
no nested arrays may be sent

Do not use legacy values by default.

Prefer row.

Curl execution rule

When writing, call the correct Railway endpoint using exec curl POST.

Use the approved endpoint for the target tab.

Do not send provider rows to the clients endpoint.

Do not send final-client rows to the providers endpoint.

Use the preferred row object payload.

If a write payload fails:

rebuild it as { "row": { field: value } }
do not manually guess a 32-value array
do not bypass Railway
if it fails again, return the failed payload and API error
Output after writing

After writing, return only:

exact rows added count
companies added
skipped or failed companies with reason

The count must match the number of companies listed.

Never claim that rows were added unless the Railway endpoint confirms success.

If the endpoint returns partial success, report only the successfully appended companies as added.

If attempted rows and successfully appended rows differ, state the difference clearly.
