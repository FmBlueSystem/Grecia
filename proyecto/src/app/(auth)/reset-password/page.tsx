"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

function getStrength(pw: string) {
  if (!pw) return { width: "0%", color: "transparent", label: "" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const meetsAll = hasUpper && hasLower && hasDigit && pw.length >= 8;
  if (pw.length < 8) return { width: "25%", color: "#EF4444", label: "Débil" };
  if (!meetsAll) return { width: "50%", color: "#F59E0B", label: "Incompleta" };
  if (pw.length < 12) return { width: "75%", color: "#F59E0B", label: "Aceptable" };
  return { width: "100%", color: "#10B981", label: "Fuerte" };
}

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"form" | "success" | "invalid">(
    token ? "form" : "invalid"
  );
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Mínimo 8 caracteres");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Debe tener al menos 1 mayúscula");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Debe tener al menos 1 minúscula");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Debe tener al menos 1 número");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        if (
          data.error?.includes("inválido") ||
          data.error?.includes("expirado") ||
          data.error?.includes("utilizado")
        ) {
          setStatus("invalid");
        } else {
          setError(data.error || "Error al cambiar contraseña");
        }
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    }
    setLoading(false);
  }

  if (status === "invalid") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h3
          style={{
            color: "#FCA5A5",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Enlace inválido o expirado
        </h3>
        <p
          style={{
            color: "#94A3B8",
            fontSize: 13,
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          El enlace que usaste ya no es válido. Solicita uno nuevo.
        </p>
        <Link
          href="/forgot-password"
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
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3
          style={{
            color: "#10B981",
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          ¡Contraseña actualizada!
        </h3>
        <p style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.6 }}>
          Tu contraseña fue cambiada exitosamente. Redirigiendo al login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* New password */}
      <div className="login-field">
        <label htmlFor="password">Nueva contraseña</label>
        <div className="login-password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          <button
            type="button"
            className="login-toggle-pass"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Strength indicator */}
        {password && (
          <>
            <div
              style={{
                marginTop: 8,
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 2,
                  transition: "width 0.3s, background 0.3s",
                  width: strength.width,
                  background: strength.color,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                color: strength.color,
                marginTop: 4,
                display: "block",
              }}
            >
              {strength.label} — Requiere: 8+ caracteres, mayúscula, minúscula,
              número
            </span>
          </>
        )}
      </div>

      {/* Confirm password */}
      <div className="login-field">
        <label htmlFor="confirm">Confirmar contraseña</label>
        <div className="login-password-wrapper">
          <input
            id="confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Repite tu contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="button"
            className="login-toggle-pass"
            onClick={() => setShowConfirm(!showConfirm)}
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {confirm && password !== confirm && (
          <span style={{ fontSize: 11, color: "#EF4444", marginTop: 4, display: "block" }}>
            Las contraseñas no coinciden
          </span>
        )}
      </div>

      {error && <div className="login-error">{error}</div>}

      <button
        type="submit"
        className="login-submit-btn"
        disabled={loading}
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {loading ? "Guardando..." : "Cambiar contraseña"}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="login-page">
      <div className="login-ambient-1" />
      <div className="login-ambient-2" />

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo-section">
          <div className="login-logo-icon">S</div>
          <h1>STIA Casos</h1>
          <p>Nueva contraseña</p>
        </div>

        <div className="login-form-card">
          <Suspense
            fallback={
              <div style={{ textAlign: "center", color: "#64748B", fontSize: 14 }}>
                Cargando...
              </div>
            }
          >
            <ResetForm />
          </Suspense>
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
