# Implementation Plan - Frontend Internationalization

## Phase 1: Foundation
- [ ] Install dependencies (`i18next`, `react-i18next`, `i18next-browser-languagedetector`).
- [ ] Create translation JSON structure (`src/locales/en.json`, `src/locales/es.json`).
- [ ] Initialize `i18n` configuration in `src/i18n.ts`.
- [ ] Integrate `I18nextProvider` or simple init in `main.tsx`.

## Phase 2: Core UI Translation
- [ ] Translate Sidebar/Navigation items.
- [ ] Translate Common UI elements (Buttons: "Save", "Cancel", "Delete").
- [ ] Translate Topbar/Header.

## Phase 3: Page Migration
- [ ] Translate **Dashboard** page.
- [ ] Translate **Accounts** (Cuentas) page.
- [ ] Translate **Contacts** page.
- [ ] Translate **Opportunities** page.
- [ ] Translate **Invoices** page.

## Phase 4: Formatting & Polish
- [ ] Configure `date-fns` or Intl for localized date formatting.
- [ ] Ensure currency displays match the locale or the actual currency of the record (important distinction for CRM).
- [ ] Add Language Switcher component in the UI.
