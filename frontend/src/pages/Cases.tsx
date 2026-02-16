import { LifeBuoy } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

export default function Cases() {
  return (
    <div>
      <PageHeader
        title="Casos"
        subtitle="Gestión de casos de soporte"
        breadcrumbs={[
          { label: 'Panel', path: '/' },
          { label: 'Casos' },
        ]}
      />

      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
          <LifeBuoy className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">En Desarrollo</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          La gestion de casos de soporte con integracion a SAP Service Layer
          estara disponible en una proxima actualizacion.
        </p>
      </div>
    </div>
  );
}
