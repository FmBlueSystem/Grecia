import { X, FileText, ShoppingCart, Receipt, CalendarCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type KpiType = 'revenue' | 'pipeline' | 'conversion' | 'activities';

interface DocItem {
  docEntry?: number;
  docNum?: number;
  client?: string;
  amount?: number;
  date?: string;
  type?: string;
  subject?: string;
  activityType?: string;
  status?: string;
}

interface KpiDrilldownModalProps {
  open: boolean;
  onClose: () => void;
  kpiType: KpiType;
  drilldown: {
    revenue?: DocItem[];
    quotes?: DocItem[];
    orders?: DocItem[];
    activities?: DocItem[];
  } | null;
}

const KPI_CONFIG: Record<KpiType, { title: string; icon: typeof FileText; color: string; bgColor: string }> = {
  revenue: { title: 'Facturas del Mes', icon: Receipt, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  pipeline: { title: 'Cartera Abierta', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  conversion: { title: 'Proporción: Órdenes vs Ofertas', icon: ShoppingCart, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  activities: { title: 'Actividades de la Semana', icon: CalendarCheck, color: 'text-teal-600', bgColor: 'bg-teal-50' },
};

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d: string | undefined) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short' });
};

export default function KpiDrilldownModal({ open, onClose, kpiType, drilldown }: KpiDrilldownModalProps) {
  const navigate = useNavigate();
  const config = KPI_CONFIG[kpiType];
  const Icon = config.icon;

  const handleRowClick = (item: DocItem) => {
    if (item.type === 'invoice') navigate(`/invoices/${item.docEntry}`);
    else if (item.type === 'quote') navigate(`/quotes/${item.docEntry}`);
    else if (item.type === 'order') navigate(`/orders/${item.docEntry}`);
    onClose();
  };

  const getDocItems = (): DocItem[] => {
    if (!drilldown) return [];
    switch (kpiType) {
      case 'revenue': return drilldown.revenue || [];
      case 'pipeline': return [...(drilldown.quotes || []), ...(drilldown.orders || [])].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 20);
      case 'conversion': return [...(drilldown.orders || []).map(o => ({ ...o, _section: 'order' })), ...(drilldown.quotes || []).map(q => ({ ...q, _section: 'quote' }))].slice(0, 20);
      case 'activities': return drilldown.activities || [];
      default: return [];
    }
  };

  const items = getDocItems();
  const typeLabel = (t?: string) => t === 'invoice' ? 'Factura' : t === 'quote' ? 'Oferta' : t === 'order' ? 'Orden' : '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-5 border-b border-slate-100 flex justify-between items-center ${config.bgColor}/30`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 ${config.bgColor} rounded-xl ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{config.title}</h3>
                  <p className="text-xs text-slate-500">{items.length} documento{items.length !== 1 ? 's' : ''} encontrado{items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {kpiType === 'activities' ? (
                /* Activities table */
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Asunto</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Cliente</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Tipo</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Fecha</th>
                      <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-slate-900 max-w-[200px] truncate">{item.subject || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 max-w-[180px] truncate">{item.client}</td>
                        <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">{item.activityType}</span></td>
                        <td className="px-5 py-3 text-sm text-slate-500">{fmtDate(item.date)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'Abierta' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* Documents table */
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3"># Doc</th>
                      {kpiType !== 'revenue' && <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Tipo</th>}
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Cliente</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase px-5 py-3">Monto</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Fecha</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => handleRowClick(item)}
                      >
                        <td className="px-5 py-3">
                          <span className={`text-sm font-bold ${config.color}`}>{item.docNum}</span>
                        </td>
                        {kpiType !== 'revenue' && (
                          <td className="px-5 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              item.type === 'order' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {typeLabel(item.type)}
                            </span>
                          </td>
                        )}
                        <td className="px-5 py-3 text-sm text-slate-700 max-w-[220px] truncate">{item.client}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">{fmt(item.amount || 0)}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{fmtDate(item.date)}</td>
                        <td className="px-5 py-1">
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {items.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay documentos para mostrar</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && kpiType !== 'activities' && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <span className="text-xs text-slate-400">Mostrando los primeros {items.length} documentos</span>
                <span className="text-sm font-bold text-slate-700">
                  Total: {fmt(items.reduce((s, i) => s + (i.amount || 0), 0))}
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
