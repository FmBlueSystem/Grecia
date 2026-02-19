import { useState, useEffect } from 'react';
import { Plus, Check, X, ArrowRight, Building2, Briefcase, DollarSign, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { toast } from 'sonner';

interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    email?: string;
    phone?: string;
    status: string;
    rating?: string;

    // Qualification
    jobTitle?: string;
    industry?: string;
    budget?: number;
    authority?: boolean;
    need?: string;
    timeframe?: string;
    notes?: string;

    sourceDetail?: string;
    createdAt: string;
}

const EMPTY_FORM = { firstName: '', lastName: '', company: '', email: '', phone: '', jobTitle: '', need: '', budget: '', timeframe: '' };

export default function Leads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [showQualifyModal, setShowQualifyModal] = useState<Lead | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState(EMPTY_FORM);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            if (res.data?.data) setLeads(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!createForm.firstName.trim() || !createForm.lastName.trim()) {
            toast.error('Nombre y Apellido son requeridos');
            return;
        }
        setCreating(true);
        try {
            const payload: Record<string, any> = {
                firstName: createForm.firstName.trim(),
                lastName: createForm.lastName.trim(),
            };
            if (createForm.company) payload.company = createForm.company;
            if (createForm.email) payload.email = createForm.email;
            if (createForm.phone) payload.phone = createForm.phone;
            if (createForm.jobTitle) payload.jobTitle = createForm.jobTitle;
            if (createForm.need) payload.need = createForm.need;
            if (createForm.budget) payload.budget = Number(createForm.budget);
            if (createForm.timeframe) payload.timeframe = createForm.timeframe;
            const res = await api.post('/leads', payload);
            if (res.data?.data) setLeads([res.data.data, ...leads]);
            setShowCreateModal(false);
            setCreateForm(EMPTY_FORM);
            toast.success('Lead creado exitosamente');
        } catch {
            toast.error('Error al crear lead');
        } finally {
            setCreating(false);
        }
    };

    const handleQualify = async (leadId: string) => {
        try {
            await api.post(`/leads/${leadId}/qualify`, {
                createAccount: true,
                createContact: true,
                createOpportunity: true
            });
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'QUALIFIED' } : l));
            setShowQualifyModal(null);
        } catch (err) {
            toast.error("Error al calificar prospecto");
        }
    };

    const QualificationBadge = ({ active, label }: { active?: boolean, label: string }) => (
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${active ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {label}
        </span>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Leads (Etapa 1-2)</h2>
                    <p className="text-slate-500 mt-1">Captación, Calificación y Conversión</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Ingreso Manual
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leads.map((lead) => (
                    <motion.div
                        layout
                        key={lead.id}
                        onClick={() => setShowQualifyModal(lead)}
                        className={`cursor-pointer bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all hover:shadow-md ${lead.status === 'QUALIFIED' ? 'opacity-60 grayscale' : ''}`}
                    >
                        {/* Qualification Stats (BANT) */}
                        <div className="absolute top-4 right-4 flex gap-1">
                            <QualificationBadge active={!!lead.budget} label="B" />
                            <QualificationBadge active={lead.authority} label="A" />
                            <QualificationBadge active={!!lead.need} label="N" />
                            <QualificationBadge active={!!lead.timeframe} label="T" />
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600 border-2 border-white shadow-sm">
                                {lead.firstName[0]}{lead.lastName[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {lead.firstName} {lead.lastName}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                    <Briefcase className="w-3 h-3" />
                                    {lead.jobTitle || 'Sin Cargo'}
                                </p>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3 h-3" />
                                    {lead.company || 'Sin Empresa'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            {lead.need && (
                                <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                                    "{lead.need}"
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-slate-400" />
                                    {lead.budget ? `$${lead.budget.toLocaleString()}` : '--'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {lead.timeframe || '--'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lead.sourceDetail || 'Web'}</span>
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${lead.status === 'QUALIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                                {lead.status}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {leads.length === 0 && !loading && (
                    <div className="col-span-3 py-12 text-center text-slate-400">
                        No hay leads registrados.
                    </div>
                )}
            </div>

            {/* Qualification / Detail Modal */}
            <AnimatePresence>
                {showQualifyModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{showQualifyModal.firstName} {showQualifyModal.lastName}</h3>
                                    <p className="text-sm text-slate-500">{showQualifyModal.company} • {showQualifyModal.jobTitle}</p>
                                </div>
                                <button onClick={() => setShowQualifyModal(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-900 border-b pb-2">Información de Contacto</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-slate-500 block text-xs">Email</span> {showQualifyModal.email || '-'}</p>
                                            <p><span className="text-slate-500 block text-xs">Teléfono</span> {showQualifyModal.phone || '-'}</p>
                                            <p><span className="text-slate-500 block text-xs">Origen</span> {showQualifyModal.sourceDetail || 'Web'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                                            Calificación (BANT)
                                            {showQualifyModal.status === 'QUALIFIED' && <Check className="w-4 h-4 text-emerald-500" />}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                                <span className="text-xs font-bold text-indigo-400 uppercase">Presupuesto</span>
                                                <p className="font-semibold text-indigo-900">{showQualifyModal.budget ? `$${showQualifyModal.budget}` : 'N/D'}</p>
                                            </div>
                                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                                <span className="text-xs font-bold text-indigo-400 uppercase">Autoridad</span>
                                                <p className="font-semibold text-indigo-900">{showQualifyModal.authority ? 'Si' : 'No'}</p>
                                            </div>
                                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 col-span-2">
                                                <span className="text-xs font-bold text-indigo-400 uppercase">Necesidad</span>
                                                <p className="font-semibold text-indigo-900">{showQualifyModal.need || 'No especificada'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {showQualifyModal.status === 'NEW' ? (
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-emerald-800">¿Listo para convertir?</h4>
                                            <p className="text-sm text-emerald-600">Creará Oportunidad en Etapa 6 (Oportunidad)</p>
                                        </div>
                                        <button
                                            onClick={() => handleQualify(showQualifyModal.id)}
                                            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md flex items-center gap-2"
                                        >
                                            Calificar <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-slate-100 text-center p-4 rounded-xl text-slate-500 font-medium">
                                        Este lead ya ha sido calificado y convertido.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Lead Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900">Nuevo Lead</h3>
                                <button onClick={() => { setShowCreateModal(false); setCreateForm(EMPTY_FORM); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre *</label>
                                        <input value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Apellido *</label>
                                        <input value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Empresa</label>
                                    <input value={createForm.company} onChange={e => setCreateForm({ ...createForm, company: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                                        <input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono</label>
                                        <input value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo</label>
                                    <input value={createForm.jobTitle} onChange={e => setCreateForm({ ...createForm, jobTitle: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Necesidad</label>
                                    <textarea value={createForm.need} onChange={e => setCreateForm({ ...createForm, need: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Presupuesto (USD)</label>
                                        <input type="number" value={createForm.budget} onChange={e => setCreateForm({ ...createForm, budget: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Plazo</label>
                                        <select value={createForm.timeframe} onChange={e => setCreateForm({ ...createForm, timeframe: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none bg-white">
                                            <option value="">Seleccionar...</option>
                                            <option value="Inmediato">Inmediato</option>
                                            <option value="1-3 meses">1-3 meses</option>
                                            <option value="3-6 meses">3-6 meses</option>
                                            <option value="6-12 meses">6-12 meses</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={() => { setShowCreateModal(false); setCreateForm(EMPTY_FORM); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Cancelar</button>
                                <button onClick={handleCreate} disabled={creating} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Crear Lead
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
