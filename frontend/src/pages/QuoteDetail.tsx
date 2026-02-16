import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DetailLayout from '../components/detail/DetailLayout';
import InfoCard from '../components/detail/InfoCard';
import StatusBadge from '../components/shared/StatusBadge';
import DataTable, { type Column } from '../components/shared/DataTable';
import api from '../lib/api';

interface LineItem {
  id: string;
  code: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
  total: number;
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
const fmtDate = (d: string | null) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/quotes/${id}`)
      .then(res => setQuote(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const columns: Column<LineItem>[] = [
    { key: 'code', header: 'Código', width: '100px', render: (row) => <span className="font-mono text-xs text-slate-600">{row.code}</span> },
    { key: 'description', header: 'Descripción', render: (row) => <span className="font-medium text-slate-900">{row.description}</span> },
    { key: 'qty', header: 'Cant.', width: '70px', align: 'center' },
    { key: 'unitPrice', header: 'P. Unitario', width: '120px', align: 'right', render: (row) => fmt(row.unitPrice) },
    { key: 'discount', header: 'Desc.', width: '70px', align: 'right', render: (row) => row.discount > 0 ? <span className="text-red-500 text-xs font-semibold">-{row.discount}%</span> : <span className="text-slate-300">-</span> },
    { key: 'total', header: 'Total', width: '120px', align: 'right', render: (row) => <span className="font-semibold">{fmt(row.total)}</span> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No se pudo cargar la oferta</p>
        <button onClick={() => window.history.back()} className="mt-4 text-brand text-sm font-medium">Volver</button>
      </div>
    );
  }

  const items: LineItem[] = (quote.items || []).map((item: any) => ({
    id: item.id,
    code: item.product?.code || item.productId || '-',
    description: item.product?.name || '-',
    qty: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount || 0,
    total: item.totalPrice,
  }));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const total = quote.totalAmount || subtotal;
  const tax = total > subtotal ? total - subtotal : 0;

  const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
    DRAFT: { label: 'Borrador', variant: 'neutral' },
    SENT: { label: 'Enviada', variant: 'info' },
    ACCEPTED: { label: 'Aprobada', variant: 'success' },
  };
  const statusInfo = STATUS_MAP[quote.status] || { label: quote.status || '-', variant: 'neutral' as const };

  const bpfMap: Record<string, { label: string; status: 'completed' | 'active' | 'pending' }[]> = {
    DRAFT: [
      { label: 'Borrador', status: 'active' },
      { label: 'Enviada', status: 'pending' },
      { label: 'Aprobada', status: 'pending' },
      { label: 'Cerrada', status: 'pending' },
    ],
    SENT: [
      { label: 'Borrador', status: 'completed' },
      { label: 'Enviada', status: 'active' },
      { label: 'Aprobada', status: 'pending' },
      { label: 'Cerrada', status: 'pending' },
    ],
    ACCEPTED: [
      { label: 'Borrador', status: 'completed' },
      { label: 'Enviada', status: 'completed' },
      { label: 'Aprobada', status: 'completed' },
      { label: 'Cerrada', status: 'completed' },
    ],
  };

  return (
    <DetailLayout
      title={`Oferta #${quote.sapDocNum || quote.id}`}
      subtitle={quote.account?.name || '-'}
      backPath="/quotes"
      badges={<StatusBadge label={statusInfo.label} variant={statusInfo.variant} />}
      actions={
        <>
          <button
            disabled={copying || quote.status === 'ACCEPTED'}
            onClick={async () => {
              setCopying(true);
              try {
                const res = await api.post(`/quotes/${id}/copy-to-order`);
                toast.success(`Orden #${res.data.docNum || ''} creada desde oferta`);
                navigate(`/orders/${res.data.id || res.data.docEntry}`);
              } catch (err: any) {
                toast.error(err.response?.data?.error || 'Error al copiar a orden');
              } finally {
                setCopying(false);
              }
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
          >
            {copying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            Copiar a Orden
          </button>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Duplicar</button>
          <button className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover">Enviar al Cliente</button>
        </>
      }
      bpfSteps={bpfMap[quote.status] || bpfMap.SENT}
      left={
        <>
          <DataTable columns={columns} data={items} />
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-900">{fmt(subtotal)}</span></div>
              {tax > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Impuesto</span><span className="text-slate-900">{fmt(tax)}</span></div>}
              <div className="border-t border-slate-100 pt-2 flex justify-between text-base"><span className="font-semibold text-slate-900">Total</span><span className="font-bold text-slate-900">{fmt(total)}</span></div>
            </div>
          </div>
        </>
      }
      right={
        <>
          <InfoCard
            title="Información"
            fields={[
              { label: 'Cliente', value: quote.account?.name || '-' },
              { label: 'Vendedor', value: quote.owner ? `${quote.owner.firstName} ${quote.owner.lastName}`.trim() || '-' : '-' },
              { label: 'Fecha', value: fmtDate(quote.createdAt) },
              { label: 'Vigencia', value: fmtDate(quote.expirationDate) },
              { label: 'Moneda', value: quote.currency || 'USD' },
            ]}
          />
          {quote.linkedOrders && quote.linkedOrders.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Órdenes Derivadas</h3>
              <div className="space-y-2">
                {quote.linkedOrders.map((o: any) => (
                  <button
                    key={o.docEntry}
                    onClick={() => navigate(`/orders/${o.docEntry}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-semibold text-brand">Orden #{o.docNum}</span>
                      <p className="text-xs text-slate-500">{fmtDate(o.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{fmt(o.total)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      }
    />
  );
}
