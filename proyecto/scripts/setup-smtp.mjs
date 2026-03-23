import pg from "pg";
import { createHash, createCipheriv, randomBytes } from "crypto";

const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "stia_portal_clientes",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

function encrypt(plainText) {
  const secret = process.env.JWT_SECRET || "stia-casos-jwt-secret-2026-bluesystem";
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

const SETTINGS = [
  ["smtp_host", "smtp.office365.com"],
  ["smtp_port", 587],
  ["smtp_user", "notificaciones@stia.net"],
  ["smtp_pass", encrypt("STEnt3570$")],
  ["smtp_from", "STIA Casos <notificaciones@stia.net>"],
];

async function run() {
  console.log("Insertando parametros SMTP en casos.settings...\n");
  for (const [key, value] of SETTINGS) {
    await pool.query(
      `INSERT INTO casos.settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
    const display = key === "smtp_pass" ? "***encrypted***" : value;
    console.log(`  ${key} = ${display}`);
  }

  console.log("\nVerificando...");
  const { rows } = await pool.query("SELECT key, value FROM casos.settings WHERE key LIKE 'smtp%' ORDER BY key");
  for (const r of rows) {
    const display = r.key === "smtp_pass" ? "***" : JSON.parse(r.value);
    console.log(`  ${r.key} = ${display}`);
  }

  await pool.end();
  console.log("\nListo. Settings SMTP configurados.");
}

run().catch((e) => { console.error(e); process.exit(1); });
