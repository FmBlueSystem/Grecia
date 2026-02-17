import { useState, useEffect } from 'react';
import { Truck, Package, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn } from '../../lib/animations';
import api from '../../lib/api';

interface Order {
  id: string;
  sapDocNum: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  account: { name: string };
  owner: { firstName: string; lastName: string };
  createdAt: string;
}

export default function LogisticsDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders?top=100&filter=' + encodeURIComponent("DocumentStatus eq 'bost_Open'"))
            .then(r => setOrders(r.data?.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                <span className="ml-3 text-slate-500">Cargando logistica...</span>
            </div>
        );
    }

    const now = new Date();
    const openOrders = orders.filter(o => o.status === 'Abierta' || o.status === 'OPEN');
    const overdueOrders = orders.filter(o => o.dueDate && new Date(o.dueDate) < now);
    const totalValue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-brand">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Ordenes Abiertas</p>
                            <h3 className="text-2xl font-bold text-slate-900">{openOrders.length}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Atrasadas</p>
                            <h3 className="text-2xl font-bold text-red-600">{overdueOrders.length}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Valor Total Pendiente</p>
                            <h3 className="text-2xl font-bold text-slate-900">${Math.round(totalValue).toLocaleString()}</h3>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={scaleIn} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Entrega Promedio</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {orders.length > 0
                                    ? `${Math.round(orders.reduce((s, o) => s + Math.max(0, (new Date(o.dueDate).getTime() - new Date(o.createdAt).getTime()) / 86400000), 0) / orders.length)}d`
                                    : 'N/A'
                                }
                            </h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">Ordenes Pendientes de Entrega</h3>
                    <span className="text-sm text-slate-400">{orders.length} ordenes</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-600"># SAP</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Cliente</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Vendedor</th>
                                <th className="px-6 py-3 font-bold text-slate-600 text-right">Monto</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Fecha Entrega</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.length > 0 ? orders.map(o => {
                                const isOverdue = o.dueDate && new Date(o.dueDate) < now;
                                return (
                                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-bold text-brand">{o.sapDocNum}</td>
                                        <td className="px-6 py-3 font-medium text-slate-900">{o.account?.name || '-'}</td>
                                        <td className="px-6 py-3 text-slate-600">{o.owner?.firstName} {o.owner?.lastName}</td>
                                        <td className="px-6 py-3 text-right font-semibold">${(o.totalAmount || 0).toLocaleString()}</td>
                                        <td className="px-6 py-3">
                                            <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}>
                                                {o.dueDate ? new Date(o.dueDate).toLocaleDateString() : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            {isOverdue ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700">
                                                    <AlertTriangle className="w-3 h-3" /> Atrasada
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                                                    <Clock className="w-3 h-3" /> Pendiente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No hay ordenes abiertas pendientes de entrega
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
