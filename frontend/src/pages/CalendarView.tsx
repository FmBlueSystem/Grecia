import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import CalendarGrid from '../components/calendar/CalendarGrid';
import StatusBadge from '../components/shared/StatusBadge';
import api from '../lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color?: string;
  type?: string;
  description?: string;
}

const TYPE_COLORS: Record<string, string> = {
  'Llamada': 'var(--color-brand-light)',
  'Reunión': 'var(--color-brand)',
  'Tarea': '#4ECDC4',
  'Visita': '#F38181',
};

export default function CalendarView() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/activities?top=200')
      .then(res => {
        const activities = res.data?.data || [];
        const mapped: CalendarEvent[] = activities.map((act: any) => {
          const actType = act.activityType || 'Tarea';
          return {
            id: String(act.id),
            title: act.subject || actType,
            date: act.dueDate ? act.dueDate.split('T')[0] : '',
            time: act.startTime || '',
            color: TYPE_COLORS[actType] || 'var(--color-brand)',
            type: actType,
            description: act.account?.name || act.cardName || '',
          };
        });
        setEvents(mapped);
      })
      .catch(err => console.error('Error cargando actividades del calendario', err))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const weekEnd = new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0];

  const todayEvents = events.filter(e => e.date === today);
  const thisWeekEvents = events.filter(e => e.date >= today && e.date <= weekEnd);
  const pendingEvents = events.filter(e => e.date >= today);

  return (
    <div>
      <PageHeader
        title="Calendario"
        subtitle="Gestión de actividades y eventos"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Calendario' },
        ]}
        action={
          <button onClick={() => navigate('/activities')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Nueva Actividad
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Hoy"
          value={loading ? '-' : todayEvents.length}
          icon={CalendarIcon}
          iconBg="bg-blue-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          label="Esta Semana"
          value={loading ? '-' : thisWeekEvents.length}
          icon={Clock}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
        />
        <StatCard
          label="Pendientes"
          value={loading ? '-' : pendingEvents.length}
          icon={AlertCircle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Calendar and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-slate-400">Cargando actividades...</p>
            </div>
          ) : (
            <CalendarGrid events={events} />
          )}
        </div>

        {/* Today's Events Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Eventos de Hoy</h3>
              <StatusBadge label={`${todayEvents.length} eventos`} variant="primary" />
            </div>

            <div className="space-y-3">
              {todayEvents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No hay eventos programados para hoy</p>
              ) : (
                todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1 h-full rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: event.color || 'var(--color-brand)', minHeight: '40px' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {event.time && (
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.type && (
                            <StatusBadge label={event.type} variant="neutral" className="text-[10px] py-0 px-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl p-5 text-white">
            <h3 className="text-sm font-semibold mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              <button onClick={() => navigate('/activities')} className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                Agendar Reunion
              </button>
              <button onClick={() => navigate('/activities')} className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                Crear Tarea
              </button>
              <button onClick={() => navigate('/calendar')} className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                Ver Disponibilidad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
