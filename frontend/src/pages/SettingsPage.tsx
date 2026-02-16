import { useState, useEffect } from 'react';
import { User, Building2, Users, Plug, Lock, Bell, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import { FormInput, FormSelect } from '../components/forms/FormField';
import ToggleSwitch from '../components/forms/ToggleSwitch';
import { useAuthStore, useThemeStore, THEME_META, type ThemeSkin } from '../lib/store';
import api from '../lib/api';

type TabId = 'perfil' | 'empresa' | 'usuarios' | 'integraciones';

const TABS: Array<{ id: TabId; label: string; icon: typeof User }> = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'integraciones', label: 'Integraciones', icon: Plug },
];

const ROL_OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'sales', label: 'Vendedor' },
  { value: 'manager', label: 'Gerente' },
  { value: 'viewer', label: 'Visualizador' },
];

const PAIS_OPTIONS = [
  { value: 'cr', label: 'Costa Rica' },
  { value: 'gt', label: 'Guatemala' },
  { value: 'sv', label: 'El Salvador' },
  { value: 'hn', label: 'Honduras' },
  { value: 'pa', label: 'Panamá' },
];

interface UsageUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
  daysSinceLogin: number | null;
  status: 'active' | 'inactive' | 'dormant' | 'never';
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Activo',    cls: 'bg-emerald-50 text-emerald-700' },
  inactive: { label: 'Inactivo',  cls: 'bg-amber-50 text-amber-700' },
  dormant:  { label: 'Inactivo',  cls: 'bg-red-50 text-red-700' },
  never:    { label: 'Sin acceso', cls: 'bg-slate-100 text-slate-500' },
};

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const theme = useThemeStore(s => s.theme);
  const setTheme = useThemeStore(s => s.setTheme);
  const [activeTab, setActiveTab] = useState<TabId>('perfil');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async () => {
    setPwdMessage(null);
    if (newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    setPwdLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPwdMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      setPwdMessage({ type: 'error', text: err.response?.data?.error || 'Error al cambiar la contraseña' });
    } finally {
      setPwdLoading(false);
    }
  };

  // Users tab state
  const [usersData, setUsersData] = useState<UsageUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const rolMap: Record<string, string> = { Admin: 'admin', Gerente: 'manager', Vendedor: 'sales' };
  const userRole = rolMap[user?.role || ''] || 'sales';
  const userInitials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  // Fetch users when tab becomes active
  useEffect(() => {
    if (activeTab === 'usuarios' && usersData.length === 0) {
      setUsersLoading(true);
      api.get('/admin/usage')
        .then(res => setUsersData(res.data?.users || []))
        .catch(() => {})
        .finally(() => setUsersLoading(false));
    }
  }, [activeTab]);

  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Gestiona tu perfil y preferencias del sistema"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Configuraci\u00f3n' },
        ]}
      />

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-brand text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'perfil' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Información Personal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      label="Nombre"
                      type="text"
                      defaultValue={user?.firstName || ''}
                      required
                    />
                    <FormInput
                      label="Apellido"
                      type="text"
                      defaultValue={user?.lastName || ''}
                      required
                    />
                    <FormInput
                      label="Email"
                      type="email"
                      defaultValue={user?.email || ''}
                      required
                    />
                    <FormInput
                      label="Teléfono"
                      type="tel"
                      defaultValue="+506 8888-9999"
                    />
                    <FormSelect
                      label="Rol"
                      options={ROL_OPTIONS}
                      defaultValue={userRole}
                      required
                    />
                    <FormSelect
                      label="País"
                      options={PAIS_OPTIONS}
                      defaultValue="cr"
                      required
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                      Cancelar
                    </button>
                    <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium">
                      Guardar Cambios
                    </button>
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                      <Lock className="w-4 h-4 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Seguridad</h2>
                  </div>

                  {/* Password feedback message */}
                  {pwdMessage && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium ${
                      pwdMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {pwdMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                      {pwdMessage.text}
                    </div>
                  )}

                  <div className="space-y-4">
                    {!showPasswordForm ? (
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Cambiar contraseña</p>
                        <button
                          onClick={() => { setShowPasswordForm(true); setPwdMessage(null); }}
                          className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                        >
                          Actualizar Contraseña
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
                          <div className="relative">
                            <input
                              type={showCurrentPwd ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={e => setCurrentPassword(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none text-sm pr-10"
                              placeholder="Ingresa tu contraseña actual"
                            />
                            <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                          <div className="relative">
                            <input
                              type={showNewPwd ? 'text' : 'password'}
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none text-sm pr-10"
                              placeholder="Mínimo 6 caracteres"
                            />
                            <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {newPassword.length > 0 && newPassword.length < 6 && (
                            <p className="text-xs text-amber-600 mt-1">Mínimo 6 caracteres</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none text-sm"
                            placeholder="Repite la nueva contraseña"
                          />
                          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
                          )}
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwdMessage(null); }}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleChangePassword}
                            disabled={pwdLoading || !currentPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {pwdLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Cambiar Contraseña
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="pt-4 border-t border-slate-100">
                      <ToggleSwitch
                        label="Autenticación de dos factores (2FA)"
                        description="Aumenta la seguridad de tu cuenta"
                        checked={false}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Avatar */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Foto de Perfil</h3>
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-brand to-brand-light rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {userInitials}
                    </div>
                    <button className="text-sm text-brand hover:underline font-medium">
                      Cambiar Foto
                    </button>
                  </div>
                </div>

                {/* Preferences — Theme Picker */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Bell className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">Preferencias</h3>
                  </div>
                  <div className="space-y-4">
                    <ToggleSwitch
                      label="Notificaciones por email"
                      description="Recibir actualizaciones vía correo"
                      checked={emailNotifications}
                      onChange={setEmailNotifications}
                    />
                    <ToggleSwitch
                      label="Notificaciones push"
                      description="Alertas en tiempo real"
                      checked={pushNotifications}
                      onChange={setPushNotifications}
                    />
                    {/* Theme Skin Picker */}
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-sm font-semibold text-slate-700 mb-2">Tema de Color</p>
                      <div className="flex gap-3">
                        {(Object.keys(THEME_META) as ThemeSkin[]).map(t => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                              theme === t ? 'border-brand bg-brand/5 scale-105' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: THEME_META[t].color }} />
                            <span className="text-[11px] font-semibold text-slate-600">{THEME_META[t].label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'empresa' && (
            <div className="bg-white rounded-xl border border-slate-200 p-12">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Configuración de Empresa</h3>
                <p className="text-sm text-slate-500">Esta sección estará disponible próximamente</p>
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Usuarios del Sistema</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{usersData.length} usuarios registrados</p>
                </div>
              </div>
              {usersLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 text-brand animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Usuario</th>
                        <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Rol</th>
                        <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">&Uacute;ltimo Acceso</th>
                        <th className="text-left px-6 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {usersData.map(u => {
                        const st = STATUS_LABELS[u.status] || STATUS_LABELS.never;
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-light rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{u.name}</p>
                                  <p className="text-xs text-slate-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className="text-sm font-medium text-slate-700">{u.role}</span>
                            </td>
                            <td className="px-6 py-3 text-slate-500">
                              {u.lastLoginAt
                                ? new Date(u.lastLoginAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'Nunca'}
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>
                                {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'integraciones' && (
            <div className="bg-white rounded-xl border border-slate-200 p-12">
              <div className="text-center">
                <Plug className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Integraciones</h3>
                <p className="text-sm text-slate-500">Conecta con tus herramientas favoritas (próximamente)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
