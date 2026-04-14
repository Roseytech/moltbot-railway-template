# Commands — Headhunter Ops

## !add

Create a new candidate in Candidates_Master.

### Input

Minimum:

- full_name OR linkedin_url

Optional fields:

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

### Behavior

- check duplicate on linkedin_url
- generate candidate_id
- fill default values
- write new row in sheet
- log action

### Output

- confirmation
- candidate_id
- next action suggestion

---

## !qualify

Complete missing candidate fields.

### Input

- candidate_id
- fields to update

### Behavior

- update only empty fields unless `force`
- do not overwrite protected fields
- update last_update
- move status to `to_review` if ready

### Output

- updated fields
- ignored fields
- next action

---

## !score

Assign a fit score to a candidate.

### Input

- candidate_id
- optional mission

### Behavior

- require stack_main
- compute score (0–10)
- update status and priority
- write fit_reason
- update next_action

### Output

- score
- reason
- status
- next step

---

## !shortlist

Return top candidates.

### Input

Optional filters:

- mission
- market
- score
- owner

### Behavior

- filter non-archived candidates
- sort by fit_score DESC
- limit to 5

### Output

- list of candidates
- suggestion if none

---

## !next

Return next actions.

### Input

Optional:

- owner
- market

### Behavior

- filter active candidates
- sort by priority then date

### Output

- prioritized task list

---

## !update

Update allowed fields.

### Input

- candidate_id
- field:value pairs

### Behavior

- allow only whitelisted fields
- reject protected fields
- update last_update

### Output

- before/after values
