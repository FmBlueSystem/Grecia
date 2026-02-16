import { useState, useEffect } from 'react';
import { DollarSign, FileText, TrendingUp, ShoppingCart, Loader2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import DataTable, { type Column } from '../components/shared/DataTable';
import DonutChart from '../components/dashboard/DonutChart';
import BarChartSimple from '../components/dashboard/BarChartSimple';
import api from '../lib/api';

interface ReportData {
  kpis: {
    totalRevenue: number;
    totalQuotes: number;
    conversionRate: number;
    avgTicket: number;
  };
  topSellers: { id: string; name: string; revenue: number; orders: number }[];
  topClients: { name: string; value: number }[];
  revenueByMonth: { name: string; revenue: number }[];
}

const fmt = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', notation: 'compact' }).format(v);
const fmtFull = (v: number) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

const COLORS = ['#0067B2', '#00A3E0', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FFD93D', '#6BCB77', '#FF6B6B', '#4D96FF'];

const SELLER_COLS: Column<ReportData['topSellers'][0]>[] = [
  { key: 'name', header: 'Vendedor', render: r => <span className="font-medium text-slate-900">{r.name}</span> },
  { key: 'revenue', header: 'Ingresos Facturados', align: 'right', render: r => <span className="font-semibold">{fmtFull(r.revenue)}</span> },
  { key: 'orders', header: 'Pedidos', align: 'right', render: r => <span className="text-sm text-slate-600">{r.orders}</span> },
];

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#0067B2] animate-spin" />
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
      <PageHeader
        title="Reportes"
        subtitle="Análisis de rendimiento comercial (últimos 6 meses)"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Reportes' },
        ]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Ingresos Facturados"
          value={fmt(data.kpis.totalRevenue)}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Cotizaciones"
          value={data.kpis.totalQuotes}
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-[#0067B2]"
        />
        <StatCard
          label="Tasa de Conversión"
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
          color="#0067B2"
        />
      </div>

      {/* Table */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Top Vendedores</h2>
        <DataTable columns={SELLER_COLS} data={data.topSellers} />
      </div>
    </div>
  );
}
