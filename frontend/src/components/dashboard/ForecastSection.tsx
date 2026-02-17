import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { slideUp } from '../../lib/animations';
import api from '../../lib/api';

interface ForecastSummary {
    totalPipeline: number;
    weightedPipeline: number;
    avgDealSize: number;
    avgCloseTime: number;
    winRate: number;
    dealsInPipeline: number;
}

interface StageData {
    stage: string;
    count: number;
    value: number;
    weighted: number;
}

interface MonthData {
    month: string;
    deals: number;
    value: number;
    weighted: number;
}

interface ForecastData {
    summary: ForecastSummary;
    byStage: StageData[];
    byMonth: MonthData[];
    recentWins: { name: string; amount: number; accountName: string; closedAt: string }[];
    recentLosses: { name: string; amount: number; accountName: string; reason: string }[];
}

const STAGE_LABELS: Record<string, string> = {
    OPPORTUNITY: 'Oportunidad',
    PROPOSAL: 'Propuesta',
    FOLLOW_UP: 'Seguimiento',
    NEGOTIATION: 'Negociacion',
    CLOSED_WON: 'Ganada',
    CLOSED_LOST: 'Perdida',
};

const MONTH_LABELS: Record<string, string> = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

function fmt(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function ForecastSection() {
    const [data, setData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/forecast')
            .then(res => setData(res.data))
            .catch(err => console.error('Error fetching forecast:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="w-6 h-6 text-indigo-600" />
                    Proyección de Ventas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
                            <div className="h-8 bg-slate-200 rounded w-32" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { summary, byStage, byMonth } = data;

    // P0: No mostrar sección si no hay datos reales de Opportunity
    if (summary.dealsInPipeline === 0 && summary.totalPipeline === 0 && summary.winRate === 0) return null;

    const forecastKpis = [
        { label: 'Cartera Total', value: fmt(summary.totalPipeline), icon: DollarSign, color: 'blue', sub: `${summary.dealsInPipeline} negocios` },
        { label: 'Cartera Ponderada', value: fmt(summary.weightedPipeline), icon: Target, color: 'indigo', sub: 'Ponderado' },
        { label: 'Tasa de Cierre', value: `${summary.winRate}%`, icon: Award, color: 'emerald', sub: 'Histórico' },
        { label: 'Negocio Promedio', value: fmt(summary.avgDealSize), icon: BarChart3, color: 'teal', sub: `~${summary.avgCloseTime}d cierre` },
    ];

    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50/50 text-blue-600',
        indigo: 'bg-indigo-50/50 text-indigo-600',
        emerald: 'bg-emerald-50/50 text-emerald-600',
        teal: 'bg-teal-50/50 text-teal-600',
    };

    const chartData = byMonth.map(m => ({
        name: `${MONTH_LABELS[m.month.slice(5)] || m.month.slice(5)} ${m.month.slice(2, 4)}`,
        total: m.value,
        ponderado: m.weighted,
        deals: m.deals,
    }));

    return (
        <div className="space-y-6">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="w-6 h-6 text-indigo-600" />
                    Proyección de Ventas
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Datos en vivo
                </span>
            </div>

            {/* Forecast KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {forecastKpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        variants={slideUp}
                        className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-lg flex items-start justify-between hover:scale-[1.02] transition-transform"
                    >
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{kpi.label}</p>
                            <h4 className="text-2xl font-extrabold text-slate-800">{kpi.value}</h4>
                            <span className="text-[10px] font-medium text-slate-400 mt-1">{kpi.sub}</span>
                        </div>
                        <div className={`p-3 rounded-xl ${colorMap[kpi.color]} shadow-sm`}>
                            <kpi.icon className="w-5 h-5" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Chart + Table row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Forecast Chart */}
                <motion.div
                    variants={slideUp}
                    className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg"
                >
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Proyeccion por Mes</h4>
                    <p className="text-sm text-slate-500 mb-4">Cartera total vs ponderada por fecha de cierre</p>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartData} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                                <Tooltip
                                    formatter={(value: number, name: string) => [fmt(value), name === 'total' ? 'Total' : 'Ponderado']}
                                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                                />
                                <Legend formatter={v => v === 'total' ? 'Total' : 'Ponderado'} />
                                <Bar dataKey="total" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="ponderado" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">
                            Sin datos de proyeccion
                        </div>
                    )}
                </motion.div>

                {/* Pipeline by Stage Table */}
                <motion.div
                    variants={slideUp}
                    className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg"
                >
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Cartera por Etapa</h4>
                    <p className="text-sm text-slate-500 mb-4">Desglose de oportunidades abiertas</p>
                    {byStage.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Etapa</th>
                                        <th className="text-right py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Negocios</th>
                                        <th className="text-right py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                                        <th className="text-right py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ponderado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {byStage.map((s, idx) => (
                                        <tr key={s.stage} className={idx % 2 === 0 ? 'bg-slate-50/30' : ''}>
                                            <td className="py-2.5 px-3 font-medium text-slate-700">
                                                {STAGE_LABELS[s.stage] || s.stage}
                                            </td>
                                            <td className="py-2.5 px-3 text-right text-slate-600">{s.count}</td>
                                            <td className="py-2.5 px-3 text-right text-slate-600">{fmt(s.value)}</td>
                                            <td className="py-2.5 px-3 text-right font-semibold text-indigo-600">{fmt(s.weighted)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-slate-200 font-bold">
                                        <td className="py-2.5 px-3 text-slate-800">Total</td>
                                        <td className="py-2.5 px-3 text-right text-slate-800">{byStage.reduce((s, r) => s + r.count, 0)}</td>
                                        <td className="py-2.5 px-3 text-right text-slate-800">{fmt(byStage.reduce((s, r) => s + r.value, 0))}</td>
                                        <td className="py-2.5 px-3 text-right text-indigo-700">{fmt(byStage.reduce((s, r) => s + r.weighted, 0))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
                            Sin oportunidades en pipeline
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Wins & Losses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Wins */}
                <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                    <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        Ganadas Recientes
                    </h4>
                    {data.recentWins.length > 0 ? (
                        <div className="space-y-2">
                            {data.recentWins.map((w, i) => (
                                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-emerald-50/30 transition-colors">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{w.name}</p>
                                        <p className="text-xs text-slate-400">{w.accountName}</p>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-600">{fmt(w.amount)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 py-4 text-center">Sin datos</p>
                    )}
                </motion.div>

                {/* Recent Losses */}
                <motion.div variants={slideUp} className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg">
                    <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400" />
                        Perdidas Recientes
                    </h4>
                    {data.recentLosses.length > 0 ? (
                        <div className="space-y-2">
                            {data.recentLosses.map((l, i) => (
                                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-red-50/30 transition-colors">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{l.name}</p>
                                        <p className="text-xs text-slate-400">{l.accountName}</p>
                                    </div>
                                    <span className="text-sm font-bold text-red-500">{fmt(l.amount)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 py-4 text-center">Sin datos</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
