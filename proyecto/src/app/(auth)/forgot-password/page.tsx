"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Ingresa tu correo electrónico");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Always show success to prevent email enumeration
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-ambient-1" />
      <div className="login-ambient-2" />

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo-section">
          <div className="login-logo-icon">S</div>
          <h1>STIA Casos</h1>
          <p>Recuperar contraseña</p>
        </div>

        <div className="login-form-card">
          {sent ? (
            /* Success state */
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <h3
                style={{
                  color: "#F1F5F9",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Revisa tu correo
              </h3>
              <p
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                Si el email está registrado, recibirás un enlace para
                restablecer tu contraseña. Revisa también tu carpeta de spam.
              </p>
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  borderRadius: 10,
                  background: "rgba(59,130,246,0.15)",
                  color: "#3B82F6",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Volver al login
              </Link>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit}>
              <p
                style={{
                  color: "#94A3B8",
                  fontSize: 13,
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                Ingresa tu correo electrónico y te enviaremos un enlace para
                restablecer tu contraseña.
              </p>

              <div className="login-field">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@stia.net"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Link
                  href="/login"
                  style={{
                    fontSize: 13,
                    color: "#3B82F6",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <ArrowLeft style={{ width: 14, height: 14 }} />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="login-footer">
          <div className="login-country-pills">
            <span>{"\u{1F1E8}\u{1F1F7}"} CR</span>
            <span>{"\u{1F1EC}\u{1F1F9}"} GT</span>
            <span>{"\u{1F1ED}\u{1F1F3}"} HN</span>
            <span>{"\u{1F1F8}\u{1F1FB}"} SV</span>
            <span>{"\u{1F1F5}\u{1F1E6}"} PA</span>
          </div>
          <p>
            &copy; 2026 STIA &middot; Powered by{" "}
            <a
              href="https://bluesystem.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              BlueSystem.IO
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
