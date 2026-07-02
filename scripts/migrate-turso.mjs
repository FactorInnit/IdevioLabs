import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing env vars. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.");
  process.exit(1);
}

const client = createClient({ url, authToken });

function parseStatements(sql) {
  return sql
    .split(";")
    .map((part) =>
      part
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter(Boolean);
}

async function main() {
  const existing = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='User'"
  );

  if (existing.rows.length > 0) {
    console.log("Turso database already has tables. Nothing to do.");
    return;
  }

  const sql = readFileSync(join(root, "prisma", "turso-schema.sql"), "utf8");
  const statements = parseStatements(sql);

  console.log(`Applying ${statements.length} statements to Turso...`);

  for (const statement of statements) {
    await client.execute(statement);
  }

  console.log("Turso database is ready.");
}

main().catch((err) => {
  console.error("Turso setup failed:", err.message ?? err);
  process.exit(1);
});
