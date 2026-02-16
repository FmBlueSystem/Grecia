import { useParams } from 'react-router-dom';
import DetailLayout from '../components/detail/DetailLayout';
import InfoCard from '../components/detail/InfoCard';
import Timeline from '../components/detail/Timeline';
import SLAIndicator from '../components/detail/SLAIndicator';
import StatusBadge from '../components/shared/StatusBadge';
import { MessageSquare, UserCheck, Wrench, AlertTriangle, Phone } from 'lucide-react';

export default function CaseDetail() {
  const { id } = useParams();

  return (
    <DetailLayout
      title={`CAS-${id || '5892'}`}
      subtitle="Falla en selladora automática"
      backPath="/cases"
      badges={
        <>
          <StatusBadge label="En Progreso" variant="warning" />
          <StatusBadge label="Alta" variant="error" dot />
        </>
      }
      actions={
        <>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Escalar</button>
          <button className="px-4 py-2 bg-[#0067B2] text-white rounded-lg text-sm font-medium hover:bg-[#005a9e]">Resolver</button>
        </>
      }
      bpfSteps={[
        { label: 'Abierto', status: 'completed' },
        { label: 'Asignado', status: 'completed' },
        { label: 'En Progreso', status: 'active' },
        { label: 'Resuelto', status: 'pending' },
        { label: 'Cerrado', status: 'pending' },
      ]}
      left={
        <>
          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Descripción del Caso</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              El cliente reporta que la selladora automática modelo SEL-2000 presenta fallas intermitentes
              en el ciclo de sellado. La máquina se detiene aleatoriamente durante el proceso y muestra
              el código de error E-47 en el panel. El técnico de planta realizó un reinicio sin éxito.
              Se requiere visita técnica urgente ya que la línea de producción está detenida.
            </p>
          </div>

          {/* SLA */}
          <SLAIndicator
            label="Tiempo de Resolución SLA"
            elapsed="18h"
            total="24h"
            percentage={75}
            status="warning"
          />

          {/* Interaction Timeline */}
          <Timeline
            title="Interacciones"
            events={[
              { id: '1', title: 'Caso abierto por el cliente', description: 'Llamada de Ricardo Solano - Gerente de Planta', date: '12 Feb 2026, 08:30', icon: Phone, iconBg: 'bg-blue-50', iconColor: 'text-[#0067B2]' },
              { id: '2', title: 'Asignado a Roberto Vargas', description: 'Técnico Senior - Especialista en sellado', date: '12 Feb 2026, 09:00', icon: UserCheck, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
              { id: '3', title: 'Diagnóstico remoto', description: 'Error E-47 indica falla en sensor de presión. Se requiere visita.', date: '12 Feb 2026, 10:15', icon: Wrench, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
              { id: '4', title: 'Alerta SLA', description: 'Quedan 6 horas para cumplir el SLA de resolución', date: '13 Feb 2026, 02:30', icon: AlertTriangle, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
              { id: '5', title: 'Nota del técnico', description: 'Visita programada para hoy 14 Feb. Llevando repuesto sensor presión SP-200.', date: '14 Feb 2026, 07:00', icon: MessageSquare, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
            ]}
          />
        </>
      }
      right={
        <>
          <InfoCard
            title="Información del Caso"
            fields={[
              { label: 'Cliente', value: 'Empacadora CR Industrial' },
              { label: 'Equipo', value: 'Selladora SEL-2000' },
              { label: 'Serie', value: 'SN-2024-CR-0847' },
              { label: 'Técnico', value: 'Roberto Vargas' },
              { label: 'Prioridad', value: <StatusBadge label="Alta" variant="error" dot /> },
              { label: 'Canal', value: 'Teléfono' },
            ]}
          />
          <InfoCard
            title="Contacto del Cliente"
            fields={[
              { label: 'Nombre', value: 'Ricardo Solano' },
              { label: 'Cargo', value: 'Gerente de Planta' },
              { label: 'Teléfono', value: '+506 2222-3344' },
              { label: 'Email', value: 'rsolano@empacadora.cr' },
            ]}
          />
        </>
      }
    />
  );
}
