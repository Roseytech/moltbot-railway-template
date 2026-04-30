# Tools

### Headhunter Ops
Command: sh /data/workspace/headhunter-ops.sh

---

### Audit CRO MCP Server (`mcp-audit-cro`)

Validated as of 2026-04-30.

The MCP server is the preferred write path for Audit CRO Google Sheet operations.

**Location:** `mcp-audit-cro/index.js`

**Config:** `mcp-audit-cro/.env` (not committed — see `.env.example`)

**Required env vars:**
- `RAILWAY_APP_URL` — Railway app base URL
- `AUDIT_CRO_INTERNAL_SECRET` — shared secret, must match Railway Variable

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

**Security:** All Railway write endpoints require `X-AUDIT-CRO-SECRET` header. Requests without it return HTTP 401.

**Write constraints:** append-only, no update, no delete, no overwrite, no unauthorized tabs.

**OpenClaw MCP connection:** not yet confirmed. Until confirmed, Claude Code + MCP is the validated write path.
