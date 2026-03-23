"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

type NoteFilter = "all" | "internal" | "external";

interface Note {
  id: number;
  case_id: number;
  user_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

interface CaseTimelineProps {
  caseId: number;
}

export function CaseTimeline({ caseId }: CaseTimelineProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<NoteFilter>("all");

  async function loadNotes() {
    try {
      const res = await fetch(`/api/casos/${caseId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [caseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/casos/${caseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), is_internal: isInternal }),
      });
      if (res.ok) {
        setContent("");
        await loadNotes();
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const filteredNotes = notes.filter((note) => {
    if (filter === "internal") return note.is_internal;
    if (filter === "external") return !note.is_internal;
    return true;
  });

  const filterTabs: { key: NoteFilter; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "internal", label: "Internas" },
    { key: "external", label: "Cliente" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <MessageCircle className="h-4 w-4" />
          Notas ({notes.length})
        </h2>

        {/* Filter tabs */}
        <div className="flex rounded-lg border bg-slate-50 p-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === tab.key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add note form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Agregar una nota..."
            rows={2}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <Button
            type="submit"
            size="sm"
            className="self-end"
            disabled={sending || !content.trim()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            className="rounded border-slate-300"
          />
          <Lock className="h-3 w-3 text-slate-400" />
          <span className="text-xs text-slate-500">Nota interna (no visible para el cliente)</span>
        </label>
      </form>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-4">
          Sin notas aún
        </p>
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />

          <AnimatePresence>
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative flex gap-3 py-3 ${
                  note.is_internal ? "" : ""
                }`}
              >
                {/* Dot */}
                <div
                  className={`relative z-10 mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full border-2 ml-[10px] ${
                    note.is_internal
                      ? "border-amber-500 bg-amber-100"
                      : "border-blue-500 bg-blue-100"
                  }`}
                />

                {/* Content */}
                <div
                  className={`flex-1 min-w-0 rounded-lg px-3 py-2.5 border-l-[3px] ${
                    note.is_internal
                      ? "bg-[#FFFBEB] border border-amber-200 border-l-amber-400"
                      : "bg-[#F0F9FF] border border-blue-200 border-l-blue-400"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">
                      {note.user_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(note.created_at)}
                    </span>
                    {note.is_internal ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                        <Lock className="h-2.5 w-2.5" /> Interna
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                        <Globe className="h-2.5 w-2.5" /> Cliente
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
