#!/usr/bin/env node

import { getSheetsClient } from "../src/googleSheets.js";

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return null;
  return process.argv[i + 1] ?? null;
}

async function main() {
  const sheet = getArg("--sheet");
  const access = process.argv.includes("--access");

  if (sheet !== "Candidates_Master" || !access) {
    console.error("Unsupported command");
    process.exit(1);
  }

  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  if (!sheetId) {
    console.error("GOOGLE_SHEET_ID manquant");
    process.exit(1);
  }

  try {
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Candidates_Master!A1:D5",
    });

    console.log("access ok");
    process.exit(0);
  } catch (err) {
    console.error(err?.message || String(err));
    process.exit(1);
  }
}

main();
