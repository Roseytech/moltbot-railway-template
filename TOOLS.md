# Tools

### Headhunter Ops
Command: sh /data/workspace/headhunter-ops.sh

---

### Audit CRO MCP Server (`mcp-audit-cro`) via MCPorter

Updated 2026-04-30.

**Write path:**
```
OpenClaw Audit CRO agent
  → mcporter call audit-cro.<tool>
  → mcp-audit-cro (/app/mcp-audit-cro/index.js)
  → Railway endpoint (X-AUDIT-CRO-SECRET)
  → Google Sheet
```

**Runtime locations (Railway image):**
- MCP server: `/app/mcp-audit-cro/index.js`
- MCPorter binary: `/usr/local/bin/mcporter` (global install)
- MCPorter config: `/app/config/mcporter.json` (env: `MCPORTER_CONFIG`)

**Required Railway Variables:**
- `AUDIT_CRO_INTERNAL_SECRET` — passed to `mcp-audit-cro` at runtime via MCPorter env interpolation; never committed to Git
- `RAILWAY_APP_URL` — Railway app base URL; falls back to `https://moltbot-railway-template-production-2e3c.up.railway.app` if unset

**Tools exposed:**

| Tool | Action |
|---|---|
| `audit_cro_health_check` | Check Railway gateway status |
| `audit_cro_validate_client_row` | Validate client row locally (no write) |
| `audit_cro_validate_provider_row` | Validate provider row locally (no write) |
| `audit_cro_append_client` | Append one row to `Clients_Finaux_Audit_CRO` |
| `audit_cro_append_provider` | Append one row to `Prestataires_Audit_CRO` |
| `audit_cro_run_report` | Session stats + gateway health |

All append tools support `dry_run: true` to validate without writing.

**Security:**
- All Railway write endpoints require `X-AUDIT-CRO-SECRET` header. Requests without it return HTTP 401.
- `AUDIT_CRO_INTERNAL_SECRET` is injected via MCPorter config env interpolation — never stored as a raw value in any Git-tracked file.

---

## Audit CRO safety rules

These rules apply to every agent in OpenClaw without exception.

**Scope:**
- `audit_cro_*` tools are for the **Audit CRO agent only**.
- Other agents must not call `audit_cro_*` tools under any circumstance.

**Write targets:**
- Provider writes must go to `Prestataires_Audit_CRO` only (via `audit_cro_append_provider`).
- Client writes must go to `Clients_Finaux_Audit_CRO` only (via `audit_cro_append_client`).
- Do not write to any other tab.

**Write behavior:**
- Append-only.
- No update.
- No delete.
- No overwrite.
- No write claim without a technical confirmation from MCPorter or the Railway endpoint (SUCCESS or DUPLICATE response).
- If no MCPorter or MCP tool call was performed in the session, output exactly: `NO_WRITE_PERFORMED`

---

## audit-cro agent skills list

Paste into the live Control UI openclaw.json under the audit-cro agent definition.  
Do **not** add root key `mcp` to openclaw.json — it is unsupported by OpenClaw.

```json
"skills": [
  "audit-cro-run-controller",
  "audit-cro-prestataires-sourcing",
  "audit-cro-client-sourcing",
  "audit-cro-sheet-writer"
]
```

No `skill-creator` for the audit-cro agent.

---

## Post-deploy verification commands

Run these after Railway build completes. Do not run live Google Sheet writes.

```bash
# MCPorter binary and version
mcporter --version

# Config env var and file
echo $MCPORTER_CONFIG
test -f /app/config/mcporter.json && echo "mcporter.json OK"

# MCP server file
test -f /app/mcp-audit-cro/index.js && echo "mcp-audit-cro OK"
node --check /app/mcp-audit-cro/index.js && echo "syntax OK"

# MCPorter config inspection (no secrets printed)
mcporter config list --json

# List available tools and schema (no write)
mcporter list audit-cro --schema

# Health check only — no write, no Sheet call
mcporter call audit-cro.audit_cro_health_check --output json
```
