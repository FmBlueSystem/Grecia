import { toast as sonnerToast } from 'sonner';

/**
 * Sistema de notificaciones Toast
 * Wrapper sobre Sonner para uso consistente en toda la app
 */

export const toast = {
  /**
   * Muestra un toast de éxito
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Muestra un toast de error
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Muestra un toast de advertencia
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Muestra un toast informativo
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Muestra un toast de carga
   */
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
    });
  },

  /**
   * Maneja promises automáticamente
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Descarta un toast específico
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Descarta todos los toasts
   */
  dismissAll: () => {
    sonnerToast.dismiss();
  },
};

// Shortcuts para operaciones CRUD comunes
export const toastCRUD = {
  created: (entity: string) => toast.success(`${entity} creado exitosamente`),
  updated: (entity: string) => toast.success(`${entity} actualizado exitosamente`),
  deleted: (entity: string) => toast.success(`${entity} eliminado exitosamente`),
  error: (action: string, error?: string) => 
    toast.error(`Error al ${action}`, error),
};
