// Test email sending using the same libs as the app
import pg from "pg";
import { createHash, createDecipheriv } from "crypto";
import nodemailer from "nodemailer";

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  database: "stia_portal_clientes",
  user: "postgres",
  password: process.env.DB_PASSWORD || "jI0ruuKrOdoE6cT0HRL82lBFdlh0pLjF",
});

function decrypt(cipherText) {
  const parts = cipherText.split(":");
  if (parts.length !== 3) return cipherText;
  const secret = process.env.JWT_SECRET || "stia-casos-jwt-secret-2026-bluesystem";
  const key = createHash("sha256").update(secret).digest();
  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function getSetting(key) {
  const { rows } = await pool.query("SELECT value FROM casos.settings WHERE key = $1", [key]);
  if (!rows[0]) return null;
  try { return JSON.parse(rows[0].value); } catch { return rows[0].value; }
}

async function run() {
  const host = await getSetting("smtp_host");
  const port = await getSetting("smtp_port");
  const user = await getSetting("smtp_user");
  const passRaw = await getSetting("smtp_pass");
  const from = await getSetting("smtp_from");

  const pass = passRaw && passRaw.includes(":") ? decrypt(passRaw) : passRaw;

  console.log("SMTP Config:");
  console.log(`  host: ${host}`);
  console.log(`  port: ${port}`);
  console.log(`  user: ${user}`);
  console.log(`  pass: ${"*".repeat(pass?.length || 0)}`);
  console.log(`  from: ${from}\n`);

  const transporter = nodemailer.createTransport({
    host, port, secure: false, auth: { user, pass },
  });

  console.log("Verificando SMTP...");
  await transporter.verify();
  console.log("SMTP OK\n");

  console.log("Enviando correo de prueba...");
  const info = await transporter.sendMail({
    from,
    to: "notificaciones@stia.net",
    subject: "Prueba SMTP Produccion - Portal Casos STIA",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0067B2;padding:20px;color:white;text-align:center">
          <h2 style="margin:0">STIA Casos - Prueba desde Produccion</h2>
        </div>
        <div style="padding:20px;border:1px solid #e5e7eb;border-top:none">
          <p>Este correo fue enviado desde el servidor de produccion (AWS EC2).</p>
          <table style="width:100%;border-collapse:collapse;margin:15px 0">
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Servidor</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${host}:${port}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Usuario</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${user}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Cifrado</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">STARTTLS</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Fecha</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${new Date().toLocaleString("es")}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Origen</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">AWS EC2 3.212.155.164</td></tr>
          </table>
          <p style="color:#16a34a;font-weight:bold">Settings leidos desde PostgreSQL + password desencriptado correctamente.</p>
        </div>
        <div style="padding:10px 20px;background:#f8fafc;text-align:center;font-size:12px;color:#64748b">Portal de Servicio STIA</div>
      </div>
    `,
  });

  console.log("Enviado! MessageId:", info.messageId);
  console.log("Response:", info.response);
  await pool.end();
}

run().catch((e) => { console.error("ERROR:", e.message); pool.end(); process.exit(1); });
