# Routing — Headhunter Ops

## Trigger conditions

This skill must be triggered when a message starts with one of the following commands:

- `!add`
- `!qualify`
- `!score`
- `!shortlist`
- `!next`
- `!update`

## Priority

- This skill has priority over generic assistant behavior when commands are detected
- Commands must be executed, not interpreted conversationally

## Behavior

- If a command is recognized → execute corresponding workflow
- If command is malformed → return validation error
- If no command is detected → do not activate this skill

## Constraints

- No autonomous triggering
- No background execution
- No inference outside explicit commands

## Fallback

If input is unclear:

- return a clear error
- suggest a valid command format
