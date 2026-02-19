import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, MoreHorizontal, CheckCircle, Clock, AlertTriangle, Trash2, Loader2, Building2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fadeIn, staggerContainer } from '../lib/animations';
import api from '../lib/api';
import { TableSkeleton, EmptyState } from '../components';
import Pagination from '../components/shared/Pagination';

interface Quote {
    id: string;
    sapDocNum: number;
    sapDocEntry: number;
    quoteNumber: string;
    name: string;
    account: { name: string };
    owner: { id: string; firstName: string; lastName: string };
    totalAmount: number;
    status: string;
    expirationDate: string;
    createdAt: string;
}

interface ClientOption { cardCode: string; name: string }
interface ProductOption { code: string; name: string; price: number }
interface QuoteLine { itemCode: string; itemName: string; quantity: number; unitPrice: number; discount: number }

export default function Quotes() {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 25;

    // Modal form state
    const [clientQuery, setClientQuery] = useState('');
    const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [comments, setComments] = useState('');
    const [lines, setLines] = useState<QuoteLine[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const clientDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);
    const productDebounce = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        fetchQuotes();
    }, [page, statusFilter, dateFilter]);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const filters: string[] = [];
            // Status filter via SAP DocumentStatus
            if (statusFilter === 'OPEN') filters.push("DocumentStatus eq 'bost_Open'");
            else if (statusFilter === 'CLOSED') filters.push("DocumentStatus eq 'bost_Close'");
            // Date filter
            if (dateFilter !== 'ALL') {
                const now = new Date();
                let startDate: string;
                if (dateFilter === 'MONTH') {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                } else if (dateFilter === 'QUARTER') {
                    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
                } else {
                    startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                }
                filters.push(`DocDate ge '${startDate}'`);
            }
            const filterStr = filters.length > 0 ? `&filter=${encodeURIComponent(filters.join(' and '))}` : '';
            const res = await api.get(`/quotes?top=${pageSize}&skip=${page * pageSize}${filterStr}`);
            if (res.data?.data) setQuotes(res.data.data);
            if (res.data?.total != null) setTotal(res.data.total);
        } catch (error) {
            console.error('Error al obtener ofertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-100 text-slate-600';
            case 'SENT': return 'bg-blue-50 text-blue-600';
            case 'ACCEPTED': return 'bg-emerald-50 text-emerald-600';
            case 'REJECTED': return 'bg-red-50 text-red-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DRAFT': return <FileText className="w-3 h-3" />;
            case 'SENT': return <Clock className="w-3 h-3" />;
            case 'ACCEPTED': return <CheckCircle className="w-3 h-3" />;
            case 'REJECTED': return <AlertTriangle className="w-3 h-3" />;
            default: return <FileText className="w-3 h-3" />;
        }
    };

    const searchClients = (q: string) => {
        if (q.length < 2) { setClientOptions([]); return; }
        api.get(`/manager/clients?q=${encodeURIComponent(q)}`)
            .then(res => { setClientOptions(res.data.data || []); setShowClientDropdown(true); })
            .catch(() => setClientOptions([]));
    };

    const searchProducts = (q: string) => {
        if (q.length < 2) { setProductOptions([]); return; }
        api.get(`/products?search=${encodeURIComponent(q)}&top=10`)
            .then(res => {
                const items = (res.data.data || []).map((p: any) => ({ code: p.code, name: p.name, price: p.price || 0 }));
                setProductOptions(items);
                setShowProductDropdown(true);
            })
            .catch(() => setProductOptions([]));
    };

    const handleClientInput = (val: string) => {
        setClientQuery(val);
        setSelectedClient(null);
        clearTimeout(clientDebounce.current);
        clientDebounce.current = setTimeout(() => searchClients(val), 300);
    };

    const handleProductInput = (val: string) => {
        setProductSearch(val);
        clearTimeout(productDebounce.current);
        productDebounce.current = setTimeout(() => searchProducts(val), 300);
    };

    const addLine = (product: ProductOption) => {
        setLines(prev => [...prev, { itemCode: product.code, itemName: product.name, quantity: 1, unitPrice: product.price, discount: 0 }]);
        setProductSearch('');
        setShowProductDropdown(false);
    };

    const updateLine = (idx: number, field: keyof QuoteLine, value: number) => {
        setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
    };

    const removeLine = (idx: number) => {
        setLines(prev => prev.filter((_, i) => i !== idx));
    };

    const resetModal = () => {
        setClientQuery(''); setSelectedClient(null); setDueDate('');
        setComments(''); setLines([]); setProductSearch('');
        setShowClientDropdown(false); setShowProductDropdown(false);
    };

    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) { toast.error('Seleccione un cliente'); return; }
        if (lines.length === 0) { toast.error('Agregue al menos un producto'); return; }
        if (!dueDate) { toast.error('Seleccione una fecha de validez'); return; }

        setSubmitting(true);
        try {
            const payload = {
                cardCode: selectedClient.cardCode,
                docDueDate: dueDate,
                comments,
                lines: lines.map(l => ({
                    itemCode: l.itemCode,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    discount: l.discount,
                })),
            };
            const res = await api.post('/quotes', payload);
            toast.success(`Oferta #${res.data.docNum} creada exitosamente en SAP`);
            setIsModalOpen(false);
            resetModal();
            fetchQuotes();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Error al crear oferta');
        } finally {
            setSubmitting(false);
        }
    };

    const ownerName = (q: Quote) => `${q.owner?.firstName || ''} ${q.owner?.lastName || ''}`.trim();
    const filteredQuotes = quotes.filter(q => {
        const term = searchTerm.toLowerCase();
        return q.name.toLowerCase().includes(term) ||
            q.quoteNumber.toLowerCase().includes(term) ||
            String(q.sapDocNum).includes(term) ||
            q.account.name.toLowerCase().includes(term) ||
            ownerName(q).toLowerCase().includes(term);
    });

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={fadeIn} className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Ofertas de Ventas</h2>
                    <p className="text-slate-500 mt-1">Gestión de ofertas y propuestas comerciales</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-transform active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Nueva Oferta
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeIn} className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Buscar por referencia, cliente o título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                    <option value="ALL">Todos los estados</option>
                    <option value="OPEN">Abiertas</option>
                    <option value="CLOSED">Cerradas</option>
                </select>
                <select
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setPage(0); }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                    <option value="ALL">Todas las fechas</option>
                    <option value="MONTH">Este Mes</option>
                    <option value="QUARTER">Último Trimestre</option>
                    <option value="YEAR">Este Año</option>
                </select>
            </motion.div>

            {/* List */}
            <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700"># SAP</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Cliente</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Vendedor</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Estado</th>
                                <th className="px-6 py-4 font-bold text-slate-700 text-right">Total</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Vencimiento</th>
                                <th className="px-6 py-4 font-bold text-slate-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="p-6"><TableSkeleton rows={5} /></td></tr>
                            ) : filteredQuotes.length > 0 ? (
                                filteredQuotes.map((quote) => (
                                    <tr key={quote.id} onClick={() => navigate(`/quotes/${quote.id}`)} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-indigo-600">{quote.sapDocNum}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <Building2 className="w-3 h-3" />
                                                </div>
                                                <span className="font-medium text-slate-700">{quote.account.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                                                    {(quote.owner?.firstName?.[0] || '') + (quote.owner?.lastName?.[0] || '')}
                                                </div>
                                                <span className="text-sm text-slate-700">{ownerName(quote) || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(quote.status)}`}>
                                                {getStatusIcon(quote.status)}
                                                {{ DRAFT: 'Borrador', SENT: 'Enviada', ACCEPTED: 'Aceptada', REJECTED: 'Rechazada' }[quote.status] || quote.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-slate-900">${quote.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {quote.expirationDate ? new Date(quote.expirationDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-6">
                                        <EmptyState
                                            icon={FileText}
                                            title={searchTerm ? 'No se encontraron ofertas' : 'No hay ofertas'}
                                            description={searchTerm ? `No hay resultados para "${searchTerm}"` : 'Crea una nueva oferta para comenzar'}
                                            variant={searchTerm ? 'search' : undefined}
                                            actionLabel={searchTerm ? undefined : 'Nueva Oferta'}
                                            onAction={searchTerm ? undefined : () => setIsModalOpen(true)}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
            </motion.div>

            {/* New Quote Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                                <h3 className="text-xl font-bold text-slate-900">Nueva Oferta Comercial</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateQuote} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-5">
                                    {/* Client Search */}
                                    <div className="col-span-2 relative">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Cliente (SAP)</label>
                                        <input
                                            value={clientQuery}
                                            onChange={e => handleClientInput(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Buscar cliente por nombre..."
                                        />
                                        {selectedClient && (
                                            <span className="absolute right-3 top-[38px] text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                {selectedClient.cardCode}
                                            </span>
                                        )}
                                        {showClientDropdown && clientOptions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-48 overflow-y-auto">
                                                {clientOptions.map(opt => (
                                                    <button key={opt.cardCode} type="button" onClick={() => { setSelectedClient(opt); setClientQuery(opt.name); setShowClientDropdown(false); }}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm border-b border-slate-50 last:border-0">
                                                        <span className="font-semibold text-slate-800">{opt.name}</span>
                                                        <span className="text-xs text-slate-400 ml-2">{opt.cardCode}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Validez Hasta</label>
                                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Notas</label>
                                        <input value={comments} onChange={e => setComments(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Condiciones de pago..." />
                                    </div>

                                    {/* Products */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Productos</label>
                                        <div className="relative mb-3">
                                            <input value={productSearch} onChange={e => handleProductInput(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="Buscar producto por nombre o código..." />
                                            {showProductDropdown && productOptions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-48 overflow-y-auto">
                                                    {productOptions.map(p => (
                                                        <button key={p.code} type="button" onClick={() => addLine(p)}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-sm border-b border-slate-50 last:border-0 flex justify-between">
                                                            <span><span className="font-mono text-xs text-slate-400 mr-2">{p.code}</span><span className="font-medium text-slate-800">{p.name}</span></span>
                                                            <span className="font-semibold text-slate-600">${p.price.toLocaleString()}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {lines.length > 0 && (
                                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th className="text-left px-3 py-2 text-xs font-bold text-slate-500">Producto</th>
                                                            <th className="text-center px-2 py-2 text-xs font-bold text-slate-500 w-20">Cant.</th>
                                                            <th className="text-right px-2 py-2 text-xs font-bold text-slate-500 w-24">Precio</th>
                                                            <th className="text-center px-2 py-2 text-xs font-bold text-slate-500 w-16">Desc%</th>
                                                            <th className="text-right px-2 py-2 text-xs font-bold text-slate-500 w-24">Total</th>
                                                            <th className="w-8"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {lines.map((line, idx) => {
                                                            const lineTotal = line.quantity * line.unitPrice * (1 - line.discount / 100);
                                                            return (
                                                                <tr key={idx}>
                                                                    <td className="px-3 py-2 text-slate-700">{line.itemName}</td>
                                                                    <td className="px-2 py-2"><input type="number" min={1} value={line.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value) || 1)} className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-sm" /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0} step={0.01} value={line.unitPrice} onChange={e => updateLine(idx, 'unitPrice', Number(e.target.value) || 0)} className="w-full text-right border border-slate-200 rounded px-1 py-0.5 text-sm" /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0} max={100} value={line.discount} onChange={e => updateLine(idx, 'discount', Number(e.target.value) || 0)} className="w-full text-center border border-slate-200 rounded px-1 py-0.5 text-sm" /></td>
                                                                    <td className="px-2 py-2 text-right font-semibold text-slate-800">${lineTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                                                    <td className="px-1 py-2"><button type="button" onClick={() => removeLine(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                    <tfoot className="bg-slate-50">
                                                        <tr>
                                                            <td colSpan={4} className="px-3 py-2 text-right font-bold text-slate-700">Total</td>
                                                            <td className="px-2 py-2 text-right font-bold text-indigo-600">
                                                                ${lines.reduce((s, l) => s + l.quantity * l.unitPrice * (1 - l.discount / 100), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}

                                        {lines.length === 0 && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed text-center text-sm text-slate-400">
                                                Busque y seleccione productos arriba para agregarlos
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => { setIsModalOpen(false); resetModal(); }} className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-2">
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {submitting ? 'Creando...' : 'Crear en SAP'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

