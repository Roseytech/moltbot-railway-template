# Tool — find_candidate_by_linkedin

## Purpose

Find an existing candidate in `Candidates_Master` using `linkedin_url`.

## Inputs

- `linkedin_url`

## Behavior

- search for exact match in the `linkedin_url` column
- ignore leading or trailing spaces
- comparison should be case-insensitive
- if match found, return:
  - `candidate_id`
  - `full_name`
  - `row_number`
- if no match found, return `not_found`

## Output

### Match found

- status: `found`
- candidate_id
- full_name
- row_number

### No match

- status: `not_found`

## Rules

- this tool is read-only
- this tool does not modify the sheet
- this tool is used before candidate creation to prevent confirmed duplicates
