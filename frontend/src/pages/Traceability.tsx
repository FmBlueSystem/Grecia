import { useState } from 'react';
import { Search, FileText, ShoppingCart, Receipt, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import api from '../lib/api';

interface ChainNode {
  type: 'quote' | 'order' | 'invoice';
  docEntry: number;
  docNum: number;
  cardCode: string;
  cardName: string;
  total: number;
  date: string;
  dueDate: string;
  status: string;
  salesPerson: string;
  paidAmount?: number;
}

interface TraceResult {
  searchedDocNum: number;
  searchedType: string;
  client: string;
  chain: ChainNode[];
}

const TYPE_CONFIG = {
  quote: { label: 'Oferta', icon: FileText, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-600' },
  order: { label: 'Orden', icon: ShoppingCart, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-600' },
  invoice: { label: 'Factura', icon: Receipt, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-600' },
};

const fmt = (v: number) => `$${v.toLocaleString()}`;

export default function Traceability() {
  const [docNum, setDocNum] = useState('');
  const [docType, setDocType] = useState('');
  const [result, setResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNum.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const typeParam = docType ? `&type=${docType}` : '';
      const res = await api.get(`/traceability/search?docNum=${docNum.trim()}${typeParam}`);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al buscar documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Trazabilidad"
        subtitle="Seguimiento de documentos: Oferta, Orden y Factura"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Trazabilidad' },
        ]}
      />

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-slate-700 mb-2">Numero de Documento (SAP)</label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={docNum}
                onChange={e => setDocNum(e.target.value)}
                placeholder="Ej: 12345"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo (opcional)</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Buscar en todos</option>
              <option value="quote">Oferta</option>
              <option value="order">Orden</option>
              <option value="invoice">Factura</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !docNum.trim()}
            className="px-6 py-2 rounded-xl font-bold text-white bg-brand hover:bg-brand-hover shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Client header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                {result.client.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{result.client}</h3>
                <p className="text-sm text-slate-500">Documento buscado: #{result.searchedDocNum} ({TYPE_CONFIG[result.searchedType as keyof typeof TYPE_CONFIG]?.label || result.searchedType})</p>
              </div>
            </div>
          </div>

          {/* Chain visualization */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Cadena Documental</h3>

            <div className="flex items-start gap-2 flex-wrap">
              {result.chain.map((node, idx) => {
                const cfg = TYPE_CONFIG[node.type];
                const Icon = cfg.icon;
                const isSearched = node.docNum === result.searchedDocNum;
                return (
                  <div key={`${node.type}-${node.docEntry}`} className="flex items-center gap-2">
                    {idx > 0 && (
                      <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <div className={`rounded-xl border-2 p-4 min-w-[220px] transition-all ${isSearched ? `${cfg.border} ${cfg.bg} ring-2 ring-offset-2 ring-brand/30` : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`p-2 rounded-lg ${cfg.bg}`}>
                          <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                        </div>
                        <div>
                          <span className={`text-xs font-bold uppercase ${cfg.text}`}>{cfg.label}</span>
                          <p className="text-lg font-bold text-slate-900">#{node.docNum}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total</span>
                          <span className="font-bold text-slate-900">{fmt(node.total)}</span>
                        </div>
                        {node.type === 'invoice' && node.paidAmount != null && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Pagado</span>
                            <span className="font-bold text-emerald-600">{fmt(node.paidAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fecha</span>
                          <span className="text-slate-700">{new Date(node.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Estado</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${node.status === 'Abierta' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {node.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Vendedor</span>
                          <span className="text-slate-700 text-xs">{node.salesPerson}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {result.chain.length === 1 && (
              <p className="text-sm text-slate-400 mt-4">Este documento no tiene documentos vinculados anteriores ni posteriores.</p>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Buscar Trazabilidad</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Ingrese un numero de documento SAP para ver la cadena completa:
            Oferta, Orden y Factura vinculadas.
          </p>
        </div>
      )}
    </div>
  );
}
