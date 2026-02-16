import { Truck } from 'lucide-react';

export default function LogisticsDashboard() {
    return (
        <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">En Desarrollo</h3>
            <p className="text-sm text-slate-500 text-center max-w-md">
                El dashboard de logistica con rastreo de envios, estados de aduana
                y alertas de retrasos conectado a SAP estara disponible en una proxima actualizacion.
            </p>
        </div>
    );
}
