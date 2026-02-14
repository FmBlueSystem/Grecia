import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Mail, MessageSquare, Phone, Plus, User, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../lib/animations';

interface Activity {
    id: string;
    activityType: 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note';
    subject: string;
    description?: string;
    dueDate?: string;
    status: string;
    contact?: { firstName: string, lastName: string };
    owner: { firstName: string, lastName: string };
    isCompleted: boolean;
}

const ICONS = {
    Call: Phone,
    Email: Mail,
    Meeting: Calendar,
    Task: CheckCircle,
    Note: MessageSquare
};

const COLORS = {
    Call: 'bg-blue-100 text-blue-600',
    Email: 'bg-purple-100 text-purple-600',
    Meeting: 'bg-orange-100 text-orange-600',
    Task: 'bg-emerald-100 text-emerald-600',
    Note: 'bg-slate-100 text-slate-600'
};

export default function Activities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        activityType: 'Task',
        subject: '',
        description: '',
        dueDate: '',
        ownerId: ''
    });

    useEffect(() => {
        fetchActivities();
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setFormData(prev => ({ ...prev, ownerId: userData.id }));
        }
    }, []);

    const fetchActivities = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/activities');
            const json = await res.json();
            if (json.data) setActivities(json.data);
        } catch (err) {
            console.error("Failed to fetch activities", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                fetchActivities();
                setFormData(prev => ({ ...prev, subject: '', description: '', dueDate: '', activityType: 'Task' }));
            }
        } catch (err) {
            console.error("Failed to create activity", err);
        }
    };

    const handleToggleComplete = async (id: string, current: boolean) => {
        // Optimistic upates
        setActivities(prev => prev.map(a => a.id === id ? { ...a, isCompleted: !current } : a));

        try {
            await fetch(`http://localhost:3000/api/activities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: !current })
            });
        } catch (err) {
            console.error("Failed to update", err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Actividades</h2>
                    <p className="text-slate-500">Agenda, tareas y registro de interacciones</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" /> Nueva Actividad
                </button>
            </div>

            {/* List of Activities */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">Cargando actividades...</div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                >
                    {activities.map((activity) => {
                        const Icon = ICONS[activity.activityType as keyof typeof ICONS] || CheckCircle;
                        const colorClass = COLORS[activity.activityType as keyof typeof COLORS] || 'bg-slate-100 text-slate-600';

                        return (
                            <motion.div
                                variants={fadeIn}
                                key={activity.id}
                                className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow ${activity.isCompleted ? 'opacity-60 bg-slate-50' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => handleToggleComplete(activity.id, activity.isCompleted)}
                                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${activity.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'}`}
                                    >
                                        {activity.isCompleted && <CheckCircle className="w-4 h-4" />}
                                    </button>

                                    <div>
                                        <h3 className={`font-bold text-lg ${activity.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{activity.subject}</h3>
                                        <p className="text-sm text-slate-500 mb-2">{activity.description || 'Sin descripción'}</p>

                                        <div className="flex items-center gap-3 text-xs font-bold">
                                            <span className={`px-2 py-1 rounded-lg flex items-center gap-1 ${colorClass}`}>
                                                <Icon className="w-3 h-3" /> {activity.activityType}
                                            </span>
                                            {activity.dueDate && (
                                                <span className={`flex items-center gap-1 ${new Date(activity.dueDate) < new Date() && !activity.isCompleted ? 'text-red-500' : 'text-slate-400'}`}>
                                                    <Clock className="w-3 h-3" /> {new Date(activity.dueDate).toLocaleDateString()} {new Date(activity.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                            {activity.contact && (
                                                <span className="flex items-center gap-1 text-slate-400">
                                                    <User className="w-3 h-3" /> {activity.contact.firstName} {activity.contact.lastName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button className="text-slate-300 hover:text-slate-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </motion.div>
                        );
                    })}
                    {activities.length === 0 && (
                        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
                            No hay actividades pendientes.
                        </div>
                    )}
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
                                <h3 className="text-xl font-bold text-slate-900">Nueva Actividad</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo</label>
                                    <div className="flex gap-2">
                                        {['Call', 'Email', 'Meeting', 'Task'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, activityType: type })}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${formData.activityType === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Asunto</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Ej. Llamada de seguimiento"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                                    <textarea
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none"
                                        placeholder="Detalles adicionales..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Fecha y Hora</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
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
                                        Guardar
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
