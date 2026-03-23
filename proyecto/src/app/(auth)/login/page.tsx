"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Eye,
  EyeOff,
  Activity,
  MessageCircle,
  Globe,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("stia-remember-email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (rememberMe) {
      localStorage.setItem("stia-remember-email", email);
    } else {
      localStorage.removeItem("stia-remember-email");
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Verifique su red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* STIA Color Bar */}
      <div className="login-color-bar">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="login-content-row">
        {/* Left Panel - Branding */}
        <div className="login-left-panel">
          <div className="login-left-top">
            <div className="login-brand-row">
              <div className="login-logo-blocks">
                <div className="login-block b1" />
                <div className="login-block-row">
                  <div className="login-block b2" />
                  <div className="login-block b3" />
                </div>
                <div className="login-block b4" />
              </div>
              <span className="login-brand-name">Stia</span>
              <span className="login-casos-badge">Casos</span>
            </div>
          </div>

          <div className="login-left-middle">
            <h1 className="login-headline">
              Soporte centralizado para toda la región
            </h1>
            <p className="login-subheadline">
              Gestione casos de servicio, seguimiento en tiempo real y
              comunicación directa con soporte técnico.
            </p>

            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon blue">
                  <Activity size={18} />
                </div>
                <span>Seguimiento en tiempo real de sus casos</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon green">
                  <MessageCircle size={18} />
                </div>
                <span>Comunicación directa con soporte técnico</span>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon amber">
                  <Globe size={18} />
                </div>
                <span>
                  Operaciones en Costa Rica, Guatemala, Honduras, El Salvador y
                  Panamá
                </span>
              </div>
            </div>
          </div>

          <div className="login-left-bottom">
            <div className="login-country-pills">
              <span>CR</span>
              <span>GT</span>
              <span>HN</span>
              <span>SV</span>
              <span>PA</span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="login-separator" />

        {/* Right Panel - Form */}
        <div className="login-right-panel">
          <div className="login-form-container">
            <div className="login-form-header">
              <h2>Bienvenido de nuevo</h2>
              <p>Inicie sesión para gestionar sus casos de soporte</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
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
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">Contraseña</label>
                <div className="login-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-toggle-pass"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <div className="login-form-options">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Recordarme</span>
                </label>
                <a href="/forgot-password">¿Olvidó su contraseña?</a>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Conectando..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="login-footer">
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
      </div>
    </div>
  );
}
