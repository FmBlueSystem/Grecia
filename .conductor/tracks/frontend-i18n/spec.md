# Track Specification: Frontend Internationalization (i18n)

## 🎯 Objective
Implement full internationalization support for the application, enabling seamless switching between **English (en)** and **Latin American Spanish (es-419)**.

## 📝 Requirements
1.  **Languages**:
    *   English (Default for development/code).
    *   Spanish (Latin America).
2.  **Detection**: Automatic language detection based on browser settings, with user override capability.
3.  **Persistence**: Remember user preference (localStorage).
4.  **Scope**:
    *   Navigation/Sidebar elements.
    *   Page titles and headers.
    *   Form labels and placeholders.
    *   Feedback messages (toasts, errors).
    *   Date and number formatting (currency).

## 🛠 Technology Strategy
*   **Library**: `i18next` ecosystem is the industry standard.
    *   `i18next`: Core.
    *   `react-i18next`: React bindings.
    *   `i18next-browser-languagedetector`: For auto-detection.
    *   `i18next-http-backend` (Optional): If we want to load translations lazily, though for an internal CRM, bundling or simple JSON imports might be faster initially. Let's use standard JSON resources.

## 🎨 Implementation details
*   Translation files located in `src/locales/{en,es}/common.json`.
*   Use a hook `useTranslation` in components.
*   Ensure date/currency formatting uses proper locale APIs (Intl.NumberFormat / date-fns locale).
