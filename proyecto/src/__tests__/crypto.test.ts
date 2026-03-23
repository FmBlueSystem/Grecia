import { describe, it, expect, vi, beforeAll } from "vitest";

// Set env before importing
beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-key-for-crypto";
});

import { encrypt, decrypt, isEncrypted } from "../lib/crypto";

describe("encrypt/decrypt", () => {
  it("encrypts and decrypts correctly", () => {
    const plain = "my-smtp-password-123";
    const encrypted = encrypt(plain);
    expect(encrypted).not.toBe(plain);
    expect(decrypt(encrypted)).toBe(plain);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const plain = "same-password";
    const a = encrypt(plain);
    const b = encrypt(plain);
    expect(a).not.toBe(b);
    // But both decrypt to the same value
    expect(decrypt(a)).toBe(plain);
    expect(decrypt(b)).toBe(plain);
  });

  it("returns non-encrypted strings as-is", () => {
    expect(decrypt("plain-text")).toBe("plain-text");
    expect(decrypt("")).toBe("");
  });
});

describe("isEncrypted", () => {
  it("detects encrypted strings", () => {
    const encrypted = encrypt("test");
    expect(isEncrypted(encrypted)).toBe(true);
  });

  it("rejects plain strings", () => {
    expect(isEncrypted("plain-text")).toBe(false);
    expect(isEncrypted("smtp.gmail.com")).toBe(false);
    expect(isEncrypted("")).toBe(false);
  });
});
