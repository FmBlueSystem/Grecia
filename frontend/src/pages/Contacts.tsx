import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Mail, Phone, Eye, Filter, Users, Building2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../lib/animations';
import { toast } from '../lib';
import { TableSkeleton, EmptyState } from '../components';
import PaginationControls from '../components/shared/PaginationControls';
import api from '../lib/api';

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    accountId?: string;
    accountName?: string;
    owner: {
        firstName: string;
        lastName: string;
    };
}

interface AccountOption {
    id: string;
    name: string;
}

export default function Contacts() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [totalContacts, setTotalContacts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(50);

    // Account filter
    const [accountFilter, setAccountFilter] = useState('');
    const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        accountId: '',
        ownerId: ''
    });

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setFormData(prev => ({ ...prev, ownerId: userData.id }));
        }
    }, []);

    // Fetch account options for filter
    useEffect(() => {
        api.get('/accounts', { params: { top: 200 } })
            .then(r => {
                const accs = (r.data?.data || []).map((a: any) => ({
                    id: a.id || a.cardCode,
                    name: a.name || a.cardName || a.CardName || '',
                }));
                setAccountOptions(accs.sort((a: AccountOption, b: AccountOption) => a.name.localeCompare(b.name)));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [page, pageSize, searchTerm]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contacts', { params: { top: pageSize, skip: page * pageSize, search: searchTerm || undefined } });
            if (res.data?.data) setContacts(res.data.data);
            if (res.data?.total != null) setTotalContacts(res.data.total);
        } catch (err) {
            console.error("Error al obtener contactos", err);
            toast.error('Error al cargar contactos', 'No se pudieron cargar los contactos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, accountId: formData.accountId || undefined };
            await api.post('/contacts', payload);
            setShowModal(false);
            fetchContacts();
            setFormData(prev => ({ ...prev, firstName: '', lastName: '', email: '', phone: '', jobTitle: '', accountId: '' }));
            toast.success('Contacto creado', 'El contacto se creo correctamente');
        } catch (err) {
            console.error("Error al crear contacto", err);
            toast.error('Error al crear', 'No se pudo crear el contacto');
        }
    };

    const logActivity = (contact: Contact, type: 'Call' | 'Email') => {
        const subject = type === 'Call'
            ? `Llamada a ${contact.firstName} ${contact.lastName}`
            : `Email a ${contact.firstName} ${contact.lastName}`;
        api.post('/activities', {
            activityType: type,
            subject,
            cardCode: contact.accountId || undefined,
            notes: type === 'Call' ? `Tel: ${contact.phone}` : `Email: ${contact.email}`,
        }).then(() => {
            toast.success('Actividad registrada', `${type === 'Call' ? 'Llamada' : 'Email'} registrado en SAP`);
        }).catch(() => {});
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(0);
    };

    const filteredContacts = contacts.filter(c => {
        const matchesAccount = !accountFilter ||
            c.accountName?.toLowerCase().includes(accountFilter.toLowerCase()) ||
            c.accountId === accountFilter;
        return matchesAccount;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Contactos</h2>
                    <p className="text-slate-500">Personas y puntos de contacto clave</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" /> Nuevo Contacto
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-600"
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            if (searchTimer.current) clearTimeout(searchTimer.current);
                            searchTimer.current = setTimeout(() => {
                                setSearchTerm(e.target.value);
                                setPage(0);
                            }, 400);
                        }}
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border rounded-xl font-bold flex items-center gap-2 transition-colors ${showFilters || accountFilter ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <Filter className="w-4 h-4" /> Filtros
                    {accountFilter && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                </button>
            </div>

            {/* Account Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex items-center gap-4">
                            <div className="flex items-center gap-2 flex-1">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <select
                                    value={accountFilter}
                                    onChange={(e) => setAccountFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">Todas las cuentas</option>
                                    {accountOptions.map(acc => (
                                        <option key={acc.id} value={acc.name}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            {accountFilter && (
                                <button
                                    onClick={() => setAccountFilter('')}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            {loading ? (
                <TableSkeleton rows={5} />
            ) : filteredContacts.length === 0 && contacts.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No hay contactos"
                    description="Crea tu primer contacto para comenzar a gestionar tus relaciones con clientes"
                    actionLabel="Crear Contacto"
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
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Nombre Completo</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Socio de Negocios</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Cargo</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Datos de Contacto</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Propietario</th>
                                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredContacts.map((contact) => (
                                <motion.tr variants={fadeIn} key={contact.id} onClick={() => navigate(`/contacts/${contact.id}`)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                                                {contact.firstName[0]}{contact.lastName[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{contact.firstName} {contact.lastName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                            <span className="text-slate-700 font-medium text-sm truncate max-w-[200px]" title={contact.accountName}>{contact.accountName || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-600 font-medium">{contact.jobTitle || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {contact.email && (
                                                <a href={`mailto:${contact.email}`} onClick={(e) => { e.stopPropagation(); logActivity(contact, 'Email'); }} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                                                    <Mail className="w-3 h-3" /> {contact.email}
                                                </a>
                                            )}
                                            {contact.phone && (
                                                <a href={`tel:${contact.phone}`} onClick={(e) => { e.stopPropagation(); logActivity(contact, 'Call'); }} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                                                    <Phone className="w-3 h-3" /> {contact.phone}
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {contact.owner.firstName[0]}{contact.owner.lastName[0]}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/contacts/${contact.id}`)}
                                                className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                                title="Ver detalle"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredContacts.length === 0 && contacts.length > 0 && (
                        <EmptyState
                            variant="search"
                            icon={Search}
                            title="No se encontraron contactos"
                            description={`No hay resultados para "${searchTerm}"`}
                        />
                    )}
                    <PaginationControls
                        page={page}
                        pageSize={pageSize}
                        total={totalContacts}
                        onPageChange={setPage}
                        onPageSizeChange={handlePageSizeChange}
                        label="contactos"
                    />
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
                                <h3 className="text-xl font-bold text-slate-900">Nuevo Contacto</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Apellido</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Cargo / Puesto</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Ej. Gerente de Compras"
                                        value={formData.jobTitle}
                                        onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Cuenta / Socio de Negocios</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.accountId}
                                        onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                                    >
                                        <option value="">Sin cuenta asociada</option>
                                        {accountOptions.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electronico</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Telefono</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
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
                                        Guardar Contacto
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
