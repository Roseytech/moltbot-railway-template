---
name: audit-cro-run-controller
description: Mandatory controller for Audit CRO sourcing runs. Prevents silent background tasks, enforces bounded execution, resolves provider vs final-client routing, controls Tavily/MX/Hunter/Prospeo usage, and requires exact write summaries.
---

# Audit CRO Run Controller

Use this skill for every Audit CRO sourcing run.

## Purpose

Control Audit CRO sourcing runs so they remain bounded, measurable, and immediately actionable.

This skill prevents:

- silent background tasks
- open-ended searches
- uncontrolled Tavily searches
- unnecessary Hunter or Prospeo credit usage
- Prospeo usage before qualification
- repeated approval requests
- review loops after approval
- inconsistent row counts
- writing to the wrong tab
- claiming writes without confirmed success
- changing the validated Google Sheet A:AF mapping

---

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
- funnel optimization specialists
- agencies that could buy the Audit CRO pilot

Then route to provider sourcing.

Do not mix final clients and providers in the same run unless the user explicitly asks.

---

## Tool stack control

Use the sourcing stack in this order:

1. Tavily for discovery and web verification
2. Official website review
3. MX lookup and email pattern detection
4. Hunter Free for conservative email lookup
5. Prospeo enrich-person as fallback only

Tavily is the primary discovery tool.

Hunter is not a sourcing tool.

Hunter may be used only when:

- the company or provider is already qualified
- the domain is reliable
- MX appears valid or the domain is clearly active
- a reliable contact name is available

Prospeo is not a sourcing tool.

Prospeo may be used only when:

- the company or provider is already qualified
- Hunter returned no usable result
- only weak email patterns exist
- a contact name exists but no reliable email is available
- the lead is worth paid fallback enrichment

Do not use Prospeo before Tavily, official website review, MX check, and Hunter logic.

Do not use deprecated Prospeo endpoints.

Allowed Prospeo endpoint:

- `/enrich-person`

Forbidden Prospeo endpoints:

- `/email-finder`
- `/domain-search`
- `/email-verifier`
- `/social-url-enrichment`

---

## Target resolution rule

Before starting a run, resolve:

- target tab
- market
- ICP or segment
- candidate limit
- row limit
- review mode or write mode
- whether email enrichment is allowed
- whether Hunter or Prospeo can be used within the run

Do not ask a confirmation question if the user already provided enough information.

Ask only if one of the following is unclear:

- whether the run is for final clients or providers
- market is missing and cannot be inferred
- ICP or segment is missing
- the user asks to write but required write rules are unclear
- continuing would exceed approved limits
- using paid enrichment would exceed the approved enrichment limits

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

If the user asks for a correction, refinement, replacement, cleanup, re-check, or deeper validation inside an already active bounded review run, perform the correction immediately.

Do not ask for confirmation again if the correction keeps the same:
- target tab
- market
- sourcing flow
- review mode
- candidate limit
- row limit
- enrichment limits

Examples of corrections that must be executed immediately:
- reject a weak candidate
- replace an invalid candidate
- verify official website evidence
- correct website/source fields
- complete missing 32-field review table
- remove software vendors
- continue with the same candidates
- search decision makers for already selected candidates
- return current progress if the full target cannot be completed

Only ask a clarification question if the correction would change:
- provider vs final-client flow
- market
- ICP
- write mode
- row limit
- paid enrichment limit
- target tab

Never end a correction response with:
- Do you want me to continue?
- Shall I proceed?
- Veux-tu que je le fasse ?
- Veux-tu que je continue ?

If the task cannot be fully completed, return the current validated state immediately.

---

## Default run limits

For easy final-client ICPs:

- check up to 20 candidates
- return or append up to 10 qualified rows

For difficult final-client ICPs:

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

## Default tool limits

For each bounded run, use these maximum tool limits unless the user gives stricter limits:

### Tavily

- maximum Tavily searches per run: 12
- use targeted queries only
- avoid broad, generic, or repeated searches
- do not use Tavily for open-ended discovery

### Hunter Free

- maximum Hunter lookups per run: 5
- use only after the candidate is qualified
- use only when name plus domain are available
- do not spend Hunter lookups on weak or unclear candidates

### Prospeo

- maximum Prospeo lookups per run: 3
- use only as fallback
- use only after Tavily, website review, MX/pattern logic, and Hunter logic
- do not spend Prospeo credits on weak or unclear candidates

### MX and pattern detection

- MX lookup may be used before Hunter or Prospeo
- pattern detection may be used only when domain plus contact evidence is strong enough
- never treat a pattern as verified

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

## Email enrichment control

Email enrichment must never override lead quality.

A candidate may be kept without a selected email if:

- the candidate is otherwise qualified
- the source is reliable
- `verification_status` explains the situation
- `prospeo_needed` is set correctly

Do not invent emails.

Do not invent email patterns.

Do not mark a guessed email as verified.

Do not mark MX validation as mailbox verification.

Use only these `verification_status` values:

- not_checked
- domain_mx_ok
- pattern_guess
- verified
- risky
- invalid
- no_email_found

Use only these `prospeo_needed` values:

- yes
- no

Use only these `source_tool` values:

- tavily
- official_website
- google_search
- directory
- mx_lookup
- pattern_detection
- hunter
- prospeo
- manual

`source_tool` should reflect the strongest source used for email discovery, contact evidence, or enrichment.

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

Do not use `tavily` as the default value if another source provided stronger email or contact evidence.

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

If new information is found for an existing company:

- do not overwrite the Sheet
- return the update suggestion to the user

---

## Required workflow

For each run:

1. Resolve target tab.
2. Resolve selected market.
3. Resolve selected ICP or segment.
4. Resolve run mode: review mode or write mode.
5. Resolve candidate and row limits.
6. Resolve Tavily, Hunter, and Prospeo limits.
7. Search candidates using bounded Tavily discovery.
8. Validate each candidate against the correct sourcing skill.
9. Skip non-qualified or duplicate candidates.
10. Review official website evidence.
11. Run MX or pattern detection only when useful.
12. Use Hunter only for qualified candidates with reliable name plus domain.
13. Use Prospeo only as fallback for qualified candidates.
14. Prepare rows in the exact schema order.
15. If review mode, return the qualified candidates for review.
16. If write mode, append qualified rows using the Audit CRO Sheet Writer.
17. Stop when the row limit, candidate limit, or tool limit is reached.
18. Return the correct summary.

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

## Write correction rule

If a write fails because of `invalid_values_length`, correct the payload immediately inside the same write run.

Do not ask the user for confirmation again.

The error means the `values` array does not contain exactly 32 positions.

Most likely cause:

- a blank optional field was omitted instead of being sent as `""`

Correction required:

- rebuild the row using the exact schema order
- include every blank field as `""`
- verify `values.length === 32`
- retry one POST request per row

If the error happens again, stop retrying and return the failed payload with values numbered from 1 to 32.

---

## Sheet writing contract

The Audit CRO Google Sheet write contract is already validated.

Both writable tabs use columns A:AF.

Each row must contain exactly 32 values.

Use empty strings for unknown optional fields.

Do not omit positions from the values array.

Do not change:

- field order
- number of values
- tab names
- append-only behavior
- approved Railway endpoints

The writable tabs are:

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

## Empty write rule

Never call the Railway endpoint with empty rows.

Unknown optional fields must be sent as empty strings if the row is otherwise qualified and complete.
If no qualified lead is prepared for writing:

- do not call exec curl
- do not call the Railway endpoint
- return rows added: 0
- explain that no qualified candidates were found

A write request is allowed only when at least one complete 32-value array is ready.

## Empty string position rule

Unknown optional fields must be included as empty strings.

Do not omit empty fields from the `values` array.

A blank value still counts as one of the 32 required positions.

Before every POST request, verify:

- `values` is a flat array
- `values.length === 32`
- no field position is omitted
- one row is sent per request

If a field is unknown, send `""` for that field.

Never remove a blank value to shorten the array.

---

## Review mode output

If the run is in review mode, return:

- target tab
- selected market
- selected ICP
- candidate limit used
- row limit used
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

If the endpoint returns partial success, report only the successfully appended companies as added.

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
- bounded Tavily usage
- bounded Hunter usage
- bounded Prospeo usage
- exact A:AF row mapping
- a final summary
