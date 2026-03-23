"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  BookOpen,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Article {
  id: number;
  title: string;
  content?: string;
  category: string | null;
  tipo_caso: string | null;
  tags: string[];
  author_name: string;
  published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  "Soporte Técnico",
  "Garantía",
  "Facturación",
  "Instalación",
  "Calidad",
  "Inconformidad",
  "Retroalimentación",
  "General",
];

const TIPO_CASOS = [
  "Soporte técnico",
  "Garantía",
  "Reclamo",
  "Consulta",
  "Retroalimentación positiva",
  "Inconformidad de material de empaque",
];

export default function ConocimientoPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [tipoCasoFilter, setTipoCasoFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formTipoCaso, setFormTipoCaso] = useState("");
  const [formTags, setFormTags] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  // Live search debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadArticles(overrideSearch?: string) {
    setLoading(true);
    const params = new URLSearchParams();
    const s = overrideSearch !== undefined ? overrideSearch : search;
    if (s) params.set("search", s);
    if (category) params.set("category", category);
    if (tipoCasoFilter) params.set("tipo_caso", tipoCasoFilter);
    const res = await fetch(`/api/kb?${params}`);
    const data = await res.json();
    setArticles(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, tipoCasoFilter]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadArticles(val);
    }, 350);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    loadArticles();
  }

  async function toggleExpand(id: number) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    const res = await fetch(`/api/kb/${id}`);
    const full = await res.json();
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, content: full.content } : a))
    );
    setExpanded(id);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setTitle("");
    setContent("");
    setFormCategory("");
    setFormTipoCaso("");
    setFormTags("");
    setPublished(true);
    setPreviewMode(false);
  }

  function startEdit(article: Article) {
    setEditing(article);
    setCreating(false);
    setTitle(article.title);
    setContent(article.content || "");
    setFormCategory(article.category || "");
    setFormTipoCaso(article.tipo_caso || "");
    setFormTags(article.tags?.join(", ") || "");
    setPublished(article.published);
    setPreviewMode(false);
  }

  async function handleSave() {
    if (!title || !content) return;
    setSaving(true);
    const payload = {
      title,
      content,
      category: formCategory || null,
      tipo_caso: formTipoCaso || null,
      tags: formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      published,
    };

    if (editing) {
      await fetch(`/api/kb/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/kb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setCreating(false);
    setEditing(null);
    setSaving(false);
    loadArticles();
  }

  async function handleDelete(id: number) {
    if (!confirm("Eliminar este artículo?")) return;
    await fetch(`/api/kb/${id}`, { method: "DELETE" });
    loadArticles();
  }

  const showForm = creating || editing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            Base de Conocimiento
          </h1>
          <p className="text-sm text-slate-500">{articles.length} artículos</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Artículo
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar artículos..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </form>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={tipoCasoFilter}
          onChange={(e) => setTipoCasoFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          {TIPO_CASOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-primary bg-white p-5 shadow-sm space-y-4"
        >
          <h2 className="font-semibold">
            {editing ? "Editar Artículo" : "Nuevo Artículo"}
          </h2>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del artículo"
            />
          </div>

          {/* Content with Write/Preview tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Contenido</Label>
              <div className="flex rounded-md border border-input overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1.5 transition-colors ${
                    !previewMode
                      ? "bg-primary text-white"
                      : "bg-background text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Escribir
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1.5 transition-colors ${
                    previewMode
                      ? "bg-primary text-white"
                      : "bg-background text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Vista previa
                </button>
              </div>
            </div>
            {previewMode ? (
              <div className="min-h-[200px] rounded-md border border-input bg-slate-50 px-3 py-2 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                {content || (
                  <span className="text-slate-400 italic">Sin contenido</span>
                )}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder={"# Título\n\nEscriba el contenido del artículo...\n\nUse markdown: **negrita**, *cursiva*, `código`, - listas"}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed"
              />
            )}
            <p className="text-xs text-slate-400">
              Soporta Markdown: **negrita**, *cursiva*, `código`, # títulos, - listas
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sin categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Caso</Label>
              <select
                value={formTipoCaso}
                onChange={(e) => setFormTipoCaso(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sin tipo</option>
                {TIPO_CASOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tags (separados por coma)</Label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="sap, error, configuración"
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Publicado</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !title || !content}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Articles List */}
      {loading ? (
        <div className="text-center text-slate-400 py-10">Cargando...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">Sin artículos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-200/60 bg-white shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(article.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-blue-50/40"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-slate-800">
                      {article.title}
                    </h3>
                    {!article.published && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        Borrador
                      </span>
                    )}
                    {article.tipo_caso && (
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {article.tipo_caso}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                    {article.category && (
                      <span className="rounded bg-slate-100 px-2 py-0.5">
                        {article.category}
                      </span>
                    )}
                    <span>{article.author_name}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views}
                    </span>
                    <span>
                      {new Date(article.updated_at).toLocaleDateString("es")}
                    </span>
                  </div>
                </div>
                {expanded === article.id ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                )}
              </button>
              {expanded === article.id && article.content && (
                <div className="border-t px-4 py-4">
                  <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono max-h-[400px] overflow-y-auto">
                    {article.content}
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t pt-3 flex-wrap">
                    {article.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => startEdit(article)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary"
                      >
                        <Pencil className="h-3 w-3" /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
