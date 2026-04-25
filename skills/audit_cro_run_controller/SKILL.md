---
name: audit-cro-run-controller
description: Mandatory controller for every Audit CRO sourcing runs, prevent silent background tasks, enforce write summaries, and stop open-ended sourcing.
---

# Audit CRO Run Controller

Use this skill for every Audit CRO sourcing run.

## Purpose

Control the execution of sourcing runs so they remain bounded, measurable, and immediately actionable.

This skill prevents:
- silent background tasks
- open-ended searches
- repeated approval requests
- review loops after approval
- inconsistent row counts
- claiming writes without confirmed success

## Default run limits

For easy ICPs:
- check up to 20 candidates
- append up to 10 qualified rows

For difficult ICPs:
- check up to 15 candidates
- append up to 5 qualified rows

If the user gives a specific limit, follow the user limit.

Never run beyond the limit without asking.

## Approval behavior

If the user says:
- yes
- proceed
- continue
- append
- write
- add to the sheet
- go

Then proceed with the approved write action.

Do not ask for confirmation again.

Do not return another candidate review list before writing.

## Background behavior

Do not say:
- I will notify you
- I will update you later
- please hold on
- the sub-agent is running
- I will report upon completion

Complete the task in the current session.

If unable to complete, return current progress immediately.

## Required workflow

For each run:

1. Confirm the target tab.
2. Confirm the selected ICP.
3. Search candidates.
4. Validate each candidate.
5. Skip non-qualified or duplicate candidates.
6. Append qualified rows using the Audit CRO Sheet Writer.
7. Stop when the row limit or candidate limit is reached.
8. Return the final summary.

## Final summary

After writing, return only:

- exact rows added count
- companies successfully appended
- companies skipped or failed with reason

The count must match the number of listed companies.

If 9 companies were appended, say 9.
If 8 companies were appended, list only 8.

Never claim a row was added unless the write action returned success.
