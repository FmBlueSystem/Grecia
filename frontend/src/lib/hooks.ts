import { useEffect, useRef, useState } from 'react';

/**
 * Hook para detectar estado de conexión
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook para manejar estados de loading
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const toggleLoading = () => setIsLoading((prev) => !prev);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading,
  };
}

/**
 * Hook para trap focus en modals
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }

    element.addEventListener('keydown', handleTab as any);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTab as any);
    };
  }, [ref, active]);
}

/**
 * Hook para keyboard navigation
 */
export function useKeyPress(targetKey: string, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === targetKey) {
        handler(e);
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [targetKey, handler]);
}

/**
 * Hook para detectar clicks fuera de un elemento
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, handler]);
}

/**
 * Hook para debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para notificaciones SSE en tiempo real
 */
export function useNotificationSSE() {
  const [count, setCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${import.meta.env.BASE_URL}api` : 'http://localhost:3000/api');
    const company = localStorage.getItem('company') || 'CR';

    const connect = () => {
      // EventSource doesn't support custom headers, pass token as query param
      const url = `${baseURL}/notifications/stream?token=${encodeURIComponent(token)}&company=${company}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setCount(data.total || 0);
        } catch { /* ignore parse errors */ }
      };

      es.onerror = () => {
        es.close();
        // Reconnect after 30 seconds
        setTimeout(connect, 30_000);
      };
    };

    connect();

    return () => {
      esRef.current?.close();
    };
  }, []);

  return count;
}
