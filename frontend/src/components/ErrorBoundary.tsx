import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ButtonLoading } from './ButtonLoading';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Captura errores de React y muestra un fallback UI elegante
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Error Fallback UI Component
 */
interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ¡Oops! Algo salió mal
            </h1>
            <p className="text-white/90">
              Encontramos un error inesperado
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-mono text-slate-600 break-all">
                {error?.message || 'Error desconocido'}
              </p>
            </div>

            <div className="space-y-3">
              <ButtonLoading
                variant="primary"
                onClick={onReset}
                className="w-full justify-center"
              >
                <RefreshCw className="w-5 h-5" />
                Intentar de nuevo
              </ButtonLoading>

              <ButtonLoading
                variant="secondary"
                onClick={handleReload}
                className="w-full justify-center"
              >
                <RefreshCw className="w-5 h-5" />
                Recargar página
              </ButtonLoading>

              <ButtonLoading
                variant="ghost"
                onClick={handleGoHome}
                className="w-full justify-center"
              >
                <Home className="w-5 h-5" />
                Ir al inicio
              </ButtonLoading>
            </div>

            {/* Debug info (only in development) */}
            {import.meta.env.DEV && error?.stack && (
              <details className="mt-6">
                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                  Ver detalles técnicos
                </summary>
                <pre className="mt-2 p-4 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-auto max-h-60">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 text-center">
              Si el problema persiste, contacta a soporte
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page Error Boundary
 * Error boundary específico para páginas/rutas
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onReset={() => {
        // Clear any page-specific state
        window.history.back();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
