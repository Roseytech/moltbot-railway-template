#!/usr/bin/env node
// MCP server – Audit CRO append-only Google Sheet tools.
// Calls existing Railway endpoints; never touches the Sheet directly.
//
// Required env vars:
//   RAILWAY_APP_URL          e.g. https://myapp.up.railway.app
//   AUDIT_CRO_INTERNAL_SECRET  shared secret for Audit CRO write operations
//                              (must match the same var in Railway Variables)
// Optional:
//   MCP_DEBUG=1              verbose logging to stderr

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ── env ──────────────────────────────────────────────────────────────────────

const RAILWAY_APP_URL          = (process.env.RAILWAY_APP_URL || "").replace(/\/$/, "");
const AUDIT_CRO_INTERNAL_SECRET = process.env.AUDIT_CRO_INTERNAL_SECRET || "";
const DEBUG                    = Boolean(process.env.MCP_DEBUG);

if (!RAILWAY_APP_URL) {
  console.error("[audit-cro-mcp] RAILWAY_APP_URL is required");
  process.exit(1);
}

if (!AUDIT_CRO_INTERNAL_SECRET) {
  console.error("[audit-cro-mcp] AUDIT_CRO_INTERNAL_SECRET is required");
  process.exit(1);
}

function dbg(...args) {
  if (DEBUG) console.error("[audit-cro-mcp]", ...args);
}

// ── field lists (must match server.js exactly) ───────────────────────────────

const CLIENT_FIELDS = [
  "id", "market", "company_name", "website", "linkedin_url",
  "contact_name", "contact_role", "contact_linkedin", "email",
  "city", "country", "industry", "employee_range", "cro_friction_summary",
  "icp_fit", "why_fit", "source", "date_added", "added_by",
  "cro_signal_1", "cro_signal_2", "cro_signal_3", "cro_signal_4", "cro_signal_5",
  "email_guess_1", "email_guess_2", "email_guess_3",
  "verification_status", "selected_email", "prospeo_needed",
  "source_tool", "email_source_url",
];

const PRESTATAIRE_FIELDS = [
  "id", "market", "company_name", "website", "linkedin_url",
  "contact_name", "contact_role", "contact_linkedin", "email",
  "city", "country", "offer_type", "packaged_offer", "icp_fit",
  "why_fit", "source", "date_added", "added_by", "status",
  "founder_name", "team_size_estimate", "b2b_fit", "ecommerce_risk",
  "pricing_signal", "email_guess_1", "email_guess_2", "email_guess_3",
  "verification_status", "selected_email", "prospeo_needed",
  "source_tool", "email_source_url",
];

// ── session stats ─────────────────────────────────────────────────────────────

const stats = {
  startedAt: new Date().toISOString(),
  clients:      { appended: 0, duplicates: 0, validationErrors: 0, endpointErrors: 0 },
  providers:    { appended: 0, duplicates: 0, validationErrors: 0, endpointErrors: 0 },
};

// ── validation ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_FIELDS = ["website", "linkedin_url", "contact_linkedin", "email_source_url"];
const EMAIL_FIELDS = ["email", "email_guess_1", "email_guess_2", "email_guess_3", "selected_email"];

function validateRow(row) {
  const errors = [];

  if (!String(row.company_name || "").trim()) {
    errors.push({ field: "company_name", message: "required" });
  }

  if (!String(row.website || "").trim() && !String(row.linkedin_url || "").trim()) {
    errors.push({
      field: "website / linkedin_url",
      message: "at least one is required for duplicate detection",
    });
  }

  for (const f of URL_FIELDS) {
    const v = String(row[f] || "").trim();
    if (!v) continue;
    try {
      new URL(v.startsWith("http") ? v : `https://${v}`);
    } catch {
      errors.push({ field: f, message: `invalid URL: ${v}` });
    }
  }

  for (const f of EMAIL_FIELDS) {
    const v = String(row[f] || "").trim();
    if (v && !EMAIL_RE.test(v)) {
      errors.push({ field: f, message: `invalid email: ${v}` });
    }
  }

  return errors;
}

// ── Railway HTTP helper ───────────────────────────────────────────────────────

function auditCroHeaders() {
  return {
    "Content-Type": "application/json",
    "X-AUDIT-CRO-SECRET": AUDIT_CRO_INTERNAL_SECRET,
  };
}

async function callRailway(path, body) {
  const url = `${RAILWAY_APP_URL}${path}`;
  dbg("POST", url);
  const res = await fetch(url, {
    method: "POST",
    headers: auditCroHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  dbg("response", res.status, json);
  return { status: res.status, body: json };
}

async function checkHealth() {
  const url = `${RAILWAY_APP_URL}/healthz`;
  dbg("GET", url);
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  const json = await res.json();
  dbg("health", res.status, json);
  return { status: res.status, body: json };
}

// ── JSON Schema helpers ───────────────────────────────────────────────────────

function rowSchema(fields) {
  const properties = Object.fromEntries(
    fields.map((f) => [f, { type: "string" }])
  );
  return { type: "object", properties, additionalProperties: false };
}

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "audit_cro_health_check",
    description:
      "Check whether the Railway gateway is up. Returns gateway status and last known error if any.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "audit_cro_validate_client_row",
    description:
      "Validate a Clients_Finaux_Audit_CRO row locally without writing anything. " +
      "Returns validation errors or a success message.",
    inputSchema: {
      type: "object",
      required: ["row"],
      properties: {
        row: {
          ...rowSchema(CLIENT_FIELDS),
          description:
            "Row fields for Clients_Finaux_Audit_CRO. " +
            "Required: company_name + (website or linkedin_url).",
        },
      },
    },
  },
  {
    name: "audit_cro_validate_provider_row",
    description:
      "Validate a Prestataires_Audit_CRO row locally without writing anything. " +
      "Returns validation errors or a success message.",
    inputSchema: {
      type: "object",
      required: ["row"],
      properties: {
        row: {
          ...rowSchema(PRESTATAIRE_FIELDS),
          description:
            "Row fields for Prestataires_Audit_CRO. " +
            "Required: company_name + (website or linkedin_url).",
        },
      },
    },
  },
  {
    name: "audit_cro_append_client",
    description:
      "Validate then append one row to Clients_Finaux_Audit_CRO. " +
      "The server deduplicates by website, LinkedIn, email, and company+country. " +
      "Set dry_run:true to validate without writing.",
    inputSchema: {
      type: "object",
      required: ["row"],
      properties: {
        row: {
          ...rowSchema(CLIENT_FIELDS),
          description:
            "Row fields for Clients_Finaux_Audit_CRO. " +
            "Required: company_name + (website or linkedin_url).",
        },
        dry_run: {
          type: "boolean",
          description: "If true, validate only — do not write to the sheet.",
          default: false,
        },
      },
    },
  },
  {
    name: "audit_cro_append_provider",
    description:
      "Validate then append one row to Prestataires_Audit_CRO. " +
      "The server deduplicates by website, LinkedIn, email, and company+country. " +
      "Set dry_run:true to validate without writing.",
    inputSchema: {
      type: "object",
      required: ["row"],
      properties: {
        row: {
          ...rowSchema(PRESTATAIRE_FIELDS),
          description:
            "Row fields for Prestataires_Audit_CRO. " +
            "Required: company_name + (website or linkedin_url).",
        },
        dry_run: {
          type: "boolean",
          description: "If true, validate only — do not write to the sheet.",
          default: false,
        },
      },
    },
  },
  {
    name: "audit_cro_run_report",
    description:
      "Return a summary of all append activity in this MCP session: rows appended, duplicates detected, and validation errors for both clients and providers. Also includes current gateway health.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function handleHealthCheck() {
  try {
    const { status, body } = await checkHealth();
    if (status === 200 && body.ok) {
      return ok(`Gateway is UP.\nStatus: ${JSON.stringify(body, null, 2)}`);
    }
    return ok(
      `Gateway is DOWN or degraded (HTTP ${status}).\n${JSON.stringify(body, null, 2)}`
    );
  } catch (err) {
    return ok(`Health check failed: ${err.message}`);
  }
}

function handleValidate(row, label) {
  const errors = validateRow(row);
  if (errors.length === 0) {
    return ok(`[${label}] Validation passed. Row looks good.`);
  }
  const lines = errors.map((e) => `  • ${e.field}: ${e.message}`).join("\n");
  return ok(`[${label}] Validation failed (${errors.length} error(s)):\n${lines}`);
}

async function handleAppend(row, dry_run, path, tab, bucket) {
  const errors = validateRow(row);
  if (errors.length > 0) {
    stats[bucket].validationErrors++;
    const lines = errors.map((e) => `  • ${e.field}: ${e.message}`).join("\n");
    console.error(`[audit-cro-mcp] validation_error tab=${tab} company=${row.company_name || ""}`);
    return ok(
      `[${tab}] VALIDATION ERROR — row not sent.\n${lines}`
    );
  }

  if (dry_run) {
    return ok(
      `[${tab}] DRY RUN — validation passed. Row was NOT written.\n` +
      `  company: ${row.company_name || "(none)"}`
    );
  }

  let result;
  try {
    result = await callRailway(path, { row });
  } catch (err) {
    stats[bucket].endpointErrors++;
    console.error(`[audit-cro-mcp] endpoint_error tab=${tab} error=${err.message}`);
    return ok(`[${tab}] ENDPOINT ERROR — ${err.message}`);
  }

  const { status, body } = result;

  if (status === 200 && body.success) {
    stats[bucket].appended++;
    console.error(
      `[audit-cro-mcp] appended tab=${tab} company=${body.company || row.company_name || ""}`
    );
    return ok(
      `[${tab}] SUCCESS — 1 row appended.\n` +
      `  company: ${body.company || row.company_name}\n` +
      `  tab: ${body.tab}`
    );
  }

  if (status === 409 && body.duplicate) {
    stats[bucket].duplicates++;
    console.error(
      `[audit-cro-mcp] duplicate tab=${tab} company=${row.company_name || ""}`
    );
    return ok(
      `[${tab}] DUPLICATE — row already exists, not appended.\n` +
      `  company: ${row.company_name || "(none)"}`
    );
  }

  if (status === 422 && body.error === "PROVIDER_ROW_VALIDATION_ERROR") {
    stats[bucket].validationErrors++;
    const details = (body.details || []).map((d) => `  • ${d.field}: ${d.message}`).join("\n");
    console.error(`[audit-cro-mcp] server_validation_error tab=${tab} company=${body.company || ""}`);
    return ok(
      `[${tab}] SERVER VALIDATION ERROR:\n${details}`
    );
  }

  // Any other non-200
  stats[bucket].endpointErrors++;
  console.error(`[audit-cro-mcp] endpoint_error tab=${tab} status=${status}`);
  return ok(
    `[${tab}] ENDPOINT ERROR (HTTP ${status}):\n${JSON.stringify(body, null, 2)}`
  );
}

async function handleRunReport() {
  let healthLine = "gateway: unknown (health check skipped)";
  try {
    const { status, body } = await checkHealth();
    healthLine = status === 200 && body.ok
      ? `gateway: UP`
      : `gateway: DOWN or degraded (HTTP ${status})`;
  } catch (err) {
    healthLine = `gateway: unreachable — ${err.message}`;
  }

  const c = stats.clients;
  const p = stats.providers;

  const report = [
    `=== Audit CRO MCP session report ===`,
    `Session started: ${stats.startedAt}`,
    ``,
    healthLine,
    ``,
    `Clients (Clients_Finaux_Audit_CRO):`,
    `  appended:          ${c.appended}`,
    `  duplicates:        ${c.duplicates}`,
    `  validation errors: ${c.validationErrors}`,
    `  endpoint errors:   ${c.endpointErrors}`,
    ``,
    `Providers (Prestataires_Audit_CRO):`,
    `  appended:          ${p.appended}`,
    `  duplicates:        ${p.duplicates}`,
    `  validation errors: ${p.validationErrors}`,
    `  endpoint errors:   ${p.endpointErrors}`,
  ].join("\n");

  return ok(report);
}

// ── MCP response helpers ──────────────────────────────────────────────────────

function ok(text) {
  return { content: [{ type: "text", text }] };
}

function toolError(message) {
  return { content: [{ type: "text", text: `ERROR: ${message}` }], isError: true };
}

// ── Server setup ──────────────────────────────────────────────────────────────

const server = new Server(
  { name: "audit-cro-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  dbg("call", name, args);

  try {
    switch (name) {
      case "audit_cro_health_check":
        return await handleHealthCheck();

      case "audit_cro_validate_client_row":
        return handleValidate(args.row || {}, "Clients_Finaux_Audit_CRO");

      case "audit_cro_validate_provider_row":
        return handleValidate(args.row || {}, "Prestataires_Audit_CRO");

      case "audit_cro_append_client":
        return await handleAppend(
          args.row || {},
          Boolean(args.dry_run),
          "/setup/api/sheets/audit-cro/clients",
          "Clients_Finaux_Audit_CRO",
          "clients"
        );

      case "audit_cro_append_provider":
        return await handleAppend(
          args.row || {},
          Boolean(args.dry_run),
          "/setup/api/sheets/audit-cro/prestataires",
          "Prestataires_Audit_CRO",
          "providers"
        );

      case "audit_cro_run_report":
        return await handleRunReport();

      default:
        return toolError(`Unknown tool: ${name}`);
    }
  } catch (err) {
    console.error("[audit-cro-mcp] unhandled error in", name, err);
    return toolError(err.message);
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[audit-cro-mcp] started — Railway app: ${RAILWAY_APP_URL} — secret: ***`);
