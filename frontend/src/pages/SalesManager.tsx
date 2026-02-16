import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Users, Target, AlertTriangle, Building2, Phone, Globe,
    TrendingUp, DollarSign, FileText, ShoppingCart, Receipt, Calendar,
    Award, Percent, CreditCard, Clock, ChevronRight, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { staggerContainer, fadeIn, slideUp } from '../lib/animations';
import api from '../lib/api';

// ─── Types ───────────────────────────────────────────
interface Client360 {
    client: {
        cardCode: string; name: string; phone: string; website: string;
        country: string; industry: string; salesPerson: string; currentBalance: number;
    };
    summary: {
        totalRevenue: number; totalOrders: number; totalInvoices: number;
        avgOrderValue: number; openBalance: number; overdueCount: number;
        overdueAmount: number; lastPurchaseDate: string | null; lastActivityDate: string | null;
        daysSinceLastContact: number; openQuotesCount: number; openQuotesValue: number;
    };
    topProducts: { code: string; name: string; qty: number; value: number }[];
    recentOrders: { docNum: number; date: string; total: number; status: string; seller: string }[];
    recentInvoices: { docNum: number; date: string; total: number; paid: number; balance: number; dueDate: string; overdue: boolean }[];
    openQuotes: { docNum: number; date: string; total: number; validUntil: string; seller: string }[];
    recentActivities: { type: string; subject: string; date: string; handler: string }[];
}

interface SellerScore {
    code: number; name: string;
    quotes: { count: number; total: number };
    orders: { count: number; total: number };
    invoices: { count: number; total: number };
    avgTicket: number; conversionRate: number; collectionRate: number;
}

interface Scorecard {
    period: string;
    sellers: SellerScore[];
    totals: { quotes: number; orders: number; invoices: number; revenue: number };
    alerts: { expiringQuotes: number; overdueInvoices: number; overdueAmount: number; unassignedQuotes: number };
}

interface ClientOption { cardCode: string; name: string; phone: string; country: string }

const TABS = [
    { id: 'client360', label: 'Ficha 360°', icon: Building2 },
    { id: 'scorecard', label: 'Scorecard Vendedores', icon: Users },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
] as const;

type TabId = typeof TABS[number]['id'];

function fmt(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtDate(d: string | null): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];

// ─── Main Component ──────────────────────────────────
export default function SalesManager() {
    const [activeTab, setActiveTab] = useState<TabId>('client360');

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <motion.div variants={fadeIn}>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
                        <Award className="w-6 h-6" />
                    </div>
                    Gerente de Ventas
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">SAP LIVE</span>
                </h2>
                <p className="text-slate-500 mt-1">Herramientas de inteligencia comercial para toma de decisiones</p>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={fadeIn} className="flex gap-1 bg-slate-100/80 p-1 rounded-xl w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* Tab Content */}
            {activeTab === 'client360' && <Client360Tab />}
            {activeTab === 'scorecard' && <ScorecardTab />}
            {activeTab === 'alerts' && <AlertsTab />}
        </motion.div>
    );
}

// ─── CLIENT 360° TAB ─────────────────────────────────
function Client360Tab() {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<ClientOption[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [data, setData] = useState<Client360 | null>(null);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const searchClients = useCallback((q: string) => {
        if (q.length < 2) { setOptions([]); return; }
        api.get(`/manager/clients?q=${encodeURIComponent(q)}`)
            .then(res => { setOptions(res.data.data || []); setShowDropdown(true); })
            .catch(() => setOptions([]));
    }, []);

    const handleInputChange = (val: string) => {
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchClients(val), 300);
    };

    const selectClient = (cardCode: string, name: string) => {
        setSelectedClient(cardCode);
        setQuery(name);
        setShowDropdown(false);
        setLoading(true);
        api.get(`/manager/client-360/${encodeURIComponent(cardCode)}`)
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="space-y-6">
            {/* Search */}
            <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-500" /> Buscar Cliente
                </h3>
                <div className="relative" ref={dropdownRef}>
                    <input
                        type="text"
                        value={query}
                        onChange={e => handleInputChange(e.target.value)}
                        onFocus={() => options.length > 0 && setShowDropdown(true)}
                        placeholder="Escriba el nombre del cliente (ej: Chiquita, Auto Mercado...)"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                    />
                    {showDropdown && options.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-64 overflow-y-auto">
                            {options.map(opt => (
                                <button
                                    key={opt.cardCode}
                                    onClick={() => selectClient(opt.cardCode, opt.name)}
                                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center justify-between border-b border-slate-50 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{opt.name}</p>
                                        <p className="text-xs text-slate-400">{opt.cardCode} {opt.country && `· ${opt.country}`}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                </div>
            )}

            {/* 360° Data */}
            {!loading && data && (
                <>
                    {/* Client Header */}
                    <motion.div variants={slideUp} className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold">{data.client.name}</h3>
                                <p className="text-indigo-200 mt-1">{data.client.cardCode} · {data.client.country} · {data.client.industry || 'Sin industria'}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-indigo-100">
                                    {data.client.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{data.client.phone}</span>}
                                    {data.client.website && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{data.client.website}</span>}
                                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Vendedor: {data.client.salesPerson}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider">Saldo Actual</p>
                                <p className="text-3xl font-extrabold mt-1">{fmt(data.client.currentBalance)}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Summary KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { label: 'Facturado', value: fmt(data.summary.totalRevenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
                            { label: 'Pedidos', value: String(data.summary.totalOrders), icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
                            { label: 'Ticket Prom.', value: fmt(data.summary.avgOrderValue), icon: BarChart3, color: 'text-indigo-600 bg-indigo-50' },
                            { label: 'Saldo Abierto', value: fmt(data.summary.openBalance), icon: CreditCard, color: data.summary.openBalance > 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50' },
                            { label: 'Vencidas', value: `${data.summary.overdueCount} (${fmt(data.summary.overdueAmount)})`, icon: AlertTriangle, color: data.summary.overdueCount > 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50' },
                            { label: 'Dias sin contacto', value: data.summary.daysSinceLastContact >= 999 ? 'N/A' : `${data.summary.daysSinceLastContact}d`, icon: Clock, color: data.summary.daysSinceLastContact > 30 ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50' },
                        ].map((kpi, i) => (
                            <motion.div key={i} variants={slideUp} className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-md">
                                <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center mb-2`}>
                                    <kpi.icon className="w-4 h-4" />
                                </div>
                                <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                                <p className="text-lg font-bold text-slate-800 mt-0.5">{kpi.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Top Products + Open Quotes */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Products Pie Chart */}
                        <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-500" /> Top Productos
                            </h4>
                            {data.topProducts.length > 0 ? (
                                <div className="flex items-start gap-4">
                                    <ResponsiveContainer width="50%" height={200}>
                                        <PieChart>
                                            <Pie data={data.topProducts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                                {data.topProducts.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v: number) => fmt(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex-1 space-y-1.5 max-h-[200px] overflow-y-auto">
                                        {data.topProducts.map((p, idx) => (
                                            <div key={p.code} className="flex items-center gap-2 text-xs">
                                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                <span className="text-slate-600 truncate flex-1" title={p.name}>{p.name}</span>
                                                <span className="font-semibold text-slate-800 shrink-0">{fmt(p.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-10">Sin datos de productos</p>
                            )}
                        </motion.div>

                        {/* Open Quotes */}
                        <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-amber-500" /> Cotizaciones Abiertas ({data.summary.openQuotesCount})
                                <span className="ml-auto text-sm font-bold text-amber-600">{fmt(data.summary.openQuotesValue)}</span>
                            </h4>
                            {data.openQuotes.length > 0 ? (
                                <div className="space-y-2">
                                    {data.openQuotes.map(q => (
                                        <div key={q.docNum} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-amber-50/30 transition-colors border border-transparent hover:border-amber-100">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">QT-{q.docNum}</p>
                                                <p className="text-xs text-slate-400">Vence: {fmtDate(q.validUntil)} · {q.seller}</p>
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">{fmt(q.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-10">Sin cotizaciones abiertas</p>
                            )}
                        </motion.div>
                    </div>

                    {/* Recent Orders + Invoices */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-blue-500" /> Pedidos Recientes
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-2 px-2 text-xs font-bold text-slate-500 uppercase">Doc#</th>
                                            <th className="text-left py-2 px-2 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                            <th className="text-right py-2 px-2 text-xs font-bold text-slate-500 uppercase">Total</th>
                                            <th className="text-left py-2 px-2 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentOrders.map(o => (
                                            <tr key={o.docNum} className="border-b border-slate-50 hover:bg-slate-50/50">
                                                <td className="py-2 px-2 font-medium text-indigo-600">{o.docNum}</td>
                                                <td className="py-2 px-2 text-slate-600">{fmtDate(o.date)}</td>
                                                <td className="py-2 px-2 text-right font-semibold">{fmt(o.total)}</td>
                                                <td className="py-2 px-2">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status === 'Abierta' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {data.recentOrders.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Sin pedidos recientes</p>}
                            </div>
                        </motion.div>

                        <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-emerald-500" /> Facturas Recientes
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left py-2 px-2 text-xs font-bold text-slate-500 uppercase">Doc#</th>
                                            <th className="text-right py-2 px-2 text-xs font-bold text-slate-500 uppercase">Total</th>
                                            <th className="text-right py-2 px-2 text-xs font-bold text-slate-500 uppercase">Saldo</th>
                                            <th className="text-left py-2 px-2 text-xs font-bold text-slate-500 uppercase">Vence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentInvoices.map(inv => (
                                            <tr key={inv.docNum} className={`border-b border-slate-50 ${inv.overdue ? 'bg-red-50/30' : 'hover:bg-slate-50/50'}`}>
                                                <td className="py-2 px-2 font-medium text-indigo-600">{inv.docNum}</td>
                                                <td className="py-2 px-2 text-right">{fmt(inv.total)}</td>
                                                <td className={`py-2 px-2 text-right font-semibold ${inv.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {inv.balance > 0 ? fmt(inv.balance) : 'Pagada'}
                                                </td>
                                                <td className="py-2 px-2">
                                                    <span className={inv.overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                                                        {fmtDate(inv.dueDate)}
                                                        {inv.overdue && ' !'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {data.recentInvoices.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Sin facturas recientes</p>}
                            </div>
                        </motion.div>
                    </div>

                    {/* Activities */}
                    <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-fuchsia-500" /> Actividades Recientes
                        </h4>
                        {data.recentActivities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {data.recentActivities.map((act, i) => (
                                    <div key={i} className="p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-colors">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                act.type === 'Llamada' ? 'bg-blue-100 text-blue-700' :
                                                act.type === 'Reunion' || act.type === 'Reunión' ? 'bg-purple-100 text-purple-700' :
                                                act.type === 'Email' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>{act.type}</span>
                                            <span className="text-[10px] text-slate-400">{fmtDate(act.date)}</span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-medium line-clamp-2">{act.subject}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{act.handler}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-6">Sin actividades registradas</p>
                        )}
                    </motion.div>
                </>
            )}

            {/* Empty state */}
            {!loading && !data && !selectedClient && (
                <motion.div variants={fadeIn} className="flex flex-col items-center justify-center py-20 text-center">
                    <Building2 className="w-16 h-16 text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">Seleccione un cliente</h3>
                    <p className="text-slate-400 mt-1 text-sm max-w-md">
                        Busque un cliente por nombre para ver su ficha 360° completa con historial de compras, facturas, cotizaciones y actividades.
                    </p>
                </motion.div>
            )}
        </div>
    );
}

// ─── SCORECARD TAB ───────────────────────────────────
function ScorecardTab() {
    const [data, setData] = useState<Scorecard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/manager/seller-scorecard')
            .then(res => setData(res.data))
            .catch(err => console.error('Error fetching scorecard:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/70 p-6 rounded-2xl border border-white/20 shadow-lg animate-pulse">
                        <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map(j => <div key={j} className="h-12 bg-slate-100 rounded" />)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return <p className="text-slate-500 text-center py-20">Error al cargar datos</p>;

    const topSeller = data.sellers[0];
    const chartData = data.sellers.slice(0, 10).map(s => ({
        name: s.name.split(' ')[0],
        facturado: s.invoices.total,
        pedidos: s.orders.total,
    }));

    return (
        <div className="space-y-6">
            {/* Period */}
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Rendimiento del Equipo</h3>
                    <p className="text-sm text-slate-500">{data.period}</p>
                </div>
                <div className="flex gap-3">
                    {[
                        { label: 'Cotizaciones', value: data.totals.quotes, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Pedidos', value: data.totals.orders, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Facturas', value: data.totals.invoices, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Facturacion', value: fmt(data.totals.revenue), color: 'bg-indigo-50 text-indigo-700' },
                    ].map(t => (
                        <span key={t.label} className={`text-xs font-bold px-3 py-1.5 rounded-full ${t.color}`}>
                            {t.label}: {t.value}
                        </span>
                    ))}
                </div>
            </motion.div>

            {/* Top Seller Highlight */}
            {topSeller && (
                <motion.div variants={slideUp} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                            {topSeller.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-amber-100 text-xs uppercase font-bold tracking-wider">Mejor Vendedor</p>
                            <h4 className="text-2xl font-bold">{topSeller.name}</h4>
                            <p className="text-amber-100 text-sm mt-0.5">
                                {topSeller.invoices.count} facturas · Conversion: {topSeller.conversionRate}% · Cobro: {topSeller.collectionRate}%
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-amber-100 text-xs uppercase font-bold">Facturado</p>
                        <p className="text-3xl font-extrabold">{fmt(topSeller.invoices.total)}</p>
                    </div>
                </motion.div>
            )}

            {/* Chart */}
            <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Comparativo de Vendedores</h4>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                        <Tooltip formatter={(v: number, name: string) => [fmt(v), name === 'facturado' ? 'Facturado' : 'Pedidos']} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                        <Bar dataKey="facturado" fill="#6366f1" radius={[4, 4, 0, 0]} name="Facturado" />
                        <Bar dataKey="pedidos" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Pedidos" />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Seller Table */}
            <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Detalle por Vendedor</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase">#</th>
                                <th className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase">Vendedor</th>
                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase">Cotizaciones</th>
                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase">Pedidos</th>
                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase">Facturado</th>
                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase">Ticket Prom.</th>
                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase">Conversion</th>
                                <th className="text-right py-3 px-3 text-xs font-bold text-slate-500 uppercase">Cobro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.sellers.map((s, idx) => (
                                <tr key={s.code} className={`border-b border-slate-50 hover:bg-slate-50/50 ${idx === 0 ? 'bg-amber-50/30' : ''}`}>
                                    <td className="py-3 px-3 text-slate-400 font-medium">{idx + 1}</td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                {s.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-slate-800">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <span className="text-slate-700">{s.quotes.count}</span>
                                        <span className="text-slate-400 text-xs ml-1">({fmt(s.quotes.total)})</span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <span className="text-slate-700">{s.orders.count}</span>
                                        <span className="text-slate-400 text-xs ml-1">({fmt(s.orders.total)})</span>
                                    </td>
                                    <td className="py-3 px-3 text-right font-bold text-indigo-600">{fmt(s.invoices.total)}</td>
                                    <td className="py-3 px-3 text-right text-slate-700">{fmt(s.avgTicket)}</td>
                                    <td className="py-3 px-3 text-right">
                                        <span className={`inline-flex items-center gap-0.5 font-semibold ${s.conversionRate >= 50 ? 'text-emerald-600' : s.conversionRate >= 25 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {s.conversionRate >= 50 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {s.conversionRate}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <span className={`font-semibold ${s.collectionRate >= 80 ? 'text-emerald-600' : s.collectionRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {s.collectionRate}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}

// ─── ALERTS TAB ──────────────────────────────────────
function AlertsTab() {
    const [data, setData] = useState<Scorecard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/manager/seller-scorecard')
            .then(res => setData(res.data))
            .catch(err => console.error('Error fetching alerts:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
        </div>
    );

    if (!data) return null;

    const alerts = data.alerts;
    const hasAlerts = alerts.expiringQuotes > 0 || alerts.overdueInvoices > 0 || alerts.unassignedQuotes > 0;

    return (
        <div className="space-y-6">
            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={slideUp} className={`p-6 rounded-2xl border shadow-lg ${alerts.overdueInvoices > 0 ? 'bg-red-50 border-red-100' : 'bg-white/70 border-white/20'}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${alerts.overdueInvoices > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Facturas Vencidas</p>
                            <p className="text-xs text-slate-500">Requieren cobranza inmediata</p>
                        </div>
                    </div>
                    <p className={`text-3xl font-extrabold ${alerts.overdueInvoices > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                        {alerts.overdueInvoices}
                    </p>
                    {alerts.overdueAmount > 0 && (
                        <p className="text-sm text-red-500 font-semibold mt-1">Monto: {fmt(alerts.overdueAmount)}</p>
                    )}
                </motion.div>

                <motion.div variants={slideUp} className={`p-6 rounded-2xl border shadow-lg ${alerts.expiringQuotes > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white/70 border-white/20'}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${alerts.expiringQuotes > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Cotizaciones por Vencer</p>
                            <p className="text-xs text-slate-500">Vencen en los proximos 7 dias</p>
                        </div>
                    </div>
                    <p className={`text-3xl font-extrabold ${alerts.expiringQuotes > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                        {alerts.expiringQuotes}
                    </p>
                </motion.div>

                <motion.div variants={slideUp} className={`p-6 rounded-2xl border shadow-lg ${alerts.unassignedQuotes > 0 ? 'bg-purple-50 border-purple-100' : 'bg-white/70 border-white/20'}`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${alerts.unassignedQuotes > 0 ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Sin Vendedor Asignado</p>
                            <p className="text-xs text-slate-500">Cotizaciones sin propietario</p>
                        </div>
                    </div>
                    <p className={`text-3xl font-extrabold ${alerts.unassignedQuotes > 0 ? 'text-purple-600' : 'text-slate-300'}`}>
                        {alerts.unassignedQuotes}
                    </p>
                </motion.div>
            </div>

            {/* Sellers at Risk */}
            <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" /> Vendedores con Bajo Rendimiento
                </h4>
                {(() => {
                    const lowPerformers = data.sellers.filter(s => s.conversionRate < 25 || s.collectionRate < 50);
                    return lowPerformers.length > 0 ? (
                        <div className="space-y-3">
                            {lowPerformers.map(s => (
                                <div key={s.code} className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold">
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{s.name}</p>
                                            <div className="flex gap-3 mt-0.5">
                                                {s.conversionRate < 25 && (
                                                    <span className="text-xs text-red-600 font-medium">
                                                        Conversion: {s.conversionRate}% (bajo)
                                                    </span>
                                                )}
                                                {s.collectionRate < 50 && (
                                                    <span className="text-xs text-red-600 font-medium">
                                                        Cobro: {s.collectionRate}% (bajo)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-800">{fmt(s.invoices.total)}</p>
                                        <p className="text-xs text-slate-500">{s.invoices.count} facturas</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-10 text-slate-400">
                            <Award className="w-10 h-10 mb-2 text-emerald-300" />
                            <p className="font-medium text-emerald-600">Todos los vendedores tienen buen rendimiento</p>
                        </div>
                    );
                })()}
            </motion.div>

            {!hasAlerts && (
                <motion.div variants={fadeIn} className="flex flex-col items-center py-10 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                        <Award className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-700">Sin alertas criticas</h3>
                    <p className="text-slate-500 text-sm mt-1">Todas las metricas se encuentran dentro de los parametros normales</p>
                </motion.div>
            )}
        </div>
    );
}
