"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { trackPageView } from "@/lib/telemetry";
import { CountrySelector } from "@/components/country-selector";
import { NotificationBell } from "@/components/notification-bell";
import { Search, Menu } from "lucide-react";
import { DEFAULT_COUNTRY, type CountryCode } from "@/lib/constants";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { useMobile } from "@/hooks/use-mobile";

interface SessionData {
  name: string;
  role: string;
  country: CountryCode;
  countries: string[];
  permissions: Record<string, boolean>;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMobile();
  const [session, setSession] = useState<SessionData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.country) setSession(data);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (pathname) trackPageView(pathname);
  }, [pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/casos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const country = session?.country || DEFAULT_COUNTRY;
  const countries = session?.countries || [DEFAULT_COUNTRY];

  return (
    <ThemeProvider>
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        userName={session?.name}
        userRole={session?.role}
        permissions={session?.permissions}
        country={session?.country}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Bar */}
        <header className="flex h-[4rem] items-center justify-between border-b border-slate-200/60 bg-white/90 backdrop-blur-md px-3 sm:px-6 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            {/* Hamburger menu - mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 transition-all duration-300 hover:bg-slate-50 focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(0,103,178,0.15)]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar casos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-32 sm:w-48 md:w-64 border-none bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-700"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <CountrySelector current={country} countries={countries} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Dev Banner */}
      {process.env.NEXT_PUBLIC_SHOW_DEV_BANNER === "true" && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-500 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-amber-500/30">
          Sistema en desarrollo
        </div>
      )}
    </div>
    </ThemeProvider>
  );
}
