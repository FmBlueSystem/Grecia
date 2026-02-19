import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Building2, User, Briefcase, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface ContactInfo {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    mobile?: string;
    jobTitle?: string;
    isActive: boolean;
    accountId: string;
    accountName: string;
    owner: { id: string; firstName: string; lastName: string };
}

export default function ContactDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [contact, setContact] = useState<ContactInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        // Contact ID format: CardCode-InternalCode
        // We fetch the parent account and find the contact within it
        const cardCode = id.split('-')[0];
        if (!cardCode) { setError('ID de contacto invalido'); setLoading(false); return; }

        api.get(`/accounts/${cardCode}`)
            .then(res => {
                const account = res.data?.data;
                if (!account) { setError('Cuenta no encontrada'); return; }
                const found = (account.contacts || []).find((c: any) => c.id === id);
                if (found) {
                    setContact({ ...found, accountId: account.id, accountName: account.name });
                } else {
                    // If not found by exact ID, try partial match
                    const partial = (account.contacts || []).find((c: any) => c.id?.includes(id.split('-').slice(1).join('-')));
                    if (partial) {
                        setContact({ ...partial, accountId: account.id, accountName: account.name });
                    } else {
                        setError('Contacto no encontrado en esta cuenta');
                    }
                }
            })
            .catch(() => setError('Error al cargar contacto'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="ml-3 text-slate-500">Cargando contacto...</span>
            </div>
        );
    }

    if (error || !contact) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center">
                <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">{error || 'Contacto no encontrado'}</h2>
                <button onClick={() => navigate('/contacts')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                    Volver a Contactos
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back + Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900">{contact.firstName} {contact.lastName}</h2>
                    <p className="text-slate-500 text-sm">{contact.jobTitle || 'Sin cargo'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${contact.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {contact.isActive ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Informacion de Contacto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contact.email && (
                                <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors group">
                                    <Mail className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600">{contact.email}</p>
                                    </div>
                                </a>
                            )}
                            {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-emerald-50 transition-colors group">
                                    <Phone className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Telefono</p>
                                        <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-600">{contact.phone}</p>
                                    </div>
                                </a>
                            )}
                            {contact.mobile && (
                                <a href={`tel:${contact.mobile}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-emerald-50 transition-colors group">
                                    <Phone className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Celular</p>
                                        <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-600">{contact.mobile}</p>
                                    </div>
                                </a>
                            )}
                            {contact.jobTitle && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Cargo</p>
                                        <p className="text-sm font-medium text-slate-900">{contact.jobTitle}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Account Card */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Cuenta Asociada</h3>
                        <Link to={`/accounts/${contact.accountId}`} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                            <Building2 className="w-8 h-8 text-indigo-600" />
                            <div>
                                <p className="font-bold text-indigo-700">{contact.accountName}</p>
                                <p className="text-xs text-indigo-500">{contact.accountId}</p>
                            </div>
                        </Link>
                    </div>

                    {/* Owner */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Vendedor Asignado</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                {contact.owner.firstName[0]}{contact.owner.lastName[0]}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{contact.owner.firstName} {contact.owner.lastName}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
