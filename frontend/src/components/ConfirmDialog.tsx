import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { ButtonLoading } from './ButtonLoading';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    confirmButton: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50',
    confirmButton: 'primary' as const,
  },
  info: {
    icon: AlertTriangle,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    confirmButton: 'primary' as const,
  },
};

/**
 * Confirm Dialog Component
 * Modal de confirmación para acciones críticas
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  // Handle ESC key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onKeyDown={handleKeyDown}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-6 border-b border-slate-100">
                <div className={`p-3 rounded-full ${config.iconBg}`}>
                  <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 
                    id="dialog-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    {title}
                  </h3>
                </div>
                {!loading && (
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <p 
                  id="dialog-description"
                  className="text-slate-600 leading-relaxed"
                >
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-100">
                <ButtonLoading
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  {cancelText}
                </ButtonLoading>
                <ButtonLoading
                  variant={config.confirmButton}
                  onClick={onConfirm}
                  loading={loading}
                  className="flex-1"
                >
                  {confirmText}
                </ButtonLoading>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook para manejar confirmaciones
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => {
    if (!loading) setIsOpen(false);
  };

  const confirm = async (action: () => void | Promise<void>) => {
    setLoading(true);
    try {
      await action();
      setIsOpen(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    loading,
    open,
    close,
    confirm,
  };
}

// Import necesario para el hook
import { useState } from 'react';
