# Audit CRO Sheet Writer

## Objective
Write structured sourcing results into the Audit CRO Google Sheet only.

This skill is only for appending qualified sourcing rows into the correct tabs.
It must not be used to change business logic, edit historical rows, or write into reporting tabs.

## Allowed tabs
OpenClaw may write only into these 2 tabs:
- `Prestataires_Audit_CRO`
- `Clients_Finaux_Audit_CRO`

## Forbidden tabs
Do not write into:
- `README`
- `Business_Model`
- `Matching_Intro`
- `Outreach_Tracker`
- `Leads_Envoyés_au_Presta`
- `Revenue_Tracker`
- `Budget_Tracker`
- `Dashboard`

## Core rules
- Append new rows only
- Never overwrite existing rows
- Never edit existing data
- Never write outside the allowed tabs
- If a value is unknown, leave it blank
- Do not invent emails, names, roles, LinkedIn URLs, or websites
- Use only the exact field order defined below
- Use plain strings only
- Keep `why_fit` short and concrete
- Use `high`, `medium`, or `low` only for `icp_fit`
- Use `US` or `UK` only for `market`
- Use `openclaw` for `added_by`
- Use `new` for `status` unless explicitly instructed otherwise

## API endpoints
Use these full public Railway URLs for writing rows:

### Prestataires
POST `https://moltbot-railway-template-production-ffb6.up.railway.app/setup/api/sheets/audit-cro/prestataires`

### Clients finaux
POST `https://moltbot-railway-template-production-ffb6.up.railway.app/setup/api/sheets/audit-cro/clients`
## Authentication
Use setup authentication already configured for the OpenClaw environment.

## Payload format
Always send JSON with this structure:
rows must be an array of arrays.
Each inner array must follow the exact tab column order.

Column order: Prestataires_Audit_CRO

Write values in this exact order:

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

Prestataires example row

```json
{
  "rows": [
    [
      "P-001",
      "US",
      "Agency Alpha",
      "https://agencyalpha.com",
      "https://linkedin.com/company/agencyalpha",
      "Jane Doe",
      "Founder",
      "https://linkedin.com/in/janedoe",
      "jane@agencyalpha.com",
      "New York",
      "USA",
      "CRO audit",
      "yes",
      "high",
      "Packaged CRO offer for SMBs",
      "linkedin",
      "2026-04-21",
      "openclaw",
      "new"
    ]
  ]
}

Column order: Clients_Finaux_Audit_CRO

Write values in this exact order:

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
pain_signal
icp_fit
why_fit
source
date_added
added_by
status

Clients example row

{
  "rows": [
    [
      "C-001",
      "UK",
      "SaaS Beta",
      "https://saasbeta.com",
      "https://linkedin.com/company/saasbeta",
      "John Smith",
      "Growth Lead",
      "https://linkedin.com/in/johnsmith",
      "john@saasbeta.com",
      "London",
      "UK",
      "SaaS",
      "11-50",
      "Weak funnel clarity on landing pages",
      "high",
      "Visible CRO relevance",
      "company website",
      "2026-04-21",
      "openclaw",
      "new"
    ]
  ]
}

ID rules

Use a simple prefix:

Prestataires: P-...
Clients finaux: C-...

If no robust ID generation logic is available, use a temporary unique ID with date or timestamp.
Do not reuse an existing ID intentionally.

Data quality rules
For prestataires

Prioritize:

agencies
consultants
boutique firms
packaged CRO offers
clear service pages
clear conversion / funnel / landing page positioning
For clients finaux

Prioritize:

companies with visible conversion or funnel issues
pages or funnels with likely CRO pain
SMB / mid-market companies
businesses where a CRO audit could be a credible first step
Final behavior

Before writing:

confirm whether the lead is a prestataire or a client final
choose the correct endpoint
map fields in the exact required order
leave unknown values blank
append the row only once
