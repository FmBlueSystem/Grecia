import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { ButtonLoading } from './ButtonLoading';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: ReactNode;
}

/**
 * Empty State Component
 * Muestra un estado vacío elegante cuando no hay datos
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration o Icon */}
      {illustration || (
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-60" />
          <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full p-8">
            <Icon className="w-16 h-16 text-indigo-600" strokeWidth={1.5} />
          </div>
        </div>
      )}

      {/* Content */}
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-slate-600 max-w-md mb-6">
        {description}
      </p>

      {/* Action */}
      {actionLabel && onAction && (
        <ButtonLoading
          variant="primary"
          onClick={onAction}
          className="inline-flex"
        >
          {actionLabel}
        </ButtonLoading>
      )}
    </div>
  );
}

/**
 * Empty State with Image
 */
export function EmptyStateWithImage({
  imageSrc,
  title,
  description,
  actionLabel,
  onAction,
}: {
  imageSrc: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <img 
        src={imageSrc} 
        alt={title}
        className="w-64 h-64 object-contain mb-6 opacity-80"
      />
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-slate-600 max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <ButtonLoading
          variant="primary"
          onClick={onAction}
        >
          {actionLabel}
        </ButtonLoading>
      )}
    </div>
  );
}

/**
 * Search Empty State
 */
export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        No se encontraron resultados
      </h3>
      <p className="text-slate-600 max-w-md">
        No encontramos resultados para <span className="font-semibold">"{query}"</span>.
        <br />
        Intenta con otros términos de búsqueda.
      </p>
    </div>
  );
}

/**
 * Error Empty State
 */
export function ErrorEmptyState({ 
  message = 'No se pudo cargar la información',
  onRetry,
}: { 
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        Error al cargar
      </h3>
      <p className="text-slate-600 max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <ButtonLoading
          variant="primary"
          onClick={onRetry}
        >
          Reintentar
        </ButtonLoading>
      )}
    </div>
  );
}
