import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3, Building2, Users, UserPlus, TrendingUp,
  FileText, ShoppingCart, Receipt, Calendar, Package,
  Truck, LogOut, Settings, ChevronDown, Award,
  Clock, PieChart, Activity, Palette, Shield
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore, useThemeStore, THEME_META, type ThemeSkin } from '../../lib/store';

const COMPANIES = [
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
];

// Roles that can see each section
const ROLE_ACCESS: Record<string, string[]> = {
  'PRINCIPAL': ['Admin', 'Gerente', 'Vendedor'],
  'COMERCIAL': ['Admin', 'Gerente', 'Vendedor'],
  'GERENTE DE VENTAS': ['Admin', 'Gerente'],
  'GESTIÓN': ['Admin', 'Gerente'],
};

const NAV_SECTIONS = [
  {
    label: 'PRINCIPAL',
    items: [
      { id: 'dashboard', label: 'Panel', icon: BarChart3, path: '/' },
      { id: 'accounts', label: 'Cuentas', icon: Building2, path: '/accounts' },
      { id: 'contacts', label: 'Contactos', icon: Users, path: '/contacts' },
      { id: 'leads', label: 'Prospectos', icon: UserPlus, path: '/leads' },
      { id: 'pipeline', label: 'Embudo', icon: TrendingUp, path: '/pipeline' },
    ],
  },
  {
    label: 'COMERCIAL',
    items: [
      { id: 'quotes', label: 'Ofertas', icon: FileText, path: '/quotes' },
      { id: 'orders', label: 'Órdenes', icon: ShoppingCart, path: '/orders' },
      { id: 'invoices', label: 'Facturas', icon: Receipt, path: '/invoices' },
      { id: 'activities', label: 'Actividades', icon: Calendar, path: '/activities' },
      { id: 'products', label: 'Productos', icon: Package, path: '/products' },
    ],
  },
  {
    label: 'GERENTE DE VENTAS',
    items: [
      { id: 'sales-manager', label: 'Panel Gerencial', icon: Award, path: '/sales-manager' },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { id: 'logistics', label: 'Logística', icon: Truck, path: '/logistics' },
      { id: 'aging', label: 'Antigüedad', icon: Clock, path: '/aging' },
      { id: 'reports', label: 'Reportes', icon: PieChart, path: '/reports' },
      { id: 'usage', label: 'Adopcion', icon: Activity, path: '/usage' },
      { id: 'audit-log', label: 'Auditoria', icon: Shield, path: '/audit-log' },
    ],
  },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const theme = useThemeStore(s => s.theme);
  const setTheme = useThemeStore(s => s.setTheme);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(() => {
    const saved = localStorage.getItem('company');
    return COMPANIES.find(c => c.code === saved) || COMPANIES[0];
  });

  const handleSwitchCompany = (company: typeof COMPANIES[0]) => {
    setCurrentCompany(company);
    localStorage.setItem('company', company.code);
    setShowCompanyMenu(false);
    window.location.reload();
  };

  return (
    <aside className="h-full w-[260px] bg-sidebar-bg border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <h1 className="text-sidebar-text font-bold text-sm leading-tight">STIA CRM</h1>
          <p className="text-sidebar-muted text-[10px] font-medium">Empresarial</p>
        </div>
      </div>

      {/* Company Selector */}
      <div className="px-3 py-3 border-b border-sidebar-border shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className="w-full flex items-center justify-between px-3 py-2 bg-sidebar-hover hover:bg-sidebar-border rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2 text-sm text-sidebar-text">
              <span>{currentCompany.flag}</span>
              <span className="font-medium">{currentCompany.name}</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-sidebar-muted transition-transform ${showCompanyMenu ? 'rotate-180' : ''}`} />
          </button>
          {showCompanyMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar-hover rounded-lg border border-sidebar-border overflow-hidden z-50">
              {COMPANIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => handleSwitchCompany(c)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                    currentCompany.code === c.code
                      ? 'bg-brand text-white'
                      : 'text-sidebar-inactive hover:bg-sidebar-border hover:text-sidebar-text'
                  }`}
                >
                  <span>{c.flag}</span>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_SECTIONS.filter(section => {
          const allowed = ROLE_ACCESS[section.label];
          return !allowed || allowed.includes(user?.role || '');
        }).map(section => (
          <div key={section.label}>
            <p className="text-sidebar-muted text-[10px] font-bold tracking-widest uppercase px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-brand/10 text-brand font-semibold'
                        : 'text-sidebar-inactive font-medium hover:bg-sidebar-hover hover:text-sidebar-text'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-3 space-y-1 shrink-0">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-sidebar-inactive font-medium hover:bg-sidebar-hover hover:text-sidebar-text'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          Configuración
        </NavLink>

        {/* Theme Switcher */}
        <div className="flex items-center gap-3 px-3 py-2">
          <Palette className="w-4 h-4 text-sidebar-muted" />
          <span className="text-sm font-medium text-sidebar-inactive">Tema</span>
          <div className="ml-auto flex gap-2">
            {(Object.keys(THEME_META) as ThemeSkin[]).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                title={THEME_META[t].label}
                className={`w-5 h-5 rounded-full transition-all ${
                  theme === t ? 'ring-2 ring-sidebar-text ring-offset-1 ring-offset-sidebar-bg scale-110' : 'opacity-50 hover:opacity-80 hover:scale-110'
                }`}
                style={{ backgroundColor: THEME_META[t].color }}
              />
            ))}
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2 mt-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-light rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-text text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-sidebar-muted text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-sidebar-muted hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
