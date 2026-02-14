import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language === 'es' ? 'ES' : 'EN';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
      title={i18n.language === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
    >
      <Languages className="w-4 h-4" />
      <span className="font-bold">{currentLang}</span>
    </button>
  );
}
