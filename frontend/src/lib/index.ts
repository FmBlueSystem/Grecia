/**
 * Lib Index
 * Exportación centralizada de utilities, hooks y schemas
 */

// Toast Notifications
export { toast, toastCRUD } from './toast';

// API Client
export { default as api, apiWithRetry, apiWithLoading } from './api';

// Schemas
export * from './schemas';

// Hooks
export {
  useOnlineStatus,
  useLoading,
  useFocusTrap,
  useKeyPress,
  useClickOutside,
  useDebounce
} from './hooks';

// Accessibility
export {
  generateAriaId,
  announceToScreenReader,
  moveFocus,
  getFocusableElements,
  isElementVisible
} from './accessibility';

// Animations (existing)
export * from './animations';
