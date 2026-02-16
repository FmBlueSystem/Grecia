import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Download, CreditCard, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../lib/animations';
import api from '../lib/api';
import { EmptyState } from '../components/EmptyState';
import Pagination from '../components/shared/Pagination';
// import { ButtonLoading } from '../components/ButtonLoading';
// import { toast } from '../lib/toast';

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string; // UNPAID, PAID, OVERDUE, PARTIAL
    dueDate: string;
    accountId: string;
    account?: { name: string };
    sapInvoiceId?: string;
}

export default function Invoices() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 25;

    useEffect(() => {
        fetchInvoices();
    }, [page]);

    const fetchInvoices = async () => {
        try {
            setRefreshing(true);
            const res = await api.get(`/invoices?top=${pageSize}&skip=${page * pageSize}`);
            if (res.data && res.data.data) {
                setInvoices(res.data.data);
            }
            if (res.data?.total != null) setTotal(res.data.total);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            // Error is already handled by api interceptor toast
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-100/50 text-emerald-700 border-emerald-200';
            case 'UNPAID': return 'bg-amber-100/50 text-amber-700 border-amber-200';
            case 'OVERDUE': return 'bg-red-100/50 text-red-700 border-red-200';
            case 'PARTIAL': return 'bg-blue-100/50 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'UNPAID': return <Clock className="w-3.5 h-3.5" />;
            case 'OVERDUE': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return <FileText className="w-3.5 h-3.5" />;
        }
    };

    const stats = invoices.reduce((acc, inv) => {
        if (inv.status === 'PAID') acc.paid += inv.amount;
        else if (inv.status === 'UNPAID') acc.pending += inv.amount;
        else if (inv.status === 'OVERDUE') acc.overdue += inv.amount;
        return acc;
    }, { paid: 0, pending: 0, overdue: 0 });

    const filteredInvoices = invoices.filter(i => {
        const matchesSearch =
            i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.account?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.accountId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Facturación</h2>
                    <p className="text-slate-500 mt-2 text-lg">Gestión centralizada de facturas y cobros</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => fetchInvoices()}
                        className="bg-white/50 backdrop-blur-sm text-slate-600 border border-slate-200/60 px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-white/80 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Clock className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Actualizando...' : 'Actualizar'}
                    </button>
                    {/* Facturas se crean desde SAP */}
                </div>
            </motion.div>

            {/* Quick Stats Cards */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Cobrado este mes',
                        value: stats.paid,
                        color: 'emerald',
                        icon: CheckCircle,
                        bg: 'bg-emerald-50/50',
                        text: 'text-emerald-600'
                    },
                    {
                        label: 'Pendiente de Pago',
                        value: stats.pending,
                        color: 'amber',
                        icon: Clock,
                        bg: 'bg-amber-50/50',
                        text: 'text-amber-600'
                    },
                    {
                        label: 'Vencido (>30 días)',
                        value: stats.overdue,
                        color: 'red',
                        icon: AlertCircle,
                        bg: 'bg-red-50/50',
                        text: 'text-red-600'
                    }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl shadow-slate-200/50 flex items-center gap-5 hover:transform hover:scale-[1.02] transition-all duration-300">
                        <div className={`p-4 ${stat.bg} rounded-2xl ${stat.text} shadow-sm`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
                            <h4 className="text-3xl font-bold text-slate-800">${stat.value.toLocaleString()}</h4>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Main Content */}
            <motion.div variants={fadeIn} className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[500px]">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100/50 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/40">
                    <div className="relative flex-1 w-full md:max-w-md group">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por cliente, ID o número..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200/60 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 rounded-2xl border border-slate-200/60 bg-white/50 text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer hover:bg-white transition-all font-medium"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="PAID">Pagado</option>
                                <option value="UNPAID">Pendiente</option>
                                <option value="OVERDUE">Vencido</option>
                            </select>
                        </div>
                        <button className="px-4 py-3 bg-white/50 border border-slate-200/60 rounded-2xl text-slate-600 hover:bg-white hover:text-indigo-600 transition-all shadow-sm">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table or Empty State */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-slate-400 animate-pulse">Cargando facturas...</p>
                        </div>
                    ) : filteredInvoices.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100/50 bg-slate-50/30 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-8 py-5">Factura</th>
                                    <th className="px-8 py-5">Cliente</th>
                                    <th className="px-8 py-5">Fecha Vencim.</th>
                                    <th className="px-8 py-5 text-center">Estado</th>
                                    <th className="px-8 py-5 text-right">Monto</th>
                                    <th className="px-8 py-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {filteredInvoices.map((invoice, index) => (
                                    <motion.tr
                                        key={invoice.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                                        className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                {invoice.invoiceNumber}
                                            </div>
                                            {invoice.sapInvoiceId && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 mt-1">
                                                    SAP: {invoice.sapInvoiceId}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-slate-600 font-medium">
                                            {invoice.account?.name || <span className="text-slate-400 italic">Sin Cuenta</span>}
                                        </td>
                                        <td className="px-8 py-5 text-slate-500">
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(invoice.status)}`}>
                                                {getStatusIcon(invoice.status)}
                                                {{ PAID: 'Pagado', UNPAID: 'Pendiente', OVERDUE: 'Vencido', PARTIAL: 'Parcial' }[invoice.status] || invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="font-bold text-slate-900 text-lg">
                                                ${invoice.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors" title="Descargar PDF">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="Registrar Pago">
                                                    <CreditCard className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12">
                            <EmptyState
                                title="No se encontraron facturas"
                                description={searchTerm ? `No hay resultados para "${searchTerm}"` : "Comienza creando tu primera factura para registrar ventas."}
                                actionLabel="Crear Factura"
                                onAction={() => { }}
                                icon={FileText}
                            />
                        </div>
                    )}
                </div>
                <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
            </motion.div>
        </motion.div>
    );
}
