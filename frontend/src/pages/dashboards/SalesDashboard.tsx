import { useState } from 'react';
import { BarChart3, Building2, TrendingUp, Activity, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RevenueChart, PipelineChart, PerformanceChart, ActivityChart } from '../../components/Charts';
import { staggerContainer, fadeIn, slideUp, scaleIn } from '../../lib/animations';

export default function SalesDashboard() {
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [selectedChart, setSelectedChart] = useState<string | null>(null);

    const handleChartClick = (chartInfo: any) => {
        console.log("Chart clicked:", chartInfo);
        setSelectedChart(chartInfo?.type || 'Gráfico');
        setFilterModalOpen(true);
    };

    // Mock Data - In real app, fetch from API
    const kpis = [
        { title: 'Revenue (MTD)', value: '$85,250', trend: '+12% vs last month', color: 'indigo', icon: TrendingUp },
        { title: 'Pipeline Value', value: '$450,000', trend: '1 Active Deals', color: 'blue', icon: Building2 },
        { title: 'Win Rate', value: '42%', trend: '+5% vs avg', color: 'emerald', icon: BarChart3 },
        { title: 'Actividades', value: '64', trend: '12 Hoy', color: 'fuchsia', icon: Activity },
    ];

    const getColorClasses = (color: string) => {
        const classes: Record<string, string> = {
            indigo: 'bg-indigo-50/50 text-indigo-600',
            blue: 'bg-blue-50/50 text-blue-600',
            emerald: 'bg-emerald-50/50 text-emerald-600',
            fuchsia: 'bg-fuchsia-50/50 text-fuchsia-600',
        };
        return classes[color] || 'bg-slate-50 text-slate-600';
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Filter Modal */}
            <AnimatePresence>
                {filterModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                        onClick={() => setFilterModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100/50 flex justify-between items-center bg-indigo-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-100/50 rounded-xl text-indigo-600 shadow-sm">
                                        <Filter className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">Filtrar: {selectedChart}</h3>
                                        <p className="text-sm text-slate-500">Ajustar visualización de datos</p>
                                    </div>
                                </div>
                                <button onClick={() => setFilterModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Rango de Fecha</label>
                                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 text-sm font-medium">
                                        <option>Este Mes</option>
                                        <option>Último Trimestre</option>
                                        <option>Año Actual</option>
                                        <option>Personalizado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Vendedor / Equipo</label>
                                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 text-sm font-medium">
                                        <option>Todos</option>
                                        <option>Equipo Alpha</option>
                                        <option>Equipo Beta</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100/50 bg-slate-50/50 flex justify-end gap-3">
                                <button onClick={() => setFilterModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors">
                                    Cancelar
                                </button>
                                <button onClick={() => setFilterModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                                    Aplicar Filtros
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Dashboard Comercial
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">LIVE</span>
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">Visión general del rendimiento y proyecciones</p>
                </div>
                <button className="bg-white/50 backdrop-blur-sm text-indigo-600 border border-indigo-100/50 px-5 py-2.5 rounded-xl font-bold hover:bg-white hover:shadow-md transition-all active:scale-95 flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4" /> Exportar Reporte
                </button>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        variants={slideUp}
                        className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl shadow-slate-200/50 flex items-start justify-between hover:transform hover:scale-[1.02] transition-all duration-300"
                    >
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{kpi.title}</p>
                            <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight">{kpi.value}</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.trend.includes('+') ? 'bg-emerald-100/50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {kpi.trend}
                                </span>
                            </div>
                        </div>
                        <div className={`p-4 rounded-2xl ${getColorClasses(kpi.color)} shadow-sm`}>
                            <kpi.icon className="w-6 h-6" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard
                    title="Pipeline Funnel"
                    subtitle="Conversión por etapa"
                    onClick={() => handleChartClick({ type: 'Pipeline' })}
                >
                    <PipelineChart onChartClick={(d) => handleChartClick({ ...d, type: 'Pipeline' })} />
                </ChartCard>

                <ChartCard
                    title="Revenue vs Objetivo"
                    subtitle="Rendimiento mensual vs meta"
                    onClick={() => handleChartClick({ type: 'Revenue' })}
                >
                    <RevenueChart onChartClick={(d) => handleChartClick({ ...d, type: 'Revenue' })} />
                </ChartCard>

                <ChartCard
                    title="Actividad del Equipo"
                    subtitle="Llamadas y reuniones (Última semana)"
                    onClick={() => handleChartClick({ type: 'Actividad' })}
                >
                    <ActivityChart onChartClick={(d) => handleChartClick({ ...d, type: 'Actividad' })} />
                </ChartCard>

                <ChartCard
                    title="Top Performers"
                    subtitle="Líderes en ingresos generados"
                    onClick={() => handleChartClick({ type: 'Performance' })}
                >
                    <PerformanceChart onChartClick={(d) => handleChartClick({ ...d, type: 'Performance' })} />
                </ChartCard>
            </div>
        </motion.div>
    );
}

// Sub-component for Charts
function ChartCard({ title, subtitle, children, onClick }: { title: string, subtitle: string, children: React.ReactNode, onClick: () => void }) {
    return (
        <motion.div
            variants={scaleIn}
            className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl shadow-slate-200/50 group hover:bg-white/80 transition-all cursor-pointer relative overflow-hidden"
            onDoubleClick={onClick}
        >
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h4 className="text-xl font-bold text-slate-800">{title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                </div>
                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    Doble click para filtrar
                </span>
            </div>
            <div className="chart-container">
                {children}
            </div>
        </motion.div>
    );
}

function DownloadIcon(props: any) {
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
    )
}
