import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SalesDashboard from './dashboards/SalesDashboard';
import LogisticsDashboard from './dashboards/LogisticsDashboard';
import ServiceDashboard from './dashboards/ServiceDashboard';

export default function Dashboard() {
    const [activeView, setActiveView] = useState<'sales' | 'logistics' | 'service'>('sales');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 tracking-tight">Dashboard Ejecutivo</h2>
                    <p className="text-slate-500 mt-2 text-lg">Visión unificada del negocio.</p>
                </div>

                {/* View Switcher */}
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                    <button
                        onClick={() => setActiveView('sales')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'sales' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        Ventas
                    </button>
                    <button
                        onClick={() => setActiveView('logistics')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'logistics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        Logística
                    </button>
                    <button
                        onClick={() => setActiveView('service')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'service' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        Servicio
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeView === 'sales' && <SalesDashboard />}
                    {activeView === 'logistics' && <LogisticsDashboard />}
                    {activeView === 'service' && <ServiceDashboard />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
