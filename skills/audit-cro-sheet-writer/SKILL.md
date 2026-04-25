---
name: audit_cro_sheet_writer
description: Write verified Audit CRO leads to the live Google Sheet using exec curl only.
---

# Audit CRO Sheet Writer

Use this skill only when the user asks to write verified Audit CRO leads to the Google Sheet.

## Mandatory rules

- Never use local file write.
- Use exec curl POST only.
- Append only.
- Never overwrite or edit existing rows.
- Never write unverified leads.
- Never write duplicate companies, websites, or emails if duplicate detection is available.
- Never claim success unless the API returns success.

## Clients endpoint

POST:
https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/clients

## Clients schema order

id, market, company_name, website, linkedin_url, contact_name, contact_role, contact_linkedin, email, city, country, industry, employee_range, pain_signal, icp_fit, why_fit, source, date_added, added_by, status

## Required before writing

For each client-final lead:
- company_name present
- website present
- market is US or UK
- public email present
- email source URL present
- source URL present
- client-final business confirmed
- not a marketing agency, CRO agency, lead-gen agency, funnel agency, web agency, or consultant
- observable CRO friction present

## If missing data

If required data is missing, do not write. Return the reason.
