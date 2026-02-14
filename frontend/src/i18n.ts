import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    debug: false,
    
    supportedLngs: ['es', 'en'],
    
    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    ns: [
      'common',
      'auth',
      'navigation',
      'dashboard',
      'contacts',
      'accounts',
      'leads',
      'opportunities',
      'pipeline',
      'quotes',
      'invoices',
      'orders',
      'products',
      'activities',
      'forms',
      'validation',
      'errors',
      'messages',
    ],

    defaultNS: 'common',

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
