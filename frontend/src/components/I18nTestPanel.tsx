import { useTranslation } from 'react-i18next';
import { CheckCircle2, Languages } from 'lucide-react';

export function I18nTestPanel() {
  const { t, i18n } = useTranslation(['common', 'auth', 'dashboard', 'contacts']);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Languages className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">i18n Status Panel</h3>
          <p className="text-xs text-slate-500">Validation Dashboard</p>
        </div>
      </div>

      {/* Current Language */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-xs font-medium text-emerald-800">Current Language</p>
            <p className="text-sm font-bold text-emerald-900">
              {i18n.language.toUpperCase()} - {i18n.language === 'es' ? 'Español' : 'English'}
            </p>
          </div>
        </div>

        {/* Sample Translations */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-bold text-slate-600 mb-2">Sample Translations:</p>
          
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">common.app.name:</span>
              <span className="font-bold text-slate-900">{t('common:app.name')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">common.actions.save:</span>
              <span className="font-bold text-slate-900">{t('common:actions.save')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">auth.login.title:</span>
              <span className="font-bold text-slate-900">{t('auth:login.title')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">dashboard.title:</span>
              <span className="font-bold text-slate-900">{t('dashboard:title')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">contacts.title:</span>
              <span className="font-bold text-slate-900">{t('contacts:title')}</span>
            </div>
          </div>
        </div>

        {/* Loaded Namespaces */}
        <div className="bg-indigo-50 rounded-lg p-3">
          <p className="text-xs font-bold text-indigo-900 mb-2">Loaded Namespaces:</p>
          <div className="flex flex-wrap gap-1">
            {Object.keys(i18n.store.data[i18n.language] || {}).map((ns) => (
              <span 
                key={ns} 
                className="text-xs px-2 py-1 bg-white rounded border border-indigo-200 text-indigo-700 font-medium"
              >
                {ns}
              </span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <p className="text-xs font-bold text-amber-900 mb-1">✓ Validation Instructions:</p>
          <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
            <li>Click the language button in the header</li>
            <li>Watch translations update in real-time</li>
            <li>Verify localStorage persistence</li>
            <li>Check all namespaces load correctly</li>
          </ol>
        </div>
      </div>

      {/* Manual Toggle (for testing) */}
      <div className="flex gap-2">
        <button
          onClick={() => i18n.changeLanguage('es')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            i18n.language === 'es'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🇪🇸 ES
        </button>
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            i18n.language === 'en'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🇬🇧 EN
        </button>
      </div>
    </div>
  );
}
