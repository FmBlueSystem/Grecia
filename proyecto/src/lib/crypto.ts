import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";

function deriveKey(): Buffer {
  const secret = process.env.JWT_SECRET || "fallback-key";
  return createHash("sha256").update(secret).digest();
}

export function encrypt(plainText: string): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

export function decrypt(cipherText: string): string {
  const parts = cipherText.split(":");
  if (parts.length !== 3) return cipherText; // not encrypted, return as-is

  const key = deriveKey();
  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function isEncrypted(value: string): boolean {
  return /^[a-f0-9]{24}:[a-f0-9]{32}:[a-f0-9]+$/.test(value);
}
