import { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle, Clock, AlertOctagon, MoreHorizontal, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn } from '../../lib/animations';
import { DashboardSkeleton } from '../../components';

interface Case {
    id: string;
    caseNumber: string;
    title: string;
    description?: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    origin?: 'PHONE' | 'EMAIL' | 'WEB';
    account?: { name: string };
    contact?: { firstName: string; lastName: string };
    owner: { firstName: string; lastName: string };
    createdAt: string;
}

const PRIORITY_COLORS = {
    LOW: 'bg-emerald-100 text-emerald-700',
    NORMAL: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700'
};

const STATUS_LABELS: Record<string, string> = {
    NEW: 'Nuevo',
    IN_PROGRESS: 'En Progreso',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado'
};

export default function ServiceDashboard() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ open: 0, critical: 0, avgTime: '4h 12m' });

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/cases');
            const json = await res.json();
            if (json.data) {
                setCases(json.data);
                // Calculate basic stats for MVP
                const open = json.data.filter((c: Case) => c.status !== 'CLOSED' && c.status !== 'RESOLVED').length;
                const critical = json.data.filter((c: Case) => c.priority === 'CRITICAL').length;
                setStats(prev => ({ ...prev, open, critical }));
            }
        } catch (err) {
            console.error("Failed to fetch cases", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <LifeBuoy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Casos Abiertos</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.open}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                            <AlertOctagon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Casos Críticos</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.critical}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Tiempo Solución (Prom)</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.avgTime}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">SLA Cumplido</p>
                            <h3 className="text-2xl font-bold text-slate-900">98%</h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Cases List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">Casos Recientes</h3>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Ver Todo</button>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400">Cargando casos...</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {cases.map(c => (
                            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'NEW' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-400">#{c.caseNumber}</span>
                                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.title}</h4>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${PRIORITY_COLORS[c.priority]}`}>{c.priority}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-1 mb-1">{c.description || 'Sin descripción'}</p>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                            {c.account && <span className="flex items-center gap-1"><LifeBuoy className="w-3 h-3" /> {c.account.name}</span>}
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {c.origin || 'WEB'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-500 mb-1">Estado</div>
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">{STATUS_LABELS[c.status] || c.status}</span>
                                    </div>
                                    <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {cases.length === 0 && (
                            <div className="p-12 text-center text-slate-400">
                                No hay casos registrados recientemente.
                            </div>
                        )}
                    </div>
                )}
            </div>
                </>
            )}
        </div>
    );
}
