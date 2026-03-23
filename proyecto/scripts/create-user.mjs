import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  host: "localhost", port: 5432, database: "stia_portal_clientes",
  user: "postgres", password: process.env.DB_PASSWORD || "jI0ruuKrOdoE6cT0HRL82lBFdlh0pLjF",
});

const email = process.argv[2];
const name = process.argv[3];
const role = process.argv[4] || "admin";
const password = process.argv[5] || "Stia2026!";
const countries = ["CR", "SV", "GT", "HN", "PA"];

if (!email || !name) {
  console.error("Uso: node create-user.mjs <email> <name> [role] [password]");
  process.exit(1);
}

const existing = await pool.query("SELECT id FROM casos.users WHERE email = $1", [email.toLowerCase()]);
if (existing.rows.length > 0) {
  console.log(`Usuario ${email} ya existe con id ${existing.rows[0].id}`);
  await pool.end();
  process.exit(0);
}

const hash = await bcrypt.hash(password, 10);
const result = await pool.query(
  `INSERT INTO casos.users (email, password_hash, name, role, countries, default_country)
   VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
  [email.toLowerCase(), hash, name, role, countries, countries[0]]
);

console.log(`Usuario creado:`);
console.log(`  ID: ${result.rows[0].id}`);
console.log(`  Email: ${email}`);
console.log(`  Nombre: ${name}`);
console.log(`  Rol: ${role}`);
console.log(`  Paises: ${countries.join(", ")}`);
console.log(`  Password: ${password}`);
await pool.end();
