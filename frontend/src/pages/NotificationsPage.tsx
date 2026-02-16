import { useState } from 'react';
import { FileText, AlertTriangle, UserPlus, Receipt, Calendar, Truck, Settings, CheckCheck } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import FilterChips from '../components/shared/FilterChips';
import NotificationItem from '../components/notifications/NotificationItem';

interface Notification {
  id: string;
  icon: typeof FileText;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: FileText,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#0067B2]',
    title: 'Nueva cotización solicitada',
    description: 'Alimentos del Valle S.A. ha solicitado una cotización para Expansión Línea Frutas',
    time: 'Hace 10 minutos',
    read: false,
    category: 'ventas',
  },
  {
    id: '2',
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'SLA próximo a vencer',
    description: 'El caso #CS-2026-045 vence en 2 horas. Requiere atención inmediata.',
    time: 'Hace 25 minutos',
    read: false,
    category: 'soporte',
  },
  {
    id: '3',
    icon: UserPlus,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    title: 'Nuevo prospecto asignado',
    description: 'Se te ha asignado el prospecto "Exportadora Tropical" para seguimiento',
    time: 'Hace 1 hora',
    read: false,
    category: 'ventas',
  },
  {
    id: '4',
    icon: Receipt,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    title: 'Factura pagada',
    description: 'La factura INV-2026-0234 ha sido pagada por $450,000',
    time: 'Hace 2 horas',
    read: true,
    category: 'ventas',
  },
  {
    id: '5',
    icon: Calendar,
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#0067B2]',
    title: 'Recordatorio de reunión',
    description: 'Reunión con AgroIndustrias CR programada para mañana a las 10:00 AM',
    time: 'Hace 3 horas',
    read: true,
    category: 'sistema',
  },
  {
    id: '6',
    icon: Truck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'Envío completado',
    description: 'El lote LOT-2026-001198 ha sido entregado exitosamente',
    time: 'Hace 5 horas',
    read: true,
    category: 'sistema',
  },
  {
    id: '7',
    icon: Settings,
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-600',
    title: 'Actualización del sistema',
    description: 'Nueva versión 2.4.1 disponible con mejoras de rendimiento',
    time: 'Ayer, 4:30 PM',
    read: true,
    category: 'sistema',
  },
];

const FILTER_OPTIONS = [
  { id: 'todas', label: 'Todas', count: MOCK_NOTIFICATIONS.length },
  { id: 'no_leidas', label: 'No leídas', count: MOCK_NOTIFICATIONS.filter(n => !n.read).length },
  { id: 'ventas', label: 'Ventas', count: MOCK_NOTIFICATIONS.filter(n => n.category === 'ventas').length },
  { id: 'soporte', label: 'Soporte', count: MOCK_NOTIFICATIONS.filter(n => n.category === 'soporte').length },
  { id: 'sistema', label: 'Sistema', count: MOCK_NOTIFICATIONS.filter(n => n.category === 'sistema').length },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState('todas');

  const filteredNotifications = MOCK_NOTIFICATIONS.filter((notification) => {
    if (filter === 'todas') return true;
    if (filter === 'no_leidas') return !notification.read;
    return notification.category === filter;
  });

  const todayNotifications = filteredNotifications.filter((n) => n.time.includes('minutos') || n.time.includes('hora'));
  const yesterdayNotifications = filteredNotifications.filter((n) => n.time.includes('Ayer'));

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notificaciones"
        subtitle={`Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Notificaciones' },
        ]}
        action={
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <CheckCheck className="w-4 h-4" />
            Marcar todo leído
          </button>
        }
      />

      {/* Filters */}
      <div className="mb-6">
        <FilterChips options={FILTER_OPTIONS} selected={filter} onChange={setFilter} />
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {/* Today */}
        {todayNotifications.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Hoy</h2>
            <div className="space-y-2">
              {todayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  icon={notification.icon}
                  iconBg={notification.iconBg}
                  iconColor={notification.iconColor}
                  title={notification.title}
                  description={notification.description}
                  time={notification.time}
                  read={notification.read}
                />
              ))}
            </div>
          </div>
        )}

        {/* Yesterday */}
        {yesterdayNotifications.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ayer</h2>
            <div className="space-y-2">
              {yesterdayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  icon={notification.icon}
                  iconBg={notification.iconBg}
                  iconColor={notification.iconColor}
                  title={notification.title}
                  description={notification.description}
                  time={notification.time}
                  read={notification.read}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCheck className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay notificaciones</h3>
              <p className="text-sm text-slate-500">
                {filter === 'no_leidas'
                  ? 'Has leído todas tus notificaciones'
                  : 'No tienes notificaciones en esta categoría'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
