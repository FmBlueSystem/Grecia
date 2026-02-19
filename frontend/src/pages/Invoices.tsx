import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Download, CreditCard, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { fadeIn, staggerContainer } from '../lib/animations';
import api from '../lib/api';
import { EmptyState, TableSkeleton } from '../components';
import Pagination from '../components/shared/Pagination';
import { getStatusColor } from '../lib/hooks';

interface Invoice {
    id: string;
    sapDocNum: number;
    sapDocEntry: number;
    invoiceNumber: string;
    amount: number;
    paidAmount: number;
    status: string; // UNPAID, PAID, OVERDUE, PARTIAL
    dueDate: string;
    accountId: string;
    account?: { name: string };
    sapInvoiceId?: string;
}

const InvoiceRow = memo(function InvoiceRow({ invoice, index, onNavigate }: {
    invoice: Invoice;
    index: number;
    onNavigate: (id: string) => void;
}) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'UNPAID': return <Clock className="w-3.5 h-3.5" />;
            case 'OVERDUE': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return <FileText className="w-3.5 h-3.5" />;
        }
    };

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate(invoice.id)}
            className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
        >
            <td className="px-8 py-5">
                <div className="font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    {invoice.sapDocNum}
                </div>
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
                    <button
                        onClick={(e) => { e.stopPropagation(); toast.info('Descarga de PDF: disponible próximamente'); }}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors" title="Descargar PDF"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toast.info('Registro de pago: disponible próximamente'); }}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="Registrar Pago"
                    >
                        <CreditCard className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
});

export default function Invoices() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [globalStats, setGlobalStats] = useState<{ paid: number; pending: number; overdue: number } | null>(null);
    const pageSize = 25;

    useEffect(() => {
        fetchInvoices();
    }, [page, statusFilter]);

    useEffect(() => {
        api.get('/invoices/stats')
            .then(res => { if (res.data) setGlobalStats(res.data); })
            .catch(err => console.error('Error al obtener stats de facturas', err));
    }, []);

    const fetchInvoices = async () => {
        try {
            setRefreshing(true);
            const params = new URLSearchParams({ top: String(pageSize), skip: String(page * pageSize) });
            if (statusFilter !== 'ALL') {
                const filterMap: Record<string, string> = {
                    PAID: "PaidToDate ge DocTotal",
                    UNPAID: "PaidToDate eq 0",
                    OVERDUE: "PaidToDate lt DocTotal",
                };
                if (filterMap[statusFilter]) params.set('filter', filterMap[statusFilter]);
            }
            const res = await api.get(`/invoices?${params}`);
            if (res.data && res.data.data) {
                setInvoices(res.data.data);
            }
            if (res.data?.total != null) setTotal(res.data.total);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleNavigate = useCallback((id: string) => navigate(`/invoices/${id}`), [navigate]);

    const stats = globalStats || { paid: 0, pending: 0, overdue: 0 };

    const filteredInvoices = invoices.filter(i => {
        const matchesSearch =
            String(i.sapDocNum).includes(searchTerm) ||
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
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                                className="pl-10 pr-8 py-3 rounded-2xl border border-slate-200/60 bg-white/50 text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer hover:bg-white transition-all font-medium"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="PAID">Pagado</option>
                                <option value="UNPAID">Pendiente</option>
                                <option value="OVERDUE">Vencido</option>
                            </select>
                        </div>
                        <button
                            onClick={() => toast.info('Exportación de facturas: disponible próximamente')}
                            className="px-4 py-3 bg-white/50 border border-slate-200/60 rounded-2xl text-slate-600 hover:bg-white hover:text-indigo-600 transition-all shadow-sm"
                            title="Exportar"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table or Empty State */}
                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="p-6"><TableSkeleton rows={6} /></div>
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
                                    <InvoiceRow key={invoice.id} invoice={invoice} index={index} onNavigate={handleNavigate} />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12">
                            <EmptyState
                                title="No se encontraron facturas"
                                description={searchTerm ? `No hay resultados para "${searchTerm}"` : "Las facturas se sincronizan automaticamente desde SAP Business One."}
                                icon={FileText}
                                variant={searchTerm ? 'search' : undefined}
                            />
                        </div>
                    )}
                </div>
                <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
            </motion.div>
        </motion.div>
    );
}
