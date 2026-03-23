// Validates required environment variables at import time

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const env = {
  JWT_SECRET: required("JWT_SECRET"),
  DATABASE_URL: required("DATABASE_URL"),
  SAP_BASE_URL: required("SAP_BASE_URL"),
  SAP_USER: required("SAP_USER"),
  SAP_PASSWORD: required("SAP_PASSWORD"),
  CRON_SECRET: optional("CRON_SECRET", ""),
  SMTP_HOST: optional("SMTP_HOST", ""),
  SMTP_PORT: optional("SMTP_PORT", "587"),
  SMTP_USER: optional("SMTP_USER", ""),
  SMTP_PASS: optional("SMTP_PASS", ""),
  SMTP_FROM: optional("SMTP_FROM", "STIA Casos <casos@stia.com>"),
  UPLOAD_DIR: optional("UPLOAD_DIR", "./uploads"),
  NODE_ENV: optional("NODE_ENV", "development"),
} as const;
