# Tool — append_automation_log

## Purpose

Append one log entry to `Automations_Log` after a write action.

## Inputs

- timestamp
- candidate_id
- action
- source
- target
- status
- detail

## Behavior

- append one new row at the end of `Automations_Log`
- preserve column order exactly as defined in the sheet
- do not overwrite existing rows

## Output

### Success

- status: `success`
- row_number

### Failure

- status: `error`
- reason

## Rules

- this tool is append-only
- this tool must not modify previous log rows
- this tool is used after successful or failed write attempts when logging is required
