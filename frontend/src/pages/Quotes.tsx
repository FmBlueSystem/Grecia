import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, DollarSign, User, MoreHorizontal, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, staggerContainer } from '../lib/animations';

interface Quote {
    id: string;
    quoteNumber: string;
    name: string;
    account: { name: string };
    totalAmount: number;
    status: string;
    expirationDate: string;
    createdAt: string;
}

export default function Quotes() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/quotes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.data) setQuotes(data.data);
        } catch (error) {
            console.error('Failed to fetch quotes:', error);
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

    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        // MVP: Mock creation or implement full form. For now, we'll confirm the UI flow.
        // In a real implementation, we'd gather all form data being consistent with backend schema.
        setIsModalOpen(false);
        alert("Funcionalidad de creación completa en desarrollo. El backend está listo.");
    };

    const filteredQuotes = quotes.filter(q =>
        q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={fadeIn} className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Ofertas de Ventas</h2>
                    <p className="text-slate-500 mt-1">Gestión de cotizaciones y propuestas comerciales</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-transform active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Nueva Oferta
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeIn} className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Buscar por referencia, cliente o título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Este Mes
                </button>
            </motion.div>

            {/* List */}
            <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700">Referencia</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Cliente</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Estado</th>
                                <th className="px-6 py-4 font-bold text-slate-700 text-right">Total</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Vencimiento</th>
                                <th className="px-6 py-4 font-bold text-slate-700 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredQuotes.length > 0 ? (
                                filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-inidigo-600">{quote.quoteNumber}</p>
                                                <p className="text-xs text-slate-500">{quote.name}</p>
                                            </div>
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
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(quote.status)}`}>
                                                {getStatusIcon(quote.status)}
                                                {quote.status}
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        {loading ? 'Cargando ofertas...' : 'No se encontraron ofertas. Crea una nueva para comenzar.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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

                            <form onSubmit={handleCreateQuote} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Título de la Oferta</label>
                                        <input className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: Renovación de Licencias 2026" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Cliente (Cuenta)</label>
                                        <select className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option>Seleccionar Cliente...</option>
                                            {/* Simulate accounts */}
                                            <option>TechCorp Solutions</option>
                                            <option>Global Industries</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Validez Hasta</label>
                                        <input type="date" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>

                                    {/* Items Section Placeholder */}
                                    <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed text-center">
                                        <p className="text-sm text-slate-500 mb-2">Detalle de Productos</p>
                                        <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1">
                                            <Plus className="w-4 h-4" /> Agregar Producto
                                        </button>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Notas / Términos</label>
                                        <textarea rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Condiciones de pago, entrega, etc..." />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
                                        Crear Oferta
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

function Building2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    )
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 18 18" />
        </svg>
    )
}
