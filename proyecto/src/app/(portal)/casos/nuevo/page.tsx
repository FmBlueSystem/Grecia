"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Search, Paperclip, FileText, X, Lock, Lightbulb, CheckCircle, Copy, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRIORITY_OPTIONS } from "@/lib/constants";
import { useDropdownOptions } from "@/hooks/use-dropdown-options";

interface BPResult {
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface BPContact {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  position: string | null;
  isDefault?: boolean;
}

interface PortalUserResult {
  id: number;
  name: string;
  email: string;
  role: string;
  sapEmployeeId: number | null;
}

// Sugerencias inteligentes: al seleccionar Tipo de Caso, sugerir Área y Tiempo
const TIPO_SUGGESTIONS: Record<string, { area: string; tiempo: string }> = {
  "Garantia": { area: "Calidad", tiempo: "72 horas" },
  "Soporte tecnico": { area: "Soporte", tiempo: "24 horas" },
  "Consulta": { area: "Atencion al Cliente", tiempo: "24 horas" },
  "Reclamo": { area: "Atencion al Cliente", tiempo: "48 horas" },
  "Servicio de campo": { area: "Soporte", tiempo: "1 semana" },
};

export default function NuevoCasoPage() {
  const router = useRouter();
  const { options: ddOptions } = useDropdownOptions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // BP search
  const [bpSearch, setBpSearch] = useState("");
  const [bpResults, setBpResults] = useState<BPResult[]>([]);
  const [bpLoading, setBpLoading] = useState(false);
  const [showBpDropdown, setShowBpDropdown] = useState(false);
  const bpRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [canal, setCanal] = useState("");
  const [tipoCaso, setTipoCaso] = useState("");
  const [area, setArea] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [contactCode, setContactCode] = useState<number | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // S6: IME — Inconformidad de Material de Empaque
  const [imeProducto, setImeProducto] = useState("");
  const [imeCodMaterial, setImeCodMaterial] = useState("");
  const [imeLote, setImeLote] = useState("");
  const [imeFactura, setImeFactura] = useState("");
  const [imeCantInicial, setImeCantInicial] = useState("");
  const [imeCantReclamo, setImeCantReclamo] = useState("");
  const [imeReportadoPor, setImeReportadoPor] = useState("");

  // BP contacts
  const [bpContacts, setBpContacts] = useState<BPContact[]>([]);
  const [bpContactsLoading, setBpContactsLoading] = useState(false);

  // New contact form
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "", position: "" });

  // Portal user search (assigned collaborator)
  const [empSearch, setEmpSearch] = useState("");
  const [empResults, setEmpResults] = useState<PortalUserResult[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState<number | null>(null);
  const [assignedUserName, setAssignedUserName] = useState("");
  const empRef = useRef<HTMLDivElement>(null);

  // Pending attachments (staged before case creation)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial note
  const [initialNote, setInitialNote] = useState("");
  const [noteIsInternal, setNoteIsInternal] = useState(true);

  // Smart suggestion state
  const [suggestion, setSuggestion] = useState<{ area: string; tiempo: string } | null>(null);

  // Created case modal
  const [createdCase, setCreatedCase] = useState<{ id: number; date: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // BP search debounce
  useEffect(() => {
    if (bpSearch.length < 2) {
      setBpResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setBpLoading(true);
      try {
        const res = await fetch(`/api/bp?search=${encodeURIComponent(bpSearch)}`);
        const data = await res.json();
        setBpResults(data.items || []);
        setShowBpDropdown(true);
      } catch {
        setBpResults([]);
      } finally {
        setBpLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [bpSearch]);

  // Portal user search debounce
  useEffect(() => {
    if (empSearch.length < 2) {
      setEmpResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setEmpLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(empSearch)}`);
        const data = await res.json();
        setEmpResults(data.items || []);
        setShowEmpDropdown(true);
      } catch {
        setEmpResults([]);
      } finally {
        setEmpLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [empSearch]);

  // S2: Retroalimentación positiva — deshabilitar prioridad y tiempo estimado
  const isRetroalimentacion = tipoCaso === "Retroalimentación positiva";
  // S6: IME
  const isIME = tipoCaso === "Inconformidad de material de empaque";
  useEffect(() => {
    if (tipoCaso === "Retroalimentación positiva") {
      setPriority("N/A");
      setTiempoEstimado("N/A");
    }
  }, [tipoCaso]);

  // Smart suggestion when tipoCaso changes
  useEffect(() => {
    const s = TIPO_SUGGESTIONS[tipoCaso];
    if (s) {
      setSuggestion(s);
    } else {
      setSuggestion(null);
    }
  }, [tipoCaso]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bpRef.current && !bpRef.current.contains(e.target as Node)) {
        setShowBpDropdown(false);
      }
      if (empRef.current && !empRef.current.contains(e.target as Node)) {
        setShowEmpDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectBP(bp: BPResult) {
    setCustomerCode(bp.code);
    setCustomerName(bp.name);
    setBpSearch(bp.name);
    setContactPhone(bp.phone || "");
    setContactEmail(bp.email || "");
    setShowBpDropdown(false);
    // Cargar personas de contacto del BP
    setBpContacts([]);
    setBpContactsLoading(true);
    fetch(`/api/bp/${encodeURIComponent(bp.code)}/contacts`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.contacts)) {
          setBpContacts(d.contacts);
          // Auto-seleccionar el contacto marcado como estándar
          const defaultContact = d.contacts.find((c: BPContact) => c.isDefault);
          if (defaultContact) selectBPContact(defaultContact);
        }
      })
      .catch(() => {})
      .finally(() => setBpContactsLoading(false));
  }

  function selectBPContact(c: BPContact) {
    setContactCode(c.id);
    setContactName(c.name);
    if (c.phone) setContactPhone(c.phone);
    if (c.email) setContactEmail(c.email);
  }

  function applyNewContact() {
    if (!newContact.name.trim()) return;
    setContactCode(null);
    setContactName(newContact.name.trim());
    setContactPhone(newContact.phone.trim());
    setContactEmail(newContact.email.trim());
    setShowNewContactForm(false);
    setNewContact({ name: "", phone: "", email: "", position: "" });
  }

  function selectEmployee(emp: PortalUserResult) {
    setAssignedUserId(emp.id);
    setAssignedUserName(emp.name);
    setEmpSearch(emp.name);
    setShowEmpDropdown(false);
  }

  function applySuggestion() {
    if (!suggestion) return;
    setArea(suggestion.area);
    setTiempoEstimado(suggestion.tiempo);
    setSuggestion(null);
  }

  function handleAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > 10 * 1024 * 1024) {
        setError(`"${f.name}" excede 10MB`);
        continue;
      }
      newFiles.push(f);
    }
    setPendingFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerCode) {
      setError("Seleccione un cliente de la lista");
      return;
    }
    if (!subject.trim()) {
      setError("El asunto es obligatorio");
      return;
    }
    if (!description.trim()) {
      setError("La descripción es obligatoria");
      return;
    }
    if (!canal) {
      setError("Seleccione un canal de ingreso");
      return;
    }
    if (!tipoCaso) {
      setError("Seleccione un tipo de caso");
      return;
    }
    if (!area) {
      setError("Seleccione un área responsable");
      return;
    }
    if (contactPhone && !/^[+\d\s\-()]*$/.test(contactPhone)) {
      setError("El teléfono solo puede contener números, +, -, espacios y paréntesis");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 1. Crear caso
      const res = await fetch("/api/casos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          customerCode,
          description,
          priority,
          canal,
          tipoCaso,
          area,
          tiempoEstimado,
          contactCode: contactCode ?? undefined,
          contactName: contactName || undefined,
          contactPhone,
          contactEmail,
          ...(assignedUserId ? { assignedUserId } : {}),
          ...(isIME ? {
            imeProducto: imeProducto || undefined,
            imeCodMaterial: imeCodMaterial || undefined,
            imeLote: imeLote || undefined,
            imeFactura: imeFactura || undefined,
            imeCantInicial: imeCantInicial ? Number(imeCantInicial) : undefined,
            imeCantReclamo: imeCantReclamo ? Number(imeCantReclamo) : undefined,
            imeReportadoPor: imeReportadoPor || undefined,
          } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear el caso");
        return;
      }

      const caseId = data.id;

      // 2. Subir adjuntos pendientes (en paralelo)
      if (pendingFiles.length > 0) {
        const uploadPromises = pendingFiles.map((file) => {
          const formData = new FormData();
          formData.append("file", file);
          return fetch(`/api/casos/${caseId}/attachments`, {
            method: "POST",
            body: formData,
          }).catch(() => {});
        });
        await Promise.all(uploadPromises);
      }

      // 3. Crear nota inicial
      if (initialNote.trim()) {
        await fetch(`/api/casos/${caseId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: initialNote.trim(),
            is_internal: noteIsInternal,
          }),
        }).catch(() => {});
      }

      setCreatedCase({
        id: caseId,
        date: new Date().toLocaleDateString("es", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyId() {
    if (!createdCase) return;
    navigator.clipboard.writeText(String(createdCase.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Caso</h1>
          <p className="text-sm text-slate-500">Complete los datos para crear un caso de servicio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Cliente */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Cliente</h2>

          <div className="relative" ref={bpRef}>
            <Label>Buscar cliente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Código o nombre del cliente..."
                value={bpSearch}
                onChange={(e) => { setBpSearch(e.target.value); setCustomerCode(""); }}
                className="pl-9"
              />
              {bpLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
            </div>
            {bpSearch.length > 0 && bpSearch.length < 2 && !bpLoading && (
              <p className="text-xs text-slate-400 mt-1">Escriba al menos 2 caracteres para buscar</p>
            )}
            {showBpDropdown && bpResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-48 overflow-auto">
                {bpResults.map((bp) => (
                  <button
                    key={bp.code}
                    type="button"
                    onClick={() => selectBP(bp)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium">{bp.code}</span> - {bp.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {customerCode && (
            <p className="text-sm text-green-600">
              Cliente seleccionado: <strong>{customerCode}</strong> - {customerName}
            </p>
          )}
        </div>

        {/* Contacto */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contacto</h2>
            {!showNewContactForm && (
              <button
                type="button"
                onClick={() => setShowNewContactForm(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Plus className="h-3 w-3" /> Nuevo contacto
              </button>
            )}
          </div>

          {/* Form inline: nuevo contacto */}
          {showNewContactForm && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Agregar nuevo contacto</span>
                <button type="button" onClick={() => setShowNewContactForm(false)}>
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Persona contacto *</Label>
                  <Input
                    value={newContact.name}
                    onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cargo</Label>
                  <Input
                    value={newContact.position}
                    onChange={(e) => setNewContact((p) => ({ ...p, position: e.target.value }))}
                    placeholder="Ej. Gerente de compras"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Teléfono</Label>
                  <Input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+506 0000-0000"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                    placeholder="contacto@empresa.com"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewContactForm(false)}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={applyNewContact} disabled={!newContact.name.trim()}>
                  Agregar
                </Button>
              </div>
            </div>
          )}

          {/* Selector de persona de contacto del BP */}
          {customerCode && (bpContactsLoading || bpContacts.length > 0) && (
            <div className="space-y-2">
              <Label>Persona de contacto</Label>
              {bpContactsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Cargando contactos...
                </div>
              ) : (
                <select
                  value={contactCode !== null ? String(contactCode) : ""}
                  onChange={(e) => {
                    const c = bpContacts.find((x) => String(x.id) === e.target.value);
                    if (c) selectBPContact(c);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Seleccionar persona —</option>
                  {bpContacts.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}{c.isDefault ? " ★" : ""}{c.position ? ` · ${c.position}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Nombre del contacto</Label>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nombre de quien reporta el caso" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+506 0000-0000" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contacto@empresa.com" />
            </div>
          </div>
        </div>

        {/* Caso */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Detalle del Caso</h2>

          <div className="space-y-2">
            <Label htmlFor="subject">Asunto *</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridad *</Label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} disabled={isRetroalimentacion} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {PRIORITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                {isRetroalimentacion && <option value="N/A">N/A</option>}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Canal de Ingreso *</Label>
              <select value={canal} onChange={(e) => setCanal(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {ddOptions.canal.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Caso *</Label>
              <select value={tipoCaso} onChange={(e) => setTipoCaso(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {ddOptions.tipo_caso.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Área Responsable *</Label>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {ddOptions.area.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Smart suggestion */}
          {suggestion && !area && !tiempoEstimado && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3">
              <Lightbulb className="h-4 w-4 text-blue-500 shrink-0" />
              <div className="flex-1 text-sm text-blue-700">
                Para <strong>{tipoCaso}</strong> se sugiere: <strong>{suggestion.area}</strong> con tiempo estimado de <strong>{suggestion.tiempo}</strong>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={applySuggestion} className="shrink-0 text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
                Aplicar
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tiempo Estimado</Label>
            <select value={tiempoEstimado} onChange={(e) => setTiempoEstimado(e.target.value)} disabled={isRetroalimentacion} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">Seleccionar...</option>
              {ddOptions.tiempo_estimado.map((o) => <option key={o} value={o}>{o}</option>)}
              {isRetroalimentacion && <option value="N/A">N/A</option>}
            </select>
          </div>
        </div>

        {/* S6: IME — Detalle del Reclamo (solo cuando tipo = IME) */}
        {isIME && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-700">Detalle del Reclamo — F069</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Producto</Label>
                <Input value={imeProducto} onChange={(e) => setImeProducto(e.target.value)} placeholder="Nombre del producto" />
              </div>
              <div className="space-y-2">
                <Label>Código Material STIA</Label>
                <Input value={imeCodMaterial} onChange={(e) => setImeCodMaterial(e.target.value)} placeholder="Ej. MAT-0001" />
              </div>
              <div className="space-y-2">
                <Label>Lote / Orden de Producción</Label>
                <Input value={imeLote} onChange={(e) => setImeLote(e.target.value)} placeholder="Número de lote" />
              </div>
              <div className="space-y-2">
                <Label>Número de Factura</Label>
                <Input value={imeFactura} onChange={(e) => setImeFactura(e.target.value)} placeholder="Ej. FAC-12345" />
              </div>
              <div className="space-y-2">
                <Label>Cantidad Inicial</Label>
                <Input type="number" min="0" value={imeCantInicial} onChange={(e) => setImeCantInicial(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Cantidad en Reclamo</Label>
                <Input type="number" min="0" value={imeCantReclamo} onChange={(e) => setImeCantReclamo(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Reportado por</Label>
                <Input value={imeReportadoPor} onChange={(e) => setImeReportadoPor(e.target.value)} placeholder="Nombre de quien reporta" />
              </div>
            </div>
          </div>
        )}

        {/* Tecnico asignado */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Colaborador Asignado</h2>
          <div className="relative" ref={empRef}>
            <Label>Buscar colaborador</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Nombre o email del colaborador..."
                value={empSearch}
                onChange={(e) => { setEmpSearch(e.target.value); setAssignedUserId(null); }}
                className="pl-9"
              />
              {empLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
            </div>
            {showEmpDropdown && empResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-48 overflow-auto">
                {empResults.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => selectEmployee(emp)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-slate-400 ml-2 text-xs">{emp.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {assignedUserId && (
            <p className="text-sm text-green-600">
              Colaborador seleccionado: <strong>{assignedUserName}</strong>
            </p>
          )}
        </div>

        {/* Adjuntos */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Paperclip className="h-4 w-4" /> Adjuntos ({pendingFiles.length})
            </h2>
            <label className="cursor-pointer">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAddFiles}
                className="hidden"
                multiple
              />
              <span className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Paperclip className="h-3 w-3" />
                Agregar archivo
              </span>
            </label>
          </div>
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              {pendingFiles.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center gap-3 rounded border px-3 py-2 text-sm bg-slate-50">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                  </div>
                  <button type="button" onClick={() => removePendingFile(i)} className="p-1 hover:bg-slate-200 rounded">
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400">Los archivos se subirán al crear el caso. Máximo 10MB por archivo.</p>
        </div>

        {/* Nota Inicial */}
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Nota Inicial (opcional)</h2>
          <textarea
            value={initialNote}
            onChange={(e) => setInitialNote(e.target.value)}
            placeholder="Agregar una nota al crear el caso..."
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={noteIsInternal}
              onChange={(e) => setNoteIsInternal(e.target.checked)}
              className="rounded border-slate-300"
            />
            <Lock className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-500">Nota interna (no visible para el cliente)</span>
          </label>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creando..." : "Crear Caso"}
          </Button>
        </div>
      </form>

      {/* Modal de confirmación */}
      {createdCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-200 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Caso creado exitosamente</h2>
              <p className="mt-1 text-sm text-slate-500">{createdCase.date}</p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Código del caso</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-extrabold font-mono text-primary">#{createdCase.id}</span>
                <button
                  onClick={handleCopyId}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                  title="Copiar código"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copied && <p className="text-xs text-emerald-600 mt-1">Copiado al portapapeles</p>}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCreatedCase(null);
                  setCopied(false);
                  // Reset form
                  setSubject("");
                  setDescription("");
                  setCustomerCode("");
                  setCustomerName("");
                  setBpSearch("");
                  setPriority("Normal");
                  setCanal("");
                  setTipoCaso("");
                  setArea("");
                  setTiempoEstimado("");
                  setContactCode(null);
                  setContactName("");
                  setContactPhone("");
                  setContactEmail("");
                  setAssignedUserId(null);
                  setAssignedUserName("");
                  setEmpSearch("");
                  setPendingFiles([]);
                  setInitialNote("");
                  setNoteIsInternal(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear otro
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push(`/casos/${createdCase.id}`)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver caso
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
