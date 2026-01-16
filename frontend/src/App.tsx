import { useState, useEffect } from 'react';
import { BarChart3, Users, Building2, TrendingUp, Activity, LogOut, Plus, Search, Bell, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import { RevenueChart, PipelineChart, PerformanceChart, ActivityChart } from './components/Charts';
import ContactForm from './components/ContactForm';
import OpportunityForm from './components/OpportunityForm';
import { fadeIn, slideUp, staggerContainer, scaleIn, pageTransition } from './lib/animations';

interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  company?: string;
  leadSource?: string;
  tags: string[];
}

interface Opportunity {
  id?: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  closeDate: string;
  accountName: string;
  contactName: string;
}

interface Stats {
  revenue: {
    mtd: number;
    target: number;
    percentage: number;
    trend: string;
  };
  pipeline: {
    value: number;
    weighted: number;
    deals: number;
  };
  winRate: {
    percentage: number;
    trend: string;
  };
  activities: {
    today: number;
    thisWeek: number;
    overdue: number;
  };
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contacts' | 'opportunities'>('dashboard');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>(undefined);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, oppsRes, statsRes] = await Promise.all([
          fetch('http://localhost:3000/api/contacts'),
          fetch('http://localhost:3000/api/opportunities'),
          fetch('http://localhost:3000/api/dashboard/stats'),
        ]);

        const contactsData = await contactsRes.json();
        const oppsData = await oppsRes.json();
        const statsData = await statsRes.json();

        setContacts(contactsData.data);
        setOpportunities(oppsData.data);
        setStats(statsData);
        setBackendConnected(true);
      } catch (error) {
        console.error('Error conectando con backend:', error);
        setBackendConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Qualification': 'bg-amber-100/50 text-amber-700 border-amber-200',
      'Proposal': 'bg-blue-100/50 text-blue-700 border-blue-200',
      'Negotiation': 'bg-violet-100/50 text-violet-700 border-violet-200',
      'Closed Won': 'bg-emerald-100/50 text-emerald-700 border-emerald-200',
      'Closed Lost': 'bg-rose-100/50 text-rose-700 border-rose-200',
    };
    return colors[stage] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Contact CRUD operations
  const handleSaveContact = async (contact: Contact) => {
    const url = contact.id
      ? `http://localhost:3000/api/contacts/${contact.id}`
      : 'http://localhost:3000/api/contacts';
    const method = contact.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    if (!response.ok) {
      throw new Error('Error al guardar contacto');
    }

    const data = await response.json();

    if (contact.id) {
      setContacts(contacts.map((c) => (c.id === contact.id ? data.data : c)));
    } else {
      setContacts([...contacts, data.data]);
    }

    setShowContactForm(false);
    setEditingContact(undefined);
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este contacto?')) return;

    const response = await fetch(`http://localhost:3000/api/contacts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar contacto');
    }

    setContacts(contacts.filter((c) => c.id !== id));
  };

  // Opportunity CRUD operations
  const handleSaveOpportunity = async (opportunity: Opportunity) => {
    const url = opportunity.id
      ? `http://localhost:3000/api/opportunities/${opportunity.id}`
      : 'http://localhost:3000/api/opportunities';
    const method = opportunity.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(opportunity),
    });

    if (!response.ok) {
      throw new Error('Error al guardar oportunidad');
    }

    const data = await response.json();

    if (opportunity.id) {
      setOpportunities(opportunities.map((o) => (o.id === opportunity.id ? data.data : o)));
    } else {
      setOpportunities([...opportunities, data.data]);
    }

    setShowOpportunityForm(false);
    setEditingOpportunity(undefined);
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta oportunidad?')) return;

    const response = await fetch(`http://localhost:3000/api/opportunities/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar oportunidad');
    }

    setOpportunities(opportunities.filter((o) => o.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium animate-pulse">Cargando experiencia...</p>
        </div>
      </div>
    );
  }

  if (!backendConnected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistema Desconectado</h2>
          <p className="text-slate-500 mb-6">
            No se detecta conexión con el servidor. Verifica que el backend esté ejecutándose.
          </p>
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-left text-sm mb-6 font-mono">
            npm run dev
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Header */}
      <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mb-8">
        <nav className="glass rounded-2xl shadow-lg shadow-slate-200/50 px-4 py-3 flex items-center justify-between border-white/50">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl tracking-tighter">S</span>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600 leading-tight">STIA</h1>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Enterprise</p>
              </div>
            </div>

            {/* Navigation Tabs - Pill Style with Gradient Active State */}
            <div className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center relative overflow-hidden ${activeTab === 'dashboard'
                  ? 'text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
              >
                {activeTab === 'dashboard' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </span>
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center relative overflow-hidden ${activeTab === 'contacts'
                  ? 'text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
              >
                {activeTab === 'contacts' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Contactos
                </span>
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center relative overflow-hidden ${activeTab === 'opportunities'
                  ? 'text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
              >
                {activeTab === 'opportunities' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Oportunidades
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white/50 rounded-lg hover:bg-white border border-transparent hover:border-indigo-100">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative bg-white/50 rounded-lg hover:bg-white border border-transparent hover:border-indigo-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-indigo-500 mt-1 font-medium">Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer border-2 border-white ring-2 ring-indigo-100">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <motion.div
              key="dashboard"
              className="space-y-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={fadeIn} className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 tracking-tight">Dashboard Ejecutivo</h2>
                  <p className="text-slate-500 mt-2 text-lg">Bienvenido de nuevo, aquí está el resumen de hoy.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Insights Activos</span>
                </div>
              </motion.div>

              {/* KPI Cards */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={staggerContainer}
              >
                {[
                  {
                    title: 'Revenue MTD',
                    value: formatCurrency(stats.revenue.mtd),
                    trend: stats.revenue.trend,
                    color: 'indigo',
                    icon: TrendingUp,
                    metric: `${stats.revenue.percentage}%`,
                    chart: true
                  },
                  {
                    title: 'Pipeline Value',
                    value: formatCurrency(stats.pipeline.value),
                    trend: `${stats.pipeline.deals} active deals`,
                    color: 'blue',
                    icon: Building2,
                    metric: 'Ponderado'
                  },
                  {
                    title: 'Win Rate',
                    value: `${stats.winRate.percentage}%`,
                    trend: stats.winRate.trend,
                    color: 'emerald',
                    icon: BarChart3,
                    metric: 'Mensual'
                  },
                  {
                    title: 'Actividades',
                    value: stats.activities.today,
                    trend: `${stats.activities.overdue} atrasadas`,
                    color: 'fuchsia',
                    icon: Activity,
                    metric: 'Hoy'
                  },
                ].map((kpi, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 card-hover group relative overflow-hidden"
                    variants={slideUp}
                  >
                    <div className={`absolute top-0 right-0 p-20 bg-${kpi.color}-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150`}></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className={`p-3 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 group-hover:bg-${kpi.color}-100 transition-colors shadow-sm`}>
                        <kpi.icon className="w-6 h-6" />
                      </div>
                      {kpi.metric && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          {kpi.metric}
                        </span>
                      )}
                    </div>
                    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider relative z-10">{kpi.title}</h3>
                    <div className="flex items-baseline gap-2 mt-1 relative z-10">
                      <span className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.value}</span>
                    </div>
                    <p className={`text-sm mt-2 font-bold relative z-10 ${kpi.trend.includes('atrasadas') ? 'text-orange-500' : 'text-emerald-600'}`}>
                      {kpi.trend}
                    </p>

                    {kpi.chart && (
                      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative z-10">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.revenue.percentage}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Charts Grid */}
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={staggerContainer}
              >
                <motion.div variants={scaleIn} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 font-display flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    Ingresos vs Objetivo
                  </h3>
                  <RevenueChart />
                </motion.div>
                <motion.div variants={scaleIn} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 font-display flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    Pipeline Funnel
                  </h3>
                  <PipelineChart />
                </motion.div>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={staggerContainer}
              >
                <motion.div variants={scaleIn} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 font-display flex items-center gap-2">
                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                    Performance por Equipo
                  </h3>
                  <PerformanceChart />
                </motion.div>
                <motion.div variants={scaleIn} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 font-display flex items-center gap-2">
                    <span className="w-2 h-6 bg-fuchsia-500 rounded-full"></span>
                    Actividad Reciente
                  </h3>
                  <ActivityChart />
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              className="space-y-6"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Directorio de Contactos</h2>
                  <p className="text-slate-500 mt-1">Gestiona tus relaciones comerciales</p>
                </div>
                <button
                  onClick={() => {
                    setEditingContact(undefined);
                    setShowContactForm(true);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 font-bold active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Contacto
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      {['Nombre', 'Email', 'Teléfono', 'Empresa', 'Tags'].map((header) => (
                        <th key={header} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-indigo-50/30 cursor-pointer transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-indigo-700 font-bold group-hover:scale-110 transition-transform">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                {contact.firstName} {contact.lastName}
                              </div>
                              <div className="text-xs text-slate-500">{contact.jobTitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {contact.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {contact.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {contact.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {contact.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-indigo-100 text-indigo-600 shadow-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <motion.div
              key="opportunities"
              className="space-y-6"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Pipeline de Oportunidades</h2>
                  <p className="text-slate-500 mt-1">Seguimiento de negocios activos</p>
                </div>
                <button
                  onClick={() => {
                    setEditingOpportunity(undefined);
                    setShowOpportunityForm(true);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 font-bold active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Oportunidad
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      {['Oportunidad', 'Cuenta', 'Valor', 'Etapa', 'Probabilidad', 'Cierre'].map((header) => (
                        <th key={header} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-50">
                    {opportunities.map((opp) => (
                      <tr key={opp.id} className="hover:bg-indigo-50/30 cursor-pointer transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{opp.name}</div>
                          <div className="text-xs text-slate-500">{opp.contactName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {opp.accountName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 font-mono">
                          {formatCurrency(opp.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getStageColor(opp.stage)}`}>
                            {opp.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${opp.probability}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-600">{opp.probability}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(opp.closeDate).toLocaleDateString('es-CR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer - Minimal */}
      <footer className="mt-12 py-8 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400 font-medium tracking-wide">
            POWERED BY <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600 font-bold">BLUESYSTEM</span>
          </p>
        </div>
      </footer>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <ContactForm
            contact={editingContact}
            onClose={() => {
              setShowContactForm(false);
              setEditingContact(undefined);
            }}
            onSave={handleSaveContact}
          />
        )}
      </AnimatePresence>

      {/* Opportunity Form Modal */}
      <AnimatePresence>
        {showOpportunityForm && (
          <OpportunityForm
            opportunity={editingOpportunity}
            onClose={() => {
              setShowOpportunityForm(false);
              setEditingOpportunity(undefined);
            }}
            onSave={handleSaveOpportunity}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
