import { useState, useEffect } from 'react';
import { DollarSign, FileText, TrendingUp, ShoppingCart, Loader2, Percent, Package } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import DataTable, { type Column } from '../components/shared/DataTable';
import DonutChart from '../components/dashboard/DonutChart';
import BarChartSimple from '../components/dashboard/BarChartSimple';
import api from '../lib/api';

interface TopProduct {
  code: string;
  name: string;
  qty: number;
  revenue: number;
  profit: number;
  margin: number;
}

interface ReportData {
  kpis: {
    totalRevenue: number;
    grossProfit: number;
    profitMargin: number;
    totalQuotes: number;
    conversionRate: number;
    avgTicket: number;
  };
  topSellers: { id: string; name: string; revenue: number; profit: number; margin: number; orders: number }[];
  topClients: { name: string; value: number }[];
  topProducts: TopProduct[];
  revenueByMonth: { name: string; revenue: number }[];
}

const fmt = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', notation: 'compact' }).format(v);
const fmtFull = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const COLORS = ['var(--color-brand)', 'var(--color-brand-light)', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FFD93D', '#6BCB77', '#FF6B6B', '#4D96FF'];

const SELLER_COLS: Column<ReportData['topSellers'][0]>[] = [
  { key: 'name', header: 'Vendedor', render: r => <span className="font-medium text-slate-900">{r.name}</span> },
  { key: 'revenue', header: 'Ingresos', align: 'right', render: r => <span className="font-semibold">{fmtFull(r.revenue)}</span> },
  { key: 'profit', header: 'Utilidad Bruta', align: 'right', render: r => <span className="font-semibold text-emerald-600">{fmtFull(r.profit)}</span> },
  { key: 'margin', header: 'Margen', align: 'right', width: '80px', render: r => <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.margin >= 30 ? 'bg-emerald-50 text-emerald-700' : r.margin >= 15 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{r.margin}%</span> },
  { key: 'orders', header: 'Órdenes', align: 'right', width: '80px', render: r => <span className="text-sm text-slate-600">{r.orders}</span> },
];

const PRODUCT_COLS: Column<TopProduct>[] = [
  { key: 'code', header: 'Código', width: '100px', render: r => <span className="font-mono text-xs text-slate-500">{r.code}</span> },
  { key: 'name', header: 'Producto', render: r => <span className="font-medium text-slate-900">{r.name.length > 40 ? r.name.slice(0, 37) + '...' : r.name}</span> },
  { key: 'qty', header: 'Qty', align: 'right', width: '70px' },
  { key: 'revenue', header: 'Ingresos', align: 'right', render: r => <span className="font-semibold">{fmtFull(r.revenue)}</span> },
  { key: 'profit', header: 'Utilidad', align: 'right', render: r => <span className="font-semibold text-emerald-600">{fmtFull(r.profit)}</span> },
  { key: 'margin', header: 'Margen', align: 'right', width: '80px', render: r => <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.margin >= 30 ? 'bg-emerald-50 text-emerald-700' : r.margin >= 15 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{r.margin}%</span> },
];

const DATE_RANGES = [
  { value: '3', label: 'Últimos 3 meses' },
  { value: '6', label: 'Últimos 6 meses' },
  { value: '12', label: 'Último año' },
];

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState('6');

  useEffect(() => {
    setLoading(true);
    api.get(`/reports?months=${months}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [months]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <span className="ml-3 text-slate-500">Cargando reportes...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-slate-500">No se pudieron cargar los reportes</p>
      </div>
    );
  }

  const clientDonutData = data.topClients.slice(0, 8).map((c, i) => ({
    name: c.name.length > 25 ? c.name.slice(0, 22) + '...' : c.name,
    value: c.value,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title="Reportes"
          subtitle={`Análisis de rendimiento comercial (${DATE_RANGES.find(d => d.value === months)?.label})`}
          breadcrumbs={[
            { label: 'Dashboard', path: '/' },
            { label: 'Reportes' },
          ]}
        />
        <select
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {DATE_RANGES.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          label="Ingresos Facturados"
          value={fmt(data.kpis.totalRevenue)}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Utilidad Bruta"
          value={fmt(data.kpis.grossProfit)}
          icon={TrendingUp}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          label="Margen"
          value={`${data.kpis.profitMargin}%`}
          icon={Percent}
          iconBg={data.kpis.profitMargin >= 25 ? 'bg-emerald-50' : 'bg-red-50'}
          iconColor={data.kpis.profitMargin >= 25 ? 'text-emerald-600' : 'text-red-600'}
        />
        <StatCard
          label="Ofertas"
          value={data.kpis.totalQuotes}
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Conversión"
          value={`${data.kpis.conversionRate}%`}
          icon={TrendingUp}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          label="Ticket Promedio"
          value={fmt(data.kpis.avgTicket)}
          icon={ShoppingCart}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DonutChart
          title="Top Clientes por Ingreso"
          data={clientDonutData}
          centerValue={fmt(data.kpis.totalRevenue)}
          centerLabel="Total"
        />
        <BarChartSimple
          title="Ingresos por Mes"
          data={data.revenueByMonth}
          dataKey="revenue"
          color="var(--color-brand)"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Top Vendedores</h2>
          <DataTable columns={SELLER_COLS} data={data.topSellers} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-bold text-slate-900">Top Productos</h2>
          </div>
          <DataTable columns={PRODUCT_COLS} data={data.topProducts || []} />
        </div>
      </div>
    </div>
  );
}
