"use client";

import { useState } from "react";
import { Globe, ChevronDown, Loader2 } from "lucide-react";
import { SAP_DATABASES, type CountryCode } from "@/lib/constants";

interface CountrySelectorProps {
  current: CountryCode;
  countries: string[];
}

export function CountrySelector({ current, countries }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  async function handleSwitch(code: CountryCode) {
    if (code === current) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    setOpen(false);

    try {
      const res = await fetch("/api/auth/switch-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: code }),
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // silent fail
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={switching}
        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-primary/50 transition-all duration-300 disabled:opacity-50 shadow-sm"
      >
        {switching ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <Globe className="h-4 w-4 text-slate-400" />
        )}
        <span className="sm:hidden">{current}</span>
        <span className="hidden sm:inline">{SAP_DATABASES[current].name}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-48 rounded-2xl border border-slate-200 bg-white py-2 shadow-lg overflow-hidden transition-all duration-200">
          {Object.entries(SAP_DATABASES).map(([code, db]) => {
            const hasAccess = countries.includes(code);
            return (
              <button
                key={code}
                onClick={() => hasAccess && handleSwitch(code as CountryCode)}
                disabled={!hasAccess}
                className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors duration-200 ${code === current
                  ? "font-bold text-primary bg-blue-50"
                  : hasAccess
                    ? "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
                    : "text-slate-300 cursor-not-allowed"
                  }`}
              >
                {db.name}
                {code === current && <span className="ml-auto text-xs">●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
