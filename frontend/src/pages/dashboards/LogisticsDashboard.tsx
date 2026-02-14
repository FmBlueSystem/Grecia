import { Package, Truck, Clock, AlertTriangle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { staggerContainer, fadeIn, slideUp, scaleIn } from '../../lib/animations';

const logisticsData = [
    { stage: 'Processing', count: 12 },
    { stage: 'Billed', count: 8 },
    { stage: 'Port Dispatch', count: 5 },
    { stage: 'Port Arrival', count: 3 },
    { stage: 'Delivered', count: 45 },
];

export default function LogisticsDashboard() {
    const kpis = [
        { title: 'Pedidos en Tránsito', value: '16', sub: 'Activos actualmente', color: 'blue', icon: Truck },
        { title: 'Tiempo Promedio Entrega', value: '14 Días', sub: '-2 días vs mes pasado', color: 'emerald', icon: Clock },
        { title: 'Pedidos en Puerto', value: '3', sub: 'Esperando Aduana', color: 'indigo', icon: MapPin },
        { title: 'Alertas / Retrasos', value: '2', sub: 'Requieren atención', color: 'orange', icon: AlertTriangle },
    ];

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            <motion.div variants={fadeIn} className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">Operaciones Logísticas</h3>
                    <p className="text-slate-500">Rastreo de envíos y eficiencia operativa</p>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <motion.div key={idx} variants={slideUp} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{kpi.title}</p>
                            <h4 className="text-2xl font-bold text-slate-900">{kpi.value}</h4>
                            <p className={`text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded-full ${kpi.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>{kpi.sub}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                            <kpi.icon className="w-6 h-6" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={scaleIn} className="col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-6">Volumen de Pedidos por Etapa</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={logisticsData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="stage" stroke="#64748B" axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748B" axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4">Pedidos con Retraso</h4>
                    <div className="space-y-4">
                        {[
                            { id: 'ORD-9921', client: 'Distribuidora Central', days: 5, stage: 'Aduana' },
                            { id: 'ORD-9945', client: 'Supermercados El Rey', days: 3, stage: 'Procesando' },
                        ].map((order, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{order.id}</p>
                                    <p className="text-xs text-slate-500">{order.client}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-orange-600 text-sm">+{order.days} días</p>
                                    <p className="text-xs text-orange-400">{order.stage}</p>
                                </div>
                            </div>
                        ))}
                        <div className="text-center pt-2">
                            <button className="text-sm font-bold text-indigo-600 hover:underline">Ver todos los retrasos</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
