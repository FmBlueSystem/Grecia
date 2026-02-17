import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { toast } from './toast';

// Configuración base de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${import.meta.env.BASE_URL}api` : 'http://localhost:3000/api'),
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Agrega token de autenticación a todas las peticiones
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar company header si existe
    const company = localStorage.getItem('company');
    if (company && config.headers) {
      config.headers['x-company-id'] = company;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Maneja errores globalmente
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    void (error.config as AxiosRequestConfig & { _retry?: boolean });

    // 401 Unauthorized - Redirect a login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Solo mostrar toast si NO estamos en la página de login (evita "Sesión expirada" al poner credenciales incorrectas)
      if (window.location.pathname !== '/login') {
        toast.error('Sesión expirada', 'Por favor inicia sesión nuevamente');
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // 403 Forbidden - Sin permisos
    if (error.response?.status === 403) {
      toast.error(
        'Acceso denegado',
        'No tienes permisos para realizar esta acción'
      );
      return Promise.reject(error);
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      toast.error(
        'Recurso no encontrado',
        'El recurso solicitado no existe'
      );
      return Promise.reject(error);
    }

    // 422 Validation Error
    if (error.response?.status === 422) {
      const errorData = error.response.data as any;
      toast.error(
        'Error de validación',
        errorData.message || 'Los datos enviados no son válidos'
      );
      return Promise.reject(error);
    }

    // 500 Internal Server Error
    if (error.response?.status === 500) {
      toast.error(
        'Error del servidor',
        'Ocurrió un error en el servidor. Intenta nuevamente.'
      );
      return Promise.reject(error);
    }

    // Network Error (sin conexión)
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      toast.error(
        'Sin conexión',
        'Verifica tu conexión a internet e intenta nuevamente'
      );
      return Promise.reject(error);
    }

    // Timeout Error
    if (error.code === 'ECONNABORTED') {
      toast.error(
        'Tiempo agotado',
        'La petición tomó demasiado tiempo. Intenta nuevamente.'
      );
      return Promise.reject(error);
    }

    // 400 Bad Request — dejar que el componente lo maneje
    if (error.response?.status === 400) {
      return Promise.reject(error);
    }

    // Error genérico
    toast.error(
      'Error inesperado',
      error.message || 'Ocurrió un error. Intenta nuevamente.'
    );

    return Promise.reject(error);
  }
);

/**
 * Retry Logic con Exponential Backoff
 */
interface RetryConfig {
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: AxiosError) => boolean;
}

export async function apiWithRetry<T>(
  request: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    retryCondition = (error) => {
      // Retry solo en network errors o 5xx
      return (
        error.message === 'Network Error' ||
        (error.response?.status || 0) >= 500
      );
    },
  } = config;

  let lastError: any;

  for (let i = 0; i <= retries; i++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;

      // No retry si no cumple condición o es el último intento
      if (
        !retryCondition(error as AxiosError) ||
        i === retries
      ) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = retryDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry silently in production
    }
  }

  throw lastError;
}

/**
 * Helper para peticiones con loading toast
 */
export async function apiWithLoading<T>(
  request: () => Promise<T>,
  messages: {
    loading: string;
    success: string;
    error?: string;
  }
): Promise<T> {
  return toast.promise(request(), {
    loading: messages.loading,
    success: messages.success,
    error: messages.error || 'Ocurrió un error',
  }) as unknown as Promise<T>;
}

export default api;
