import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

/**
 * Loading Spinner Component
 * Spinner reutilizable con diferentes tamaños
 */
export function LoadingSpinner({ 
  size = 'md', 
  className = '',
  color = 'text-indigo-600' 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} ${color} animate-spin`}
      />
    </div>
  );
}

/**
 * Page Loading Spinner
 * Spinner centrado para páginas completas
 */
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-slate-600 font-medium">Cargando...</p>
      </div>
    </div>
  );
}

/**
 * Card Loading Skeleton
 * Loading state para cards/contenedores
 */
export function CardLoading() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <LoadingSpinner size="lg" className="my-8" />
    </div>
  );
}

/**
 * Inline Loading Spinner
 * Spinner pequeño para uso inline
 */
export function InlineSpinner({ className = '' }: { className?: string }) {
  return (
    <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
  );
}
