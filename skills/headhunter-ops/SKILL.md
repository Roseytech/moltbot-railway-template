# Headhunter Ops

Headhunter Ops is the operational recruitment skill for Nexdoor Talent.

It manages candidate workflows from Discord using Google Sheets as the single source of truth.

## Critical execution rule

Do not treat `headhunter-ops` as a shell command.

Do not execute:
`headhunter-ops --sheet ...`

Never assume the skill name is an executable program.

## Tool usage rule

For all candidate and sheet operations, use the existing tools in `tools/google-sheets/`.

Relevant tools include:
- `tools/google-sheets/find_candidate_by_linkedin.md`
- `tools/google-sheets/find_candidate_by_id.md`
- `tools/google-sheets/get_next_candidate_id.md`
- `tools/google-sheets/append_candidate_row.md`
- `tools/google-sheets/append_automation_log.md`
- `tools/google-sheets/update_candidate_fields.md`

## Source of truth

The only source of truth for candidate data is:
- `Candidates_Master`

Supporting tabs may include:
- `ID_Rules`
- `Automations_Log`
- `Lists_Shortlists`

## Trigger conditions

Activate this skill when a message starts with one of these commands:
- `!add`
- `!qualify`
- `!score`
- `!shortlist`
- `!next`
- `!update`

This skill has priority over generic assistant behavior when those commands are detected.

## Access check behavior

If the user asks to check whether `Candidates_Master` is accessible:
- do not use shell execution
- use an existing Google Sheets tool instead
- if the sheet can be accessed, reply exactly: `access ok`
- if access fails, reply with the exact error

## !add behavior

When handling `!add`:
1. validate input
2. require at least `full_name` or `linkedin_url`
3. check duplicate on `linkedin_url`
4. generate the next `candidate_id`
5. fill agreed default values
6. append a new row to `Candidates_Master`
7. append a log row to `Automations_Log`
8. return a short operational confirmation

## !qualify behavior

When handling `!qualify`:
- update only allowed fields
- avoid overwriting protected fields
- update `last_update`
- return updated fields and next useful action

## !score behavior

When handling `!score`:
- require sufficient qualification data
- compute or assign fit score
- update allowed score-related fields only
- update next action if relevant

## !shortlist behavior

When handling `!shortlist`:
- filter active candidates
- sort by fit score and relevance
- keep output concise and operational

## !next behavior

When handling `!next`:
- return prioritized next actions
- sort by priority and date where relevant

## !update behavior

When handling `!update`:
- allow only whitelisted fields
- reject protected fields
- update `last_update`
- confirm before/after values when useful

## Guardrails

- Always validate input before writing
- Always check duplicates before creating a candidate
- Always update `last_update` on every write
- Always write a log entry for every sheet write
- Never modify protected fields
- Never invent missing data
- If data is unknown, use the agreed fallback values
- Keep responses short, clear, and operational
- Do not pretend a sheet update succeeded if it failed

## Response style

Every response should:
- start with `✅`, `⚠`, `❌`, or `ℹ`
- mention the candidate ID when relevant
- mention what changed or what was found
- suggest the next useful action when applicable

Do not return raw JSON.
