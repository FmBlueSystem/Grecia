import { useState, useEffect } from 'react';
import { BarChart3, Users, Building2, TrendingUp, Activity, LogOut, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import { RevenueChart, PipelineChart, PerformanceChart, ActivityChart } from './components/Charts';
import ContactForm from './components/ContactForm';
import OpportunityForm from './components/OpportunityForm';
import { fadeInUp, staggerContainer, staggerItem, fadeInLeft, scaleIn } from './utils/animations';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  company: string;
  tags: string[];
}

interface Opportunity {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  closeDate: string;
  account: string;
  contact: string;
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
      'Qualification': 'bg-yellow-100 text-yellow-800',
      'Proposal': 'bg-blue-100 text-blue-800',
      'Negotiation': 'bg-purple-100 text-purple-800',
      'Closed Won': 'bg-green-100 text-green-800',
      'Closed Lost': 'bg-red-100 text-red-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando STIA CRM...</p>
        </div>
      </div>
    );
  }

  if (!backendConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Backend No Disponible</h2>
          <p className="text-gray-600 mb-4">
            No se puede conectar al backend en http://localhost:3000
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-left text-sm mb-4">
            <p className="font-semibold mb-2">Para iniciar el backend:</p>
            <code className="block bg-gray-900 text-green-400 p-2 rounded">
              cd backend<br />
              npm run dev
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">STIA CRM</h1>
                <p className="text-xs text-gray-500">MVP Demo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'contacts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Contactos
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'opportunities'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Oportunidades
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <motion.div
            className="space-y-6"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h2
              className="text-2xl font-bold text-gray-900"
              variants={fadeInLeft}
            >
              Dashboard Ejecutivo
            </motion.h2>

            {/* KPI Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
            >
              <motion.div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer"
                variants={staggerItem}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: { duration: 0.3 },
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue MTD</p>
                    <motion.p
                      className="text-2xl font-bold text-gray-900 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                    >
                      {formatCurrency(stats.revenue.mtd)}
                    </motion.p>
                    <p className="text-sm text-green-600 mt-1">{stats.revenue.trend}</p>
                  </div>
                  <motion.div
                    className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.revenue.percentage}%` }}
                      transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.revenue.percentage}% de objetivo ({formatCurrency(stats.revenue.target)})
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer"
                variants={staggerItem}
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: { duration: 0.3 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                    <motion.p
                      className="text-2xl font-bold text-gray-900 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: 'spring' }}
                    >
                      {formatCurrency(stats.pipeline.value)}
                    </motion.p>
                    <p className="text-sm text-gray-600 mt-1">{stats.pipeline.deals} deals activos</p>
                  </div>
                  <motion.div
                    className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </motion.div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Ponderado: {formatCurrency(stats.pipeline.weighted)}</p>
              </motion.div>

              <motion.div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer"
                variants={staggerItem}
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: { duration: 0.3 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <motion.p
                      className="text-2xl font-bold text-gray-900 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: 'spring' }}
                    >
                      {stats.winRate.percentage}%
                    </motion.p>
                    <p className="text-sm text-green-600 mt-1">{stats.winRate.trend}</p>
                  </div>
                  <motion.div
                    className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 cursor-pointer"
                variants={staggerItem}
                whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: { duration: 0.3 } }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Actividades Hoy</p>
                    <motion.p
                      className="text-2xl font-bold text-gray-900 mt-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: 'spring' }}
                    >
                      {stats.activities.today}
                    </motion.p>
                    <p className="text-sm text-orange-600 mt-1">{stats.activities.overdue} atrasadas</p>
                  </div>
                  <motion.div
                    className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ delay: 0.9, duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Activity className="w-6 h-6 text-orange-600" />
                  </motion.div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Esta semana: {stats.activities.thisWeek}</p>
              </motion.div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              variants={fadeInUp}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Rápido</h3>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={staggerItem}>
                  <p className="text-sm text-gray-600">Total Contactos</p>
                  <motion.p
                    className="text-xl font-bold text-gray-900"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                  >
                    {contacts.length}
                  </motion.p>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <p className="text-sm text-gray-600">Oportunidades Activas</p>
                  <motion.p
                    className="text-xl font-bold text-gray-900"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1, type: 'spring' }}
                  >
                    {opportunities.length}
                  </motion.p>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <p className="text-sm text-gray-600">Pipeline Ponderado</p>
                  <motion.p
                    className="text-xl font-bold text-gray-900"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                  >
                    {formatCurrency(stats.pipeline.weighted)}
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Interactive Charts */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              variants={staggerContainer}
            >
              <motion.div variants={scaleIn}>
                <RevenueChart />
              </motion.div>
              <motion.div variants={scaleIn}>
                <PipelineChart />
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              variants={staggerContainer}
            >
              <motion.div variants={scaleIn}>
                <PerformanceChart />
              </motion.div>
              <motion.div variants={scaleIn}>
                <ActivityChart />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Contactos</h2>
              <button
                onClick={() => {
                  setEditingContact(undefined);
                  setShowContactForm(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Contacto
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {contact.firstName[0]}{contact.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{contact.jobTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {contact.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
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
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Oportunidades</h2>
              <button
                onClick={() => {
                  setEditingOpportunity(undefined);
                  setShowOpportunityForm(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nueva Oportunidad
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Oportunidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cuenta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Etapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probabilidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cierre
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{opp.name}</div>
                        <div className="text-sm text-gray-500">{opp.contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opp.account}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(opp.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStageColor(opp.stage)}`}>
                          {opp.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${opp.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{opp.probability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(opp.closeDate).toLocaleDateString('es-CR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center">
            <p className="text-sm text-gray-500">
              © 2026 BlueSystem - Todos los derechos reservados
            </p>
          </div>
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
