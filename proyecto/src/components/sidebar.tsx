"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, MessageCircle, BarChart3, ShieldAlert, BookOpen, UserCog, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SAP_DATABASES, type CountryCode } from "@/lib/constants";

const COUNTRY_FLAGS: Record<string, string> = {
  CR: "\u{1F1E8}\u{1F1F7}",
  SV: "\u{1F1F8}\u{1F1FB}",
  GT: "\u{1F1EC}\u{1F1F9}",
  HN: "\u{1F1ED}\u{1F1F3}",
  PA: "\u{1F1F5}\u{1F1E6}",
};

const NAV_ITEMS: { href: string; label: string; icon: typeof LayoutDashboard; module: string; color: string }[] = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, module: "dashboard", color: "text-white/80" },
  { href: "/casos", label: "Casos", icon: MessageCircle, module: "casos", color: "text-white/80" },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3, module: "estadisticas", color: "text-white/80" },
  { href: "/alertas", label: "SLA & Alertas", icon: ShieldAlert, module: "alertas", color: "text-white/80" },
  { href: "/conocimiento", label: "Conocimiento", icon: BookOpen, module: "conocimiento", color: "text-white/80" },
  { href: "/configuracion", label: "Administración", icon: UserCog, module: "configuracion", color: "text-white/80" },
];

interface SidebarProps {
  userName?: string;
  userRole?: string;
  permissions?: Record<string, boolean>;
  country?: CountryCode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ userName, userRole, permissions, country, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openCasosCount, setOpenCasosCount] = useState(0);
  const [exceededCount, setExceededCount] = useState(0);

  useEffect(() => {
    fetch("/api/casos?page=1&status=-3")
      .then((r) => r.json())
      .then((d) => setOpenCasosCount(d.total || 0))
      .catch(() => {});
    fetch("/api/alertas")
      .then((r) => r.json())
      .then((d) => setExceededCount(d.summary?.exceeded || 0))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!permissions) return false;
    return permissions[item.module] === true;
  });

  const countryName = country ? SAP_DATABASES[country]?.name : undefined;
  const countryFlag = country ? COUNTRY_FLAGS[country] : undefined;

  return (
    <>
      {/* Backdrop overlay - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] flex-col justify-between overflow-hidden transition-transform duration-300 ease-in-out",
          "md:relative md:z-40 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "linear-gradient(to bottom, var(--sidebar-gradient-from), var(--sidebar-gradient-to))" }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#DC2626] via-[#F59E0B] to-[#16A34A]" />

        <div className="relative z-10">
          {/* Logo + Country + Close button */}
          <div className="flex h-[4rem] items-center gap-3 border-b border-white/10 px-6">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-lg shadow-black/10 ring-2 ring-white/20 shrink-0">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-base font-bold text-white tracking-widest uppercase">Casos</span>
              {countryName && (
                <p className="text-[11px] text-white/60 -mt-0.5 flex items-center gap-1">
                  {countryFlag && <span className="text-xs">{countryFlag}</span>}
                  {countryName}
                </p>
              )}
            </div>
            {/* Close button - mobile only */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/15 hover:text-white transition-colors md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex flex-col gap-1 px-3">
            {visibleItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const badgeCount =
                item.module === "casos" && openCasosCount > 0 ? openCasosCount :
                item.module === "alertas" && exceededCount > 0 ? exceededCount : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "relative group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <item.icon className={cn("relative z-10 h-5 w-5 transition-colors duration-300", isActive ? "text-white" : item.color)} />
                  <span className="relative z-10 flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User + Logout */}
        <div className="relative z-10 border-t border-white/10 p-4">
          {userName && (
            <div className="mb-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-white/90 capitalize mt-0.5 font-medium">{userRole}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
