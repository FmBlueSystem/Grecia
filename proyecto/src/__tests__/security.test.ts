import { describe, it, expect } from "vitest";
import {
  checkRateLimit,
  validateOrigin,
  escapeHtml,
  validatePassword,
  validateFileType,
  sanitizeODataString,
  sanitizeODataDate,
} from "../lib/security";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
    );
  });

  it("escapes ampersands and quotes", () => {
    expect(escapeHtml('A & B "C"')).toBe("A &amp; B &quot;C&quot;");
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("does not modify safe strings", () => {
    expect(escapeHtml("hello world 123")).toBe("hello world 123");
  });
});

describe("validatePassword", () => {
  it("rejects short passwords", () => {
    expect(validatePassword("Ab1")).toEqual({
      valid: false,
      error: "Contrasena debe tener minimo 8 caracteres",
    });
  });

  it("requires uppercase", () => {
    expect(validatePassword("abcdefg1")).toEqual({
      valid: false,
      error: "Contrasena debe tener al menos 1 mayuscula",
    });
  });

  it("requires lowercase", () => {
    expect(validatePassword("ABCDEFG1")).toEqual({
      valid: false,
      error: "Contrasena debe tener al menos 1 minuscula",
    });
  });

  it("requires number", () => {
    expect(validatePassword("Abcdefgh")).toEqual({
      valid: false,
      error: "Contrasena debe tener al menos 1 numero",
    });
  });

  it("accepts valid password", () => {
    expect(validatePassword("Stia123*ab")).toEqual({ valid: true });
  });
});

describe("validateFileType", () => {
  it("allows PDF files", () => {
    expect(validateFileType("doc.pdf", "application/pdf")).toEqual({ allowed: true });
  });

  it("allows images", () => {
    expect(validateFileType("photo.jpg", "image/jpeg")).toEqual({ allowed: true });
  });

  it("rejects executable files", () => {
    const result = validateFileType("malware.exe", "application/x-msdownload");
    expect(result.allowed).toBe(false);
  });

  it("rejects shell scripts", () => {
    const result = validateFileType("script.sh", "text/x-shellscript");
    expect(result.allowed).toBe(false);
  });

  it("rejects .bat files", () => {
    const result = validateFileType("run.bat", "application/x-msdos-program");
    expect(result.allowed).toBe(false);
  });
});

describe("sanitizeODataString", () => {
  it("escapes single quotes", () => {
    expect(sanitizeODataString("O'Brien")).toBe("O''Brien");
  });

  it("removes special characters", () => {
    expect(sanitizeODataString("test$filter()")).toBe("testfilter");
  });

  it("limits length to 200 characters", () => {
    const long = "a".repeat(300);
    expect(sanitizeODataString(long).length).toBe(200);
  });
});

describe("sanitizeODataDate", () => {
  it("accepts valid ISO date", () => {
    expect(sanitizeODataDate("2026-01-15")).toBe("2026-01-15");
  });

  it("rejects invalid format", () => {
    expect(sanitizeODataDate("01/15/2026")).toBeNull();
  });

  it("rejects injection attempts", () => {
    expect(sanitizeODataDate("2026-01-15' or 1 eq 1")).toBeNull();
  });
});

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const key = `test:${Date.now()}`;
    const result = checkRateLimit(key, 3, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks after exceeding limit", () => {
    const key = `test:block:${Date.now()}`;
    checkRateLimit(key, 2, 60000);
    checkRateLimit(key, 2, 60000);
    const result = checkRateLimit(key, 2, 60000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });
});

describe("validateOrigin", () => {
  it("accepts matching origin", () => {
    expect(validateOrigin("https://casos.stia.net/api/test", "https://casos.stia.net", null)).toBe(true);
  });

  it("accepts matching referer", () => {
    expect(validateOrigin("https://casos.stia.net/api/test", null, "https://casos.stia.net/page")).toBe(true);
  });

  it("rejects different origin", () => {
    expect(validateOrigin("https://casos.stia.net/api/test", "https://evil.com", null)).toBe(false);
  });

  it("rejects when both missing", () => {
    expect(validateOrigin("https://casos.stia.net/api/test", null, null)).toBe(false);
  });
});
