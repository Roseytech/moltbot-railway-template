import childProcess from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import express from "express";
import httpProxy from "http-proxy";
import * as tar from "tar";

import { getSheetsClient } from "./googleSheets.js";

function ensureBraveBxInstalled() {
  try {
    process.env.PATH = `/data/bin:/root/.local/bin:/home/node/.local/bin:${process.env.PATH || ""}`;

    if (fs.existsSync("/data/bin/bx")) {
      console.log("[brave] bx already installed at /data/bin/bx");
      return;
    }

    console.log("[brave] installing bx into persistent path...");
    fs.mkdirSync("/data/bin", { recursive: true });

    childProcess.execFileSync("sh", [
      "-lc",
      [
        "curl -fsSL https://raw.githubusercontent.com/brave/brave-search-cli/main/scripts/install.sh -o /tmp/install-bx.sh",
        "sh /tmp/install-bx.sh",
        "BX_PATH=$(command -v bx || true)",
        "echo \"[brave] detected bx at: $BX_PATH\"",
        "if [ -z \"$BX_PATH\" ]; then find / -type f -name bx 2>/dev/null | head -20; fi",
        "BX_PATH=$(command -v bx || find / -type f -name bx 2>/dev/null | head -1)",
        "if [ -z \"$BX_PATH\" ]; then echo '[brave] bx binary not found after install'; exit 1; fi",
        "cp \"$BX_PATH\" /data/bin/bx",
        "chmod +x /data/bin/bx",
        "/data/bin/bx --help >/dev/null",
        "echo '[brave] bx installed and verified at /data/bin/bx'"
      ].join(" && ")
    ], {
      stdio: "inherit",
      env: {
        ...process.env,
        PATH: `/data/bin:/root/.local/bin:/home/node/.local/bin:${process.env.PATH || ""}`
      }
    });

    console.log("[brave] bx install complete");
  } catch (error) {
    console.error("[brave] bx install failed:", error);
  }
}

ensureBraveBxInstalled();

// ========== ENVIRONMENT VARIABLE MIGRATION ==========
// Auto-migrate legacy CLAWDBOT_* and MOLTBOT_* env vars to OPENCLAW_* for backward compatibility.
// This ensures existing Railway deployments continue working after the rename.
const ENV_MIGRATIONS = [
  { old: "CLAWDBOT_PUBLIC_PORT", new: "OPENCLAW_PUBLIC_PORT" },
  { old: "MOLTBOT_PUBLIC_PORT", new: "OPENCLAW_PUBLIC_PORT" },
  { old: "CLAWDBOT_STATE_DIR", new: "OPENCLAW_STATE_DIR" },
  { old: "MOLTBOT_STATE_DIR", new: "OPENCLAW_STATE_DIR" },
  { old: "CLAWDBOT_WORKSPACE_DIR", new: "OPENCLAW_WORKSPACE_DIR" },
  { old: "MOLTBOT_WORKSPACE_DIR", new: "OPENCLAW_WORKSPACE_DIR" },
  { old: "CLAWDBOT_GATEWAY_TOKEN", new: "OPENCLAW_GATEWAY_TOKEN" },
  { old: "MOLTBOT_GATEWAY_TOKEN", new: "OPENCLAW_GATEWAY_TOKEN" },
  { old: "CLAWDBOT_CONFIG_PATH", new: "OPENCLAW_CONFIG_PATH" },
  { old: "MOLTBOT_CONFIG_PATH", new: "OPENCLAW_CONFIG_PATH" },
];

for (const { old, new: newVar } of ENV_MIGRATIONS) {
  if (process.env[old] && !process.env[newVar]) {
    console.warn(`[env-migration] Detected legacy ${old}, auto-migrating to ${newVar}`);
    process.env[newVar] = process.env[old];
  }
}

// Railway commonly sets PORT=8080 for HTTP services.
// Prefer OPENCLAW_PUBLIC_PORT (explicit user config) over Railway's default PORT.
const PORT = Number.parseInt(
  process.env.OPENCLAW_PUBLIC_PORT?.trim() || process.env.PORT || "8080",
  10,
);
const STATE_DIR =
  process.env.OPENCLAW_STATE_DIR?.trim() ||
  path.join(os.homedir(), ".openclaw");
const WORKSPACE_DIR =
  process.env.OPENCLAW_WORKSPACE_DIR?.trim() ||
  path.join(STATE_DIR, "workspace");

// Protect /setup with a user-provided password.
const SETUP_PASSWORD = process.env.SETUP_PASSWORD?.trim();

// Debug logging helper
const DEBUG = process.env.OPENCLAW_TEMPLATE_DEBUG?.toLowerCase() === "true";
function debug(...args) {
  if (DEBUG) console.log(...args);
}

// Gateway admin token (protects Openclaw gateway + Control UI).
// Must be stable across restarts. If not provided via env, persist it in the state dir.
function resolveGatewayToken() {
  console.log(`[token] ========== SERVER STARTUP TOKEN RESOLUTION ==========`);
  const envTok = process.env.OPENCLAW_GATEWAY_TOKEN?.trim();
  console.log(`[token] ENV OPENCLAW_GATEWAY_TOKEN exists: ${!!process.env.OPENCLAW_GATEWAY_TOKEN}`);
  console.log(`[token] ENV value length: ${process.env.OPENCLAW_GATEWAY_TOKEN?.length || 0}`);
  console.log(`[token] After trim length: ${envTok?.length || 0}`);

  if (envTok) {
    console.log(`[token] ✓ Using token from OPENCLAW_GATEWAY_TOKEN env variable`);
    debug(`[token]   First 16 chars: ${envTok.slice(0, 16)}...`);
    debug(`[token]   Full token: ${envTok}`);
    return envTok;
  }

  console.log(`[token] Env variable not available, checking persisted file...`);
  const tokenPath = path.join(STATE_DIR, "gateway.token");
  console.log(`[token] Token file path: ${tokenPath}`);

  try {
    const existing = fs.readFileSync(tokenPath, "utf8").trim();
    if (existing) {
      console.log(`[token] ✓ Using token from persisted file`);
      debug(`[token]   First 8 chars: ${existing.slice(0, 8)}...`);
      return existing;
    }
  } catch (err) {
    console.log(`[token] Could not read persisted file: ${err.message}`);
  }

  const generated = crypto.randomBytes(32).toString("hex");
  console.log(`[token] ⚠️  Generating new random token`);
  debug(`[token]   First 8 chars: ${generated.slice(0, 8)}...`);
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(tokenPath, generated, { encoding: "utf8", mode: 0o600 });
    console.log(`[token] Persisted new token to ${tokenPath}`);
  } catch (err) {
    console.warn(`[token] Could not persist token: ${err}`);
  }
  return generated;
}

const OPENCLAW_GATEWAY_TOKEN = resolveGatewayToken();
process.env.OPENCLAW_GATEWAY_TOKEN = OPENCLAW_GATEWAY_TOKEN;
debug(`[token] Final resolved token: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}... (len: ${OPENCLAW_GATEWAY_TOKEN.length})`);
console.log(`[token] ========== TOKEN RESOLUTION COMPLETE ==========\n`);

// Where the gateway will listen internally (we proxy to it).
const INTERNAL_GATEWAY_PORT = Number.parseInt(
  process.env.INTERNAL_GATEWAY_PORT ?? "18789",
  10,
);
const INTERNAL_GATEWAY_HOST = process.env.INTERNAL_GATEWAY_HOST ?? "127.0.0.1";
const GATEWAY_TARGET = `http://${INTERNAL_GATEWAY_HOST}:${INTERNAL_GATEWAY_PORT}`;

// Always run the built-from-source CLI entry directly to avoid PATH/global-install mismatches.
const OPENCLAW_ENTRY =
  process.env.OPENCLAW_ENTRY?.trim() || "/openclaw/dist/entry.js";
const OPENCLAW_NODE = process.env.OPENCLAW_NODE?.trim() || "node";

function clawArgs(args) {
  return [OPENCLAW_ENTRY, ...args];
}

// ========== AUTH PROVIDER GROUPS ==========
// Hardcoded auth provider groups for setup wizard (avoids CLI dependency for UI rendering).
// This matches Openclaw's auth-choice grouping logic for consistency.
const AUTH_GROUPS = [
  {
    value: "openai",
    label: "OpenAI",
    hint: "Codex OAuth + API key",
    options: [
      { value: "codex-cli", label: "OpenAI Codex OAuth (Codex CLI)" },
      { value: "openai-codex", label: "OpenAI Codex (ChatGPT OAuth)" },
      { value: "openai-api-key", label: "OpenAI API key" },
    ],
  },
  {
    value: "anthropic",
    label: "Anthropic",
    hint: "Claude Code CLI + API key",
    options: [
      { value: "claude-cli", label: "Anthropic token (Claude Code CLI)" },
      { value: "token", label: "Anthropic token (paste setup-token)" },
      { value: "apiKey", label: "Anthropic API key" },
    ],
  },
  {
    value: "google",
    label: "Google",
    hint: "Gemini API key + OAuth",
    options: [
      { value: "gemini-api-key", label: "Google Gemini API key" },
      { value: "google-antigravity", label: "Google Antigravity OAuth" },
      { value: "google-gemini-cli", label: "Google Gemini CLI OAuth" },
    ],
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    hint: "API key",
    options: [{ value: "openrouter-api-key", label: "OpenRouter API key" }],
  },
  {
    value: "ai-gateway",
    label: "Vercel AI Gateway",
    hint: "API key",
    options: [
      { value: "ai-gateway-api-key", label: "Vercel AI Gateway API key" },
    ],
  },
  {
    value: "moonshot",
    label: "Moonshot AI",
    hint: "Kimi K2 + Kimi Code",
    options: [
      { value: "moonshot-api-key", label: "Moonshot AI API key" },
      { value: "kimi-code-api-key", label: "Kimi Code API key" },
    ],
  },
  {
    value: "zai",
    label: "Z.AI (GLM 4.7)",
    hint: "API key",
    options: [{ value: "zai-api-key", label: "Z.AI (GLM 4.7) API key" }],
  },
  {
    value: "minimax",
    label: "MiniMax",
    hint: "M2.1 (recommended)",
    options: [
      { value: "minimax-api", label: "MiniMax M2.1" },
      { value: "minimax-api-lightning", label: "MiniMax M2.1 Lightning" },
    ],
  },
  {
    value: "qwen",
    label: "Qwen",
    hint: "OAuth",
    options: [{ value: "qwen-portal", label: "Qwen OAuth" }],
  },
  {
    value: "copilot",
    label: "Copilot",
    hint: "GitHub + local proxy",
    options: [
      {
        value: "github-copilot",
        label: "GitHub Copilot (GitHub device login)",
      },
      { value: "copilot-proxy", label: "Copilot Proxy (local)" },
    ],
  },
  {
    value: "synthetic",
    label: "Synthetic",
    hint: "Anthropic-compatible (multi-model)",
    options: [{ value: "synthetic-api-key", label: "Synthetic API key" }],
  },
  {
    value: "opencode-zen",
    label: "OpenCode Zen",
    hint: "API key",
    options: [
      { value: "opencode-zen", label: "OpenCode Zen (multi-model proxy)" },
    ],
  },
];

// Returns all candidate config paths in priority order.
// Supports explicit override + legacy config file migration.
function resolveConfigCandidates() {
  const candidates = [];

  // 1. Explicit override (highest priority)
  const explicit = process.env.OPENCLAW_CONFIG_PATH?.trim();
  if (explicit) {
    candidates.push(explicit);
  }

  // 2. Current openclaw.json
  candidates.push(path.join(STATE_DIR, "openclaw.json"));

  // 3. Legacy config files (for auto-migration)
  candidates.push(path.join(STATE_DIR, "moltbot.json"));
  candidates.push(path.join(STATE_DIR, "clawdbot.json"));

  return candidates;
}

// Returns the active config path (prefers explicit override, falls back to default location).
function configPath() {
  const explicit = process.env.OPENCLAW_CONFIG_PATH?.trim();
  if (explicit) return explicit;
  return path.join(STATE_DIR, "openclaw.json");
}

// Returns true if any config file exists (including legacy files).
function isConfigured() {
  const candidates = resolveConfigCandidates();
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return true;
      }
    } catch {
      // ignore
    }
  }
  return false;
}

// ========== LEGACY CONFIG FILE MIGRATION ==========
// Auto-migrate legacy config files (moltbot.json, clawdbot.json) → openclaw.json on module load.
// This runs once at startup before any gateway operations.
(function migrateLegacyConfigFiles() {
  const target = configPath();

  // If target already exists, nothing to migrate
  try {
    if (fs.existsSync(target)) {
      return;
    }
  } catch {
    return;
  }

  // Check for legacy files and migrate the first one found
  const legacyFiles = [
    path.join(STATE_DIR, "moltbot.json"),
    path.join(STATE_DIR, "clawdbot.json"),
  ];

  for (const legacyPath of legacyFiles) {
    try {
      if (fs.existsSync(legacyPath)) {
        console.warn(`[config-migration] Found legacy config file: ${legacyPath}`);
        console.warn(`[config-migration] Renaming to: ${target}`);

        // Ensure target directory exists
        fs.mkdirSync(path.dirname(target), { recursive: true });

        // Rename (atomic on same filesystem)
        fs.renameSync(legacyPath, target);

        console.warn(`[config-migration] ✓ Migration complete`);
        return;
      }
    } catch (err) {
      console.error(`[config-migration] Failed to migrate ${legacyPath}: ${err.message}`);
      // Continue checking other legacy files
    }
  }
})();

let gatewayProc = null;
let gatewayStarting = null;
let gatewayHealthy = false;

// Debug breadcrumbs for common Railway failures (502 / "Application failed to respond").
let lastGatewayError = null;
let lastGatewayExit = null;
let lastDoctorOutput = null;
let lastDoctorAt = null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForGatewayReady(opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const start = Date.now();
  const endpoints = ["/openclaw", "/openclaw", "/", "/health"];

  while ((Date.now() - start) < timeoutMs) {
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`${GATEWAY_TARGET}${endpoint}`, { method: "GET" });

        if (res) {
          const elapsed = ((Date.now() - start) / 1000).toFixed(1);
          console.log(`[gateway] ready at ${endpoint} (${elapsed}s elapsed)`);
          gatewayHealthy = true;
          return true;
        }
      } catch {
        // not ready, try next endpoint
      }
    }

    await sleep(250);
  }
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.warn(`[gateway] initial readiness check timed out after ${elapsed}s, but gateway may still be starting...`);
  console.warn(`[gateway] continuing health monitoring in background`);
  return false;
}

async function startGateway() {
  if (gatewayProc) return;
  if (!isConfigured()) throw new Error("Gateway cannot start: not configured");

  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

  console.log(`[gateway] ========== GATEWAY START TOKEN SYNC ==========`);
  console.log(`[gateway] Syncing wrapper token to config (length: ${OPENCLAW_GATEWAY_TOKEN.length})`);
  debug(`[gateway] Token preview: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}...`);

  const syncResult = await runCmd(
    OPENCLAW_NODE,
    clawArgs(["config", "set", "gateway.auth.token", OPENCLAW_GATEWAY_TOKEN]),
  );

  console.log(`[gateway] Sync result: exit code ${syncResult.code}`);
  if (syncResult.output?.trim()) {
    console.log(`[gateway] Sync output: ${syncResult.output}`);
  }

  if (syncResult.code !== 0) {
    console.error(`[gateway] ⚠️  WARNING: Token sync failed with code ${syncResult.code}`);
    throw new Error(`Token sync failed: ${syncResult.output}`);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath(), "utf8"));
    const configToken = config?.gateway?.auth?.token;

    console.log(`[gateway] Token verification:`);
    debug(`[gateway]   Wrapper: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}... (len: ${OPENCLAW_GATEWAY_TOKEN.length})`);
    debug(`[gateway]   Config:  ${configToken?.slice(0, 16)}... (len: ${configToken?.length || 0})`);
    console.log(`[gateway]   Token lengths - Wrapper: ${OPENCLAW_GATEWAY_TOKEN.length}, Config: ${configToken?.length || 0}`);

    if (configToken !== OPENCLAW_GATEWAY_TOKEN) {
      console.error(`[gateway] ✗ Token mismatch detected!`);
      debug(`[gateway]   Full wrapper: ${OPENCLAW_GATEWAY_TOKEN}`);
      debug(`[gateway]   Full config:  ${configToken || "null"}`);
      throw new Error(
        "Token mismatch: tokens don't match (enable DEBUG logging for details)",
      );
    }
    console.log(`[gateway] ✓ Token verification PASSED`);
  } catch (err) {
    console.error(`[gateway] ERROR: Token verification failed: ${err}`);
    throw err;
  }

  console.log(`[gateway] ========== TOKEN SYNC COMPLETE ==========`);

  const args = [
    "gateway",
    "run",
    "--bind",
    "loopback",
    "--port",
    String(INTERNAL_GATEWAY_PORT),
    "--auth",
    "token",
    "--token",
    OPENCLAW_GATEWAY_TOKEN,
  ];

  gatewayProc = childProcess.spawn(OPENCLAW_NODE, clawArgs(args), {
    stdio: "inherit",
    env: {
      ...process.env,
      OPENCLAW_STATE_DIR: STATE_DIR,
      OPENCLAW_WORKSPACE_DIR: WORKSPACE_DIR,
    },
  });

  console.log(`[gateway] starting with command: ${OPENCLAW_NODE} ${clawArgs(args).join(" ")}`);
  console.log(`[gateway] STATE_DIR: ${STATE_DIR}`);
  console.log(`[gateway] WORKSPACE_DIR: ${WORKSPACE_DIR}`);
  console.log(`[gateway] config path: ${configPath()}`);

  gatewayProc.on("error", (err) => {
    const msg = `[gateway] spawn error: ${String(err)}`;
    console.error(msg);
    lastGatewayError = msg;
    gatewayProc = null;
  });

  gatewayProc.on("exit", (code, signal) => {
    const msg = `[gateway] exited code=${code} signal=${signal}`;
    console.error(msg);
    lastGatewayExit = { code, signal, at: new Date().toISOString() };
    gatewayProc = null;
    gatewayHealthy = false;
  });

  startBackgroundHealthMonitor();
}

let healthMonitorInterval = null;
function startBackgroundHealthMonitor() {
  if (healthMonitorInterval) {
    clearInterval(healthMonitorInterval);
  }

  healthMonitorInterval = setInterval(async () => {
    if (gatewayProc && !gatewayHealthy) {
      try {
        const res = await fetch(`${GATEWAY_TARGET}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        if (res) {
          console.log(`[gateway] background health check: gateway is NOW HEALTHY`);
          gatewayHealthy = true;
          clearInterval(healthMonitorInterval);
          healthMonitorInterval = null;
        }
      } catch {
        // Still not ready
      }
    } else if (!gatewayProc && healthMonitorInterval) {
      clearInterval(healthMonitorInterval);
      healthMonitorInterval = null;
      gatewayHealthy = false;
    }
  }, 10_000);
}

async function runDoctorBestEffort() {
  const now = Date.now();
  if (lastDoctorAt && now - lastDoctorAt < 5 * 60 * 1000) return;
  lastDoctorAt = now;

  try {
    const r = await runCmd(OPENCLAW_NODE, clawArgs(["doctor"]));
    const out = redactSecrets(r.output || "");
    lastDoctorOutput = out.length > 50_000 ? `${out.slice(0, 50_000)}\n... (truncated)\n` : out;
  } catch (err) {
    lastDoctorOutput = `doctor failed: ${String(err)}`;
  }
}

async function ensureGatewayRunning() {
  if (!isConfigured()) return { ok: false, reason: "not configured" };
  if (gatewayProc) return { ok: true };
  if (!gatewayStarting) {
    gatewayStarting = (async () => {
      try {
        lastGatewayError = null;
        gatewayHealthy = false;
        await startGateway();
        const ready = await waitForGatewayReady({ timeoutMs: 60_000 });
        if (!ready) {
          console.warn(`[gateway] Initial readiness check timed out, but background monitor will continue checking`);
        }
      } catch (err) {
        const msg = `[gateway] start failure: ${String(err)}`;
        lastGatewayError = msg;
        await runDoctorBestEffort();
        throw err;
      }
    })().finally(() => {
      gatewayStarting = null;
    });
  }
  await gatewayStarting;
  return { ok: true };
}

async function restartGateway() {
  console.log("[gateway] Restarting gateway...");

  if (gatewayProc) {
    console.log(`[gateway] Killing wrapper-managed gateway process (PID: ${gatewayProc.pid})`);
    try {
      gatewayProc.kill("SIGTERM");
    } catch (err) {
      console.log(`[gateway] Failed to kill wrapper process: ${err.message}`);
    }
    gatewayProc = null;
  }

  console.log(`[gateway] Ensuring all gateway processes stopped with pkill...`);

  const killPatterns = [
    "gateway run",
    "openclaw.*gateway",
    `port.*${INTERNAL_GATEWAY_PORT}`,
  ];

  for (const pattern of killPatterns) {
    try {
      const killResult = await runCmd("pkill", ["-f", pattern], { timeoutMs: 5000 });
      if (killResult.code === 0) {
        console.log(`[gateway] pkill -f "${pattern}" succeeded`);
      }
    } catch (err) {
      console.log(`[gateway] pkill -f "${pattern}": ${err.message}`);
    }
  }

  await sleep(2000);

  try {
    const stillListening = await probeGateway();
    if (stillListening) {
      console.warn(`[gateway] ⚠️  Port ${INTERNAL_GATEWAY_PORT} still in use after pkill!`);
      await sleep(3000);
    }
  } catch {
    // fine
  }

  return ensureGatewayRunning();
}

function requireSetupAuth(req, res, next) {
  if (!SETUP_PASSWORD) {
    return res
      .status(500)
      .type("text/plain")
      .send(
        "SETUP_PASSWORD is not set. Set it in Railway Variables before using /setup.",
      );
  }

  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) {
    res.set("WWW-Authenticate", 'Basic realm="Openclaw Setup"');
    return res.status(401).send("Auth required");
  }
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  const password = idx >= 0 ? decoded.slice(idx + 1) : "";
  if (password !== SETUP_PASSWORD) {
    res.set("WWW-Authenticate", 'Basic realm="Openclaw Setup"');
    return res.status(401).send("Invalid password");
  }
  return next();
}

async function probeGateway() {
  const net = await import("node:net");

  return await new Promise((resolve) => {
    const sock = net.createConnection({
      host: INTERNAL_GATEWAY_HOST,
      port: INTERNAL_GATEWAY_PORT,
      timeout: 750,
    });

    const done = (ok) => {
      try {
        sock.destroy();
      } catch {}
      resolve(ok);
    };

    sock.on("connect", () => done(true));
    sock.on("timeout", () => done(false));
    sock.on("error", () => done(false));
  });
}

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
function normalizeAuditCroValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

async function isDuplicateAuditCroRow(sheets, spreadsheetId, range, values) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];

  // Le sheet a une ligne titre + une ligne headers, donc on ignore les 2 premières lignes
  const dataRows = rows.slice(2);

  const newCompanyName = normalizeAuditCroValue(values[2]);
  const newWebsite = normalizeAuditCroValue(values[3]);
  const newLinkedinUrl = normalizeAuditCroValue(values[4]);
  const newContactLinkedin = normalizeAuditCroValue(values[7]);
  const newEmail = normalizeAuditCroValue(values[8]);
  const newCountry = normalizeAuditCroValue(values[10]);
  const newSelectedEmail = normalizeAuditCroValue(values[28]);

  return dataRows.some((row) => {
    const existingCompanyName = normalizeAuditCroValue(row[2]);
    const existingWebsite = normalizeAuditCroValue(row[3]);
    const existingLinkedinUrl = normalizeAuditCroValue(row[4]);
    const existingContactLinkedin = normalizeAuditCroValue(row[7]);
    const existingEmail = normalizeAuditCroValue(row[8]);
    const existingCountry = normalizeAuditCroValue(row[10]);
    const existingSelectedEmail = normalizeAuditCroValue(row[28]);

    // Doublon fort : même website
    if (newWebsite && existingWebsite && newWebsite === existingWebsite) {
      return true;
    }

    // Doublon fort : même LinkedIn company
    if (newLinkedinUrl && existingLinkedinUrl && newLinkedinUrl === existingLinkedinUrl) {
      return true;
    }

    // Doublon fort : même LinkedIn contact
    if (newContactLinkedin && existingContactLinkedin && newContactLinkedin === existingContactLinkedin) {
      return true;
    }

    // Doublon email visible
    if (newEmail && existingEmail && newEmail === existingEmail) {
      return true;
    }

    // Doublon email sélectionné pour outreach
    if (newSelectedEmail && existingSelectedEmail && newSelectedEmail === existingSelectedEmail) {
      return true;
    }

    // Doublon faible mais utile : même nom + même pays
    if (
      newCompanyName &&
      existingCompanyName &&
      newCountry &&
      existingCountry &&
      newCompanyName === existingCompanyName &&
      newCountry === existingCountry
    ) {
      return true;
    }

    return false;
  });
}

const PRESTATAIRE_FIELDS = [
  "id",
  "market",
  "company_name",
  "website",
  "linkedin_url",
  "contact_name",
  "contact_role",
  "contact_linkedin",
  "email",
  "city",
  "country",
  "offer_type",
  "packaged_offer",
  "icp_fit",
  "why_fit",
  "source",
  "date_added",
  "added_by",
  "status",
  "founder_name",
  "team_size_estimate",
  "b2b_fit",
  "ecommerce_risk",
  "pricing_signal",
  "email_guess_1",
  "email_guess_2",
  "email_guess_3",
  "verification_status",
  "selected_email",
  "prospeo_needed",
  "source_tool",
  "email_source_url"
];

const CLIENT_FIELDS = [
  "id",
  "market",
  "company_name",
  "website",
  "linkedin_url",
  "contact_name",
  "contact_role",
  "contact_linkedin",
  "email",
  "city",
  "country",
  "industry",
  "employee_range",
  "cro_friction_summary",
  "icp_fit",
  "why_fit",
  "source",
  "date_added",
  "added_by",
  "cro_signal_1",
  "cro_signal_2",
  "cro_signal_3",
  "cro_signal_4",
  "cro_signal_5",
  "email_guess_1",
  "email_guess_2",
  "email_guess_3",
  "verification_status",
  "selected_email",
  "prospeo_needed",
  "source_tool",
  "email_source_url"
];

function normalizeSheetValues(body, fields, tabName) {
  if (Array.isArray(body?.values)) {
    if (body.values.length !== fields.length) {
      return {
        ok: false,
        status: 400,
        response: {
          success: false,
          error: "invalid_values_length",
          expected: fields.length,
          received: body.values.length,
          tab: tabName
        }
      };
    }

    return {
      ok: true,
      values: body.values.map((value) =>
        value === undefined || value === null ? "" : String(value)
      )
    };
  }

  if (body?.row && typeof body.row === "object" && !Array.isArray(body.row)) {
    const values = fields.map((field) => {
      const value = body.row[field];
      return value === undefined || value === null ? "" : String(value);
    });

    return {
      ok: true,
      values
    };
  }

  return {
    ok: false,
    status: 400,
    response: {
      success: false,
      error: "invalid_payload",
      message: "Expected either { values: [32 ordered values] } or { row: { field: value } }",
      tab: tabName
    }
  };
}

function requireAuditCroSecret(req, res, next) {
  const secret = process.env.AUDIT_CRO_INTERNAL_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, error: "AUDIT_CRO_INTERNAL_SECRET not configured on server" });
  }
  if (req.headers["x-audit-cro-secret"] !== secret) {
    return res.status(401).json({ success: false, error: "unauthorized" });
  }
  return next();
}

app.post("/setup/api/sheets/audit-cro/prestataires", requireAuditCroSecret, express.json(), async (req, res) => {
  try {
  const built = buildRowFromPayload(
  req.body,
  PRESTATAIRE_FIELDS,
  "Prestataires_Audit_CRO"
);

if (!built.ok) {
  return res.status(built.status).json(built.response);
}

const row = normalizeProviderRow(built.row);

const validationErrors = validateProviderRow(row);

if (validationErrors.length > 0) {
  return res.status(422).json({
    success: false,
    error: "PROVIDER_ROW_VALIDATION_ERROR",
    tab: "Prestataires_Audit_CRO",
    company: row.company_name || "",
    details: validationErrors
  });
}

const values = rowToSheetValues(row, PRESTATAIRE_FIELDS);

const sheets = await getSheetsClient();

console.log("[audit-cro/prestataires] incoming values:", values);

const duplicate = await isDuplicateAuditCroRow(
  sheets,
  process.env.GOOGLE_SHEET_AUDIT_CRO_ID,
  "Prestataires_Audit_CRO!A:AF",
  values
);

console.log("[audit-cro/prestataires] duplicate result:", duplicate);

if (duplicate) {
  return res.status(409).json({
    success: false,
    duplicate: true,
    tab: "Prestataires_Audit_CRO",
    message: "Duplicate detected. Row was not added."
  });
}

await sheets.spreadsheets.values.append({
  spreadsheetId: process.env.GOOGLE_SHEET_AUDIT_CRO_ID,
  range: "Prestataires_Audit_CRO!A:AF",
  valueInputOption: "RAW",
  insertDataOption: "INSERT_ROWS",
  requestBody: {
    values: [values]
  }
});

return res.json({
  success: true,
  rowsAdded: 1,
  tab: "Prestataires_Audit_CRO",
  company: values[2] || ""
});
    
  } catch (error) {
    console.error("[audit-cro/prestataires] append error:", error);

    return res.status(500).json({
      success: false,
      error: "provider_append_failed",
      message: error.message
    });
  }
});

app.post("/setup/api/sheets/audit-cro/clients", requireAuditCroSecret, express.json(), async (req, res) => {
  try {
   const normalized = normalizeSheetValues(
  req.body,
  CLIENT_FIELDS,
  "Clients_Finaux_Audit_CRO"
);

if (!normalized.ok) {
  return res.status(normalized.status).json(normalized.response);
}

const values = normalized.values;

    const sheets = await getSheetsClient();

    console.log("[audit-cro/clients] incoming values:", values);

    const duplicate = await isDuplicateAuditCroRow(
      sheets,
      process.env.GOOGLE_SHEET_AUDIT_CRO_ID,
      "Clients_Finaux_Audit_CRO!A:AF",
      values
    );

    console.log("[audit-cro/clients] duplicate result:", duplicate);

    if (duplicate) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        tab: "Clients_Finaux_Audit_CRO",
        message: "Duplicate detected. Row was not added."
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_AUDIT_CRO_ID,
      range: "Clients_Finaux_Audit_CRO!A:AF",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [values]
      }
    });

    return res.json({
      success: true,
      rowsAdded: 1,
      tab: "Clients_Finaux_Audit_CRO",
      company: values[2] || ""
    });

  } catch (error) {
    console.error("[audit-cro/clients] append error:", error);

    return res.status(500).json({
      success: false,
      error: "client_append_failed",
      message: error.message
    });
  }
});

// ===============================
// Prospeo API helpers - Audit CRO
// ===============================

const PROSPEO_API_BASE = 'https://api.prospeo.io';

function getProspeoApiKey() {
  const key = process.env.PROSPEO_API_KEY;
  return key && key.trim() ? key.trim() : null;
}

// Local status check only.
// This checks whether Railway exposes PROSPEO_API_KEY to server.js.
// It does not call Prospeo and does not consume credits.
app.post('/setup/api/tools/prospeo/status', async (req, res) => {
  const apiKey = getProspeoApiKey();

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      tool: 'prospeo',
      configured: false,
      message: 'PROSPEO_API_KEY is missing from Railway environment variables.'
    });
  }

  return res.status(200).json({
    success: true,
    tool: 'prospeo',
    configured: true,
    message: 'PROSPEO_API_KEY is available in server.js environment.'
  });
});

// Prospeo enrich-person fallback.
// Use only after lead qualification, website review, MX/pattern logic and Hunter.
// This request may consume Prospeo credits if Prospeo returns enrichment data.
app.post('/setup/api/tools/prospeo/enrich-person', async (req, res) => {
  try {
    const apiKey = getProspeoApiKey();

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        tool: 'prospeo',
        error: 'PROSPEO_API_KEY is missing from Railway environment variables.'
      });
    }

    const body = req.body || {};
    const data = body.data || {};

    const hasName =
      data.full_name ||
      (data.first_name && data.last_name);

    const hasCompanyContext =
      data.company_website ||
      data.company_name ||
      data.linkedin_url;

    if (!hasName) {
      return res.status(400).json({
        success: false,
        tool: 'prospeo',
        error: 'Missing required person name. Provide full_name or first_name + last_name.'
      });
    }

    if (!hasCompanyContext) {
      return res.status(400).json({
        success: false,
        tool: 'prospeo',
        error: 'Missing company context. Provide company_website, company_name, or linkedin_url.'
      });
    }

    const payload = {
      only_verified_email: body.only_verified_email !== false,
      enrich_mobile: false,
      data
    };

    const response = await fetch(`${PROSPEO_API_BASE}/enrich-person`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KEY': apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (error) {
      parsed = { raw_response: responseText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        tool: 'prospeo',
        status: response.status,
        error: 'Prospeo API HTTP request failed.',
        response: parsed
      });
    }

    if (parsed && parsed.error === true) {
      return res.status(200).json({
        success: false,
        tool: 'prospeo',
        status: response.status,
        error_code: parsed.error_code || 'PROSPEO_ERROR',
        response: parsed
      });
    }

    const person = parsed.person || {};
    const company = parsed.company || {};
    const emailObject = person.email || {};

    const selectedEmail =
      emailObject.revealed === true && emailObject.email
        ? emailObject.email
        : '';

    const verificationStatus =
      emailObject.status === 'VERIFIED'
        ? 'verified'
        : selectedEmail
          ? 'risky'
          : 'no_email_found';

    return res.status(200).json({
      success: true,
      tool: 'prospeo',
      status: response.status,
      selected_email: selectedEmail,
      verification_status: verificationStatus,
      email_status: emailObject.status || '',
      email_mx_provider: emailObject.email_mx_provider || '',
      person: {
        first_name: person.first_name || '',
        last_name: person.last_name || '',
        full_name: person.full_name || '',
        linkedin_url: person.linkedin_url || '',
        current_job_title: person.current_job_title || ''
      },
      company: {
        name: company.name || '',
        website: company.website || '',
        domain: company.domain || '',
        linkedin_url: company.linkedin_url || '',
        industry: company.industry || '',
        employee_range: company.employee_range || '',
        city: company.location?.city || '',
        state: company.location?.state || '',
        country: company.location?.country || ''
      },
      raw_response: parsed
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      tool: 'prospeo',
      error: error.message || 'Unknown Prospeo server error.'
    });
  }
});

app.get("/setup/healthz", (_req, res) => res.json({ ok: true }));

app.get("/healthz", async (_req, res) => {
  let gatewayReachable = false;
  if (isConfigured()) {
    try {
      gatewayReachable = await probeGateway();
    } catch {
      gatewayReachable = false;
    }
  }

  res.json({
    ok: true,
    wrapper: {
      configured: isConfigured(),
      stateDir: STATE_DIR,
      workspaceDir: WORKSPACE_DIR,
    },
    gateway: {
      target: GATEWAY_TARGET,
      reachable: gatewayReachable,
      healthy: gatewayHealthy,
      processRunning: !!gatewayProc,
      lastError: lastGatewayError,
      lastExit: lastGatewayExit,
      lastDoctorAt,
    },
  });
});

app.get("/setup/app.js", requireSetupAuth, (_req, res) => {
  res.type("application/javascript");
  res.sendFile(path.join(process.cwd(), "src", "public", "setup-app.js"));
});

app.get("/setup/styles.css", requireSetupAuth, (_req, res) => {
  res.type("text/css");
  res.sendFile(path.join(process.cwd(), "src", "public", "styles.css"));
});

app.get("/setup", requireSetupAuth, (_req, res) => {
  res.sendFile(path.join(process.cwd(), "src", "public", "setup.html"));
});

app.post("/setup/api/sheets/check-access", requireSetupAuth, async (req, res) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
const sheet = String(req.body?.sheet || "").trim();

if (!sheetId) {
  return res.status(500).type("text/plain").send("GOOGLE_SHEET_ID manquant");
}

if (!sheet) {
  return res.status(400).type("text/plain").send("sheet manquante");
}

    const sheets = await getSheetsClient();

    const meta = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: "sheets(properties(title))",
    });

    const titles = (meta.data.sheets || [])
      .map((s) => s?.properties?.title)
      .filter(Boolean);

    if (!titles.includes(sheet)) {
      return res.status(404).type("text/plain").send(`Sheet tab "${sheet}" not found`);
    }

    return res.type("text/plain").send("access ok");
  } catch (err) {
    return res.status(500).type("text/plain").send(String(err?.message || err));
  }
});

function normalizeSheetRows(input) {
  if (!input) return [];

  if (Array.isArray(input)) {
    if (input.length === 0) return [];
    return Array.isArray(input[0]) ? input : [input];
  }

  return [];
}

async function appendRowsToGoogleSheet({ spreadsheetId, sheetName, rows }) {
  const normalizedRows = normalizeSheetRows(rows);

  if (!spreadsheetId) {
    throw new Error("Missing spreadsheetId");
  }

  if (!sheetName) {
    throw new Error("Missing sheetName");
  }

  if (!normalizedRows.length) {
    throw new Error("No rows provided");
  }

  const sheets = await getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: normalizedRows,
    },
  });

  return { ok: true, appended: normalizedRows.length };
}

function buildOnboardArgs(payload) {
  const args = [
    "onboard",
    "--non-interactive",
    "--accept-risk",
    "--json",
    "--no-install-daemon",
    "--skip-health",
    "--workspace",
    WORKSPACE_DIR,
    "--gateway-bind",
    "loopback",
    "--gateway-port",
    String(INTERNAL_GATEWAY_PORT),
    "--gateway-auth",
    "token",
    "--gateway-token",
    OPENCLAW_GATEWAY_TOKEN,
    "--flow",
    payload.flow || "quickstart",
  ];

  if (payload.authChoice) {
    args.push("--auth-choice", payload.authChoice);

    const secret = (payload.authSecret || "").trim();

    const requiresSecret = [
      "openai-api-key",
      "apiKey",
      "token",
      "openrouter-api-key",
      "ai-gateway-api-key",
      "moonshot-api-key",
      "kimi-code-api-key",
      "gemini-api-key",
      "zai-api-key",
      "minimax-api",
      "minimax-api-lightning",
      "synthetic-api-key",
      "opencode-zen",
    ];

    if (requiresSecret.includes(payload.authChoice) && !secret) {
      throw new Error(
        `Missing auth secret for authChoice=${payload.authChoice}.\n` +
          `Please provide your API key or token in the "Key / Token" field above.\n\n` +
          `Troubleshooting:\n` +
          `- Ensure you've pasted the API key correctly (no extra spaces)\n` +
          `- Check the provider's documentation for how to obtain the key\n` +
          `- Verify the key is valid and not expired`,
      );
    }

    const map = {
      "openai-api-key": "--openai-api-key",
      apiKey: "--anthropic-api-key",
      "openrouter-api-key": "--openrouter-api-key",
      "ai-gateway-api-key": "--ai-gateway-api-key",
      "moonshot-api-key": "--moonshot-api-key",
      "kimi-code-api-key": "--kimi-code-api-key",
      "gemini-api-key": "--gemini-api-key",
      "zai-api-key": "--zai-api-key",
      "minimax-api": "--minimax-api-key",
      "minimax-api-lightning": "--minimax-api-key",
      "synthetic-api-key": "--synthetic-api-key",
      "opencode-zen": "--opencode-zen-api-key",
    };
    const flag = map[payload.authChoice];
    if (flag && secret) {
      args.push(flag, secret);
    }

    if (payload.authChoice === "token" && secret) {
      args.push("--token-provider", "anthropic", "--token", secret);
    }
  }

  return args;
}

function runCmd(cmd, args, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 120_000;

  return new Promise((resolve) => {
    const proc = childProcess.spawn(cmd, args, {
      ...opts,
      env: {
        ...process.env,
        OPENCLAW_STATE_DIR: STATE_DIR,
        OPENCLAW_WORKSPACE_DIR: WORKSPACE_DIR,
      },
    });

    let out = "";
    let timedOut = false;
    let killTimer = null;

    proc.stdout?.on("data", (d) => (out += d.toString("utf8")));
    proc.stderr?.on("data", (d) => (out += d.toString("utf8")));

    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      out += `\n[timeout] Command exceeded ${timeoutMs}ms, sending SIGTERM...\n`;

      try {
        proc.kill("SIGTERM");
      } catch (err) {
        out += `[timeout] SIGTERM failed: ${err.message}\n`;
      }

      killTimer = setTimeout(() => {
        out += `[timeout] Process still alive after SIGTERM, sending SIGKILL...\n`;
        try {
          proc.kill("SIGKILL");
        } catch (err) {
          out += `[timeout] SIGKILL failed: ${err.message}\n`;
        }
      }, 5000);
    }, timeoutMs);

    proc.on("error", (err) => {
      clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
      out += `\n[spawn error] ${String(err)}\n`;
      resolve({ code: 127, output: out });
    });

    proc.on("close", (code) => {
      clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);

      if (timedOut && code === null) {
        resolve({ code: 124, output: out });
      } else {
        resolve({ code: code ?? 0, output: out });
      }
    });
  });
}

app.post("/setup/api/run", requireSetupAuth, async (req, res) => {
  try {
    if (isConfigured()) {
      await ensureGatewayRunning();
      return res.json({
        ok: true,
        output:
          "Already configured.\nUse Reset setup if you want to rerun onboarding.\n",
      });
    }

    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

    const payload = req.body || {};
    const onboardArgs = buildOnboardArgs(payload);

    debug(`[onboard] ========== TOKEN DIAGNOSTIC START ==========`);
    debug(
      `[onboard] Wrapper token (from env/file/generated): ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}... (length: ${OPENCLAW_GATEWAY_TOKEN.length})`,
    );
    debug(
      `[onboard] Onboard command args include: --gateway-token ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}...`,
    );
    debug(
      `[onboard] Full onboard command: node ${clawArgs(onboardArgs).join(" ").replace(OPENCLAW_GATEWAY_TOKEN, `${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}...`)}`,
    );

    const onboard = await runCmd(OPENCLAW_NODE, clawArgs(onboardArgs));

    let extra = "";

    const ok = onboard.code === 0 && isConfigured();

    if (ok) {
      try {
        const configAfterOnboard = JSON.parse(fs.readFileSync(configPath(), "utf8"));
        const tokenAfterOnboard = configAfterOnboard?.gateway?.auth?.token;
        debug(
          `[onboard] Token in config AFTER onboard: ${tokenAfterOnboard?.slice(0, 16)}... (length: ${tokenAfterOnboard?.length || 0})`,
        );
        const tokensMatch = tokenAfterOnboard === OPENCLAW_GATEWAY_TOKEN;
        console.log(`[onboard] Token match: ${tokensMatch ? "✓ MATCHES" : "✗ MISMATCH!"}`);
        if (!tokensMatch) {
          console.log(
            `[onboard] ⚠️  PROBLEM: onboard command ignored --gateway-token flag and wrote its own token!`,
          );
          extra += `\n[WARNING] onboard wrote different token than expected\n`;
          if (DEBUG) {
            extra += `  Expected: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}...\n`;
            extra += `  Got:      ${tokenAfterOnboard?.slice(0, 16)}...\n`;
          }
        }
      } catch (err) {
        console.error(`[onboard] Could not check config after onboard: ${err}`);
      }
    }

    if (ok) {
      console.log(`[onboard] Now syncing wrapper token to config`);
      debug(`[onboard] Token preview: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 8)}...`);

      await runCmd(OPENCLAW_NODE, clawArgs(["config", "set", "gateway.mode", "local"]));
      await runCmd(
        OPENCLAW_NODE,
        clawArgs(["config", "set", "gateway.auth.mode", "token"]),
      );

      const setTokenResult = await runCmd(
        OPENCLAW_NODE,
        clawArgs([
          "config",
          "set",
          "gateway.auth.token",
          OPENCLAW_GATEWAY_TOKEN,
        ]),
      );

      console.log(`[onboard] config set gateway.auth.token result: exit code ${setTokenResult.code}`);
      if (setTokenResult.output?.trim()) {
        console.log(`[onboard] config set output: ${setTokenResult.output}`);
      }

      if (setTokenResult.code !== 0) {
        console.error(
          `[onboard] ⚠️  WARNING: config set gateway.auth.token failed with code ${setTokenResult.code}`,
        );
        extra += `\n[WARNING] Failed to set gateway token in config: ${setTokenResult.output}\n`;
      }

      try {
        const configContent = fs.readFileSync(configPath(), "utf8");
        const config = JSON.parse(configContent);
        const configToken = config?.gateway?.auth?.token;

        console.log(`[onboard] Token verification after sync:`);
        debug(
          `[onboard]   Wrapper token: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}... (len: ${OPENCLAW_GATEWAY_TOKEN.length})`,
        );
        debug(
          `[onboard]   Config token:  ${configToken?.slice(0, 16)}... (len: ${configToken?.length || 0})`,
        );
        console.log(
          `[onboard]   Token lengths - Wrapper: ${OPENCLAW_GATEWAY_TOKEN.length}, Config: ${configToken?.length || 0}`,
        );

        if (configToken !== OPENCLAW_GATEWAY_TOKEN) {
          console.error(`[onboard] ✗ ERROR: Token mismatch after config set!`);
          debug(`[onboard]   Full wrapper token: ${OPENCLAW_GATEWAY_TOKEN}`);
          debug(`[onboard]   Full config token:  ${configToken || "null"}`);
          extra += `\n[ERROR] Token verification failed! Config has different token than wrapper.\n`;
          if (DEBUG) {
            extra += `  Wrapper: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}...\n`;
            extra += `  Config:  ${configToken?.slice(0, 16)}...\n`;
          }
        } else {
          console.log(`[onboard] ✓ Token verification PASSED - tokens match!`);
          extra += `\n[onboard] ✓ Gateway token synced successfully\n`;
        }
      } catch (err) {
        console.error(`[onboard] ERROR: Could not verify token in config: ${err}`);
        extra += `\n[ERROR] Could not verify token: ${String(err)}\n`;
      }

      console.log(`[onboard] ========== TOKEN DIAGNOSTIC END ==========`);

      await runCmd(
        OPENCLAW_NODE,
        clawArgs(["config", "set", "gateway.bind", "loopback"]),
      );
      await runCmd(
        OPENCLAW_NODE,
        clawArgs([
          "config",
          "set",
          "gateway.port",
          String(INTERNAL_GATEWAY_PORT),
        ]),
      );
      await runCmd(
        OPENCLAW_NODE,
        clawArgs(["config", "set", "gateway.controlUi.allowInsecureAuth", "true"]),
      );

      {
        const isRailwayEnv =
          !!process.env.RAILWAY_PROJECT_ID ||
          !!process.env.RAILWAY_ENVIRONMENT ||
          !!process.env.RAILWAY_STATIC_URL;
        const trustAllProxies = process.env.OPENCLAW_TRUST_PROXY_ALL === "true";

        const trustedProxies = (isRailwayEnv || trustAllProxies)
          ? ["127.0.0.1"]
          : ["127.0.0.1/32"];

        console.log(
          `[setup] Configuring trusted proxies: ${JSON.stringify(trustedProxies)} (Railway: ${isRailwayEnv})`,
        );

        await runCmd(
          OPENCLAW_NODE,
          clawArgs([
            "config",
            "set",
            "--json",
            "gateway.trustedProxies",
            JSON.stringify(trustedProxies),
          ]),
        );
      }

      if (payload.customProviderId?.trim()) {
        const providerId = payload.customProviderId.trim();
        const baseUrl = payload.customProviderBaseUrl?.trim();
        const api = payload.customProviderApi?.trim();
        const apiKeyEnv = payload.customProviderApiKeyEnv?.trim();
        const modelId = payload.customProviderModelId?.trim();

        if (!/^[A-Za-z0-9_-]+$/.test(providerId)) {
          throw new Error(
            `Invalid custom provider ID "${providerId}". Must contain only alphanumeric characters, underscores, and dashes.`,
          );
        }

        if (!baseUrl || !/^https?:\/\/.+/.test(baseUrl)) {
          throw new Error(
            `Invalid custom provider base URL "${baseUrl || "(empty)"}". Must start with http:// or https://.`,
          );
        }

        if (api !== "openai-completions" && api !== "openai-responses") {
          throw new Error(
            `Invalid custom provider API type "${api || "(empty)"}". Must be "openai-completions" or "openai-responses".`,
          );
        }

        if (apiKeyEnv && !/^[A-Z_][A-Z0-9_]*$/.test(apiKeyEnv)) {
          throw new Error(
            `Invalid API key environment variable name "${apiKeyEnv}". Must be uppercase with underscores (e.g., MY_API_KEY).`,
          );
        }

        console.log(`[custom-provider] Configuring custom provider: ${providerId}`);
        console.log(`[custom-provider]   Base URL: ${baseUrl}`);
        console.log(`[custom-provider]   API: ${api}`);
        console.log(`[custom-provider]   API Key Env: ${apiKeyEnv || "(none)"}`);
        console.log(`[custom-provider]   Model ID: ${modelId || "(none)"}`);

        const providerConfig = {
          api,
          baseUrl,
        };

        if (apiKeyEnv) {
          providerConfig.apiKey = `\${${apiKeyEnv}}`;
        }

        if (modelId) {
          providerConfig.models = {
            [modelId]: {
              id: modelId,
            },
          };
        }

        const setProviderResult = await runCmd(
          OPENCLAW_NODE,
          clawArgs([
            "config",
            "set",
            "--json",
            `models.providers.${providerId}`,
            JSON.stringify(providerConfig),
          ]),
        );

        extra += `\n[custom-provider] exit=${setProviderResult.code}\n${setProviderResult.output || "(no output)"}`;

        if (setProviderResult.code !== 0) {
          throw new Error(`Failed to configure custom provider: ${setProviderResult.output}`);
        }

        const setModeResult = await runCmd(
          OPENCLAW_NODE,
          clawArgs(["config", "set", "models.mode", "merge"]),
        );

        extra += `\n[custom-provider] Set models.mode=merge: exit=${setModeResult.code}\n${setModeResult.output || "(no output)"}`;

        if (setModeResult.code !== 0) {
          console.warn(
            `[custom-provider] Failed to set models.mode=merge: ${setModeResult.output}`,
          );
        }

        console.log(
          `[custom-provider] ✓ Custom provider "${providerId}" configured successfully`,
        );
      }

      const channelsHelp = await runCmd(
        OPENCLAW_NODE,
        clawArgs(["channels", "add", "--help"]),
      );
      const helpText = channelsHelp.output || "";

      const supports = (name) => helpText.includes(name);

      if (payload.telegramToken?.trim()) {
        if (!supports("telegram")) {
          extra +=
            "\n[telegram] skipped (this openclaw build does not list telegram in `channels add --help`)\n";
        } else {
          const token = payload.telegramToken.trim();
          const cfgObj = {
            enabled: true,
            dmPolicy: "pairing",
            botToken: token,
            groupPolicy: "allowlist",
            streamMode: "partial",
          };
          const set = await runCmd(
            OPENCLAW_NODE,
            clawArgs([
              "config",
              "set",
              "--json",
              "channels.telegram",
              JSON.stringify(cfgObj),
            ]),
          );
          const get = await runCmd(
            OPENCLAW_NODE,
            clawArgs(["config", "get", "channels.telegram"]),
          );
          extra += `\n[telegram config] exit=${set.code} (output ${set.output.length} chars)\n${set.output || "(no output)"}`;
          extra += `\n[telegram verify] exit=${get.code} (output ${get.output.length} chars)\n${get.output || "(no output)"}`;

          console.log("[telegram] Enabling telegram plugin...");
          const enablePlugin = await runCmd(
            OPENCLAW_NODE,
            clawArgs(["plugins", "enable", "telegram"]),
          );
          extra += `\n[telegram plugin] exit=${enablePlugin.code}\n${enablePlugin.output || "(no output)"}`;
        }
      }

      if (payload.discordToken?.trim()) {
        if (!supports("discord")) {
          extra +=
            "\n[discord] skipped (this openclaw build does not list discord in `channels add --help`)\n";
        } else {
          const token = payload.discordToken.trim();
          const cfgObj = {
            enabled: true,
            token,
            groupPolicy: "allowlist",
            dm: {
              policy: "pairing",
            },
          };
          const set = await runCmd(
            OPENCLAW_NODE,
            clawArgs([
              "config",
              "set",
              "--json",
              "channels.discord",
              JSON.stringify(cfgObj),
            ]),
          );
          const get = await runCmd(
            OPENCLAW_NODE,
            clawArgs(["config", "get", "channels.discord"]),
          );
          extra += `\n[discord config] exit=${set.code} (output ${set.output.length} chars)\n${set.output || "(no output)"}`;
          extra += `\n[discord verify] exit=${get.code} (output ${get.output.length} chars)\n${get.output || "(no output)"}`;
        }
      }

      if (payload.slackBotToken?.trim() || payload.slackAppToken?.trim()) {
        if (!supports("slack")) {
          extra +=
            "\n[slack] skipped (this openclaw build does not list slack in `channels add --help`)\n";
        } else {
          const cfgObj = {
            enabled: true,
            botToken: payload.slackBotToken?.trim() || undefined,
            appToken: payload.slackAppToken?.trim() || undefined,
          };
          const set = await runCmd(
            OPENCLAW_NODE,
            clawArgs([
              "config",
              "set",
              "--json",
              "channels.slack",
              JSON.stringify(cfgObj),
            ]),
          );
          const get = await runCmd(
            OPENCLAW_NODE,
            clawArgs(["config", "get", "channels.slack"]),
          );
          extra += `\n[slack config] exit=${set.code} (output ${set.output.length} chars)\n${set.output || "(no output)"}`;
          extra += `\n[slack verify] exit=${get.code} (output ${get.output.length} chars)\n${get.output || "(no output)"}`;
        }
      }

      console.log("[setup] Running openclaw doctor --fix...");
      const doctorFix = await runCmd(
        OPENCLAW_NODE,
        clawArgs(["doctor", "--fix"]),
      );
      extra += `\n[doctor --fix] exit=${doctorFix.code}\n${doctorFix.output || "(no output)"}`;

      await restartGateway();
    }

    return res.status(ok ? 200 : 500).json({
      ok,
      output: `${onboard.output}${extra}`,
    });
  } catch (err) {
    console.error("[/setup/api/run] error:", err);
    return res
      .status(500)
      .json({ ok: false, output: `Internal error: ${String(err)}` });
  }
});

function redactSecrets(text) {
  if (!text) return text;
  return String(text)
    .replace(/(sk-[A-Za-z0-9_-]{10,})/g, "[REDACTED]")
    .replace(/(gho_[A-Za-z0-9_]{10,})/g, "[REDACTED]")
    .replace(/(xox[baprs]-[A-Za-z0-9-]{10,})/g, "[REDACTED]")
    .replace(/(\d{5,}:[A-Za-z0-9_-]{10,})/g, "[REDACTED]")
    .replace(/(AA[A-Za-z0-9_-]{10,}:\S{10,})/g, "[REDACTED]");
}

function extractDeviceRequestIds(output) {
  const ids = [];
  const lines = (output || "").split("\n");
  for (const line of lines) {
    const match = line.match(/requestId[:\s]+([A-Za-z0-9_-]+)/i);
    if (match) ids.push(match[1]);
  }
  return ids;
}

const ALLOWED_CONSOLE_COMMANDS = new Set([
  "gateway.restart",
  "gateway.stop",
  "gateway.start",
  "openclaw.version",
  "openclaw.status",
  "openclaw.health",
  "openclaw.doctor",
  "openclaw.logs.tail",
  "openclaw.config.get",
  "openclaw.devices.list",
  "openclaw.devices.approve",
  "openclaw.plugins.list",
  "openclaw.plugins.enable",
]);

app.post("/setup/api/console/run", requireSetupAuth, async (req, res) => {
  try {
    const { command, arg } = req.body || {};

    if (!command || !ALLOWED_CONSOLE_COMMANDS.has(command)) {
      return res.status(400).json({
        ok: false,
        error: `Command not allowed: ${command || "(empty)"}`,
      });
    }

    let result;

    if (command === "gateway.restart") {
      await restartGateway();
      result = { code: 0, output: "Gateway restarted successfully\n" };
    } else if (command === "gateway.stop") {
      if (gatewayProc) {
        gatewayProc.kill("SIGTERM");
        gatewayProc = null;
        result = { code: 0, output: "Gateway stopped\n" };
      } else {
        result = { code: 0, output: "Gateway not running\n" };
      }
    } else if (command === "gateway.start") {
      await ensureGatewayRunning();
      result = { code: 0, output: "Gateway started successfully\n" };
    } else if (command === "openclaw.version") {
      result = await runCmd(OPENCLAW_NODE, clawArgs(["--version"]));
    } else if (command === "openclaw.status") {
      result = await runCmd(OPENCLAW_NODE, clawArgs(["status"]));
    } else if (command === "openclaw.health") {
      result = await runCmd(OPENCLAW_NODE, clawArgs(["health"]));
    } else if (command === "openclaw.doctor") {
      result = await runCmd(OPENCLAW_NODE, clawArgs(["doctor"]));
    } else if (command === "openclaw.logs.tail") {
      const count = arg?.trim() || "50";
      if (!/^\d+$/.test(count)) {
        return res.status(400).json({
          ok: false,
          error: "Invalid tail count (must be a number)",
        });
      }
      result = await runCmd(OPENCLAW_NODE, clawArgs(["logs", "--tail", count]));
    } else if (command === "openclaw.config.get") {
      const keyPath = arg?.trim();
      if (!keyPath) {
        return res.status(400).json({
          ok: false,
          error: "Config path required (e.g., gateway.port)",
        });
      }
      result = await runCmd(OPENCLAW_NODE, clawArgs(["config", "get", keyPath]));
    } else if (command === "openclaw.devices.list") {
      result = await runCmd(OPENCLAW_NODE, clawArgs(["devices", "list"]));
    } else if (command === "openclaw.devices.approve") {
      const requestId = arg?.trim();
      if (!requestId) {
        return res.status(400).json({
          ok: false,
          error: "Device requestId required",
        });
      }
      if (!/^[A-Za-z0-9_-]+$/.test(requestId)) {
        return res.status(400).json({
          ok: false,
          error: "Invalid requestId format (alphanumeric, underscore, dash only)",
        });
      }
      result = await runCmd(OPENCLAW_NODE, clawArgs(["devices", "approve", requestId]));
    } else if (command === "openclaw.plugins.list") {
      result = await runCmd(OPENCLAW_NODE, clawArgs(["plugins", "list"]));
    } else if (command === "openclaw.plugins.enable") {
      const pluginName = arg?.trim();
      if (!pluginName) {
        return res.status(400).json({
          ok: false,
          error: "Plugin name required",
        });
      }
      if (!/^[A-Za-z0-9_-]+$/.test(pluginName)) {
        return res.status(400).json({
          ok: false,
          error: "Invalid plugin name format (alphanumeric, underscore, dash only)",
        });
      }
      result = await runCmd(OPENCLAW_NODE, clawArgs(["plugins", "enable", pluginName]));
    } else {
      return res.status(500).json({
        ok: false,
        error: "Internal error: command allowlisted but not implemented",
      });
    }

    const output = redactSecrets(result.output || "");

    return res.json({
      ok: result.code === 0,
      output,
      exitCode: result.code,
    });
  } catch (err) {
    console.error("[/setup/api/console/run] error:", err);
    return res.status(500).json({
      ok: false,
      error: `Internal error: ${String(err)}`,
    });
  }
});

app.get("/setup/api/debug", requireSetupAuth, async (_req, res) => {
  const v = await runCmd(OPENCLAW_NODE, clawArgs(["--version"]));
  const help = await runCmd(
    OPENCLAW_NODE,
    clawArgs(["channels", "add", "--help"]),
  );

  let telegramConfig = null;
  let discordConfig = null;
  try {
    const tg = await runCmd(
      OPENCLAW_NODE,
      clawArgs(["config", "get", "channels.telegram"]),
    );
    if (tg.code === 0) {
      telegramConfig = redactSecrets(tg.output.trim());
    }
  } catch {}

  try {
    const dc = await runCmd(
      OPENCLAW_NODE,
      clawArgs(["config", "get", "channels.discord"]),
    );
    if (dc.code === 0) {
      discordConfig = redactSecrets(dc.output.trim());
    }
  } catch {}

  const gatewayReachable = isConfigured() ? await probeGateway() : false;

  let doctorOutput = lastDoctorOutput;
  if (!doctorOutput && isConfigured()) {
    try {
      const dr = await runCmd(OPENCLAW_NODE, clawArgs(["doctor"]));
      doctorOutput = redactSecrets(dr.output || "");
    } catch {}
  }

  res.json({
    wrapper: {
      node: process.version,
      port: PORT,
      stateDir: STATE_DIR,
      workspaceDir: WORKSPACE_DIR,
      configPath: configPath(),
      gatewayTokenFromEnv: Boolean(process.env.OPENCLAW_GATEWAY_TOKEN?.trim()),
      gatewayTokenPersisted: fs.existsSync(
        path.join(STATE_DIR, "gateway.token"),
      ),
      railwayCommit: process.env.RAILWAY_GIT_COMMIT_SHA || null,
    },
    openclaw: {
      entry: OPENCLAW_ENTRY,
      node: OPENCLAW_NODE,
      version: v.output.trim(),
      channelsAddHelpIncludesTelegram: help.output.includes("telegram"),
    },
    channels: {
      telegram: telegramConfig,
      discord: discordConfig,
    },
    gateway: {
      reachable: gatewayReachable,
      lastError: lastGatewayError,
      lastExit: lastGatewayExit,
    },
    diagnostics: {
      doctor: doctorOutput,
    },
  });
});

app.get("/setup/api/config/raw", requireSetupAuth, async (_req, res) => {
  try {
    const cfgPath = configPath();
    const exists = fs.existsSync(cfgPath);
    let content = "";

    if (exists) {
      try {
        content = fs.readFileSync(cfgPath, "utf8");
      } catch (err) {
        return res.status(500).json({
          ok: false,
          error: `Failed to read config file: ${String(err)}`,
        });
      }
    }

    return res.json({
      ok: true,
      path: cfgPath,
      exists,
      content,
    });
  } catch (err) {
    console.error("[/setup/api/config/raw GET] error:", err);
    return res.status(500).json({
      ok: false,
      error: `Internal error: ${String(err)}`,
    });
  }
});

app.post("/setup/api/config/raw", requireSetupAuth, async (req, res) => {
  try {
    const { content } = req.body || {};

    if (typeof content !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Missing or invalid 'content' field (must be string)",
      });
    }

    const MAX_SIZE = 500 * 1024;
    if (content.length > MAX_SIZE) {
      const sizeKB = (content.length / 1024).toFixed(1);
      const maxKB = (MAX_SIZE / 1024).toFixed(0);
      return res.status(400).json({
        ok: false,
        error: `Config file too large: ${sizeKB}KB (max ${maxKB}KB)`,
      });
    }

    try {
      JSON.parse(content);
    } catch (err) {
      return res.status(400).json({
        ok: false,
        error: `Invalid JSON: ${String(err)}`,
      });
    }

    const cfgPath = configPath();

    if (fs.existsSync(cfgPath)) {
      const timestamp = new Date().toISOString().replace(/:/g, "-").replace(/\./g, "-");
      const backupPath = `${cfgPath}.bak-${timestamp}`;

      try {
        fs.copyFileSync(cfgPath, backupPath);
        console.log(`[config-editor] Created backup: ${backupPath}`);
      } catch (err) {
        return res.status(500).json({
          ok: false,
          error: `Failed to create backup: ${String(err)}`,
        });
      }
    }

    try {
      fs.writeFileSync(cfgPath, content, { encoding: "utf8", mode: 0o600 });
      console.log(`[config-editor] Saved config to ${cfgPath}`);
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: `Failed to write config file: ${String(err)}`,
      });
    }

    let restartOutput = "";
    try {
      await restartGateway();
      restartOutput = "Gateway restarted successfully to apply changes.";
      console.log("[config-editor] Gateway restarted after config save");
    } catch (err) {
      restartOutput = `Warning: Config saved but gateway restart failed: ${String(err)}`;
      console.error("[config-editor] Gateway restart failed:", err);
    }

    return res.json({
      ok: true,
      message: "Config saved successfully",
      restartOutput,
    });
  } catch (err) {
    console.error("[/setup/api/config/raw POST] error:", err);
    return res.status(500).json({
      ok: false,
      error: `Internal error: ${String(err)}`,
    });
  }
});

app.get("/setup/api/devices/pending", requireSetupAuth, async (_req, res) => {
  try {
    const result = await runCmd(OPENCLAW_NODE, clawArgs(["devices", "list"]));
    const requestIds = extractDeviceRequestIds(result.output || "");

    return res.json({
      ok: result.code === 0,
      requestIds,
      output: result.output || "",
      exitCode: result.code,
    });
  } catch (err) {
    console.error("[/setup/api/devices/pending] error:", err);
    return res.status(500).json({
      ok: false,
      error: `Internal error: ${String(err)}`,
    });
  }
});

app.post("/setup/api/devices/approve", requireSetupAuth, async (req, res) => {
  try {
    const { requestId } = req.body || {};

    if (!requestId) {
      return res.status(400).json({
        ok: false,
        error: "Missing 'requestId' field",
      });
    }

    if (!/^[A-Za-z0-9_-]+$/.test(requestId)) {
      return res.status(400).json({
        ok: false,
        error: "Invalid requestId format (alphanumeric, underscore, dash only)",
      });
    }

    const result = await runCmd(
      OPENCLAW_NODE,
      clawArgs(["devices", "approve", requestId]),
    );

    return res.json({
      ok: result.code === 0,
      output: result.output || "",
      exitCode: result.code,
    });
  } catch (err) {
    console.error("[/setup/api/devices/approve] error:", err);
    return res.status(500).json({
      ok: false,
      error: `Internal error: ${String(err)}`,
    });
  }
});

app.post("/setup/api/pairing/approve", requireSetupAuth, async (req, res) => {
  const { channel, code } = req.body || {};
  if (!channel || !code) {
    return res
      .status(400)
      .json({ ok: false, error: "Missing channel or code" });
  }
  const r = await runCmd(
    OPENCLAW_NODE,
    clawArgs(["pairing", "approve", String(channel), String(code)]),
  );
  return res
    .status(r.code === 0 ? 200 : 500)
    .json({ ok: r.code === 0, output: r.output });
});

function isUnderDir(p, root) {
  const normP = path.resolve(p);
  const normRoot = path.resolve(root);
  return normP === normRoot || normP.startsWith(normRoot + path.sep);
}

function looksSafeTarPath(p) {
  if (p.startsWith("/")) {
    return false;
  }

  if (/^[a-zA-Z]:/.test(p)) {
    return false;
  }

  const parts = p.split(/[/\\]/);
  if (parts.some((part) => part === "..")) {
    return false;
  }

  return true;
}

function readBodyBuffer(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;

    req.on("data", (chunk) => {
      totalSize += chunk.length;

      if (totalSize > maxBytes) {
        req.destroy();
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(1);
        const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
        reject(new Error(`File too large: ${sizeMB}MB (max ${maxMB}MB)`));
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}

app.post("/setup/import", requireSetupAuth, async (req, res) => {
  const MAX_UPLOAD_SIZE = 250 * 1024 * 1024;

  try {
    console.log("[import] Starting backup import...");

    const dataRoot = "/data";
    if (!isUnderDir(STATE_DIR, dataRoot) || !isUnderDir(WORKSPACE_DIR, dataRoot)) {
      console.error("[import] Security check failed: STATE_DIR or WORKSPACE_DIR not under /data");
      return res.status(400).json({
        ok: false,
        error: `Import requires both STATE_DIR and WORKSPACE_DIR under /data. Current: STATE_DIR=${STATE_DIR}, WORKSPACE_DIR=${WORKSPACE_DIR}. Set OPENCLAW_STATE_DIR=/data/.openclaw and OPENCLAW_WORKSPACE_DIR=/data/workspace in Railway Variables.`,
      });
    }

    console.log("[import] Stopping gateway...");
    if (gatewayProc) {
      try {
        gatewayProc.kill("SIGTERM");
        gatewayProc = null;
      } catch (err) {
        console.warn(`[import] Failed to stop gateway: ${err.message}`);
      }
    }

    try {
      await runCmd("pkill", ["-f", "gateway run"], { timeoutMs: 5000 });
    } catch {}

    await sleep(2000);
    console.log("[import] Gateway stopped");

    console.log("[import] Reading upload (max 250MB)...");
    const buffer = await readBodyBuffer(req, MAX_UPLOAD_SIZE);
    console.log(`[import] Received ${buffer.length} bytes`);

    const tmpFile = path.join(os.tmpdir(), `openclaw-import-${Date.now()}.tar.gz`);
    fs.writeFileSync(tmpFile, buffer);
    console.log(`[import] Wrote temp file: ${tmpFile}`);

    try {
      console.log("[import] Extracting archive to /data...");
      let extractedCount = 0;
      let filteredCount = 0;

      await tar.x({
        file: tmpFile,
        cwd: dataRoot,
        filter: (tarPath) => {
          if (!looksSafeTarPath(tarPath)) {
            console.warn(`[import] Filtered unsafe path: ${tarPath}`);
            filteredCount++;
            return false;
          }
          extractedCount++;
          return true;
        },
        onwarn: (code, message) => {
          console.warn(`[import] tar warning: ${code} - ${message}`);
        },
      });

      console.log(
        `[import] Extraction complete: ${extractedCount} files extracted, ${filteredCount} filtered`,
      );

      fs.rmSync(tmpFile, { force: true });

      console.log("[import] Restarting gateway...");
      try {
        await restartGateway();
        console.log("[import] Gateway restarted successfully");
      } catch (err) {
        console.error(`[import] Gateway restart failed: ${err}`);
        return res.status(500).json({
          ok: false,
          error: `Import succeeded but gateway restart failed: ${String(err)}`,
        });
      }

      return res.json({
        ok: true,
        message: `Import successful: ${extractedCount} files extracted, ${filteredCount} filtered`,
      });
    } catch (err) {
      try {
        fs.rmSync(tmpFile, { force: true });
      } catch {}

      throw err;
    }
  } catch (err) {
    console.error("[import] Error:", err);
    return res.status(500).json({
      ok: false,
      error: `Import failed: ${String(err)}`,
    });
  }
});

app.post("/setup/api/reset", requireSetupAuth, async (_req, res) => {
  try {
    console.log("[reset] Stopping gateway before config deletion...");
    if (gatewayProc) {
      try {
        gatewayProc.kill("SIGTERM");
        gatewayProc = null;
      } catch (err) {
        console.warn(`[reset] Failed to stop gateway: ${err.message}`);
      }
    }

    try {
      await runCmd("pkill", ["-f", "gateway run"], { timeoutMs: 5000 });
    } catch {}

    await sleep(1000);

    console.log("[reset] Deleting config file...");
    fs.rmSync(configPath(), { force: true });

    res
      .type("text/plain")
      .send("OK - deleted config file. You can rerun setup now.");
  } catch (err) {
    res.status(500).type("text/plain").send(String(err));
  }
});

app.get("/setup/api/auth-groups", requireSetupAuth, async (_req, res) => {
  try {
    return res.json({
      ok: true,
      authGroups: AUTH_GROUPS,
    });
  } catch (err) {
    console.error("[/setup/api/auth-groups] error:", err);
    return res.status(500).json({
      ok: false,
      error: `Internal error: ${String(err)}`,
    });
  }
});

app.get("/setup/export", requireSetupAuth, async (_req, res) => {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

  res.setHeader("content-type", "application/gzip");
  res.setHeader(
    "content-disposition",
    `attachment; filename="openclaw-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.tar.gz"`,
  );

  const stateAbs = path.resolve(STATE_DIR);
  const workspaceAbs = path.resolve(WORKSPACE_DIR);

  const dataRoot = "/data";
  const underData = (p) => p === dataRoot || p.startsWith(dataRoot + path.sep);

  let cwd = "/";
  let paths = [stateAbs, workspaceAbs].map((p) => p.replace(/^\//, ""));

  if (underData(stateAbs) && underData(workspaceAbs)) {
    cwd = dataRoot;
    paths = [
      path.relative(dataRoot, stateAbs) || ".",
      path.relative(dataRoot, workspaceAbs) || ".",
    ];
  }

  const stream = tar.c(
    {
      gzip: true,
      portable: true,
      noMtime: true,
      cwd,
      onwarn: () => {},
    },
    paths,
  );

  stream.on("error", (err) => {
    console.error("[export]", err);
    if (!res.headersSent) res.status(500);
    res.end(String(err));
  });

  stream.pipe(res);
});

const proxy = httpProxy.createProxyServer({
  target: GATEWAY_TARGET,
  ws: true,
  xfwd: true,
});

proxy.on("error", (err, req, res) => {
  console.error("[proxy] error:", err.message, `(${req?.method} ${req?.url})`);

  if (res && !res.headersSent) {
    try {
      const troubleshooting = [
        `Proxy error: ${err.message}`,
        "",
        "Gateway may not be ready or has crashed.",
        "",
        "Troubleshooting:",
        "- Visit /healthz for gateway status",
        "- Visit /setup/api/debug for full diagnostics",
        "- Check Debug Console in /setup",
        "- Run 'gateway.restart' in Debug Console",
      ].join("\n");

      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end(troubleshooting);
    } catch {}
  }
});

proxy.on("proxyReq", (proxyReq, req) => {
  debug(
    `[proxy] HTTP ${req.method} ${req.url} - injecting token: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}...`,
  );
  proxyReq.setHeader("Authorization", `Bearer ${OPENCLAW_GATEWAY_TOKEN}`);
});

proxy.on("proxyReqWs", (proxyReq, req) => {
  console.log(`[proxy-event] WebSocket proxyReqWs event fired for ${req.url}`);
  console.log(`[proxy-event] Headers:`, JSON.stringify(proxyReq.getHeaders()));
});

app.use(async (req, res) => {
  if (!isConfigured() && !req.path.startsWith("/setup")) {
    return res.redirect("/setup");
  }

  if (isConfigured()) {
    try {
      await ensureGatewayRunning();
    } catch (err) {
      const errorMsg = [
        "Gateway not ready.",
        "",
        `Error: ${String(err)}`,
        "",
        "Troubleshooting:",
        "- Visit /setup and check the Debug Console",
        "- Run 'openclaw doctor' in Debug Console to diagnose issues",
        "- Visit /setup/api/debug for full diagnostics",
        "- Check /healthz for gateway status and reachability",
        "- Visit /setup Config Editor to verify openclaw.json is valid",
        "",
        "Recent gateway diagnostics:",
        lastGatewayError ? `  Last error: ${lastGatewayError}` : "",
        lastGatewayExit
          ? `  Last exit: code=${lastGatewayExit.code} signal=${lastGatewayExit.signal} at=${lastGatewayExit.at}`
          : "",
        "",
        lastDoctorOutput
          ? `Doctor output (last 500 chars):\n${lastDoctorOutput.slice(0, 500)}`
          : "Run 'openclaw doctor' in Debug Console for detailed diagnostics",
      ]
        .filter(Boolean)
        .join("\n");

      return res.status(503).type("text/plain").send(errorMsg);
    }
  }

  return proxy.web(req, res, { target: GATEWAY_TARGET });
});

const server = app.listen(PORT, async () => {
  console.log(`[wrapper] listening on port ${PORT}`);
  console.log(`[wrapper] setup wizard: http://localhost:${PORT}/setup`);
  console.log(`[wrapper] configured: ${isConfigured()}`);

  try {
    fs.mkdirSync(path.join(STATE_DIR, "credentials"), { recursive: true, mode: 0o700 });
  } catch {}
  try {
    fs.chmodSync(STATE_DIR, 0o700);
  } catch {}
  try {
    fs.chmodSync(path.join(STATE_DIR, "credentials"), 0o700);
  } catch {}

  if (isConfigured()) {
    console.log("[wrapper] config detected; starting gateway...");
    try {
      await ensureGatewayRunning();
      console.log("[wrapper] gateway ready");
    } catch (err) {
      console.error(`[wrapper] gateway failed to start at boot: ${String(err)}`);
    }
  }
});

server.on("upgrade", async (req, socket, head) => {
  if (!isConfigured()) {
    socket.destroy();
    return;
  }
  try {
    await ensureGatewayRunning();
  } catch {
    socket.destroy();
    return;
  }

  debug(
    `[ws-upgrade] Proxying WebSocket upgrade with token: ${OPENCLAW_GATEWAY_TOKEN.slice(0, 16)}...`,
  );

  proxy.ws(req, socket, head, {
    target: GATEWAY_TARGET,
    headers: {
      Authorization: `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
    },
  });
});

process.on("SIGTERM", async () => {
  console.log("[shutdown] Received SIGTERM, starting graceful shutdown...");

  server.close(() => {
    console.log("[shutdown] HTTP server closed");
  });

  if (gatewayProc) {
    console.log("[shutdown] Stopping gateway process...");
    try {
      gatewayProc.kill("SIGTERM");
      gatewayProc = null;
    } catch (err) {
      console.error(`[shutdown] Failed to stop gateway: ${err.message}`);
    }
  }

  setTimeout(() => {
    console.log("[shutdown] Graceful shutdown timeout, forcing exit");
    process.exit(0);
  }, 5000);

  server.on("close", () => {
    console.log("[shutdown] All connections closed, exiting cleanly");
    process.exit(0);
  });
});
