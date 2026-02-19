import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
  total: number;
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
const fmtDate = (d: string | null) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const columns: Column<LineItem>[] = [
    { key: 'code', header: 'Código', width: '100px', render: (row) => <span className="font-mono text-xs text-slate-600">{row.code}</span> },
    { key: 'description', header: 'Descripción', render: (row) => <span className="font-medium text-slate-900">{row.description}</span> },
    { key: 'qty', header: 'Cant.', width: '70px', align: 'center' },
    { key: 'unitPrice', header: 'P. Unitario', width: '120px', align: 'right', render: (row) => fmt(row.unitPrice) },
    { key: 'total', header: 'Total', width: '120px', align: 'right', render: (row) => <span className="font-semibold">{fmt(row.total)}</span> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No se pudo cargar la orden</p>
        <button onClick={() => window.history.back()} className="mt-4 text-brand text-sm font-medium">Volver</button>
      </div>
    );
  }

  const items: LineItem[] = (order.items || []).map((item: any) => ({
    id: item.id,
    code: item.product?.code || item.productId || '-',
    description: item.product?.name || '-',
    qty: item.quantity,
    unitPrice: item.unitPrice,
    total: item.totalPrice,
  }));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const total = order.totalAmount || subtotal;
  const tax = total > subtotal ? total - subtotal : 0;

  const statusVariant = order.status === 'DELIVERED' ? 'success' : 'warning';
  const statusLabel = order.status === 'DELIVERED' ? 'Entregado' : 'En Proceso';

  const bpfSteps = order.status === 'DELIVERED'
    ? [
        { label: 'Confirmado', status: 'completed' as const },
        { label: 'En Proceso', status: 'completed' as const },
        { label: 'Entregado', status: 'completed' as const },
      ]
    : [
        { label: 'Confirmado', status: 'completed' as const },
        { label: 'En Proceso', status: 'active' as const },
        { label: 'Entregado', status: 'pending' as const },
      ];

  return (
    <DetailLayout
      title={`Orden #${order.sapDocNum || order.id}`}
      subtitle={order.account?.name || '-'}
      backPath="/orders"
      badges={<StatusBadge label={statusLabel} variant={statusVariant} />}
      actions={
        <button onClick={() => { toast.info('Preparando impresión...'); window.print(); }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Imprimir</button>
      }
      bpfSteps={bpfSteps}
      left={
        <>
          <DataTable columns={columns} data={items} />
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
              {tax > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Impuesto</span><span>{fmt(tax)}</span></div>}
              <div className="border-t border-slate-100 pt-2 flex justify-between"><span className="font-semibold">Total</span><span className="font-bold">{fmt(total)}</span></div>
            </div>
          </div>
        </>
      }
      right={
        <>
          <InfoCard
            title="Detalles de la Orden"
            fields={[
              { label: 'Cliente', value: order.account?.name || '-' },
              { label: 'N° Documento SAP', value: String(order.sapDocNum || order.id) },
              { label: 'Fecha', value: fmtDate(order.createdAt) },
              { label: 'Entrega Estimada', value: fmtDate(order.dueDate) },
              { label: 'Vendedor', value: order.owner ? `${order.owner.firstName} ${order.owner.lastName}`.trim() || '-' : '-' },
              { label: 'Moneda', value: order.currency || 'USD' },
            ]}
          />
          {order.linkedQuote && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Oferta Origen</h3>
              <button
                onClick={() => navigate(`/quotes/${order.linkedQuote.docEntry}`)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <span className="text-sm font-semibold text-brand">Oferta #{order.linkedQuote.docNum}</span>
                  <p className="text-xs text-slate-500">{fmtDate(order.linkedQuote.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{fmt(order.linkedQuote.total)}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </button>
            </div>
          )}
          {order.linkedInvoices && order.linkedInvoices.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Facturas Derivadas</h3>
              <div className="space-y-2">
                {order.linkedInvoices.map((inv: any) => (
                  <button
                    key={inv.docEntry}
                    onClick={() => navigate(`/invoices/${inv.docEntry}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-semibold text-brand">Factura #{inv.docNum}</span>
                      <p className="text-xs text-slate-500">{fmtDate(inv.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{fmt(inv.total)}</span>
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
