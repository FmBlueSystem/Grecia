import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Search } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    account: { name: string };
    totalAmount: number;
    status: string;
    logisticsStatus: string; // 'PROCESSING', 'BILLED', 'PORT_DISPATCH', 'PORT_ARRIVAL', 'DELIVERED'
    trackingNumber?: string;
    createdAt: string;
}

const LOGISTICS_STEPS = [
    { key: 'PROCESSING', label: 'Procesando', icon: Clock },
    { key: 'BILLED', label: 'Facturado', icon: CheckCircle },
    { key: 'PORT_DISPATCH', label: 'Salió Puerto', icon: Package },
    { key: 'PORT_ARRIVAL', label: 'Llegó Puerto', icon: MapPin },
    { key: 'DELIVERED', label: 'Entregado', icon: Truck },
];

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/api/orders')
            .then(res => res.json())
            .then(data => {
                if (data.data) setOrders(data.data);
                setLoading(false);
            });
    }, []);

    const getStepStatus = (current: string, stepKey: string) => {
        const ids = LOGISTICS_STEPS.map(s => s.key);
        const currentIndex = ids.indexOf(current);
        const stepIndex = ids.indexOf(stepKey);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Pedidos y Logística</h2>
                    <p className="text-slate-500 mt-1">Rastreo de envíos y estado de órdenes</p>
                </div>
                <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                    <input placeholder="Buscar pedido..." className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{order.orderNumber}</h3>
                                <p className="text-slate-500 text-sm">{order.account.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-indigo-600">${order.totalAmount.toLocaleString()}</p>
                                <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Logistics Stepper */}
                        <div className="relative">
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 -z-10"></div>
                            <div className="flex justify-between">
                                {LOGISTICS_STEPS.map((step) => {
                                    const status = getStepStatus(order.logisticsStatus, step.key);
                                    return (
                                        <div key={step.key} className="flex flex-col items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${status === 'completed' ? 'bg-emerald-500 text-white' :
                                                    status === 'current' ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' :
                                                        'bg-slate-100 text-slate-300'
                                                }`}>
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            <span className={`text-xs font-bold ${status === 'current' ? 'text-indigo-700' : 'text-slate-400'
                                                }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Admin Controls (Mock) */}
                        <div className="mt-8 pt-4 border-t border-slate-50 flex justify-end gap-3">
                            <button className="text-xs font-bold text-slate-500 hover:text-indigo-600">Ver en SAP</button>
                            <button className="text-xs font-bold text-slate-500 hover:text-indigo-600">Actualizar Estado</button>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && !loading && (
                    <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No hay pedidos activos. <br /><span className="text-sm">Mueve una oportunidad a "Ganada" para generar uno automáticamente.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
