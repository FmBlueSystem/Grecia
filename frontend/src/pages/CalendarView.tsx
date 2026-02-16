import { Plus, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import CalendarGrid from '../components/calendar/CalendarGrid';
import StatusBadge from '../components/shared/StatusBadge';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  color?: string;
  type?: string;
  description?: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Reunión con Alimentos del Valle',
    date: '2026-02-14',
    time: '10:00 AM',
    color: '#0067B2',
    type: 'Reunión',
    description: 'Presentación de propuesta comercial',
  },
  {
    id: '2',
    title: 'Llamada - Exportadora Tropical',
    date: '2026-02-14',
    time: '2:30 PM',
    color: '#00A3E0',
    type: 'Llamada',
    description: 'Seguimiento de cotización',
  },
  {
    id: '3',
    title: 'Demo Sistema Logística',
    date: '2026-02-14',
    time: '4:00 PM',
    color: '#4ECDC4',
    type: 'Demo',
    description: 'Demostración para AgroIndustrias',
  },
  {
    id: '4',
    title: 'Envío Propuesta - Frutas Premium',
    date: '2026-02-14',
    time: '5:30 PM',
    color: '#95E1D3',
    type: 'Tarea',
    description: 'Deadline envío propuesta',
  },
  {
    id: '5',
    title: 'Workshop Productos',
    date: '2026-02-17',
    time: '9:00 AM',
    color: '#0067B2',
    type: 'Reunión',
  },
  {
    id: '6',
    title: 'Visita a Cliente - Guatemala',
    date: '2026-02-18',
    color: '#F38181',
    type: 'Visita',
  },
  {
    id: '7',
    title: 'Cierre Oportunidad',
    date: '2026-02-19',
    time: '11:00 AM',
    color: '#0067B2',
    type: 'Reunión',
  },
  {
    id: '8',
    title: 'Revisión Pipelines',
    date: '2026-02-20',
    time: '3:00 PM',
    color: '#00A3E0',
    type: 'Interna',
  },
  {
    id: '9',
    title: 'Training - Nuevo Sistema',
    date: '2026-02-21',
    time: '10:00 AM',
    color: '#4ECDC4',
    type: 'Capacitación',
  },
  {
    id: '10',
    title: 'Reunión Ventas Regional',
    date: '2026-02-24',
    time: '2:00 PM',
    color: '#0067B2',
    type: 'Reunión',
  },
];

const todayEvents = MOCK_EVENTS.filter((e) => e.date === '2026-02-14');
const thisWeekEvents = MOCK_EVENTS.filter((e) => {
  const eventDate = new Date(e.date);
  const today = new Date('2026-02-14');
  const weekEnd = new Date('2026-02-20');
  return eventDate >= today && eventDate <= weekEnd;
});
const pendingEvents = MOCK_EVENTS.filter((e) => new Date(e.date) >= new Date('2026-02-14'));

export default function CalendarView() {
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
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0067B2] text-white rounded-lg hover:bg-[#005a9c] transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Nueva Actividad
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Hoy"
          value={todayEvents.length}
          icon={CalendarIcon}
          iconBg="bg-blue-50"
          iconColor="text-[#0067B2]"
        />
        <StatCard
          label="Esta Semana"
          value={thisWeekEvents.length}
          icon={Clock}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          label="Pendientes"
          value={pendingEvents.length}
          icon={AlertCircle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Calendar and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <CalendarGrid events={MOCK_EVENTS} />
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
                <p className="text-sm text-slate-400 text-center py-6">No hay eventos programados</p>
              ) : (
                todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1 h-full rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: event.color || '#0067B2', minHeight: '40px' }}
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
          <div className="bg-gradient-to-br from-[#0067B2] to-[#00A3E0] rounded-xl p-5 text-white">
            <h3 className="text-sm font-semibold mb-3">Acciones Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                Agendar Reunión
              </button>
              <button className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                Crear Tarea
              </button>
              <button className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                Ver Disponibilidad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
