import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, Loader2, Clock, CheckCircle, MoreHorizontal, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '../lib/animations';
import PageHeader from '../components/shared/PageHeader';
import api from '../lib/api';

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  origin?: string;
  account?: { name: string };
  owner: { firstName: string; lastName: string };
  createdAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  NEW: { label: 'Nuevo', icon: LifeBuoy, color: 'bg-blue-50 text-blue-700' },
  IN_PROGRESS: { label: 'En Progreso', icon: Clock, color: 'bg-amber-50 text-amber-700' },
  RESOLVED: { label: 'Resuelto', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700' },
  CLOSED: { label: 'Cerrado', icon: CheckCircle, color: 'bg-slate-100 text-slate-600' },
};

export default function Cases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/cases')
      .then(r => setCases(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <span className="ml-3 text-slate-500">Cargando casos...</span>
      </div>
    );
  }

  const filtered = filter === 'ALL' ? cases : cases.filter(c => c.status === filter);
  const openCount = cases.filter(c => c.status === 'NEW' || c.status === 'IN_PROGRESS').length;
  const criticalCount = cases.filter(c => c.priority === 'CRITICAL').length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeIn} className="flex justify-between items-start">
        <PageHeader
          title="Casos de Soporte"
          subtitle={`${openCount} abiertos, ${criticalCount} criticos`}
          breadcrumbs={[
            { label: 'Panel', path: '/' },
            { label: 'Casos' },
          ]}
        />
      </motion.div>

      {/* Filter pills */}
      <motion.div variants={fadeIn} className="flex gap-2 flex-wrap">
        {[
          { value: 'ALL', label: 'Todos', count: cases.length },
          { value: 'NEW', label: 'Nuevos', count: cases.filter(c => c.status === 'NEW').length },
          { value: 'IN_PROGRESS', label: 'En Progreso', count: cases.filter(c => c.status === 'IN_PROGRESS').length },
          { value: 'RESOLVED', label: 'Resueltos', count: cases.filter(c => c.status === 'RESOLVED').length },
          { value: 'CLOSED', label: 'Cerrados', count: cases.filter(c => c.status === 'CLOSED').length },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === f.value ? 'bg-brand text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            {f.label} <span className="ml-1 opacity-70">{f.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Cases list */}
      <motion.div variants={fadeIn} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length > 0 ? filtered.map(c => {
            const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.NEW;
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'NEW' ? 'bg-blue-500' : c.status === 'IN_PROGRESS' ? 'bg-amber-500' : c.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-400">#{c.caseNumber}</span>
                      <h4 className="font-bold text-slate-900 group-hover:text-brand transition-colors">{c.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${PRIORITY_COLORS[c.priority] || ''}`}>{c.priority}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1 mb-1">{c.description || 'Sin descripcion'}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      {c.account && <span className="flex items-center gap-1"><LifeBuoy className="w-3 h-3" /> {c.account.name}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {c.origin || 'WEB'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${statusCfg.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                  <span className="text-xs text-slate-400">{c.owner.firstName} {c.owner.lastName}</span>
                  <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center">
              <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 mb-1">No hay casos {filter !== 'ALL' ? `con estado "${STATUS_CONFIG[filter]?.label}"` : ''}</p>
              <p className="text-xs text-slate-400">Los casos se pueden crear manualmente o mediante integracion con SAP Service Calls.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
