import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import DataTable, { type Column } from '../components/shared/DataTable';
import StatusBadge from '../components/shared/StatusBadge';
import api from '../lib/api';

interface AgingData {
  summary: {
    totalOpen: number;
    current: { count: number; amount: number };
    days30: { count: number; amount: number };
    days60: { count: number; amount: number };
    days90: { count: number; amount: number };
    over90: { count: number; amount: number };
  };
  details: {
    docNum: number;
    client: string;
    total: number;
    paid: number;
    balance: number;
    dueDate: string;
    daysOverdue: number;
    seller: string;
  }[];
}

const fmt = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const getAgingBadge = (days: number) => {
  if (days <= 0) return { label: 'Al día', variant: 'success' as const };
  if (days <= 30) return { label: '1-30d', variant: 'warning' as const };
  if (days <= 60) return { label: '31-60d', variant: 'warning' as const };
  if (days <= 90) return { label: '61-90d', variant: 'error' as const };
  return { label: `${days}d`, variant: 'error' as const };
};

const COLUMNS: Column<AgingData['details'][0]>[] = [
  { key: 'docNum', header: 'Factura', width: '90px', render: r => <span className="font-semibold text-[#0067B2]">INV-{r.docNum}</span> },
  { key: 'client', header: 'Cliente', render: r => <span className="font-medium text-slate-900 truncate">{r.client}</span> },
  { key: 'balance', header: 'Saldo', align: 'right', render: r => <span className="font-bold text-red-600">{fmt(r.balance)}</span> },
  { key: 'total', header: 'Total', align: 'right', render: r => <span className="text-sm text-slate-500">{fmt(r.total)}</span> },
  { key: 'dueDate', header: 'Vencimiento', render: r => <span className="text-sm text-slate-500">{fmtDate(r.dueDate)}</span> },
  { key: 'daysOverdue', header: 'Antigüedad', width: '100px', render: r => { const b = getAgingBadge(r.daysOverdue); return <StatusBadge label={b.label} variant={b.variant} dot />; } },
  { key: 'seller', header: 'Vendedor', render: r => <span className="text-sm text-slate-600">{r.seller}</span> },
];

export default function AgingReport() {
  const [data, setData] = useState<AgingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/aging')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#0067B2] animate-spin" />
        <span className="ml-3 text-slate-500">Generando reporte de antigüedad...</span>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-32 text-slate-500">No se pudo cargar el reporte</div>;
  }

  const { summary } = data;

  return (
    <div>
      <PageHeader
        title="Antigüedad de Cartera"
        subtitle="Cuentas por cobrar por rango de vencimiento"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Reportes', path: '/reports' },
          { label: 'Antigüedad' },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Abierto"
          value={fmt(summary.totalOpen)}
          icon={DollarSign}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Al Día"
          value={fmt(summary.current.amount)}
          icon={CheckCircle}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          label="1-30 Días"
          value={fmt(summary.days30.amount)}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="31-90 Días"
          value={fmt(summary.days60.amount + summary.days90.amount)}
          icon={AlertTriangle}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          label="+90 Días"
          value={fmt(summary.over90.amount)}
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Aging Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {[
            { amount: summary.current.amount, color: 'bg-green-400', label: 'Al día' },
            { amount: summary.days30.amount, color: 'bg-amber-400', label: '1-30d' },
            { amount: summary.days60.amount, color: 'bg-orange-400', label: '31-60d' },
            { amount: summary.days90.amount, color: 'bg-red-400', label: '61-90d' },
            { amount: summary.over90.amount, color: 'bg-red-600', label: '+90d' },
          ].filter(b => b.amount > 0).map((bucket, i) => {
            const pct = summary.totalOpen > 0 ? (bucket.amount / summary.totalOpen) * 100 : 0;
            return (
              <div
                key={i}
                className={`${bucket.color} flex items-center justify-center text-white text-[10px] font-bold`}
                style={{ width: `${Math.max(pct, 3)}%` }}
                title={`${bucket.label}: ${fmt(bucket.amount)}`}
              >
                {pct > 8 ? bucket.label : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Table */}
      <DataTable columns={COLUMNS} data={data.details} emptyMessage="No hay facturas pendientes" />
    </div>
  );
}
