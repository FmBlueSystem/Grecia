import { useState, useEffect } from 'react';
import { Shield, Clock, User, FileText, Loader2, Filter, ChevronRight } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import PaginationControls from '../components/shared/PaginationControls';
import api from '../lib/api';

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  companyCode: string;
  ipAddress?: string;
  createdAt: string;
}

interface AuditStats {
  total: number;
  today: number;
  thisWeek: number;
  byAction: { action: string; count: number }[];
  byEntity: { entity: string; count: number }[];
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-blue-50 text-blue-700',
  DELETE: 'bg-red-50 text-red-700',
  EXPORT: 'bg-amber-50 text-amber-700',
  LOGIN: 'bg-indigo-50 text-indigo-700',
  LOGOUT: 'bg-slate-100 text-slate-600',
};

const ENTITY_OPTIONS = ['Account', 'Contact', 'Quote', 'Order', 'Invoice', 'Activity', 'Opportunity', 'Lead', 'Case', 'Report'];
const ACTION_OPTIONS = ['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT'];

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [page, pageSize, entityFilter, actionFilter]);

  useEffect(() => {
    api.get('/audit/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: pageSize };
      if (entityFilter) params.entity = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await api.get('/audit', { params });
      setEntries(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Registro de todas las acciones realizadas en el sistema"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Audit Log' },
        ]}
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Total de registros</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.today}</p>
              <p className="text-xs text-slate-500">Hoy</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.thisWeek}</p>
              <p className="text-xs text-slate-500">Esta semana</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Todas las entidades</option>
            {ENTITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">Todas las acciones</option>
          {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
            <span className="ml-3 text-slate-500">Cargando registros...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Shield className="w-10 h-10 mb-3" />
            <p className="font-medium">No hay registros de auditoria</p>
            <p className="text-sm">Las acciones del sistema se registraran aqui automaticamente</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Fecha</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Usuario</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Accion</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Entidad</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Descripcion</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Pais</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{entry.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACTION_COLORS[entry.action] || 'bg-slate-100 text-slate-600'}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{entry.entity}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-[300px] truncate">{entry.description}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{entry.companyCode}</td>
                    <td className="px-4 py-3">
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === entry.id ? 'rotate-90' : ''}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              label="registros"
            />
          </>
        )}
      </div>
    </div>
  );
}
