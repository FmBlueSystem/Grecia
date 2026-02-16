/**
 * Components Index
 * Exportación centralizada de todos los componentes de robustez
 */

// Loading States
export { 
  LoadingSpinner,
  PageLoading,
  CardLoading,
  InlineSpinner 
} from './LoadingSpinner';

export {
  ButtonLoading,
  IconButtonLoading
} from './ButtonLoading';

// Error Handling
export {
  ErrorBoundary,
  PageErrorBoundary
} from './ErrorBoundary';

// Modals & Dialogs
export {
  ConfirmDialog,
  useConfirmDialog
} from './ConfirmDialog';

// Skeletons
export {
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  KPICardSkeleton,
  ChartSkeleton,
  ListSkeleton,
  FormSkeleton,
  DashboardSkeleton
} from './Skeletons';

// Empty States
export {
  EmptyState,
  EmptyStateWithImage,
  SearchEmptyState,
  ErrorEmptyState
} from './EmptyState';

// i18n
export { LanguageSwitcher } from './LanguageSwitcher';

// Layout
export { default as AppShell } from './layout/AppShell';
export { default as Sidebar } from './layout/Sidebar';
export { default as TopBar } from './layout/TopBar';

// Shared
export { default as PageHeader } from './shared/PageHeader';
export { default as StatCard } from './shared/StatCard';
export { default as DataTable } from './shared/DataTable';
export { default as StatusBadge } from './shared/StatusBadge';
export { default as FilterChips } from './shared/FilterChips';

// Detail
export { default as DetailLayout } from './detail/DetailLayout';
export { default as BPF } from './detail/BPF';
export { default as Timeline } from './detail/Timeline';
export { default as InfoCard } from './detail/InfoCard';
export { default as SLAIndicator } from './detail/SLAIndicator';

// Dashboard
export { default as DonutChart } from './dashboard/DonutChart';
export { default as BarChartSimple } from './dashboard/BarChartSimple';

// Forms
export { FormField, FormInput, FormSelect } from './forms/FormField';
export { default as ToggleSwitch } from './forms/ToggleSwitch';

// Notifications
export { default as NotificationItem } from './notifications/NotificationItem';

// Calendar
export { default as CalendarGrid } from './calendar/CalendarGrid';
