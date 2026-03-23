"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save, Loader2, Mail, Zap, Globe, Eye, EyeOff, Shield, Activity, ScrollText, Users, MousePointerClick, MonitorSmartphone, List, X, Plus, Building2, Trash2, Pencil, UserPlus, UserMinus, ChevronDown, ChevronUp, AlertTriangle, Palette, Check, Network, Download, Upload, UserCog, Search } from "lucide-react";
import { ROLE_COLORS } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import { PALETTES, type PaletteId } from "@/lib/palettes";

interface SettingItem {
  key: string;
  value: unknown;
  label: string;
  category: string;
  type: string;
}

interface PermissionsData {
  modules: string[];
  labels: Record<string, string>;
  roles: string[];
  permissions: Record<string, Record<string, boolean>>;
}

interface TelemetryEvent {
  id: number;
  user_name: string;
  event: string;
  page: string;
  duration_ms: number | null;
  country: string;
  created_at: string;
}

interface TelemetryData {
  events: TelemetryEvent[];
  stats: { eventsToday: number; usersToday: number; viewsToday: number };
  topPages: { page: string; count: number }[];
}

interface AuditEntry {
  id: number;
  source: string;
  user_name: string | null;
  action: string;
  entity: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  created_at: string;
}

interface DeptMember {
  id: number;
  name: string;
  email: string;
}

interface Department {
  id: number;
  name: string;
  country: string;
  chief: { id: number; name: string } | null;
  supervisors: DeptMember[];
  agents: DeptMember[];
  users: { id: number; name: string; role: string }[];
}

interface SimpleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  use_ad: boolean;
  department_id: number | null;
  default_country: string;
}

interface EscalationRule {
  id: number;
  priority: string;
  level_1_pct: number;
  level_2_pct: number;
  level_3_minutes: number;
  notify_email: boolean;
  notify_in_app: boolean;
  notify_whatsapp: boolean;
  country: string | null;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: string;
  countries: string[];
  default_country: string;
  active: boolean;
  created_at: string;
  sap_employee_id: number | null;
  department_id: number | null;
}

const COUNTRY_OPTIONS = [
  { code: "CR", name: "Costa Rica" },
  { code: "SV", name: "El Salvador" },
  { code: "GT", name: "Guatemala" },
  { code: "HN", name: "Honduras" },
  { code: "PA", name: "Panama" },
];

const ROLE_OPTIONS = ["agente", "colaborador", "supervisor", "admin", "coordinador"];

const CATEGORY_META: Record<string, { title: string; icon: React.ReactNode; desc: string }> = {
  general: { title: "General", icon: <Globe className="h-5 w-5" />, desc: "Configuración general del portal" },
  email: { title: "Correo SMTP", icon: <Mail className="h-5 w-5" />, desc: "Servidor de correo para notificaciones" },
  automatizacion: { title: "Automatizaciones", icon: <Zap className="h-5 w-5" />, desc: "Activar o desactivar flujos automaticos" },
  active_directory: { title: "Active Directory", icon: <Network className="h-5 w-5" />, desc: "Autenticacion de usuarios via AD corporativo" },
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  agente: "Agente",
  colaborador: "Colaborador",
  coordinador: "Coordinador",
};

const EVENT_LABELS: Record<string, string> = {
  page_view: "Vista de pagina",
  create_caso: "Crear caso",
  update_caso: "Editar caso",
  login: "Login",
  logout: "Logout",
  switch_country: "Cambiar pais",
};

export default function ConfiguracionPage() {
  const { paletteId, setPalette } = useTheme();
  const [items, setItems] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState<Record<string, unknown>>({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Permissions
  const [permsData, setPermsData] = useState<PermissionsData | null>(null);
  const [permsDirty, setPermsDirty] = useState<Record<string, Record<string, boolean>>>({});
  const [savingPerms, setSavingPerms] = useState(false);

  // Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  // Audit
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  // Dropdown options editor
  const [dropdownOptions, setDropdownOptions] = useState<Record<string, string[]>>({});
  const [dropdownDirty, setDropdownDirty] = useState<Record<string, string[]>>({});
  const [savingDropdowns, setSavingDropdowns] = useState(false);
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  // Departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allUsers, setAllUsers] = useState<SimpleUser[]>([]);
  const [coordinators, setCoordinators] = useState<{ id: number; name: string; default_country: string }[]>([]);
  const [canAdmin, setCanAdmin] = useState(false);
  const [sessionRole, setSessionRole] = useState("");
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ name: "", country: "CR", chief_user_id: "" });
  const [savingDept, setSavingDept] = useState(false);
  const [expandedDept, setExpandedDept] = useState<number | null>(null);
  const [addingMember, setAddingMember] = useState<{ deptId: number; userId: string; role: string } | null>(null);

  // AD user association
  const [adDirty, setAdDirty] = useState<Record<number, { use_ad?: boolean; department_id?: number | null }>>({});
  const [savingAD, setSavingAD] = useState(false);

  // Escalation Rules
  const [escRules, setEscRules] = useState<EscalationRule[]>([]);
  const [escRulesDirty, setEscRulesDirty] = useState<Record<number, Partial<EscalationRule>>>({});
  const [savingEscRules, setSavingEscRules] = useState(false);

  // Tab navigation
  type TabId = "usuarios" | "configuracion" | "departamentos" | "permisos" | "auditoria" | "apariencia";
  const [activeTab, setActiveTab] = useState<TabId>("usuarios");
  const [configSubTab, setConfigSubTab] = useState<"parametros" | "listas" | "escalamiento" | "directorio_ad">("parametros");

  // User management
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ created: number; failed: number; results: { row: number; email: string; status: string; reason?: string }[] } | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName2, setUserName2] = useState("");
  const [userRole, setUserRole] = useState("agente");
  const [userCountries, setUserCountries] = useState<string[]>(["CR"]);
  const [userSapId, setUserSapId] = useState("");
  const [userDeptId, setUserDeptId] = useState<string>("");
  const [userDefaultCountry, setUserDefaultCountry] = useState("CR");

  // User list filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/permissions").then((r) => r.json()),
      fetch("/api/telemetry?days=7").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/audit?days=7").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/dropdown-options").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/departments").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/users").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/escalation-rules").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/coordinators").then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/auth/session").then((r) => r.ok ? r.json() : null).catch(() => null),
    ]).then(([settingsData, permsResp, telData, auditData, ddData, deptData, usersData, escData, coordData, sessionData]) => {
      setItems(settingsData.items || []);
      if (permsResp.modules) setPermsData(permsResp);
      if (telData) setTelemetry(telData);
      if (auditData?.logs) setAuditLogs(auditData.logs);
      if (ddData) setDropdownOptions(ddData);
      if (deptData?.items) setDepartments(deptData.items);
      if (usersData?.users) {
        setAllUsers(usersData.users.filter((u: SimpleUser & { active: boolean }) => u.active));
        setUsers(usersData.users);
      }
      if (coordData?.coordinators) setCoordinators(coordData.coordinators);
      if (sessionData?.role) {
        setSessionRole(sessionData.role);
        if (["admin", "super_admin"].includes(sessionData.role)) setCanAdmin(true);
      }
      if (escData?.rules) setEscRules(escData.rules);
    }).catch(() => setError("Error al cargar configuracion"))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(key: string, value: unknown) {
    setDirty((prev) => ({ ...prev, [key]: value }));
  }

  function getValue(item: SettingItem) {
    return dirty[item.key] !== undefined ? dirty[item.key] : item.value;
  }

  function getPermValue(role: string, module: string): boolean {
    if (permsDirty[role]?.[module] !== undefined) return permsDirty[role][module];
    return permsData?.permissions[role]?.[module] === true;
  }

  function handlePermChange(role: string, module: string, enabled: boolean) {
    setPermsDirty((prev) => ({
      ...prev,
      [role]: { ...(prev[role] || {}), [module]: enabled },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    const updates = Object.entries(dirty).map(([key, value]) => ({ key, value }));
    if (updates.length === 0) { setSaving(false); setSuccess("Sin cambios"); return; }

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(`${data.updated} parametro(s) actualizado(s)`);
        setDirty({});
        const refreshed = await fetch("/api/settings").then((r) => r.json());
        setItems(refreshed.items || []);
      } else {
        const d = await res.json();
        setError(d.error || "Error al guardar");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePerms() {
    setSavingPerms(true);
    setError("");
    setSuccess("");
    const updates: { role: string; module: string; enabled: boolean }[] = [];
    for (const [role, modules] of Object.entries(permsDirty)) {
      for (const [module, enabled] of Object.entries(modules)) {
        updates.push({ role, module, enabled });
      }
    }
    if (updates.length === 0) { setSavingPerms(false); setSuccess("Sin cambios en permisos"); return; }

    try {
      const res = await fetch("/api/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(`${data.updated} permiso(s) actualizado(s)`);
        setPermsDirty({});
        const refreshed = await fetch("/api/permissions").then((r) => r.json());
        if (refreshed.modules) setPermsData(refreshed);
      } else {
        const d = await res.json();
        setError(d.error || "Error al guardar permisos");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSavingPerms(false);
    }
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  // Dropdown editor helpers
  const DROPDOWN_KEYS = [
    { key: "canal", settingKey: "dropdown_canal", label: "Canal de Ingreso" },
    { key: "tipo_caso", settingKey: "dropdown_tipo_caso", label: "Tipo de Caso" },
    { key: "area", settingKey: "dropdown_area", label: "Area Responsable" },
    { key: "tiempo_estimado", settingKey: "dropdown_tiempo_estimado", label: "Tiempo Estimado" },
  ] as const;

  function getDropdownValues(key: string): string[] {
    return dropdownDirty[key] ?? dropdownOptions[key] ?? [];
  }

  function handleRemoveOption(key: string, index: number) {
    const current = [...getDropdownValues(key)];
    if (current.length <= 1) return;
    current.splice(index, 1);
    setDropdownDirty((prev) => ({ ...prev, [key]: current }));
  }

  function handleAddOption(key: string) {
    const val = (newOptionInputs[key] || "").trim();
    if (!val) return;
    const current = [...getDropdownValues(key)];
    if (current.includes(val)) return;
    current.push(val);
    setDropdownDirty((prev) => ({ ...prev, [key]: current }));
    setNewOptionInputs((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSaveDropdowns() {
    setSavingDropdowns(true);
    setError("");
    setSuccess("");
    const updates = Object.entries(dropdownDirty).map(([key, values]) => {
      const dd = DROPDOWN_KEYS.find((d) => d.key === key);
      return { key: dd?.settingKey ?? `dropdown_${key}`, value: JSON.stringify(values) };
    });
    if (updates.length === 0) { setSavingDropdowns(false); setSuccess("Sin cambios en dropdowns"); return; }

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(`${data.updated} dropdown(s) actualizado(s)`);
        setDropdownDirty({});
        const refreshed = await fetch("/api/dropdown-options").then((r) => r.json());
        setDropdownOptions(refreshed);
      } else {
        const d = await res.json();
        setError(d.error || "Error al guardar dropdowns");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSavingDropdowns(false);
    }
  }

  const hasDirtyDropdowns = Object.keys(dropdownDirty).length > 0;

  // Escalation Rules helpers
  function getEscRuleValue<K extends keyof EscalationRule>(rule: EscalationRule, field: K): EscalationRule[K] {
    const d = escRulesDirty[rule.id];
    if (d && d[field] !== undefined) return d[field] as EscalationRule[K];
    return rule[field];
  }

  function handleEscRuleChange(ruleId: number, field: keyof EscalationRule, value: number | boolean) {
    setEscRulesDirty((prev) => ({
      ...prev,
      [ruleId]: { ...(prev[ruleId] || {}), [field]: value },
    }));
  }

  const hasEscRulesDirty = Object.keys(escRulesDirty).length > 0;

  async function handleSaveEscRules() {
    setSavingEscRules(true);
    setError("");
    setSuccess("");
    const rules = Object.entries(escRulesDirty).map(([id, changes]) => ({ id: Number(id), ...changes }));
    if (rules.length === 0) { setSavingEscRules(false); return; }
    try {
      const res = await fetch("/api/escalation-rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      if (res.ok) {
        const d = await res.json();
        setSuccess(`${d.updated} regla(s) actualizada(s)`);
        setEscRulesDirty({});
        const refreshed = await fetch("/api/escalation-rules").then((r) => r.json());
        if (refreshed?.rules) setEscRules(refreshed.rules);
      } else {
        const d = await res.json();
        setError(d.error || "Error al guardar reglas");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSavingEscRules(false);
    }
  }

  async function handleSaveAD() {
    setSavingAD(true);
    setError("");
    setSuccess("");
    try {
      await Promise.all(
        Object.entries(adDirty).map(([userId, changes]) =>
          fetch(`/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes),
          })
        )
      );
      setSuccess(`${Object.keys(adDirty).length} usuario(s) actualizado(s)`);
      setAdDirty({});
      const refreshed = await fetch("/api/users").then((r) => r.json());
      if (refreshed?.users) setAllUsers(refreshed.users.filter((u: SimpleUser & { active: boolean }) => u.active));
    } catch {
      setError("Error al guardar cambios AD");
    } finally {
      setSavingAD(false);
    }
  }

  function getAdValue<K extends keyof SimpleUser>(user: SimpleUser, field: K): SimpleUser[K] {
    const dirty = adDirty[user.id] as Partial<SimpleUser> | undefined;
    if (dirty && dirty[field] !== undefined) return dirty[field] as SimpleUser[K];
    return user[field];
  }

  const PRIORITY_COLORS: Record<string, string> = {
    Alta: "bg-red-50 text-red-700 border-red-200",
    Normal: "bg-amber-50 text-amber-700 border-amber-200",
    Baja: "bg-green-50 text-green-700 border-green-200",
  };

  // Department helpers
  async function loadDepartments() {
    const res = await fetch("/api/departments");
    if (res.ok) {
      const data = await res.json();
      setDepartments(data.items || []);
    }
  }

  function openDeptModal(dept?: Department) {
    if (dept) {
      setEditingDept(dept);
      setDeptForm({ name: dept.name, country: dept.country, chief_user_id: dept.chief?.id ? String(dept.chief.id) : "" });
    } else {
      setEditingDept(null);
      setDeptForm({ name: "", country: "CR", chief_user_id: "" });
    }
    setDeptModalOpen(true);
  }

  async function handleSaveDept() {
    if (!deptForm.name.trim()) { setError("Nombre de departamento requerido"); return; }
    if (!deptForm.chief_user_id) { setError("Debe asignar un jefe al departamento"); return; }
    setSavingDept(true);
    setError("");
    try {
      const payload = {
        name: deptForm.name.trim(),
        country: deptForm.country,
        chief_user_id: deptForm.chief_user_id ? Number(deptForm.chief_user_id) : null,
      };
      const url = editingDept ? `/api/departments/${editingDept.id}` : "/api/departments";
      const method = editingDept ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        setSuccess(editingDept ? "Departamento actualizado" : "Departamento creado");
        setDeptModalOpen(false);
        await loadDepartments();
      } else {
        const d = await res.json();
        setError(d.error || "Error al guardar departamento");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSavingDept(false);
    }
  }

  async function handleDeleteDept(deptId: number) {
    setError("");
    try {
      const res = await fetch(`/api/departments/${deptId}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Departamento eliminado");
        setExpandedDept(null);
        await loadDepartments();
      } else {
        const d = await res.json();
        setError(d.error || "Error al eliminar");
      }
    } catch {
      setError("Error de conexion");
    }
  }

  async function handleAddMember(deptId: number, userId: number, role: string) {
    setError("");
    try {
      const res = await fetch(`/api/departments/${deptId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role }),
      });
      if (res.ok) {
        setSuccess("Miembro agregado");
        setAddingMember(null);
        await loadDepartments();
      } else {
        const d = await res.json();
        setError(d.error || "Error al agregar miembro");
      }
    } catch {
      setError("Error de conexion");
    }
  }

  async function handleRemoveMember(deptId: number, userId: number) {
    setError("");
    try {
      const res = await fetch(`/api/departments/${deptId}/members/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Miembro removido");
        await loadDepartments();
      } else {
        const d = await res.json();
        setError(d.error || "Error al remover miembro");
      }
    } catch {
      setError("Error de conexion");
    }
  }

  function getAvailableUsersForDept(dept: Department): SimpleUser[] {
    const memberIds = new Set([
      ...dept.supervisors.map((m) => m.id),
      ...dept.agents.map((m) => m.id),
    ]);
    return allUsers.filter((u) => !memberIds.has(u.id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // User management functions
  async function loadUsers() {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) { const d = await res.json(); setUsers(d.users); setAllUsers(d.users.filter((u: SimpleUser & { active: boolean }) => u.active)); }
    } catch { /* silent */ } finally { setUsersLoading(false); }
    fetch("/api/coordinators").then((r) => r.ok ? r.json() : null).then((d) => { if (d?.coordinators) setCoordinators(d.coordinators); }).catch(() => {});
  }

  function toggleUserCountry(code: string) {
    setUserCountries((p) => p.includes(code) ? p.filter((c) => c !== code) : [...p, code]);
  }

  function resetUserForm() {
    setUserEmail(""); setUserPassword(""); setUserName2(""); setUserRole("agente");
    setUserCountries(["CR"]); setUserSapId(""); setUserDeptId(""); setUserDefaultCountry("CR"); setEditingUser(null);
    setUserError(""); setUserSuccess("");
  }

  function startEditingUser(u: UserRow) {
    setEditingUser(u); setShowUserForm(false);
    setUserName2(u.name); setUserEmail(u.email); setUserPassword("");
    setUserRole(u.role); setUserCountries(u.countries);
    setUserDefaultCountry(u.default_country || u.countries[0] || "CR");
    setUserSapId(u.sap_employee_id != null ? String(u.sap_employee_id) : "");
    setUserDeptId(u.department_id != null ? String(u.department_id) : "");
    setUserError(""); setUserSuccess("");
  }

  function openCreateUser() {
    resetUserForm();
    if (sessionRole === "coordinador") setUserRole("colaborador");
    setShowUserForm(true);
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true); setUserError(""); setUserSuccess("");
    try {
      const changes: Record<string, unknown> = {};
      if (userName2 !== editingUser.name) changes.name = userName2;
      if (userRole !== editingUser.role) changes.role = userRole;
      if (userPassword) changes.password = userPassword;
      const countriesChanged = userCountries.length !== editingUser.countries.length || userCountries.some((c) => !editingUser.countries.includes(c));
      if (countriesChanged) changes.countries = userCountries;
      if (userDefaultCountry !== editingUser.default_country) changes.default_country = userDefaultCountry;
      const newSapId = userSapId ? Number(userSapId) : null;
      if (newSapId !== editingUser.sap_employee_id) changes.sap_employee_id = newSapId;
      const newDeptId = userDeptId ? Number(userDeptId) : null;
      if (newDeptId !== editingUser.department_id) changes.department_id = newDeptId;
      if (Object.keys(changes).length === 0) { setUserError("No hay cambios"); setSavingUser(false); return; }
      const res = await fetch(`/api/users/${editingUser.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
      const data = await res.json();
      if (!res.ok) { setUserError(data.error || "Error al actualizar"); return; }
      setUserSuccess(`${editingUser.email} actualizado`);
      resetUserForm(); await loadUsers();
    } catch { setUserError("Error de conexion"); } finally { setSavingUser(false); }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setSavingUser(true); setUserError(""); setUserSuccess("");
    try {
      const res = await fetch("/api/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: userPassword, name: userName2, role: userRole, countries: userCountries, default_country: userCountries[0], sap_employee_id: userSapId ? Number(userSapId) : null }),
      });
      const data = await res.json();
      if (!res.ok) { setUserError(data.error || "Error al crear"); return; }
      setUserSuccess(`${userEmail} creado`);
      resetUserForm(); setShowUserForm(false); await loadUsers();
    } catch { setUserError("Error de conexion"); } finally { setSavingUser(false); }
  }

  async function handleImportUsers(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true); setImportResults(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setUserError(data.error || "Error al importar"); return; }
      setImportResults(data); await loadUsers();
    } catch { setUserError("Error de conexion"); } finally { setImporting(false); e.target.value = ""; }
  }

  async function toggleUserActive(u: UserRow) {
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !u.active }) });
      if (res.ok) await loadUsers();
    } catch { /* silent */ }
  }

  const categories = ["general", "email", "automatizacion", "active_directory"];
  const hasDirtySettings = Object.keys(dirty).length > 0;
  const hasDirtyPerms = Object.keys(permsDirty).length > 0;

  const drawerOpen = showUserForm || !!editingUser;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !userRoleFilter || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  // Sidebar nav item renderer
  function navItem(tab: TabId, icon: React.ReactNode, label: string, badge?: number) {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {badge !== undefined && (
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{badge}</span>
        )}
      </button>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UserCog className="h-6 w-6 text-slate-600" />
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900">Administración</h1>
          <p className="text-sm text-slate-500">Usuarios, configuración, departamentos y permisos del sistema</p>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">{success}</div>}

      {/* Two-column layout */}
      <div className="flex gap-5 items-start">

        {/* ── Left Sidebar ── */}
        <aside className="w-52 shrink-0 rounded-xl border border-slate-200/60 bg-white shadow-sm py-4 px-2 space-y-0.5">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Equipo</p>
          {navItem("usuarios", <Users className="h-4 w-4" />, "Usuarios", users.length)}
          {navItem("departamentos", <Building2 className="h-4 w-4" />, "Departamentos", departments.length)}

          <div className="mx-1 my-2 border-t border-slate-100" />
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sistema</p>
          {navItem("configuracion", <Settings className="h-4 w-4" />, "Configuración")}

          <div className="mx-1 my-2 border-t border-slate-100" />
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Acceso</p>
          {navItem("permisos", <Shield className="h-4 w-4" />, "Permisos")}
          {navItem("auditoria", <ScrollText className="h-4 w-4" />, "Auditoría")}
          {navItem("apariencia", <Palette className="h-4 w-4" />, "Apariencia")}
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ══ TAB: USUARIOS ══ */}
          {activeTab === "usuarios" && (
            <motion.div key="usuarios" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{filteredUsers.length} / {users.length} usuario(s)</p>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImportUsers} disabled={importing} />
                    <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                      {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Importar CSV
                    </span>
                  </label>
                  <a href="/api/admin/template" download className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Download className="h-4 w-4" /> Plantilla
                  </a>
                  {(canAdmin || sessionRole === "coordinador") && (
                    <Button onClick={openCreateUser}>
                      <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                    </Button>
                  )}
                </div>
              </div>

              {/* Search + filter */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Todos los roles</option>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {importResults && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Importación: <span className="text-green-600">{importResults.created} creados</span>
                    {importResults.failed > 0 && <span className="text-red-500 ml-2">{importResults.failed} fallidos</span>}
                  </p>
                  {importResults.results.filter((r) => r.status === "error").map((r) => (
                    <p key={r.row} className="text-xs text-red-500">Fila {r.row} ({r.email}): {r.reason}</p>
                  ))}
                </div>
              )}

              {/* Users table */}
              <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-400">
                    {users.length === 0 ? "No hay usuarios registrados" : "Sin resultados para la búsqueda"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <th className="px-4 py-3">Nombre</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Rol</th>
                          <th className="px-4 py-3">Países</th>
                          <th className="px-4 py-3 text-center">Activo</th>
                          <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className={`border-b last:border-0 transition-colors ${!u.active ? "opacity-50 bg-slate-50" : "hover:bg-blue-50/20"}`}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-800">{u.name}</div>
                              {u.sap_employee_id && <div className="text-[10px] text-slate-400">SAP ID: {u.sap_employee_id}</div>}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold border ${ROLE_COLORS[u.role] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {u.countries.map((c) => (
                                  <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{c}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleUserActive(u)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${u.active ? "bg-primary" : "bg-slate-300"}`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${u.active ? "translate-x-4" : "translate-x-0.5"}`} />
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => startEditingUser(u)}
                                className="rounded p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Editar usuario"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══ TAB: CONFIGURACIÓN ══ */}
          {activeTab === "configuracion" && (
            <motion.div key="configuracion" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Sub-navegación */}
              <div className="flex gap-1 rounded-xl border border-slate-200/60 bg-slate-50/80 p-1">
                {([
                  { id: "parametros",    label: "Parámetros",   icon: <Settings className="h-4 w-4" /> },
                  { id: "listas",        label: "Listas",        icon: <List className="h-4 w-4" /> },
                  { id: "escalamiento",  label: "Escalamiento",  icon: <AlertTriangle className="h-4 w-4" /> },
                  { id: "directorio_ad", label: "Directorio AD", icon: <Network className="h-4 w-4" /> },
                ] as const).map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setConfigSubTab(id)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      configSubTab === id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* ── Sub-tab: Parámetros ── */}
              {configSubTab === "parametros" && (
                <div className="space-y-4">
                  {hasDirtySettings && (
                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Parámetros
                      </Button>
                    </div>
                  )}
                  {categories.map((cat) => {
                const catItems = items.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;
                const meta = CATEGORY_META[cat] || { title: cat, icon: null, desc: "" };
                return (
                  <div key={cat} className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200/60 px-5 py-4">
                      <div className="text-slate-500">{meta.icon}</div>
                      <div>
                        <h2 className="font-semibold text-slate-900">{meta.title}</h2>
                        <p className="text-xs text-slate-500">{meta.desc}</p>
                      </div>
                    </div>
                    <div className="divide-y">
                      {catItems.map((item) => (
                        <div key={item.key} className="flex items-center justify-between px-5 py-4">
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-slate-700">{item.label}</Label>
                            <p className="text-xs text-slate-500 font-mono">{item.key}</p>
                          </div>
                          <div className="w-80">
                            {item.type === "boolean" ? (
                              <button
                                onClick={() => handleChange(item.key, !(getValue(item) === true))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${getValue(item) === true ? "bg-primary" : "bg-slate-300"}`}
                              >
                                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${getValue(item) === true ? "translate-x-6" : "translate-x-1"}`} />
                              </button>
                            ) : item.type === "password" ? (
                              <div className="relative">
                                <Input
                                  type={showPasswords[item.key] ? "text" : "password"}
                                  value={String(getValue(item) ?? "")}
                                  onChange={(e) => handleChange(item.key, e.target.value)}
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords((p) => ({ ...p, [item.key]: !p[item.key] }))}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  {showPasswords[item.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            ) : item.type === "number" ? (
                              <Input
                                type="number"
                                value={String(getValue(item) ?? "")}
                                onChange={(e) => handleChange(item.key, parseInt(e.target.value) || 0)}
                              />
                            ) : (
                              <Input
                                type="text"
                                value={String(getValue(item) ?? "")}
                                onChange={(e) => handleChange(item.key, e.target.value)}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
                </div>
              )}

              {/* ── Sub-tab: Listas ── */}
              {configSubTab === "listas" && (
                <div className="space-y-4">
                  {Object.keys(dropdownOptions).length === 0 && (
                    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm px-5 py-10 text-center text-slate-400 text-sm">
                      No hay listas configuradas.
                    </div>
                  )}
                  {Object.keys(dropdownOptions).length > 0 && (
                    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <List className="h-5 w-5 text-slate-500" />
                          <div>
                            <h2 className="font-semibold text-slate-900">Listas Desplegables</h2>
                            <p className="text-xs text-slate-500">Opciones disponibles en formularios de casos</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={handleSaveDropdowns} disabled={savingDropdowns || !hasDirtyDropdowns}>
                          {savingDropdowns ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Guardar Listas
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        {DROPDOWN_KEYS.map(({ key, label }) => (
                          <div key={key} className="rounded-lg border border-slate-200 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-700">{label}</h3>
                            <div className="flex flex-wrap gap-2">
                              {getDropdownValues(key).map((opt, i) => (
                                <span key={`${opt}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                                  {opt}
                                  {getDropdownValues(key).length > 1 && (
                                    <button type="button" onClick={() => handleRemoveOption(key, i)} className="ml-0.5 rounded-full p-0.5 hover:bg-slate-300/50 transition-colors">
                                      <X className="h-3 w-3 text-slate-400" />
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nueva opcion..."
                                value={newOptionInputs[key] || ""}
                                onChange={(e) => setNewOptionInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOption(key); } }}
                                className="h-8 text-xs"
                              />
                              <Button type="button" size="sm" variant="outline" onClick={() => handleAddOption(key)} className="h-8 px-2">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Sub-tab: Escalamiento ── */}
              {configSubTab === "escalamiento" && (
                <div className="space-y-4">
                  {escRules.length === 0 && (
                    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm px-5 py-10 text-center text-slate-400 text-sm">
                      No hay reglas de escalamiento configuradas.
                    </div>
                  )}
                  {escRules.length > 0 && (
                    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-slate-500" />
                          <div>
                            <h2 className="font-semibold text-slate-900">Reglas de Escalamiento</h2>
                            <p className="text-xs text-slate-500">Umbrales SLA y canales de notificacion por prioridad</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={handleSaveEscRules} disabled={savingEscRules || !hasEscRulesDirty}>
                          {savingEscRules ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Guardar Reglas
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                          <thead>
                            <tr className="border-b bg-slate-50/80 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                              <th className="px-5 py-3">Prioridad</th>
                              <th className="px-5 py-3 text-center">Nivel 1 (%)</th>
                              <th className="px-5 py-3 text-center">Nivel 2 (%)</th>
                              <th className="px-5 py-3 text-center">Nivel 3 (min)</th>
                              <th className="px-5 py-3 text-center">Email</th>
                              <th className="px-5 py-3 text-center">In-App</th>
                              <th className="px-5 py-3 text-center">WhatsApp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {escRules.map((rule) => (
                              <tr key={rule.id} className="border-b last:border-0">
                                <td className="px-5 py-3">
                                  <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[rule.priority] || "bg-slate-50 text-slate-700"}`}>
                                    {rule.priority}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-center">
                                  <input type="number" min={1} max={100} value={getEscRuleValue(rule, "level_1_pct")} onChange={(e) => handleEscRuleChange(rule.id, "level_1_pct", Number(e.target.value))} className="w-16 rounded border border-slate-200 px-2 py-1 text-center text-sm" />
                                </td>
                                <td className="px-5 py-3 text-center">
                                  <input type="number" min={1} max={200} value={getEscRuleValue(rule, "level_2_pct")} onChange={(e) => handleEscRuleChange(rule.id, "level_2_pct", Number(e.target.value))} className="w-16 rounded border border-slate-200 px-2 py-1 text-center text-sm" />
                                </td>
                                <td className="px-5 py-3 text-center">
                                  <input type="number" min={0} value={getEscRuleValue(rule, "level_3_minutes")} onChange={(e) => handleEscRuleChange(rule.id, "level_3_minutes", Number(e.target.value))} className="w-20 rounded border border-slate-200 px-2 py-1 text-center text-sm" />
                                </td>
                                {(["notify_email", "notify_in_app", "notify_whatsapp"] as const).map((field) => (
                                  <td key={field} className="px-5 py-3 text-center">
                                    <button
                                      onClick={() => handleEscRuleChange(rule.id, field, !getEscRuleValue(rule, field))}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${getEscRuleValue(rule, field) ? "bg-primary" : "bg-slate-300"}`}
                                    >
                                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${getEscRuleValue(rule, field) ? "translate-x-6" : "translate-x-1"}`} />
                                    </button>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Sub-tab: Directorio AD ── */}
              {configSubTab === "directorio_ad" && (
                <div className="space-y-4">
                  {allUsers.length === 0 && (
                    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm px-5 py-10 text-center text-slate-400 text-sm">
                      No hay usuarios configurados.
                    </div>
                  )}
                  {allUsers.length > 0 && (
                    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Network className="h-5 w-5 text-slate-500" />
                          <div>
                            <h2 className="font-semibold text-slate-900">Asociación Active Directory</h2>
                            <p className="text-xs text-slate-500">Indica qué usuarios se autentican con AD y su departamento</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={handleSaveAD} disabled={savingAD || Object.keys(adDirty).length === 0}>
                          {savingAD ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Guardar
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                              <th className="px-4 py-3">Nombre</th>
                              <th className="px-4 py-3">Email</th>
                              <th className="px-4 py-3">Departamento</th>
                              <th className="px-4 py-3 text-center">Usa AD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allUsers.map((user) => {
                              const deptId = getAdValue(user, "department_id");
                              const useAd = getAdValue(user, "use_ad");
                              const isDirty = !!adDirty[user.id];
                              return (
                                <tr key={user.id} className={`border-b last:border-0 transition-colors ${isDirty ? "bg-amber-50/40" : "hover:bg-blue-50/30"}`}>
                                  <td className="px-4 py-2.5 font-medium text-slate-800">{user.name}</td>
                                  <td className="px-4 py-2.5 text-slate-500 text-xs">{user.email}</td>
                                  <td className="px-4 py-2.5">
                                    <select
                                      value={deptId ?? ""}
                                      onChange={(e) => setAdDirty((prev) => ({
                                        ...prev,
                                        [user.id]: { ...(prev[user.id] || {}), department_id: e.target.value ? Number(e.target.value) : null },
                                      }))}
                                      className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                      <option value="">— Sin departamento —</option>
                                      {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.country})</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-4 py-2.5 text-center">
                                    <button
                                      onClick={() => setAdDirty((prev) => ({
                                        ...prev,
                                        [user.id]: { ...(prev[user.id] || {}), use_ad: !useAd },
                                      }))}
                                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${useAd ? "bg-primary" : "bg-slate-300"}`}
                                    >
                                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${useAd ? "translate-x-4" : "translate-x-0.5"}`} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}

          {/* ══ TAB: DEPARTAMENTOS ══ */}
          {activeTab === "departamentos" && (
            <>
            <motion.div key="departamentos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200/60 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-slate-500" />
                  <div>
                    <h2 className="font-semibold text-slate-900">Departamentos</h2>
                    <p className="text-xs text-slate-500">Equipos de trabajo para escalacion y asignacion de casos</p>
                  </div>
                </div>
                {canAdmin && (
                  <Button size="sm" onClick={() => openDeptModal()}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Departamento
                  </Button>
                )}
              </div>

              {departments.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No hay departamentos configurados</div>
              ) : (() => {
                const CARD_COLORS = [
                  "from-blue-500 to-blue-600", "from-violet-500 to-violet-600",
                  "from-emerald-500 to-emerald-600", "from-amber-500 to-amber-600",
                  "from-rose-500 to-rose-600", "from-cyan-500 to-cyan-600",
                  "from-indigo-500 to-indigo-600", "from-orange-500 to-orange-600",
                  "from-teal-500 to-teal-600", "from-pink-500 to-pink-600",
                  "from-lime-600 to-lime-700",
                ];
                const COUNTRY_FLAGS: Record<string, string> = { CR: "🇨🇷", SV: "🇸🇻", GT: "🇬🇹", HN: "🇭🇳", PA: "🇵🇦" };
                const activeDept = departments.find((d) => d.id === expandedDept) || null;
                return (
                  <>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {departments.map((dept, idx) => {
                        const isSelected = expandedDept === dept.id;
                        const countryName = COUNTRY_OPTIONS.find((c) => c.code === dept.country)?.name || dept.country;
                        const flag = COUNTRY_FLAGS[dept.country] || "🌎";
                        const cardColor = CARD_COLORS[idx % CARD_COLORS.length];
                        const initials = dept.chief?.name
                          ? dept.chief.name.split(" ").filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
                          : "?";
                        return (
                          <motion.div
                            key={dept.id}
                            onClick={() => setExpandedDept(isSelected ? null : dept.id)}
                            whileHover={{ y: -2 }}
                            className={`relative rounded-xl border cursor-pointer overflow-hidden transition-all duration-200 ${
                              isSelected
                                ? "border-blue-400 shadow-lg shadow-blue-100/50 ring-2 ring-blue-400/30 bg-white"
                                : "border-slate-200/60 shadow-sm bg-white hover:shadow-md"
                            }`}
                          >
                            <div className={`h-1.5 w-full bg-gradient-to-r ${cardColor}`} />
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0 pr-2">
                                  <h3 className="text-sm font-semibold text-slate-800 leading-snug">{dept.name}</h3>
                                  <span className="text-xs text-slate-400">{flag} {countryName}</span>
                                </div>
                                {canAdmin && (
                                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => openDeptModal(dept)} className="rounded p-1.5 hover:bg-slate-100 transition-colors">
                                      <Pencil className="h-3 w-3 text-slate-400" />
                                    </button>
                                    <button onClick={() => handleDeleteDept(dept.id)} className="rounded p-1.5 hover:bg-red-50 transition-colors">
                                      <Trash2 className="h-3 w-3 text-red-400" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2.5 mb-4">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${cardColor} text-xs font-bold text-white shadow-sm`}>
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Jefe</p>
                                  <p className="text-xs font-semibold text-slate-700 truncate">{dept.chief?.name || <span className="text-slate-400 italic">Sin asignar</span>}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-1.5">
                                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-700">{dept.supervisors.length}</span>
                                  <span className="text-xs text-slate-500">sup.</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1 text-[10px] font-bold text-blue-700">{dept.agents.length}</span>
                                  <span className="text-xs text-slate-500">agentes</span>
                                </div>
                                <div className="ml-auto text-slate-400">
                                  {isSelected ? <ChevronUp className="h-3.5 w-3.5 text-blue-500" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Panel de miembros — aparece debajo del grid */}
                    <AnimatePresence>
                      {activeDept && (
                        <motion.div
                          key={activeDept.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-blue-100 bg-blue-50/40 px-6 py-5 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-700">{activeDept.name}</h3>
                            <button onClick={() => setExpandedDept(null)} className="rounded p-1 hover:bg-slate-200 transition-colors">
                              <X className="h-4 w-4 text-slate-400" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-2">Supervisores</p>
                              <div className="flex flex-wrap gap-2">
                                {activeDept.supervisors.map((m) => (
                                  <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700 border border-amber-200">
                                    {m.name}
                                    <button onClick={() => handleRemoveMember(activeDept.id, m.id)} className="ml-0.5 rounded-full p-0.5 hover:bg-amber-200/60">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))}
                                {activeDept.supervisors.length === 0 && <span className="text-xs text-slate-400 italic">Sin supervisores</span>}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-2">Agentes</p>
                              <div className="flex flex-wrap gap-2">
                                {activeDept.agents.map((m) => (
                                  <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700 border border-blue-200">
                                    {m.name}
                                    <button onClick={() => handleRemoveMember(activeDept.id, m.id)} className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200/60">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))}
                                {activeDept.agents.length === 0 && <span className="text-xs text-slate-400 italic">Sin agentes</span>}
                              </div>
                            </div>
                          </div>
                          {activeDept.users.length > 0 && (
                            <div className="mt-3 border-t border-slate-100 pt-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Colaboradores ({activeDept.users.length})</p>
                              <div className="flex flex-col gap-1">
                                {activeDept.users.map((u) => (
                                  <div key={u.id} className="flex items-center justify-between rounded-md px-3 py-1.5 bg-slate-50 text-xs">
                                    <span className="font-medium text-slate-700">{u.name}</span>
                                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">{u.role}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {addingMember?.deptId === activeDept.id ? (
                            <div className="flex flex-wrap items-end gap-2 pt-1">
                              <div className="flex-1 min-w-48">
                                <Label className="text-xs text-slate-500">Usuario</Label>
                                <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
                                  value={addingMember.userId}
                                  onChange={(e) => setAddingMember({ ...addingMember, userId: e.target.value })}>
                                  <option value="">Seleccionar...</option>
                                  {getAvailableUsersForDept(activeDept).map((u) => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="w-36">
                                <Label className="text-xs text-slate-500">Rol</Label>
                                <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm"
                                  value={addingMember.role}
                                  onChange={(e) => setAddingMember({ ...addingMember, role: e.target.value })}>
                                  <option value="supervisor">Supervisor</option>
                                  <option value="agente">Agente</option>
                                </select>
                              </div>
                              <Button size="sm" disabled={!addingMember.userId} onClick={() => handleAddMember(activeDept.id, Number(addingMember.userId), addingMember.role)}>Agregar</Button>
                              <Button size="sm" variant="outline" onClick={() => setAddingMember(null)}>Cancelar</Button>
                            </div>
                          ) : (canAdmin || sessionRole === "coordinador") ? (
                            <button className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                              onClick={() => setAddingMember({ deptId: activeDept.id, userId: "", role: "agente" })}>
                              <UserPlus className="h-3.5 w-3.5" /> Agregar miembro
                            </button>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                );
              })()}
            </motion.div>

            {/* Coordinadores por País */}
            <motion.div key="coordinadores" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-slate-200/60 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-slate-200/60 px-5 py-4">
                <UserCog className="h-5 w-5 text-slate-500" />
                <div>
                  <h2 className="font-semibold text-slate-900">Coordinadores por País</h2>
                  <p className="text-xs text-slate-500">Rol de sistema — reciben escalamientos de nivel máximo. Se asigna desde la tab Usuarios cambiando el rol a "Coordinador".</p>
                </div>
              </div>
              <div className="divide-y">
                {COUNTRY_OPTIONS.map((co) => {
                  const coords = coordinators.filter((u) => u.default_country === co.code);
                  return (
                    <div key={co.code} className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm font-medium text-slate-700">{co.name}</span>
                      <div className="flex flex-wrap gap-2">
                        {coords.length === 0
                          ? <span className="text-xs text-slate-400 italic">Sin coordinador asignado</span>
                          : coords.map((u) => (
                            <span key={u.id} className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700 border border-rose-200">
                              <UserCog className="h-3 w-3" />{u.name}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            </>
          )}

          {/* ══ TAB: PERMISOS ══ */}
          {activeTab === "permisos" && permsData && (
            <motion.div key="permisos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200/60 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-slate-500" />
                  <div>
                    <h2 className="font-semibold text-slate-900">Permisos por Rol</h2>
                    <p className="text-xs text-slate-500">Controla que modulos puede ver cada rol</p>
                  </div>
                </div>
                <Button size="sm" onClick={handleSavePerms} disabled={savingPerms || !hasDirtyPerms}>
                  {savingPerms ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar Permisos
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b bg-slate-50/80 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3">Modulo</th>
                      {permsData.roles.map((role) => (
                        <th key={role} className="px-5 py-3 text-center">{ROLE_LABELS[role] || role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permsData.modules.map((mod) => (
                      <tr key={mod} className="border-b last:border-0">
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium text-slate-700">{permsData.labels[mod]}</span>
                          <span className="ml-2 text-xs text-slate-500 font-mono">{mod}</span>
                        </td>
                        {permsData.roles.map((role) => (
                          <td key={role} className="px-5 py-3 text-center">
                            <button
                              onClick={() => handlePermChange(role, mod, !getPermValue(role, mod))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${getPermValue(role, mod) ? "bg-primary" : "bg-slate-300"}`}
                            >
                              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${getPermValue(role, mod) ? "translate-x-6" : "translate-x-1"}`} />
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ══ TAB: AUDITORÍA ══ */}
          {activeTab === "auditoria" && (
            <motion.div key="auditoria" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Telemetry */}
              <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-200/60 px-5 py-4">
                  <Activity className="h-5 w-5 text-slate-500" />
                  <div>
                    <h2 className="font-semibold text-slate-900">Telemetria</h2>
                    <p className="text-xs text-slate-500">Actividad del portal en los ultimos 7 dias</p>
                  </div>
                </div>
                {telemetry ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 p-5">
                      <div className="rounded-lg bg-blue-50 p-4 text-center">
                        <MousePointerClick className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                        <p className="text-2xl font-bold text-blue-700">{telemetry.stats.eventsToday}</p>
                        <p className="text-xs text-blue-500">Eventos hoy</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-4 text-center">
                        <Users className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                        <p className="text-2xl font-bold text-emerald-700">{telemetry.stats.usersToday}</p>
                        <p className="text-xs text-emerald-500">Usuarios activos</p>
                      </div>
                      <div className="rounded-lg bg-violet-50 p-4 text-center">
                        <MonitorSmartphone className="mx-auto mb-1 h-5 w-5 text-violet-500" />
                        <p className="text-2xl font-bold text-violet-700">{telemetry.stats.viewsToday}</p>
                        <p className="text-xs text-violet-500">Paginas vistas</p>
                      </div>
                    </div>
                    {telemetry.topPages.length > 0 && (
                      <div className="border-t px-5 py-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Paginas mas visitadas</p>
                        <div className="flex flex-wrap gap-2">
                          {telemetry.topPages.map((p) => (
                            <span key={p.page} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                              {p.page} <span className="font-bold text-slate-800">{p.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="border-t overflow-x-auto">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="border-b bg-slate-50/80 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                            <th className="px-5 py-3">Fecha</th>
                            <th className="px-5 py-3">Usuario</th>
                            <th className="px-5 py-3">Evento</th>
                            <th className="px-5 py-3">Pagina</th>
                            <th className="px-5 py-3">Pais</th>
                          </tr>
                        </thead>
                        <tbody>
                          {telemetry.events.length === 0 ? (
                            <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">Sin eventos registrados</td></tr>
                          ) : (
                            telemetry.events.map((e) => (
                              <tr key={e.id} className="border-b last:border-0">
                                <td className="px-5 py-2.5 text-xs text-slate-500 whitespace-nowrap">{fmtDate(e.created_at)}</td>
                                <td className="px-5 py-2.5 text-sm text-slate-700">{e.user_name}</td>
                                <td className="px-5 py-2.5">
                                  <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                    {EVENT_LABELS[e.event] || e.event}
                                  </span>
                                </td>
                                <td className="px-5 py-2.5 text-xs font-mono text-slate-500">{e.page || "-"}</td>
                                <td className="px-5 py-2.5 text-xs text-slate-500">{e.country || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-400">No hay datos de telemetria disponibles</div>
                )}
              </div>

              {/* Audit log */}
              <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-200/60 px-5 py-4">
                  <ScrollText className="h-5 w-5 text-slate-500" />
                  <div>
                    <h2 className="font-semibold text-slate-900">Auditoria</h2>
                    <p className="text-xs text-slate-500">Registro de cambios y acciones en los ultimos 7 dias</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b bg-slate-50/80 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Usuario</th>
                        <th className="px-5 py-3">Accion</th>
                        <th className="px-5 py-3">Entidad</th>
                        <th className="px-5 py-3">Campo</th>
                        <th className="px-5 py-3">Anterior</th>
                        <th className="px-5 py-3">Nuevo</th>
                        <th className="px-5 py-3">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-400">Sin registros de auditoria</td></tr>
                      ) : (
                        auditLogs.map((log, i) => (
                          <tr key={`${log.source}-${log.id}-${i}`} className="border-b last:border-0">
                            <td className="px-5 py-2.5 text-xs text-slate-500 whitespace-nowrap">{fmtDate(log.created_at)}</td>
                            <td className="px-5 py-2.5 text-sm text-slate-700">{log.user_name || "-"}</td>
                            <td className="px-5 py-2.5">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${log.source === "audit" ? "bg-amber-50 text-amber-700" : "bg-cyan-50 text-cyan-700"}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-xs font-mono text-slate-500">{log.entity || "-"}</td>
                            <td className="px-5 py-2.5 text-xs text-slate-600">{log.field || "-"}</td>
                            <td className="px-5 py-2.5 text-xs text-red-500 max-w-[150px] truncate">{log.old_value || "-"}</td>
                            <td className="px-5 py-2.5 text-xs text-emerald-600 max-w-[150px] truncate">{log.new_value || "-"}</td>
                            <td className="px-5 py-2.5 text-xs font-mono text-slate-400">{log.ip_address || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ TAB: APARIENCIA ══ */}
          {activeTab === "apariencia" && (
            <motion.div key="apariencia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200/60 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-slate-200/60 px-5 py-4">
                <Palette className="h-5 w-5 text-slate-500" />
                <div>
                  <h2 className="font-semibold text-slate-900">Apariencia</h2>
                  <p className="text-xs text-slate-500">Selecciona la paleta de colores del portal</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(Object.values(PALETTES) as typeof PALETTES[PaletteId][]).map((palette) => {
                    const isActive = paletteId === palette.id;
                    return (
                      <button
                        key={palette.id}
                        onClick={() => setPalette(palette.id)}
                        className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                          isActive
                            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="h-3 w-full rounded-full mb-3" style={{ background: `linear-gradient(to right, ${palette.colors.sidebarGradientFrom}, ${palette.colors.sidebarGradientTo})` }} />
                        <div className="flex gap-1.5 mb-3">
                          {palette.colors.chart.map((color, i) => (
                            <div key={i} className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm">{palette.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{palette.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1 italic">{palette.citation}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </div>{/* end main content */}
      </div>{/* end two-column */}

      {/* ── Department Modal ── */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {editingDept ? "Editar Departamento" : "Nuevo Departamento"}
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-slate-600">Nombre</Label>
                <Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="Ej: Soporte Tecnico" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm text-slate-600">Pais</Label>
                <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={deptForm.country} onChange={(e) => setDeptForm({ ...deptForm, country: e.target.value })}>
                  {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Jefe</Label>
                <select className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={deptForm.chief_user_id} onChange={(e) => setDeptForm({ ...deptForm, chief_user_id: e.target.value })}>
                  <option value="">Seleccionar jefe...</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeptModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveDept} disabled={savingDept}>
                {savingDept ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingDept ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── User Drawer (create / edit) ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
              onClick={() => { setShowUserForm(false); resetUserForm(); }}
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 shrink-0">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                  </h3>
                  {editingUser && <p className="text-xs text-slate-500 mt-0.5">{editingUser.email}</p>}
                </div>
                <button
                  onClick={() => { setShowUserForm(false); resetUserForm(); }}
                  className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {userError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{userError}</div>}
                {userSuccess && <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">{userSuccess}</div>}

                <form
                  onSubmit={editingUser ? handleEditUser : handleCreateUser}
                  id="user-drawer-form"
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-xs text-slate-600">Nombre *</Label>
                    <Input value={userName2} onChange={(e) => setUserName2(e.target.value)} required className="mt-1" />
                  </div>

                  {!editingUser && (
                    <div>
                      <Label className="text-xs text-slate-600">Email *</Label>
                      <Input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required className="mt-1" />
                    </div>
                  )}
                  {editingUser && (
                    <div>
                      <Label className="text-xs text-slate-600">Email</Label>
                      <Input value={editingUser.email} disabled className="mt-1 bg-slate-50 text-slate-500" />
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-slate-600">
                      {editingUser ? "Nueva Contraseña (vacío = sin cambio)" : "Contraseña *"}
                    </Label>
                    <Input
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      required={!editingUser}
                      placeholder={editingUser ? "••••••••" : ""}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600">Rol</Label>
                    {sessionRole === "coordinador" && !editingUser ? (
                      <Input value="colaborador" disabled className="mt-1 bg-slate-50" />
                    ) : (
                      <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600">Departamento</Label>
                    <select value={userDeptId} onChange={(e) => setUserDeptId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                      <option value="">Sin departamento</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600">SAP Employee ID</Label>
                    <Input type="number" value={userSapId} onChange={(e) => setUserSapId(e.target.value)} placeholder="Opcional — para técnicos" className="mt-1" />
                    <p className="mt-1 text-[11px] text-slate-400">Requerido para asignar casos a técnicos SAP</p>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600">Países *</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {COUNTRY_OPTIONS.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => toggleUserCountry(c.code)}
                          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                            userCountries.includes(c.code)
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
                          }`}
                        >
                          {c.code} — {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600">País Principal</Label>
                    <select
                      value={userDefaultCountry}
                      onChange={(e) => setUserDefaultCountry(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      {COUNTRY_OPTIONS.filter((c) => userCountries.includes(c.code)).map((c) => (
                        <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-slate-400">Determina el país de un Coordinador en la sección de escalamiento</p>
                  </div>
                </form>
              </div>

              {/* Drawer footer */}
              <div className="shrink-0 border-t border-slate-200 px-5 py-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowUserForm(false); resetUserForm(); }}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="user-drawer-form"
                  disabled={savingUser || userCountries.length === 0}
                >
                  {savingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {editingUser ? "Guardar Cambios" : "Crear Usuario"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
