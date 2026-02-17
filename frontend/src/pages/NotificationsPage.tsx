import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, AlertCircle, Info, Receipt, FileText, Building2, Loader2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import api from '../lib/api';

interface Notification {
  id: string;
  type: 'overdue_invoice' | 'expiring_quote' | 'inactive_client' | 'high_balance';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  meta: Record<string, any>;
  date: string;
}

interface NotifData {
  summary: { total: number; critical: number; warning: number; info: number; overdueInvoices: number; expiringQuotes: number };
  notifications: Notification[];
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'Critico' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'Alerta' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', label: 'Info' },
};

const TYPE_ICON = {
  overdue_invoice: Receipt,
  expiring_quote: FileText,
  inactive_client: Building2,
  high_balance: Building2,
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<NotifData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    api.get('/notifications')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (notif: Notification) => {
    if (notif.type === 'overdue_invoice' && notif.meta.docEntry) {
      navigate(`/invoices/${notif.meta.docEntry}`);
    } else if (notif.type === 'expiring_quote' && notif.meta.docEntry) {
      navigate(`/quotes/${notif.meta.docEntry}`);
    } else if ((notif.type === 'high_balance' || notif.type === 'inactive_client') && notif.meta.cardCode) {
      navigate(`/accounts/${notif.meta.cardCode}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <span className="ml-3 text-slate-500">Cargando alertas...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-slate-500">No se pudieron cargar las notificaciones</p>
      </div>
    );
  }

  const filtered = filter === 'all'
    ? data.notifications
    : data.notifications.filter(n => n.severity === filter || n.type === filter);

  return (
    <div>
      <PageHeader
        title="Notificaciones"
        subtitle={`${data.summary.total} alertas activas`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Notificaciones' },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border transition-all text-left ${filter === 'all' ? 'border-brand bg-blue-50/50 ring-2 ring-brand/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg"><Bell className="w-5 h-5 text-slate-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.summary.total}</p>
              <p className="text-xs font-bold text-slate-500">Total</p>
            </div>
          </div>
        </button>
        <button onClick={() => setFilter('critical')}
          className={`p-4 rounded-xl border transition-all text-left ${filter === 'critical' ? 'border-red-400 bg-red-50 ring-2 ring-red-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-red-600">{data.summary.critical}</p>
              <p className="text-xs font-bold text-slate-500">Criticos</p>
            </div>
          </div>
        </button>
        <button onClick={() => setFilter('overdue_invoice')}
          className={`p-4 rounded-xl border transition-all text-left ${filter === 'overdue_invoice' ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg"><Receipt className="w-5 h-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{data.summary.overdueInvoices}</p>
              <p className="text-xs font-bold text-slate-500">Facturas Vencidas</p>
            </div>
          </div>
        </button>
        <button onClick={() => setFilter('expiring_quote')}
          className={`p-4 rounded-xl border transition-all text-left ${filter === 'expiring_quote' ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{data.summary.expiringQuotes}</p>
              <p className="text-xs font-bold text-slate-500">Ofertas por Vencer</p>
            </div>
          </div>
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Alertas</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.length > 0 ? filtered.map(notif => {
            const sev = SEVERITY_CONFIG[notif.severity];
            const SevIcon = sev.icon;
            const TypeIcon = TYPE_ICON[notif.type] || Bell;
            return (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left p-4 hover:${sev.bg} transition-colors flex items-start gap-4 group`}
              >
                <div className={`p-2 rounded-lg ${sev.bg} flex-shrink-0 mt-0.5`}>
                  <TypeIcon className={`w-5 h-5 ${sev.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 group-hover:text-brand transition-colors">{notif.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sev.badge}`}>
                      <SevIcon className="w-3 h-3 inline mr-0.5" />
                      {sev.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{notif.description}</p>
                  {notif.meta.seller && (
                    <p className="text-xs text-slate-400 mt-1">Vendedor: {notif.meta.seller}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{new Date(notif.date).toLocaleDateString()}</span>
              </button>
            );
          }) : (
            <div className="p-12 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No hay alertas {filter !== 'all' ? 'en esta categoria' : ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
