import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, Loader2, Clock, CheckCircle, MoreHorizontal, MessageSquare, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer } from '../lib/animations';
import PageHeader from '../components/shared/PageHeader';
import { toast } from 'sonner';
import api from '../lib/api';
import { useAuthStore } from '../lib/store';

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

const EMPTY_CASE = { title: '', description: '', priority: 'NORMAL', origin: 'WEB' };

export default function Cases() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_CASE);
  const [creating, setCreating] = useState(false);

  const handleCreateCase = async () => {
    if (!form.title.trim()) { toast.error('El título es requerido'); return; }
    setCreating(true);
    try {
      const caseNumber = `CS-${Date.now().toString(36).toUpperCase()}`;
      const res = await api.post('/cases', {
        title: form.title.trim(),
        description: form.description || undefined,
        priority: form.priority,
        origin: form.origin || undefined,
        caseNumber,
        ownerId: user?.id,
      });
      if (res.data?.data) setCases([res.data.data, ...cases]);
      setShowCreate(false);
      setForm(EMPTY_CASE);
      toast.success('Caso creado exitosamente');
    } catch {
      toast.error('Error al crear caso');
    } finally {
      setCreating(false);
    }
  };

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
        <button onClick={() => setShowCreate(true)} className="bg-brand text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Nuevo Caso
        </button>
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
      {/* Create Case Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Nuevo Caso</h3>
                <button onClick={() => { setShowCreate(false); setForm(EMPTY_CASE); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Título *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none" placeholder="Ej: Problema con facturación" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Prioridad</label>
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none">
                      <option value="LOW">Baja</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">Alta</option>
                      <option value="CRITICAL">Critica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Origen</label>
                    <select value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none">
                      <option value="WEB">Web</option>
                      <option value="PHONE">Teléfono</option>
                      <option value="EMAIL">Email</option>
                      <option value="IN_PERSON">En Persona</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => { setShowCreate(false); setForm(EMPTY_CASE); }} className="px-4 py-2 text-sm font-medium text-slate-600">Cancelar</button>
                <button onClick={handleCreateCase} disabled={creating} className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-bold hover:bg-brand-hover disabled:opacity-50 flex items-center gap-2">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear Caso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
