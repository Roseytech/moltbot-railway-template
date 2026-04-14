# Tool — append_candidate_row

## Purpose

Append a new candidate row to `Candidates_Master`.

## Inputs

A complete candidate payload including:

- candidate_id
- date_added
- added_by
- full_name
- linkedin_url
- location
- current_title
- current_company
- seniority
- stack_main
- target_role
- target_market
- languages
- availability
- source
- assigned_mission
- owner
- status
- priority
- fit_score
- manatal_sync_status
- next_action
- next_action_date
- last_update

Optional fields may also be included if available.

## Behavior

- append one new row at the end of `Candidates_Master`
- preserve column order exactly as defined in the sheet
- do not reorder fields
- do not overwrite existing rows
- return the written row number

## Output

### Success

- status: `success`
- row_number
- candidate_id

### Failure

- status: `error`
- reason

## Rules

- write must fail if required fields are missing
- write must fail if candidate_id is missing
- write must fail if linkedin_url is missing when it is expected
- this tool only creates new rows
- this tool never updates existing rows
