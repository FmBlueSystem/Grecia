import nodemailer from "nodemailer";

console.log("1. Probando conexion SMTP a smtp.office365.com:587...\n");

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: { user: "notificaciones@stia.net", pass: "STEnt3570$" },
});

try {
  await transporter.verify();
  console.log("   SMTP verificado OK\n");
} catch (e) {
  console.error("   SMTP verify error:", e.message, "\n");
  process.exit(1);
}

console.log("2. Enviando correo de prueba a notificaciones@stia.net...\n");

try {
  const info = await transporter.sendMail({
    from: "STIA Casos <notificaciones@stia.net>",
    to: "notificaciones@stia.net",
    subject: "Prueba SMTP - Portal Casos STIA",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0067B2;padding:20px;color:white;text-align:center">
          <h2 style="margin:0">STIA Casos - Prueba SMTP</h2>
        </div>
        <div style="padding:20px;border:1px solid #e5e7eb;border-top:none">
          <p>Este es un correo de prueba del Portal de Casos STIA.</p>
          <table style="width:100%;border-collapse:collapse;margin:15px 0">
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Servidor</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">smtp.office365.com:587</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Usuario</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">notificaciones@stia.net</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Cifrado</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">STARTTLS</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">Fecha</td><td style="padding:8px;border-bottom:1px solid #e5e7eb">${new Date().toLocaleString("es")}</td></tr>
          </table>
          <p style="color:#16a34a;font-weight:bold">Si recibes este correo, la configuracion SMTP esta correcta.</p>
        </div>
        <div style="padding:10px 20px;background:#f8fafc;text-align:center;font-size:12px;color:#64748b">Portal de Servicio STIA</div>
      </div>
    `,
  });
  console.log("   Correo enviado! MessageId:", info.messageId);
  console.log("   Response:", info.response);
} catch (e) {
  console.error("   Error enviando:", e.message);
}

console.log("\nListo.");
