---
name: audit-cro-sheet-writer
description: Mandatory writing skill for appending Audit CRO leads to the live Google Sheet via the Railway endpoint using exec curl POST only.
---

# Audit CRO Sheet Writer

Use this skill only when the user asks to write verified Audit CRO leads to the Google Sheet.

## Mandatory rules

- Use exec curl POST only to call the approved Railway endpoints.
- Never write directly to Google Sheets.
- Never use local file write.
- Append only.
- Never overwrite or edit existing rows.
- Never write unverified leads.
- Never write duplicate companies, websites, LinkedIn URLs, or emails if duplicate detection is available.
- Never bypass the Railway endpoint.
- If the endpoint returns an error, duplicate response, or HTTP 409, do not retry elsewhere.
- Never claim success unless the API returns success.

## Approved endpoints

### Clients endpoint

POST:
https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/clients

### Providers endpoint

POST:
https://moltbot-railway-template-production-2e3c.up.railway.app/setup/api/sheets/audit-cro/prestataires

## Clients schema order

id, market, company_name, website, linkedin_url, contact_name, contact_role, contact_linkedin, email, city, country, industry, employee_range, pain_signal, icp_fit, why_fit, source, date_added, added_by, status

## Providers schema order

id, market, company_name, website, linkedin_url, contact_name, contact_role, contact_linkedin, email, city, country, offer_type, packaged_offer, icp_fit, why_fit, source, date_added, added_by, status

## Required before writing client-final leads

For each client-final lead:
- company_name present
- website present
- market is US or UK
- public email present unless the user explicitly relaxed this rule
- email source URL present
- source URL present
- client-final business confirmed
- not a marketing agency, CRO agency, lead-gen agency, funnel agency, web agency, or consultant
- observable CRO friction present
- not a duplicate

## Required before writing provider leads

For each provider lead:
- company_name present
- website present
- market is US or UK
- provider business confirmed
- CRO, UX, conversion, landing page, funnel, or audit offer confirmed
- source URL present
- not a duplicate

## If missing data

If required data is missing, do not write. Return the reason.

## Empty write rule

Never call the Railway endpoint with empty rows or empty values.

If no qualified lead is prepared for writing:
- do not call exec curl
- do not call the Railway endpoint
- return rows added: 0
- explain that no qualified candidates were found

A write request is allowed only when at least one complete values array is ready.

## Output after writing

After writing, return only:
- exact rows added count
- companies added
- skipped or failed companies with reason

The count must match the number of companies listed.

