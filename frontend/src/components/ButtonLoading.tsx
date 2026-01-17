import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ButtonLoadingProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-md',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Button with Loading State
 * Botón que muestra un spinner cuando está cargando
 */
export function ButtonLoading({
  loading = false,
  children,
  loadingText,
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  ...props
}: ButtonLoadingProps) {
  const isDisabled = loading || disabled;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      disabled={isDisabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg font-medium
        transition-all duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? loadingText || children : children}
    </motion.button>
  );
}

/**
 * Icon Button with Loading
 * Botón de icono con estado de carga
 */
export function IconButtonLoading({
  loading = false,
  icon: Icon,
  ...props
}: {
  loading?: boolean;
  icon: React.ElementType;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={!loading ? { scale: 1.1 } : {}}
      whileTap={!loading ? { scale: 0.9 } : {}}
      disabled={loading}
      className="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
      ) : (
        <Icon className="w-5 h-5 text-slate-600" />
      )}
    </motion.button>
  );
}
