import { useState, useEffect } from 'react';
import { BarChart3, Building2, TrendingUp, Activity, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const isOwn = scopeLevel === 'OWN';
    const [stats, setStats] = useState<any>(null);
    const [drilldownOpen, setDrilldownOpen] = useState(false);
    const [drilldownType, setDrilldownType] = useState<KpiType>('revenue');
    const [filterMonths, setFilterMonths] = useState(6);

    const fetchStats = (months: number) => {
        setStats(null);
        api.get(`/dashboard/stats?months=${months}`)
            .then(res => { if (res.data) setStats(res.data); })
            .catch(err => console.error('Error al obtener estadísticas del panel', err));
    };

    useEffect(() => {
        fetchStats(filterMonths);
    }, [filterMonths]);

    const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const handleKpiClick = (type: KpiType) => {
        setDrilldownType(type);
        setDrilldownOpen(true);
    };

    const kpis = stats ? [
        { title: isOwn ? 'Mis Ingresos (Mes)' : 'Ingresos (Mes)', value: fmt(stats.revenue?.mtd || 0), trend: stats.revenue?.trend || '', color: 'indigo', icon: TrendingUp, kpiKey: 'revenue' as KpiType },
        { title: isOwn ? 'Mis Ofertas Abiertas' : 'Cartera Abierta', value: `${stats.pipeline?.deals || 0} Ofertas`, trend: `${stats.pipeline?.value || 0} Órdenes abiertas`, color: 'blue', icon: Building2, kpiKey: 'pipeline' as KpiType },
        { title: isOwn ? 'Mi Proporción' : 'Proporción', value: `${stats.winRate?.percentage || 0}%`, trend: stats.winRate?.trend || '', color: 'emerald', icon: BarChart3, kpiKey: 'conversion' as KpiType },
        { title: isOwn ? 'Mis Actividades' : 'Actividades', value: `${stats.activities?.today || 0}`, trend: `${stats.activities?.thisWeek || 0} esta semana`, color: 'teal', icon: Activity, kpiKey: 'activities' as KpiType },
    ] : [
        { title: isOwn ? 'Mis Ingresos (Mes)' : 'Ingresos (Mes)', value: '--', trend: 'Cargando...', color: 'indigo', icon: TrendingUp, kpiKey: 'revenue' as KpiType },
        { title: isOwn ? 'Mis Ofertas Abiertas' : 'Cartera Abierta', value: '--', trend: 'Cargando...', color: 'blue', icon: Building2, kpiKey: 'pipeline' as KpiType },
        { title: isOwn ? 'Mi Proporción' : 'Proporción', value: '--%', trend: 'Cargando...', color: 'emerald', icon: BarChart3, kpiKey: 'conversion' as KpiType },
        { title: isOwn ? 'Mis Actividades' : 'Actividades', value: '--', trend: 'Cargando...', color: 'teal', icon: Activity, kpiKey: 'activities' as KpiType },
    ];

    const getColorClasses = (color: string) => {
        const classes: Record<string, string> = {
            indigo: 'bg-indigo-50/50 text-indigo-600',
            blue: 'bg-blue-50/50 text-blue-600',
            emerald: 'bg-emerald-50/50 text-emerald-600',
            teal: 'bg-teal-50/50 text-teal-600',
        };
        return classes[color] || 'bg-slate-50 text-slate-600';
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <motion.div variants={fadeIn} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        {isOwn ? 'Mi Dashboard' : 'Dashboard Comercial'}
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">LIVE</span>
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        {isOwn ? 'Tu rendimiento personal y pendientes del día' : 'Visión general del rendimiento y proyecciones'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-1">
                        {[
                            { value: 1, label: '1M' },
                            { value: 3, label: '3M' },
                            { value: 6, label: '6M' },
                            { value: 12, label: '1A' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFilterMonths(opt.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterMonths === opt.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {isOwn && (
                        <button
                            onClick={() => navigate('/quotes')}
                            className="bg-white/50 backdrop-blur-sm text-brand border border-brand/20 px-5 py-2.5 rounded-xl font-bold hover:bg-brand/5 hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" /> Mis Ofertas
                        </button>
                    )}
                    <button
                        onClick={() => window.print()}
                        className="bg-white/50 backdrop-blur-sm text-indigo-600 border border-indigo-100/50 px-5 py-2.5 rounded-xl font-bold hover:bg-white hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Exportar
                    </button>
                </div>
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

            {/* Mi Día — Resumen accionable (prioridad para vendedores) */}
            <MyDaySection />

            {/* Forecast Section */}
            <ForecastSection />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard
                    title={isOwn ? 'Mi Embudo' : 'Embudo de Ventas'}
                    subtitle={isOwn ? 'Ofertas y órdenes abiertas' : 'Conversión por etapa'}
                >
                    <PipelineChart data={stats?.charts?.pipeline} />
                </ChartCard>

                <ChartCard
                    title={isOwn ? 'Mis Ingresos vs Objetivo' : 'Ingresos vs Objetivo'}
                    subtitle={isOwn ? 'Tu rendimiento mensual vs meta' : 'Rendimiento mensual vs meta'}
                >
                    <RevenueChart data={stats?.charts?.revenue} />
                </ChartCard>

                <ChartCard
                    title={isOwn ? 'Mi Actividad' : 'Actividad del Equipo'}
                    subtitle={isOwn ? 'Tus llamadas y reuniones (esta semana)' : 'Llamadas y reuniones (Última semana)'}
                >
                    <ActivityChart data={stats?.charts?.activity} />
                </ChartCard>

                {scopeLevel !== 'OWN' && (
                    <ChartCard
                        title="Mejores Vendedores"
                        subtitle="Líderes en ingresos generados"
                    >
                        <PerformanceChart data={stats?.charts?.topSellers} />
                    </ChartCard>
                )}
            </div>
        </motion.div>
    );
}

// Sub-component for Charts
function ChartCard({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
    return (
        <motion.div
            variants={scaleIn}
            className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl shadow-slate-200/50 hover:bg-white/80 transition-all relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h4 className="text-xl font-bold text-slate-800">{title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                </div>
            </div>
            <div className="chart-container">
                {children}
            </div>
        </motion.div>
    );
}

