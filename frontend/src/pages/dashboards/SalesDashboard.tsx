import { useState, useEffect } from 'react';
import { BarChart3, Building2, TrendingUp, Activity, X, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RevenueChart, PipelineChart, PerformanceChart, ActivityChart } from '../../components/Charts';
import { staggerContainer, fadeIn, slideUp, scaleIn } from '../../lib/animations';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import ForecastSection from '../../components/dashboard/ForecastSection';
import KpiDrilldownModal from '../../components/dashboard/KpiDrilldownModal';
import MyDaySection from '../../components/dashboard/MyDaySection';

type KpiType = 'revenue' | 'pipeline' | 'conversion' | 'activities';

export default function SalesDashboard() {
    const scopeLevel = useAuthStore(s => s.user?.scopeLevel);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [selectedChart, setSelectedChart] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [drilldownOpen, setDrilldownOpen] = useState(false);
    const [drilldownType, setDrilldownType] = useState<KpiType>('revenue');

    useEffect(() => {
        api.get('/dashboard/stats')
            .then(res => { if (res.data) setStats(res.data); })
            .catch(err => console.error('Error al obtener estadísticas del panel', err));
    }, []);

    const handleChartClick = (chartInfo: any) => {
        setSelectedChart(chartInfo?.type || 'Gráfico');
        setFilterModalOpen(true);
    };

    const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const handleKpiClick = (type: KpiType) => {
        setDrilldownType(type);
        setDrilldownOpen(true);
    };

    const kpis = stats ? [
        { title: 'Ingresos (Mes)', value: fmt(stats.revenue?.mtd || 0), trend: stats.revenue?.trend || '', color: 'indigo', icon: TrendingUp, kpiKey: 'revenue' as KpiType },
        { title: 'Cartera Abierta', value: `${stats.pipeline?.deals || 0} Ofertas`, trend: `${stats.pipeline?.value || 0} Órdenes abiertas`, color: 'blue', icon: Building2, kpiKey: 'pipeline' as KpiType },
        { title: 'Proporción', value: `${stats.winRate?.percentage || 0}%`, trend: stats.winRate?.trend || '', color: 'emerald', icon: BarChart3, kpiKey: 'conversion' as KpiType },
        { title: 'Actividades', value: `${stats.activities?.today || 0}`, trend: `${stats.activities?.thisWeek || 0} esta semana`, color: 'fuchsia', icon: Activity, kpiKey: 'activities' as KpiType },
    ] : [
        { title: 'Ingresos (Mes)', value: '--', trend: 'Cargando...', color: 'indigo', icon: TrendingUp, kpiKey: 'revenue' as KpiType },
        { title: 'Cartera Abierta', value: '--', trend: 'Cargando...', color: 'blue', icon: Building2, kpiKey: 'pipeline' as KpiType },
        { title: 'Proporción', value: '--%', trend: 'Cargando...', color: 'emerald', icon: BarChart3, kpiKey: 'conversion' as KpiType },
        { title: 'Actividades', value: '--', trend: 'Cargando...', color: 'fuchsia', icon: Activity, kpiKey: 'activities' as KpiType },
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
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">País / Compañía</label>
                                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 text-sm font-medium">
                                        <option>Todos los Países</option>
                                        <option value="CR">Costa Rica</option>
                                        <option value="GT">Guatemala</option>
                                        <option value="SV">El Salvador</option>
                                        <option value="HN">Honduras</option>
                                        <option value="PA">Panamá</option>
                                    </select>
                                </div>
                                <p className="text-xs text-slate-400">Los datos se actualizan según la compañía seleccionada en el sidebar.</p>
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
                <button
                    onClick={() => window.print()}
                    className="bg-white/50 backdrop-blur-sm text-indigo-600 border border-indigo-100/50 px-5 py-2.5 rounded-xl font-bold hover:bg-white hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Exportar Reporte
                </button>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        variants={slideUp}
                        onClick={() => stats && handleKpiClick(kpi.kpiKey)}
                        className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-xl shadow-slate-200/50 flex items-start justify-between hover:transform hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                    >
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{kpi.title}</p>
                            <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight">{kpi.value}</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.trend.includes('+') ? 'bg-emerald-100/50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {kpi.trend}
                                </span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">Clic para ver detalle</span>
                        </div>
                        <div className={`p-4 rounded-2xl ${getColorClasses(kpi.color)} shadow-sm`}>
                            <kpi.icon className="w-6 h-6" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* KPI Drilldown Modal */}
            <KpiDrilldownModal
                open={drilldownOpen}
                onClose={() => setDrilldownOpen(false)}
                kpiType={drilldownType}
                drilldown={stats?.drilldown || null}
            />

            {/* Mi Día — Resumen accionable */}
            <MyDaySection />

            {/* Forecast Section */}
            <ForecastSection />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard
                    title="Embudo de Ventas"
                    subtitle="Conversión por etapa"
                    onClick={() => handleChartClick({ type: 'Pipeline' })}
                >
                    <PipelineChart data={stats?.charts?.pipeline} onChartClick={(d) => handleChartClick({ ...d, type: 'Pipeline' })} />
                </ChartCard>

                <ChartCard
                    title="Ingresos vs Objetivo"
                    subtitle="Rendimiento mensual vs meta"
                    onClick={() => handleChartClick({ type: 'Revenue' })}
                >
                    <RevenueChart data={stats?.charts?.revenue} onChartClick={(d) => handleChartClick({ ...d, type: 'Revenue' })} />
                </ChartCard>

                <ChartCard
                    title="Actividad del Equipo"
                    subtitle="Llamadas y reuniones (Última semana)"
                    onClick={() => handleChartClick({ type: 'Actividad' })}
                >
                    <ActivityChart data={stats?.charts?.activity} onChartClick={(d) => handleChartClick({ ...d, type: 'Actividad' })} />
                </ChartCard>

                {scopeLevel !== 'OWN' && (
                    <ChartCard
                        title="Mejores Vendedores"
                        subtitle="Líderes en ingresos generados"
                        onClick={() => handleChartClick({ type: 'Performance' })}
                    >
                        <PerformanceChart data={stats?.charts?.topSellers} onChartClick={(d) => handleChartClick({ ...d, type: 'Performance' })} />
                    </ChartCard>
                )}
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
                    Doble clic para filtrar
                </span>
            </div>
            <div className="chart-container">
                {children}
            </div>
        </motion.div>
    );
}

