import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, Globe, Building2, UserCheck, Calendar, DollarSign, ShoppingCart, Receipt, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import DetailLayout from '../components/detail/DetailLayout';
import InfoCard from '../components/detail/InfoCard';
import Timeline from '../components/detail/Timeline';
import DataTable, { type Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import api from '../lib/api';

interface Client360 {
  client: {
    cardCode: string;
    name: string;
    phone: string;
    website: string;
    country: string;
    industry: string;
    salesPerson: string;
    currentBalance: number;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalInvoices: number;
    avgOrderValue: number;
    openBalance: number;
    overdueCount: number;
    overdueAmount: number;
    lastPurchaseDate: string | null;
    lastActivityDate: string | null;
    daysSinceLastContact: number;
    openQuotesCount: number;
    openQuotesValue: number;
  };
  topProducts: { code: string; name: string; qty: number; value: number }[];
  recentOrders: { docNum: number; date: string; total: number; status: string; seller: string }[];
  recentInvoices: { docNum: number; date: string; total: number; paid: number; balance: number; dueDate: string; overdue: boolean }[];
  openQuotes: { docNum: number; date: string; total: number; validUntil: string; seller: string }[];
  recentActivities: { type: string; subject: string; date: string; handler: string }[];
}

const fmt = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const ORDER_COLS: Column<Client360['recentOrders'][0]>[] = [
  { key: 'docNum', header: '#', width: '80px', render: r => <span className="font-semibold text-brand">{r.docNum}</span> },
  { key: 'date', header: 'Fecha', render: r => <span className="text-sm text-slate-500">{fmtDate(r.date)}</span> },
  { key: 'total', header: 'Total', align: 'right', render: r => <span className="font-semibold">{fmt(r.total)}</span> },
  { key: 'status', header: 'Estado', render: r => <StatusBadge label={r.status} variant={r.status === 'Abierta' ? 'warning' : 'success'} /> },
  { key: 'seller', header: 'Vendedor', render: r => <span className="text-sm text-slate-600">{r.seller}</span> },
];

const INVOICE_COLS: Column<Client360['recentInvoices'][0]>[] = [
  { key: 'docNum', header: '#', width: '80px', render: r => <span className="font-semibold text-brand">{r.docNum}</span> },
  { key: 'date', header: 'Fecha', render: r => <span className="text-sm text-slate-500">{fmtDate(r.date)}</span> },
  { key: 'total', header: 'Total', align: 'right', render: r => <span className="font-semibold">{fmt(r.total)}</span> },
  { key: 'balance', header: 'Saldo', align: 'right', render: r => <span className={r.balance > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>{fmt(r.balance)}</span> },
  { key: 'overdue', header: 'Vencida', width: '80px', render: r => r.overdue ? <StatusBadge label="Sí" variant="error" dot /> : <span className="text-slate-400">-</span> },
];

const QUOTE_COLS: Column<Client360['openQuotes'][0]>[] = [
  { key: 'docNum', header: '#', width: '80px', render: r => <span className="font-semibold text-brand">{r.docNum}</span> },
  { key: 'date', header: 'Fecha', render: r => <span className="text-sm text-slate-500">{fmtDate(r.date)}</span> },
  { key: 'total', header: 'Total', align: 'right', render: r => <span className="font-semibold">{fmt(r.total)}</span> },
  { key: 'validUntil', header: 'Válida hasta', render: r => <span className="text-sm text-slate-500">{fmtDate(r.validUntil)}</span> },
  { key: 'seller', header: 'Vendedor', render: r => <span className="text-sm text-slate-600">{r.seller}</span> },
];

const PRODUCT_COLS: Column<Client360['topProducts'][0]>[] = [
  { key: 'code', header: 'Código', width: '100px', render: r => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
  { key: 'name', header: 'Producto', render: r => <span className="font-medium text-slate-900">{r.name}</span> },
  { key: 'qty', header: 'Cantidad', align: 'right', render: r => <span className="text-sm">{r.qty.toLocaleString()}</span> },
  { key: 'value', header: 'Valor', align: 'right', render: r => <span className="font-semibold">{fmt(r.value)}</span> },
];

export default function AccountDetail() {
  const { id } = useParams();
  const [data, setData] = useState<Client360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices' | 'quotes' | 'products'>('orders');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/manager/client-360/${id}`)
      .then(r => setData(r.data))
      .catch(() => setError('No se pudo cargar la información del cliente'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <span className="ml-3 text-slate-500">Cargando ficha del cliente...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
        <p className="text-slate-600">{error || 'Cliente no encontrado'}</p>
      </div>
    );
  }

  const { client, summary } = data;

  const TABS = [
    { id: 'orders' as const, label: 'Órdenes', count: data.recentOrders.length },
    { id: 'invoices' as const, label: 'Facturas', count: data.recentInvoices.length },
    { id: 'quotes' as const, label: 'Ofertas', count: data.openQuotes.length },
    { id: 'products' as const, label: 'Top Productos', count: data.topProducts.length },
  ];

  const actTypeIcon: Record<string, { icon: typeof Mail; bg: string; color: string }> = {
    'Email': { icon: Mail, bg: 'bg-blue-50', color: 'text-brand' },
    'Llamada': { icon: Phone, bg: 'bg-purple-50', color: 'text-purple-600' },
    'Reunión': { icon: Calendar, bg: 'bg-green-50', color: 'text-green-600' },
    'Tarea': { icon: FileText, bg: 'bg-amber-50', color: 'text-amber-600' },
    'Nota': { icon: FileText, bg: 'bg-slate-50', color: 'text-slate-600' },
  };

  return (
    <DetailLayout
      title={client.name}
      subtitle={`${client.cardCode} · ${client.country || 'Sin país'}`}
      backPath="/accounts"
      badges={
        <>
          {summary.overdueCount > 0 && <StatusBadge label={`${summary.overdueCount} vencidas`} variant="error" dot />}
          {summary.openQuotesCount > 0 && <StatusBadge label={`${summary.openQuotesCount} ofertas abiertas`} variant="info" />}
        </>
      }
      left={
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Ingresos (12m)', value: fmt(summary.totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Órdenes', value: summary.totalOrders.toString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Saldo Abierto', value: fmt(summary.openBalance), icon: Receipt, color: summary.openBalance > 0 ? 'text-red-600' : 'text-green-600', bg: summary.openBalance > 0 ? 'bg-red-50' : 'bg-green-50' },
              { label: 'Ticket Promedio', value: fmt(summary.avgOrderValue), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 ${kpi.bg} rounded-lg flex items-center justify-center`}>
                    <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                  </div>
                  <span className="text-xs text-slate-500">{kpi.label}</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex gap-6">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-1 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand text-brand font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'orders' && <DataTable columns={ORDER_COLS} data={data.recentOrders} emptyMessage="Sin órdenes recientes" />}
            {activeTab === 'invoices' && <DataTable columns={INVOICE_COLS} data={data.recentInvoices} emptyMessage="Sin facturas recientes" />}
            {activeTab === 'quotes' && <DataTable columns={QUOTE_COLS} data={data.openQuotes} emptyMessage="Sin ofertas abiertas" />}
            {activeTab === 'products' && <DataTable columns={PRODUCT_COLS} data={data.topProducts} emptyMessage="Sin productos registrados" />}
          </div>
        </>
      }
      right={
        <>
          <InfoCard
            title="Información de Cuenta"
            fields={[
              {
                label: 'Industria',
                value: (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{client.industry || 'Sin industria'}</span>
                  </div>
                ),
              },
              {
                label: 'Teléfono',
                value: (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{client.phone || 'Sin teléfono'}</span>
                  </div>
                ),
              },
              {
                label: 'Website',
                value: (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    {client.website ? (
                      <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                        {client.website}
                      </a>
                    ) : <span className="text-slate-400">-</span>}
                  </div>
                ),
              },
              {
                label: 'País',
                value: client.country || 'Sin país',
              },
              {
                label: 'Vendedor',
                value: (
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span>{client.salesPerson}</span>
                  </div>
                ),
              },
              {
                label: 'Último Contacto',
                value: (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {summary.lastActivityDate ? fmtDate(summary.lastActivityDate) : 'Sin registro'}
                      {summary.daysSinceLastContact < 999 && (
                        <span className={`ml-1 text-xs ${summary.daysSinceLastContact > 30 ? 'text-red-500' : 'text-slate-400'}`}>
                          ({summary.daysSinceLastContact}d)
                        </span>
                      )}
                    </span>
                  </div>
                ),
              },
              {
                label: 'Saldo Actual',
                value: (
                  <span className={client.currentBalance > 0 ? 'font-semibold text-red-600' : 'text-green-600'}>
                    {fmt(client.currentBalance)}
                  </span>
                ),
              },
            ]}
          />

          {summary.overdueCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-700">Facturas Vencidas</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{fmt(summary.overdueAmount)}</p>
              <p className="text-xs text-red-500 mt-1">{summary.overdueCount} factura{summary.overdueCount > 1 ? 's' : ''} vencida{summary.overdueCount > 1 ? 's' : ''}</p>
            </div>
          )}

          <Timeline
            title="Actividad Reciente"
            events={data.recentActivities.map((a, i) => {
              const iconInfo = actTypeIcon[a.type] || { icon: Calendar, bg: 'bg-slate-50', color: 'text-slate-600' };
              return {
                id: String(i),
                title: `${a.type}: ${a.subject}`,
                description: `Responsable: ${a.handler}`,
                date: fmtDate(a.date),
                icon: iconInfo.icon,
                iconBg: iconInfo.bg,
                iconColor: iconInfo.color,
              };
            })}
          />
        </>
      }
    />
  );
}
