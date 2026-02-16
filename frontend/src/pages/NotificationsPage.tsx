import { Bell } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title="Notificaciones"
        subtitle="Centro de alertas y notificaciones"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Notificaciones' },
        ]}
      />

      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">En Desarrollo</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          El sistema de notificaciones en tiempo real con alertas de facturas vencidas,
          cotizaciones por vencer y eventos del pipeline estara disponible en una proxima actualizacion.
        </p>
      </div>
    </div>
  );
}
