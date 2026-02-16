import { useState, useEffect } from 'react';
import { Search, Bell, Command, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/store';
import GlobalSearch from './GlobalSearch';

const COMPANIES = [
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
];

interface TopBarProps {
  notificationCount?: number;
}

export default function TopBar({ notificationCount = 0 }: TopBarProps) {
  const user = useAuthStore(s => s.user);
  const [searchOpen, setSearchOpen] = useState(false);
  const [company, setCompany] = useState(() => localStorage.getItem('company') || 'CR');

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      {/* Search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className="relative w-80 flex items-center gap-2 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 hover:bg-slate-100 hover:border-slate-300 transition-all text-left"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        Buscar clientes, ofertas, órdenes...
        <kbd className="ml-auto hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white rounded border border-slate-200">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Company Switcher */}
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={company}
            onChange={(e) => {
              const val = e.target.value;
              setCompany(val);
              localStorage.setItem('company', val);
              window.location.reload();
            }}
            className="appearance-none bg-transparent text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none pr-1"
          >
            {COMPANIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.firstName} {user?.lastName}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{user?.role || 'Administrador'}</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </div>
      </div>
    </header>

    {/* Global Search Modal */}
    <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
