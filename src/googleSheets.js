import { google } from "googleapis";

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getAuth() {
  const credentials = JSON.parse(getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_JSON"));

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getSheetsClient() {
  const auth = getAuth();
  const client = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: client,
  });
}

export function getHhSheetsConfig() {
  return {
    spreadsheetId: getRequiredEnv("GOOGLE_SHEET_ID"),
    candidatesSheetName: process.env.CANDIDATES_SHEET_NAME || "Candidates",
    idRulesSheetName: process.env.ID_RULES_SHEET_NAME || "ID_Rules",
    automationsLogSheetName:
      process.env.AUTOMATIONS_LOG_SHEET_NAME || "Automations_Log",
  };
}

export function getAuditCroSheetsConfig() {
  return {
    spreadsheetId: getRequiredEnv("GOOGLE_SHEET_AUDIT_CRO_ID"),
    prestatairesSheetName:
      getRequiredEnv("AUDIT_CRO_PRESTATAIRES_SHEET_NAME"),
    clientsSheetName: getRequiredEnv("AUDIT_CRO_CLIENTS_SHEET_NAME"),
  };
}
