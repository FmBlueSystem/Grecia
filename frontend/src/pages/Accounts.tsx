import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Globe, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../lib/animations';
import { toast } from '../lib';
import { TableSkeleton, EmptyState } from '../components';
import Pagination from '../components/shared/Pagination';
import api from '../lib/api';

interface Account {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    phone?: string;
    owner: {
        firstName: string;
        lastName: string;
    };
    _count?: {
        contacts: number;
        opportunities: number;
    };
}

const AccountRow = memo(function AccountRow({ account, onNavigate }: { account: Account; onNavigate: (id: string) => void }) {
    return (
        <motion.tr variants={fadeIn} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => onNavigate(account.id)}>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{account.name}</div>
                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            {account.website && <><Globe className="w-3 h-3" /> {account.website}</>}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">{account.industry || 'General'}</span>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-bold text-slate-700">{account.phone || '-'}</div>
                <div className="text-xs text-slate-400">{account._count?.contacts || 0} Contactos</div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {(account.owner.firstName || '?')[0]}{(account.owner.lastName || '')[0]}
                    </div>
                    <span className="text-sm text-slate-600">{account.owner.firstName} {account.owner.lastName}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onNavigate(account.id); }}
                        className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Ver detalle"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
});

export default function Accounts() {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 50;
    const [showModal, setShowModal] = useState(false);
    // New Account Form State
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        website: '',
        phone: '',
        ownerId: '' // In real app, select from users. MVP: hardcode or current user
    });

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setFormData(prev => ({ ...prev, ownerId: userData.id }));
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(0); }, 350);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const fetchAccounts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ top: String(pageSize), skip: String(page * pageSize) });
            if (debouncedSearch) params.set('search', debouncedSearch);
            const res = await api.get(`/accounts?${params}`);
            if (res.data?.data) setAccounts(res.data.data);
            if (res.data?.total != null) setTotal(res.data.total);
        } catch (err) {
            console.error("Error al obtener cuentas", err);
            toast.error('Error al cargar cuentas', 'No se pudieron cargar las cuentas');
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/accounts', formData);
            setShowModal(false);
            fetchAccounts();
            setFormData(prev => ({ ...prev, name: '', industry: '', website: '', phone: '' }));
            toast.success('Cuenta creada', 'La cuenta se creó correctamente');
        } catch (err) {
            console.error("Error al crear cuenta", err);
            toast.error('Error al crear', 'No se pudo crear la cuenta');
        }
    };

    const handleNavigate = useCallback((id: string) => navigate(`/accounts/${id}`), [navigate]);

    const filteredAccounts = accounts;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Cuentas</h2>
                    <p className="text-slate-500">Gestión de empresas y organizaciones clientes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" /> Nueva Cuenta
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, industria..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {total > 0 && (
                    <span className="px-4 py-2 text-sm text-slate-500 font-medium">{total} cuentas</span>
                )}
            </div>

            {/* List */}
            {loading ? (
                <TableSkeleton rows={5} />
            ) : filteredAccounts.length === 0 && accounts.length === 0 ? (
                <EmptyState
                    icon={Building2}
                    title="No hay cuentas"
                    description="Crea tu primera cuenta empresarial para comenzar a gestionar tus clientes"
                    actionLabel="Crear Cuenta"
                    onAction={() => setShowModal(true)}
                />
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Nombre de Cuenta</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Industria</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Teléfono</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Vendedor</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAccounts.map((account) => (
                                <AccountRow key={account.id} account={account} onNavigate={handleNavigate} />
                            ))}
                        </tbody>
                    </table>

                    {filteredAccounts.length === 0 && (
                        <EmptyState
                            variant="search"
                            icon={Search}
                            title="No se encontraron cuentas"
                            description={`No hay resultados para "${searchTerm}"`}
                        />
                    )}
                    <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
                </motion.div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">Nueva Cuenta</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de Cuenta</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Ej. Corporación ABC"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Industria</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Ej. Tecnología, Retail..."
                                        value={formData.industry}
                                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="+506 ..."
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Sitio Web</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="www.ejemplo.com"
                                            value={formData.website}
                                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                    >
                                        Guardar Cuenta
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

    </div>
);
}
