import { Route } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

export default function Traceability() {
  return (
    <div>
      <PageHeader
        title="Trazabilidad"
        subtitle="Seguimiento de documentos y productos"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Trazabilidad' },
        ]}
      />

      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <Route className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Próximamente</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          La trazabilidad completa Cotización → Pedido → Factura con datos reales de SAP
          estará disponible en una próxima actualización.
        </p>
      </div>
    </div>
  );
}
