import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/invoices/${id}`)
      .then(res => setInvoice(res.data.data))
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
        <div className="animate-spin w-8 h-8 border-2 border-[#0067B2] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No se pudo cargar la factura</p>
        <button onClick={() => window.history.back()} className="mt-4 text-[#0067B2] text-sm font-medium">Volver</button>
      </div>
    );
  }

  const items: LineItem[] = (invoice.items || []).map((item: any) => ({
    id: item.id,
    code: item.product?.code || item.productId || '-',
    description: item.product?.name || '-',
    qty: item.quantity,
    unitPrice: item.unitPrice,
    total: item.totalPrice,
  }));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const total = invoice.amount || subtotal;
  const tax = total > subtotal ? total - subtotal : 0;
  const paid = invoice.paidAmount || 0;
  const balance = total - paid;

  const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' }> = {
    PAID: { label: 'Pagada', variant: 'success' },
    PARTIAL: { label: 'Pago Parcial', variant: 'warning' },
    OVERDUE: { label: 'Vencida', variant: 'error' },
    UNPAID: { label: 'Pendiente', variant: 'info' },
  };
  const statusInfo = STATUS_MAP[invoice.status] || { label: invoice.status || '-', variant: 'info' as const };

  const bpfMap: Record<string, { label: string; status: 'completed' | 'active' | 'pending' }[]> = {
    PAID: [
      { label: 'Emitida', status: 'completed' },
      { label: 'Enviada', status: 'completed' },
      { label: 'Pagada', status: 'completed' },
    ],
    PARTIAL: [
      { label: 'Emitida', status: 'completed' },
      { label: 'Enviada', status: 'completed' },
      { label: 'Pago Parcial', status: 'active' },
      { label: 'Pagada', status: 'pending' },
    ],
    OVERDUE: [
      { label: 'Emitida', status: 'completed' },
      { label: 'Enviada', status: 'completed' },
      { label: 'Vencida', status: 'active' },
      { label: 'Pagada', status: 'pending' },
    ],
    UNPAID: [
      { label: 'Emitida', status: 'completed' },
      { label: 'Enviada', status: 'active' },
      { label: 'Pagada', status: 'pending' },
    ],
  };

  return (
    <DetailLayout
      title={invoice.invoiceNumber || `FAC-${id}`}
      subtitle={invoice.account?.name || '-'}
      backPath="/invoices"
      badges={<StatusBadge label={statusInfo.label} variant={statusInfo.variant} />}
      actions={
        <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Descargar PDF</button>
      }
      bpfSteps={bpfMap[invoice.status] || bpfMap.UNPAID}
      left={
        <>
          <DataTable columns={columns} data={items} />
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{fmt(subtotal)}</span></div>
            {tax > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Impuesto</span><span>{fmt(tax)}</span></div>}
            <div className="border-t border-slate-100 pt-2 flex justify-between"><span className="font-semibold">Total</span><span className="font-bold">{fmt(total)}</span></div>
            {paid > 0 && <div className="flex justify-between text-sm"><span className="text-slate-500">Pagado</span><span className="text-emerald-600 font-semibold">{fmt(paid)}</span></div>}
            {balance > 0 && balance < total && <div className="flex justify-between text-sm"><span className="text-slate-500">Saldo</span><span className="font-bold">{fmt(balance)}</span></div>}
          </div>
        </>
      }
      right={
        <InfoCard
          title="Información"
          fields={[
            { label: 'Cliente', value: invoice.account?.name || '-' },
            { label: 'Factura SAP', value: `#${invoice.id}` },
            { label: 'Fecha Emisión', value: fmtDate(invoice.createdAt) },
            { label: 'Fecha Vencimiento', value: fmtDate(invoice.dueDate) },
            { label: 'Moneda', value: 'USD' },
          ]}
        />
      }
    />
  );
}
