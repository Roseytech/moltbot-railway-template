# Tools

### Headhunter Ops
Command: sh /data/workspace/headhunter-ops.sh

---

### Audit CRO MCP Server (`mcp-audit-cro`)

Updated 2026-04-30. MCP server is now bundled in the Railway runtime image.

`mcp-audit-cro` is the **real write path** for Audit CRO Google Sheet operations.  
It is the sole authoritative write mechanism for the Audit CRO agent.

**Runtime location (Railway image):** `/app/mcp-audit-cro/index.js`  
**Source location:** `mcp-audit-cro/index.js`

**Required env vars (Railway Variables):**
- `RAILWAY_APP_URL` — Railway app base URL (set in `mcp.servers.audit-cro.env` in openclaw.json)
- `AUDIT_CRO_INTERNAL_SECRET` — shared secret; inherited from Railway environment by the spawned MCP process

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

**Agent scope:**  
`audit_cro_*` tools are for the **Audit CRO agent only**.  
Other agents must not call `audit_cro_*` tools under any circumstance.

**Write enforcement rule:**  
`audit_cro_append_provider` or `audit_cro_append_client` must be called before claiming rows were written.  
If no MCP tool call was made in the session, the agent must output exactly:

```
NO_WRITE_PERFORMED
```

**OpenClaw config block** (paste into `/data/.openclaw/openclaw.json` via Control UI config editor):

```json
"mcp": {
  "servers": {
    "audit-cro": {
      "command": "node",
      "args": ["/app/mcp-audit-cro/index.js"],
      "env": {
        "RAILWAY_APP_URL": "https://moltbot-railway-template-production-2e3c.up.railway.app"
      }
    }
  }
}
```

Note: `AUDIT_CRO_INTERNAL_SECRET` is **not** set in the `env` block above.  
It is inherited from the Railway process environment when OpenClaw spawns the MCP server subprocess.  
If OpenClaw's MCP subprocess implementation does not inherit the parent environment, `AUDIT_CRO_INTERNAL_SECRET` must be added to the `env` block in openclaw.json — but its value must be read from the Railway Variable, never hardcoded in config.

**audit-cro agent skills list** (paste into openclaw.json under the audit-cro agent definition):

```json
"skills": [
  "audit-cro-run-controller",
  "audit-cro-prestataires-sourcing",
  "audit-cro-client-sourcing",
  "audit-cro-sheet-writer"
]
```

**Post-deploy verification** (run in Railway shell or debug console):

```bash
ls -la /app/mcp-audit-cro
node --check /app/mcp-audit-cro/index.js
```

**Do not run live writes for verification.** Use `dry_run: true` or `audit_cro_health_check` instead.
