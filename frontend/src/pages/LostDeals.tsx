import { useState, useEffect } from 'react';
import { TrendingDown, DollarSign, Percent, Users, Loader2, Calendar } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import DataTable, { type Column } from '../components/shared/DataTable';
import api from '../lib/api';

interface LostDeal {
  docEntry: number;
  docNum: number;
  client: string;
  cardCode: string;
  total: number;
  date: string;
  dueDate: string;
  salesPerson: string;
}

interface SellerBreakdown { name: string; count: number; total: number }

interface LostDealsData {
  period: string;
  totalClosed: number;
  totalConverted: number;
  totalLost: number;
  totalLostValue: number;
  conversionRate: number;
  bySeller: SellerBreakdown[];
  deals: LostDeal[];
}

const fmt = (v: number) => `$${v.toLocaleString()}`;

const DEAL_COLS: Column<LostDeal>[] = [
  { key: 'docNum', header: '# SAP', width: '90px', render: r => <span className="font-bold text-brand">{r.docNum}</span> },
  { key: 'client', header: 'Cliente', render: r => <span className="font-medium text-slate-900">{r.client}</span> },
  { key: 'salesPerson', header: 'Vendedor', render: r => <span className="text-sm text-slate-600">{r.salesPerson}</span> },
  { key: 'total', header: 'Monto', align: 'right', render: r => <span className="font-semibold">{fmt(r.total)}</span> },
  { key: 'date', header: 'Fecha', width: '110px', render: r => <span className="text-sm text-slate-500">{new Date(r.date).toLocaleDateString()}</span> },
  { key: 'dueDate', header: 'Vencio', width: '110px', render: r => <span className="text-sm text-slate-500">{new Date(r.dueDate).toLocaleDateString()}</span> },
];

const SELLER_COLS: Column<SellerBreakdown>[] = [
  { key: 'name', header: 'Vendedor', render: r => <span className="font-medium text-slate-900">{r.name}</span> },
  { key: 'count', header: 'Ofertas Perdidas', align: 'right', render: r => <span className="font-semibold text-red-600">{r.count}</span> },
  { key: 'total', header: 'Valor Perdido', align: 'right', render: r => <span className="font-semibold">{fmt(r.total)}</span> },
];

const DATE_RANGES = [
  { value: '3', label: '3 meses' },
  { value: '6', label: '6 meses' },
  { value: '12', label: '12 meses' },
];

export default function LostDeals() {
  const [data, setData] = useState<LostDealsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState('6');

  useEffect(() => {
    setLoading(true);
    api.get(`/lost-deals?months=${months}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [months]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <span className="ml-3 text-slate-500">Analizando ofertas perdidas...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-slate-500">No se pudieron cargar los datos</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title="Ofertas Perdidas"
          subtitle={`Cotizaciones cerradas sin conversion a orden (${data.period})`}
          breadcrumbs={[
            { label: 'Dashboard', path: '/' },
            { label: 'Ofertas Perdidas' },
          ]}
        />
        <select
          value={months}
          onChange={e => setMonths(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {DATE_RANGES.map(d => <option key={d.value} value={d.value}>Ultimos {d.label}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Ofertas Perdidas"
          value={data.totalLost}
          icon={TrendingDown}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          label="Valor Perdido"
          value={fmt(data.totalLostValue)}
          icon={DollarSign}
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <StatCard
          label="Tasa de Conversion"
          value={`${data.conversionRate}%`}
          icon={Percent}
          iconBg={data.conversionRate >= 50 ? 'bg-emerald-50' : 'bg-amber-50'}
          iconColor={data.conversionRate >= 50 ? 'text-emerald-600' : 'text-amber-600'}
        />
        <StatCard
          label="Total Cerradas"
          value={data.totalClosed}
          icon={Calendar}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
        />
      </div>

      {/* By Seller + Deals Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-bold text-slate-900">Por Vendedor</h2>
          </div>
          <DataTable columns={SELLER_COLS} data={data.bySeller} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Detalle de Ofertas Perdidas</h2>
          <DataTable columns={DEAL_COLS} data={data.deals} />
        </div>
      </div>
    </div>
  );
}
