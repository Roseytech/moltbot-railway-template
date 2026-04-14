# Tool — find_candidate_by_id

## Purpose

Find an existing candidate in `Candidates_Master` using `candidate_id`.

## Inputs

- `candidate_id`

## Behavior

- search for exact match in the `candidate_id` column
- comparison should be case-sensitive
- if match found, return:
  - `candidate_id`
  - `full_name`
  - `row_number`
  - current row values
- if no match found, return `not_found`

## Output

### Match found

- status: `found`
- candidate_id
- full_name
- row_number
- row_data

### No match

- status: `not_found`

## Rules

- this tool is read-only
- this tool does not modify the sheet
- this tool is used before qualify, score, and update actions
