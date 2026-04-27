---
name: audit-cro-run-controller
description: Mandatory controller for Audit CRO sourcing runs. Prevents silent background tasks, enforces bounded execution, resolves provider vs final-client routing, and requires exact write summaries.
---

# Audit CRO Run Controller

Use this skill for every Audit CRO sourcing run.

## Purpose

Control Audit CRO sourcing runs so they remain bounded, measurable, and immediately actionable.

This skill prevents:
- silent background tasks
- open-ended searches
- repeated approval requests
- review loops after approval
- inconsistent row counts
- writing to the wrong tab
- claiming writes without confirmed success

## Scope

This controller applies to both Audit CRO sourcing flows:

1. Final-client sourcing  
Target tab: `Clients_Finaux_Audit_CRO`

2. Provider sourcing  
Target tab: `Prestataires_Audit_CRO`

Use the correct sourcing skill based on the user request.

If the user asks for:
- final clients
- client-final leads
- companies with CRO friction
- accounting firms
- CPA firms
- law firms
- solicitors
- architecture firms
- engineering firms
- businesses that could need a CRO audit

Then route to final-client sourcing.

If the user asks for:
- prestataires
- providers
- CRO agencies
- CRO consultants
- conversion optimization agencies
- UX audit providers
- landing page optimization providers
- agencies that could buy the Audit CRO pilot

Then route to provider sourcing.

Do not mix final clients and providers in the same run unless the user explicitly asks.

---

## Target resolution rule

Before starting a run, resolve:

- target tab
- market
- ICP or segment
- candidate limit
- row limit
- write mode or review mode

Do not ask a confirmation question if the user already provided enough information.

Ask only if one of the following is unclear:

- whether the run is for final clients or providers
- market is missing and cannot be inferred
- ICP is missing
- the user asks to write but required write rules are unclear
- continuing would exceed approved limits

---

## Review mode vs write mode

Default mode is review mode.

In review mode:
- search and validate candidates
- do not write to the Sheet
- return candidates for user review
- include skipped candidates and reasons if useful

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
- lance l’écriture

Once the user has approved writing, do not ask for confirmation again.

Do not return another candidate review list before writing if the user already approved writing.

---

## No mid-run confirmation rule

During a bounded run, do not ask for confirmation to continue a validation step that is already inside the approved limits.

If the user approved or launched a run with candidate and row limits, continue until:

- the row limit is reached
- the candidate limit is reached
- no valid candidate remains
- or an error prevents continuation

Do not ask:
- Shall I continue?
- Should I proceed?
- Do you want me to check further?

Only ask a question if continuing would exceed the approved limits or change the target ICP, market, tab, or writing rules.

---

## Default run limits

For easy ICPs:
- check up to 20 candidates
- return or append up to 10 qualified rows

For difficult ICPs:
- check up to 15 candidates
- return or append up to 5 qualified rows

For provider sourcing:
- check up to 20 provider candidates
- return or append up to 10 qualified provider rows

For highly specific provider niches:
- check up to 15 provider candidates
- return or append up to 5 qualified provider rows

If the user gives a specific limit, follow the user limit.

Never run beyond the limit without asking.

---

## Candidate validation rule

Validate each candidate against the correct sourcing skill.

For final-client leads, use the final-client validation rules:
- final-client business confirmed
- selected ICP confirmed
- US or UK market unless otherwise requested
- observable CRO friction
- not a provider, agency, consultant, vendor, marketplace, or software tool
- email enrichment fields handled according to the client sourcing skill
- no duplicate if duplicate detection is available

For provider leads, use the provider validation rules:
- provider business confirmed
- CRO, UX audit, conversion, landing page, funnel, or audit offer confirmed
- US or UK market unless otherwise requested
- likely relevant for the Audit CRO pilot
- not a final-client business
- not a generic agency with no CRO or conversion evidence
- email enrichment fields handled according to the provider sourcing skill
- no duplicate if duplicate detection is available

When in doubt, skip or mark for review instead of inventing.

---

## Duplicate prevention

Before writing, check for duplicates if duplicate detection is available.

Use these duplicate keys:
- company_name
- website
- linkedin_url
- contact_linkedin
- email
- selected_email

If a duplicate exists:
- do not append the row
- report the company as skipped
- include the duplicate reason

Never overwrite existing rows.

---

## Required workflow

For each run:

1. Resolve target tab.
2. Resolve selected ICP or segment.
3. Resolve run mode: review mode or write mode.
4. Resolve candidate and row limits.
5. Search candidates.
6. Validate each candidate against the correct sourcing skill.
7. Skip non-qualified or duplicate candidates.
8. If review mode, return the qualified candidates for review.
9. If write mode, append qualified rows using the Audit CRO Sheet Writer.
10. Stop when the row limit or candidate limit is reached.
11. Return the correct summary.

---

## Writing rule

When writing, use only the Audit CRO Sheet Writer.

The Sheet Writer must call the approved Railway endpoint via exec curl POST.

Do not write directly to Google Sheets.

Do not use local file write.

Do not bypass the Railway endpoint.

Do not retry elsewhere if the endpoint returns:
- duplicate
- HTTP 409
- error response
- failed write response

Never claim a row was added unless the Railway endpoint confirms success.

---

## Review mode output

If the run is in review mode, return:

- target tab
- selected ICP
- candidate limit used
- qualified candidates found
- candidates skipped, if useful
- reason each candidate qualifies
- missing enrichment items, if any

Do not claim that rows were added.

Do not call the Sheet Writer.

---

## Write mode final summary

After writing, return only:

- exact rows added count
- companies successfully appended
- companies skipped or failed with reason

The count must match the number of companies listed.

If 9 companies were appended, say 9.

If 8 companies were appended, list only 8.

Never claim a row was added unless the write action returned success.

If there is any inconsistency between attempted rows and successfully written rows, clearly state it.

---

## Background behavior

Do not say:
- I will notify you
- I will update you later
- please hold on
- the sub-agent is running
- I will report upon completion

Do not run silent background-style tasks.

Complete the task in the current session as far as possible.

If unable to complete, return current progress immediately.

---

## Core reminder

Audit CRO sourcing is not open-ended.

Every run must have:
- a target tab
- a market
- a segment
- a candidate limit
- a row limit
- a clear review or write mode
- a final summary
