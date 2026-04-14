# Validation — Headhunter Ops

## Accepted command pattern

General form:

!command [subcommand] [candidate_id] [field:value ...] [flag]

Supported commands:

- `!add`
- `!qualify`
- `!score`
- `!shortlist`
- `!next`
- `!update`

Supported subcommand:

- `confirm` for `!add confirm`

Supported flags:

- `force`
- `dry`

## Candidate ID format

Accepted format:

- `NT-001`
- `NT-042`
- `NT-120`

Rule:

- prefix must be `NT-`
- followed by at least 3 digits

## Accepted aliases

- `nom` -> `full_name`
- `titre` -> `current_title`
- `société` -> `current_company`
- `societe` -> `current_company`
- `company` -> `current_company`
- `ville` -> `location`
- `localisation` -> `location`
- `lieu` -> `location`
- `linkedin` -> `linkedin_url`
- `linkedin_url` -> `linkedin_url`
- `stack` -> `stack_main`
- `dispo` -> `availability`
- `marché` -> `target_market`
- `marche` -> `target_market`
- `market` -> `target_market`
- `langues` -> `languages`
- `lang` -> `languages`
- `salaire` -> `salary_expectation`
- `séniorité` -> `seniority`
- `seniorite` -> `seniority`
- `seniority` -> `seniority`
- `mission` -> `assigned_mission`
- `action` -> `next_action`
- `date_action` -> `next_action_date`
- `date` -> `next_action_date`

## Normalized list values

### status

- `new`
- `to_review`
- `shortlisted`
- `contacted`
- `interview`
- `submitted`
- `offer`
- `placed`
- `on_hold`
- `archived`

### priority

- `high`
- `medium`
- `low`

### seniority

- `junior`
- `mid`
- `senior`
- `lead`
- `executive`

### target_market

- `Belgique`
- `Luxembourg`
- `Suisse`
- `France`
- `Miami`
- `UAE`
- `Multi`

### source

- `LinkedIn`
- `Referral`
- `Manatal`
- `Inbound`
- `Discord`
- `Import`

### added_by

- `manuel`
- `agent`
- `Discord`
- `import`

### owner

- `Rosy`
- `Santiago`
- `agent`

### manatal_sync_status

- `not_sent`
- `sent`
- `updated`
- `error`

### gdpr_consent

- `oui`
- `en_attente`
- `non_applicable`

## Required field rules

### !add

At least one of:

- `full_name`
- `linkedin_url`

### !qualify

Required:

- `candidate_id`

### !score

Required:

- `candidate_id`

### !update

Required:

- `candidate_id`

## Protected fields

These fields must never be overwritten through normal command usage:

- `candidate_id`
- `date_added`
- `added_by`
- `linkedin_url`
- `full_name`

## Allowed update fields

Only these fields can be changed through `!update`:

- `status`
- `priority`
- `availability`
- `assigned_mission`
- `notes`
- `next_action`
- `next_action_date`
- `owner`
- `manatal_sync_status`
- `manatal_id`
- `gdpr_consent`
- `fit_score`
- `fit_reason`
- `salary_expectation`

## Empty field rules

A field is considered empty if:

### text fields

- cell is empty
- OR value is `À qualifier`

### fit_score

- value is `0`

## Format rules

### Dates

Expected format:

- `YYYY-MM-DD`

### linkedin_url

Must start with:

- `https://linkedin.com/in/`

### languages

Expected format:

- uppercase codes separated by comma and space

Example:

- `FR, EN`

### fit_score

Expected format:

- integer from 0 to 10

## Validation principles

- reject invalid normalized values
- reject invalid date format
- reject invalid protected field update
- block confirmed duplicate on linkedin_url
- allow probable duplicate only with explicit confirm
- never invent missing data
- use fallback values when defined by the workflow
