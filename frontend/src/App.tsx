import { useState, useEffect } from 'react';
import { BarChart3, Users, Building2, TrendingUp, Activity, Plus, Search, Sparkles, Globe, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Quotes from './pages/Quotes';
import Invoices from './pages/Invoices';
import Accounts from './pages/Accounts';
import Contacts from './pages/Contacts';
import Activities from './pages/Activities';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import LandingIntro from './components/LandingIntro';
import { fadeIn, slideUp, staggerContainer, scaleIn, pageTransition } from './lib/animations';

interface User {
  firstName: string;
  lastName: string;
}

const COMPANIES = [
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Multi-Company State
  const [currentCompany, setCurrentCompany] = useState(COMPANIES[0]);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedCompany = localStorage.getItem('company');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    if (savedCompany) {
      const found = COMPANIES.find(c => c.code === savedCompany);
      if (found) setCurrentCompany(found);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const handleSwitchCompany = (company: typeof COMPANIES[0]) => {
    setCurrentCompany(company);
    localStorage.setItem('company', company.code);
    setShowCompanyMenu(false);
    // Reload or refetch data here ideally
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Cargando...</div>;



  // Inject company header into all fetch requests (Global override simplistic for demo)
  // In a real app, use an Axios interceptor or custom fetch wrapper.
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set('x-company-id', currentCompany.code);
    const newInit = { ...init, headers };
    return originalFetch(input, newInit);
  };


  return (
    <>
      {showIntro && <LandingIntro onComplete={() => setShowIntro(false)} />}

      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
            duration={4000}
          />

          {/* Background Mesh (Same as before) */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
          </div>

          {/* Floating Header */}
          <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mb-8">
            <nav className="glass rounded-2xl shadow-lg shadow-slate-200/50 px-4 py-3 flex items-center justify-between border-white/50 bg-white/70 backdrop-blur-md">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-xl">S</div>
                  <div className="hidden md:block">
                    <h1 className="text-lg font-bold text-slate-900 leading-tight">STIA</h1>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Enterprise</p>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-xl backdrop-blur-sm overflow-x-auto">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                    { id: 'accounts', label: 'Cuentas', icon: Building2 },
                    { id: 'contacts', label: 'Contactos', icon: Users },
                    { id: 'activities', label: 'Actividades', icon: Calendar },
                    { id: 'leads', label: 'Leads', icon: Search },
                    { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
                    { id: 'products', label: 'Productos', icon: Activity },
                    { id: 'quotes', label: 'Ofertas', icon: Sparkles },
                    { id: 'invoices', label: 'Facturas', icon: FileText },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 relative ${activeTab === tab.id ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      {activeTab === tab.id && (
                        <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg" />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <tab.icon className="w-4 h-4" /> {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Company Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors font-bold border border-indigo-200"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{currentCompany.flag} {currentCompany.code}</span>
                  </button>

                  <AnimatePresence>
                    {showCompanyMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 p-1"
                      >
                        {COMPANIES.map(c => (
                          <button
                            key={c.code}
                            onClick={() => handleSwitchCompany(c)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${currentCompany.code === c.code ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'
                              }`}
                          >
                            <span className="text-lg">{c.flag}</span>
                            {c.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-none">{user?.firstName}</p>
                  </div>
                  <div
                    onClick={handleLogout}
                    className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer hover:ring-2 ring-indigo-200 transition-all"
                  >
                    {user?.firstName?.[0]}
                  </div>
                </div>
              </div>
            </nav>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'accounts' && <Accounts />}
                {activeTab === 'contacts' && <Contacts />}
                {activeTab === 'activities' && <Activities />}
                {activeTab === 'leads' && <Leads />}
                {activeTab === 'products' && <Products />}
                {activeTab === 'quotes' && <Quotes />}
                {activeTab === 'invoices' && <Invoices />}
                {activeTab === 'pipeline' && <Pipeline />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
    </>
  );
}

export default App;
