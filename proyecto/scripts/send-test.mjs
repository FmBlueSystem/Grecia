import pg from "pg";
import { createHash, createDecipheriv } from "crypto";
import nodemailer from "nodemailer";

const pool = new pg.Pool({
  host: "localhost", port: 5432, database: "stia_portal_clientes",
  user: "postgres", password: process.env.DB_PASSWORD || "jI0ruuKrOdoE6cT0HRL82lBFdlh0pLjF",
});

function decrypt(ct) {
  const p = ct.split(":"); if (p.length !== 3) return ct;
  const key = createHash("sha256").update(process.env.JWT_SECRET || "stia-casos-jwt-secret-2026-bluesystem").digest();
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(p[0], "hex"));
  d.setAuthTag(Buffer.from(p[1], "hex"));
  return d.update(p[2], "hex", "utf8") + d.final("utf8");
}

const { rows } = await pool.query("SELECT key, value FROM casos.settings WHERE key LIKE 'smtp%'");
const s = {};
for (const row of rows) { try { s[row.key] = JSON.parse(row.value); } catch { s[row.key] = row.value; } }
const pass = s.smtp_pass.includes(":") ? decrypt(s.smtp_pass) : s.smtp_pass;

const t = nodemailer.createTransport({ host: s.smtp_host, port: s.smtp_port, secure: false, auth: { user: s.smtp_user, pass } });

const to = process.argv[2] || "freddy@bluesystem.io";

const info = await t.sendMail({
  from: s.smtp_from,
  to,
  subject: "Prueba SMTP - Portal Casos STIA",
  html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#0067B2;padding:20px;color:white;text-align:center"><h2 style="margin:0">STIA Casos</h2></div>
    <div style="padding:20px;border:1px solid #e5e7eb;border-top:none">
      <p>Hola,</p>
      <p>Este es un correo de prueba enviado desde el <strong>Portal de Casos STIA</strong> en produccion.</p>
      <table style="width:100%;border-collapse:collapse;margin:15px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Servidor</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${s.smtp_host}:${s.smtp_port}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Remitente</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${s.smtp_user}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Cifrado</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">STARTTLS</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Origen</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">AWS EC2 (produccion)</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Fecha</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${new Date().toLocaleString("es")}</td></tr>
      </table>
      <p style="color:#16a34a;font-weight:bold">Configuracion SMTP funcionando correctamente.</p>
    </div>
    <div style="padding:10px 20px;background:#f8fafc;text-align:center;font-size:12px;color:#64748b">Portal de Servicio STIA</div>
  </div>`,
});

console.log(`Enviado a ${to}`);
console.log("MessageId:", info.messageId);
console.log("Response:", info.response);
await pool.end();
