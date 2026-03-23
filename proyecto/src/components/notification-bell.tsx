"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, ShieldAlert, CheckCheck } from "lucide-react";
import { fetcher } from "@/lib/fetcher";

interface NotificationItem {
  id: number;
  case_id: number | null;
  country: string | null;
  title: string;
  message: string | null;
  type: string;
  created_at: string;
}

interface NotificationsResponse {
  items: NotificationItem[];
  unread_count: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

function notifIcon(type: string) {
  if (type === "sla_warning" || type === "sla_exceeded" || type === "escalation") {
    return <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />;
  }
  return <Bell className="h-4 w-4 text-slate-400 shrink-0" />;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, mutate } = useSWR<NotificationsResponse>(
    "/api/notifications",
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: true }
  );

  const count = data?.unread_count || 0;
  const items = data?.items || [];

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markRead(id: number, caseId: number | null) {
    // Optimistic: remove from list
    if (data) {
      mutate(
        {
          items: items.filter((n) => n.id !== id),
          unread_count: Math.max(count - 1, 0),
        },
        false
      );
    }
    fetch(`/api/notifications/${id}/read`, { method: "PATCH" }).catch(() => {});
    if (caseId) {
      setOpen(false);
      router.push(`/casos/${caseId}`);
    }
  }

  async function markAllRead() {
    if (data) {
      mutate({ items: [], unread_count: 0 }, false);
    }
    await fetch("/api/notifications/read-all", { method: "POST" });
    mutate();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-300 shadow-sm"
        title="Notificaciones"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-80 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Notificaciones</span>
              {count > 0 && (
                <span className="text-[11px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                  {count} sin leer
                </span>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <BellOff className="h-8 w-8 mb-2" />
                  <span className="text-sm">Sin notificaciones pendientes</span>
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id, n.case_id)}
                    className="flex gap-3 w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-150 border-b border-slate-50 last:border-b-0"
                  >
                    <div className="mt-0.5">{notifIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                      {n.message && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{n.message}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2.5">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas como leidas
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
