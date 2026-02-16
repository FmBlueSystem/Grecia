import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3, Building2, Users, UserPlus, TrendingUp,
  FileText, ShoppingCart, Receipt, Calendar, Package,
  Truck, LogOut, Settings, ChevronDown, Award,
  Clock, PieChart
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../lib/store';

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
      { id: 'quotes', label: 'Cotizaciones', icon: FileText, path: '/quotes' },
      { id: 'orders', label: 'Pedidos', icon: ShoppingCart, path: '/orders' },
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
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
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
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0A0F1A] flex flex-col z-40">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#1A2D47]">
        <div className="w-8 h-8 bg-[#0067B2] rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">STIA CRM</h1>
          <p className="text-[#64748B] text-[10px] font-medium">Empresarial</p>
        </div>
      </div>

      {/* Company Selector */}
      <div className="px-3 py-3 border-b border-[#1A2D47]">
        <div className="relative">
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#142238] hover:bg-[#1A2D47] rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2 text-sm text-white">
              <span>{currentCompany.flag}</span>
              <span className="font-medium">{currentCompany.name}</span>
            </span>
            <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${showCompanyMenu ? 'rotate-180' : ''}`} />
          </button>
          {showCompanyMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#142238] rounded-lg border border-[#1A2D47] overflow-hidden z-50">
              {COMPANIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => handleSwitchCompany(c)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                    currentCompany.code === c.code
                      ? 'bg-[#0067B2] text-white'
                      : 'text-[#8899AA] hover:bg-[#1A2D47] hover:text-white'
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
            <p className="text-[#64748B] text-[10px] font-bold tracking-widest uppercase px-3 mb-2">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#0067B2] text-white'
                        : 'text-[#8899AA] hover:bg-[#142238] hover:text-white'
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
      <div className="border-t border-[#1A2D47] p-3 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive ? 'bg-[#0067B2] text-white' : 'text-[#8899AA] hover:bg-[#142238] hover:text-white'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          Configuración
        </NavLink>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2 mt-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[#64748B] text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-[#64748B] hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
