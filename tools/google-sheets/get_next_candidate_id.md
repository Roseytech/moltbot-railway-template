# Tool — get_next_candidate_id

## Purpose

Generate the next unique `candidate_id` using the `ID_Rules` sheet.

## Inputs

- none

## Behavior

- read current counter from `ID_Rules`
- increment the counter by 1
- format ID as `NT-XXX` (3 digits minimum)
- example: `NT-001`, `NT-042`, `NT-123`
- update the counter in `ID_Rules`
- ensure no concurrent overwrite (simple lock mechanism)

## Output

- candidate_id

## Rules

- must guarantee uniqueness
- must update the counter atomically
- must fail if lock cannot be acquired
- must not generate duplicate IDs
