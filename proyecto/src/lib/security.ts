// Rate limiter, CSRF, HTML escape, password validation, file type whitelist, OData sanitization

// --- Rate Limiter (in-memory sliding window) ---
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 60_000);

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count, retryAfterMs: 0 };
}

// --- CSRF Validation ---
export function validateOrigin(requestUrl: string, origin: string | null, referer: string | null): boolean {
  if (!origin && !referer) return false;
  try {
    const allowed = new URL(requestUrl).origin;
    if (origin && new URL(origin).origin === allowed) return true;
    if (referer && new URL(referer).origin === allowed) return true;
  } catch {
    // invalid URL
  }
  return false;
}

// --- HTML Escape ---
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

// --- Password Validation ---
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Contrasena debe tener minimo 8 caracteres" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Contrasena debe tener al menos 1 mayuscula" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Contrasena debe tener al menos 1 minuscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Contrasena debe tener al menos 1 numero" };
  }
  return { valid: true };
}

// --- File Type Whitelist ---
const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp",
  ".txt", ".csv", ".zip", ".rar", ".7z",
  ".msg", ".eml",
]);

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png", "image/jpeg", "image/gif", "image/bmp", "image/webp",
  "text/plain", "text/csv",
  "application/zip", "application/x-rar-compressed", "application/x-7z-compressed",
  "application/vnd.ms-outlook", "message/rfc822",
  "application/octet-stream",
]);

export function validateFileType(fileName: string, mimeType: string): { allowed: boolean; error?: string } {
  const ext = "." + fileName.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { allowed: false, error: `Tipo de archivo no permitido: ${ext}. Permitidos: ${[...ALLOWED_EXTENSIONS].join(", ")}` };
  }
  if (mimeType !== "application/octet-stream" && !ALLOWED_MIMES.has(mimeType)) {
    return { allowed: false, error: `MIME type no permitido: ${mimeType}` };
  }
  return { allowed: true };
}

// --- OData Sanitization ---
export function sanitizeODataString(value: string): string {
  return value
    .replace(/'/g, "''")
    .replace(/[%$(){}[\]\\]/g, "")
    .slice(0, 200);
}

export function sanitizeODataDate(value: string): string | null {
  const match = value.match(/^\d{4}-\d{2}-\d{2}$/);
  return match ? value : null;
}
