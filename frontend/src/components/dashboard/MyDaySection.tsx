import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, Phone, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '../../lib/animations';
import api from '../../lib/api';

interface OverdueInvoice {
    docEntry: number;
    docNum: number;
    client: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
}

interface ExpiringQuote {
    docEntry: number;
    docNum: number;
    client: string;
    amount: number;
    dueDate: string;
    daysLeft: number;
}

interface TodayActivity {
    id: number;
    subject: string;
    client: string;
    type: string;
    time: string;
    status: string;
}

interface MyDayData {
    overdueInvoices: OverdueInvoice[];
    expiringQuotes: ExpiringQuote[];
    todayActivities: TodayActivity[];
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function MyDaySection() {
    const navigate = useNavigate();
    const [data, setData] = useState<MyDayData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/my-day')
            .then(res => { if (res.data) setData(res.data); })
            .catch(err => console.error('Error cargando Mi Día', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/70 rounded-2xl border border-slate-200/50 p-5 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                        <div className="space-y-3">
                            <div className="h-3 bg-slate-100 rounded" />
                            <div className="h-3 bg-slate-100 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const { overdueInvoices, expiringQuotes, todayActivities } = data;
    const hasContent = overdueInvoices.length > 0 || expiringQuotes.length > 0 || todayActivities.length > 0;

    if (!hasContent) return null;

    const typeIcon = (type: string) => {
        if (type === 'Llamada') return <Phone className="w-3.5 h-3.5" />;
        return <FileText className="w-3.5 h-3.5" />;
    };

    return (
        <motion.div variants={fadeIn} className="space-y-3">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">Mi Día</h3>
                <span className="text-xs font-medium text-slate-400">
                    {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Facturas Vencidas */}
                {overdueInvoices.length > 0 && (
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-red-100/50 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-red-50/50 border-b border-red-100/50 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-bold text-red-700">Cobros Pendientes</span>
                            <span className="ml-auto text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">{overdueInvoices.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {overdueInvoices.slice(0, 5).map((inv) => (
                                <div
                                    key={inv.docEntry}
                                    className="px-4 py-2.5 hover:bg-red-50/30 cursor-pointer group flex items-center gap-3 transition-colors"
                                    onClick={() => navigate(`/invoices/${inv.docEntry}`)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-800 truncate">{inv.client}</div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="font-bold text-red-600">{fmt(inv.amount)}</span>
                                            <span className="text-red-400">{inv.daysOverdue}d vencida</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-red-400 transition-colors" />
                                </div>
                            ))}
                        </div>
                        {overdueInvoices.length > 5 && (
                            <div className="px-4 py-2.5 border-t border-red-100/50 bg-red-50/30 flex items-center justify-between">
                                <span className="text-xs font-semibold text-red-600">
                                    Total pendiente: {fmt(overdueInvoices.reduce((s, i) => s + i.amount, 0))}
                                </span>
                                <button
                                    onClick={() => navigate('/invoices')}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                                >
                                    Ver todas ({overdueInvoices.length}) <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Cotizaciones por Vencer */}
                {expiringQuotes.length > 0 && (
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-amber-100/50 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-amber-50/50 border-b border-amber-100/50 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-bold text-amber-700">Ofertas por Vencer</span>
                            <span className="ml-auto text-xs font-bold text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full">{expiringQuotes.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {expiringQuotes.map((q) => (
                                <div
                                    key={q.docEntry}
                                    className="px-4 py-2.5 hover:bg-amber-50/30 cursor-pointer group flex items-center gap-3 transition-colors"
                                    onClick={() => navigate(`/quotes/${q.docEntry}`)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-800 truncate">{q.client}</div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="font-bold text-amber-600">{fmt(q.amount)}</span>
                                            <span className="text-amber-400">{q.daysLeft === 0 ? 'Vence hoy' : `${q.daysLeft}d restantes`}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-400 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actividades de Hoy */}
                {todayActivities.length > 0 && (
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-blue-100/50 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 bg-blue-50/50 border-b border-blue-100/50 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-bold text-blue-700">Agenda de Hoy</span>
                            <span className="ml-auto text-xs font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">{todayActivities.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {todayActivities.map((act, i) => (
                                <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${act.status === 'Completada' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {typeIcon(act.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-semibold truncate ${act.status === 'Completada' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{act.subject}</div>
                                        <div className="text-xs text-slate-500 truncate">{act.client}{act.time ? ` · ${act.time}` : ''}</div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${act.status === 'Completada' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {act.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
