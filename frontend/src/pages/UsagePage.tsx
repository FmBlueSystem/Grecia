import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Activity, Loader2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import StatCard from '../components/shared/StatCard';
import api from '../lib/api';

interface UsageUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
  daysSinceLogin: number | null;
  status: 'active' | 'inactive' | 'dormant' | 'never';
}

interface UsageData {
  summary: {
    totalUsers: number;
    activeThisWeek: number;
    activeThisMonth: number;
    neverLoggedIn: number;
    adoptionRate: number;
  };
  users: UsageUser[];
}

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  active: { label: 'Activo', classes: 'bg-emerald-50 text-emerald-700' },
  inactive: { label: 'Inactivo', classes: 'bg-amber-50 text-amber-700' },
  dormant: { label: 'Dormido', classes: 'bg-red-50 text-red-700' },
  never: { label: 'Nunca', classes: 'bg-slate-100 text-slate-500' },
};

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/usage')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <span className="ml-3 text-slate-500">Cargando datos de uso...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">No se pudieron cargar los datos de uso</p>
        <p className="text-xs text-slate-400 mt-1">Solo administradores tienen acceso</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Adopción del CRM"
        subtitle="Monitoreo de uso y actividad de usuarios"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Adopción' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
        <StatCard
          label="Usuarios Totales"
          value={data.summary.totalUsers}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Activos esta Semana"
          value={data.summary.activeThisWeek}
          icon={UserCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Tasa de Adopción"
          value={`${data.summary.adoptionRate}%`}
          icon={Activity}
          iconBg={data.summary.adoptionRate >= 70 ? 'bg-emerald-50' : 'bg-red-50'}
          iconColor={data.summary.adoptionRate >= 70 ? 'text-emerald-600' : 'text-red-600'}
        />
        <StatCard
          label="Nunca Ingresaron"
          value={data.summary.neverLoggedIn}
          icon={UserX}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Detalle por Usuario</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3 font-semibold text-slate-600">Usuario</th>
              <th className="px-5 py-3 font-semibold text-slate-600">Rol</th>
              <th className="px-5 py-3 font-semibold text-slate-600">Último Ingreso</th>
              <th className="px-5 py-3 font-semibold text-slate-600 text-center">Días sin entrar</th>
              <th className="px-5 py-3 font-semibold text-slate-600 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(u => {
              const st = STATUS_STYLES[u.status] || STATUS_STYLES.never;
              return (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.role}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {u.daysSinceLogin != null
                      ? <span className={`font-bold ${u.daysSinceLogin > 7 ? 'text-red-500' : 'text-slate-700'}`}>{u.daysSinceLogin}</span>
                      : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${st.classes}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
