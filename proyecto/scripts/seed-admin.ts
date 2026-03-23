import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "stia_portal_clientes",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

async function seed() {
  const email = process.argv[2] || "admin@stia.com";
  const password = process.argv[3] || "Admin2026!";
  const name = process.argv[4] || "Administrador STIA";

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO casos.users (email, password_hash, name, role, countries, default_country, active)
     VALUES ($1, $2, $3, 'admin', $4, 'CR', true)
     ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $3, role = 'admin', active = true`,
    [email, hash, name, ["CR", "SV", "GT", "HN", "PA"]]
  );

  console.log(`Admin creado: ${email}`);
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
