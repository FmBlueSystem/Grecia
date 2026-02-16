import { TrendingDown } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

export default function LostDeals() {
  return (
    <div>
      <PageHeader
        title="Ofertas Perdidas"
        subtitle="Análisis de oportunidades no convertidas"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Ofertas Perdidas' },
        ]}
      />

      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <TrendingDown className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">En Desarrollo</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          El analisis de ofertas perdidas con razones reales, competidores y tendencias
          estara disponible en una proxima actualizacion.
        </p>
      </div>
    </div>
  );
}
