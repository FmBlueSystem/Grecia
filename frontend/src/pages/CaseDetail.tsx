import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import DetailLayout from '../components/detail/DetailLayout';
import InfoCard from '../components/detail/InfoCard';
import StatusBadge from '../components/shared/StatusBadge';
import api from '../lib/api';

interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  origin?: string;
  account?: { id: string; name: string } | null;
  contact?: { id: string; firstName: string; lastName: string; email?: string; phone?: string; jobTitle?: string } | null;
  owner?: { id: string; firstName: string; lastName: string; email?: string } | null;
  createdAt: string;
  updatedAt: string;
}

const PRIORITY_VARIANT: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = {
  CRITICAL: 'error',
  HIGH: 'error',
  NORMAL: 'warning',
  LOW: 'info',
};

const STATUS_VARIANT: Record<string, 'error' | 'warning' | 'success' | 'info' | 'neutral'> = {
  NEW: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Nuevo',
  IN_PROGRESS: 'En Progreso',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

function getBPFSteps(status: string) {
  const steps = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const currentIdx = steps.indexOf(status);
  return [
    { label: 'Abierto', status: currentIdx > 0 ? 'completed' as const : currentIdx === 0 ? 'active' as const : 'pending' as const },
    { label: 'En Progreso', status: currentIdx > 1 ? 'completed' as const : currentIdx === 1 ? 'active' as const : 'pending' as const },
    { label: 'Resuelto', status: currentIdx > 2 ? 'completed' as const : currentIdx === 2 ? 'active' as const : 'pending' as const },
    { label: 'Cerrado', status: currentIdx >= 3 ? 'active' as const : 'pending' as const },
  ];
}

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/cases/${id}`)
      .then(res => setCaseData(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
        <span className="ml-3 text-slate-500">Cargando caso...</span>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">No se encontró el caso solicitado.</p>
        <button onClick={() => navigate('/cases')} className="text-brand font-medium hover:underline">Volver a Casos</button>
      </div>
    );
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <DetailLayout
      title={caseData.caseNumber}
      subtitle={caseData.title}
      backPath="/cases"
      badges={
        <>
          <StatusBadge label={STATUS_LABEL[caseData.status] || caseData.status} variant={STATUS_VARIANT[caseData.status] || 'neutral'} />
          <StatusBadge label={caseData.priority} variant={PRIORITY_VARIANT[caseData.priority] || 'neutral'} dot />
        </>
      }
      bpfSteps={getBPFSteps(caseData.status)}
      left={
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Descripcion del Caso</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {caseData.description || 'Sin descripcion disponible.'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Linea de Tiempo</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Creado</span>
                <span className="font-medium text-slate-900">{fmtDate(caseData.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ultima actualizacion</span>
                <span className="font-medium text-slate-900">{fmtDate(caseData.updatedAt)}</span>
              </div>
            </div>
          </div>
        </>
      }
      right={
        <>
          <InfoCard
            title="Informacion del Caso"
            fields={[
              { label: 'Numero', value: caseData.caseNumber },
              { label: 'Cliente', value: caseData.account?.name || 'Sin asignar' },
              { label: 'Prioridad', value: <StatusBadge label={caseData.priority} variant={PRIORITY_VARIANT[caseData.priority] || 'neutral'} dot /> },
              { label: 'Origen', value: caseData.origin || '-' },
              { label: 'Responsable', value: caseData.owner ? `${caseData.owner.firstName} ${caseData.owner.lastName}` : 'Sin asignar' },
            ]}
          />
          {caseData.contact && (
            <InfoCard
              title="Contacto"
              fields={[
                { label: 'Nombre', value: `${caseData.contact.firstName} ${caseData.contact.lastName}` },
                ...(caseData.contact.jobTitle ? [{ label: 'Cargo', value: caseData.contact.jobTitle }] : []),
                ...(caseData.contact.phone ? [{ label: 'Telefono', value: caseData.contact.phone }] : []),
                ...(caseData.contact.email ? [{ label: 'Email', value: caseData.contact.email }] : []),
              ]}
            />
          )}
        </>
      }
    />
  );
}
