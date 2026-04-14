# Tool — update_candidate_fields

## Purpose

Update specific fields for an existing candidate in `Candidates_Master`.

## Inputs

- `candidate_id`
- `row_number`
- `fields_to_update`

## Behavior

- update only the specified fields in the target row
- preserve all non-mentioned fields
- match columns by column name, not by guesswork
- update `last_update` on every successful write
- return before/after values for updated fields

## Output

### Success

- status: `success`
- candidate_id
- row_number
- updated_fields
- before_after

### Failure

- status: `error`
- reason

## Rules

- must fail if candidate_id does not exist
- must fail if row_number is missing
- must fail if a protected field is included
- must fail if a field name is unknown
- must only update allowed fields for the calling workflow
- this tool never creates a new row
