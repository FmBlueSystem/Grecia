"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  accentColor?: string;
  delay?: number;
  highlight?: boolean;
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      delay,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, value, delay]);

  return <motion.span>{rounded}</motion.span>;
}

export function KpiCard({ title, value, icon: Icon, color, bgColor, accentColor, delay = 0, highlight }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`bg-white rounded-2xl p-6 cursor-default relative overflow-hidden group border shadow-sm hover:shadow-md transition-shadow duration-300 ${highlight ? "border-blue-300 ring-2 ring-blue-200/50 shadow-blue-100/50" : "border-slate-200/60"}`}
    >
      {/* Top accent border */}
      <div className={`absolute top-0 left-0 w-full h-[3px] ${accentColor || bgColor} rounded-t-2xl`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{title}</p>
          <p className={`text-3xl font-extrabold tracking-tight ${value === 0 ? "text-slate-300" : color}`}>
            <AnimatedNumber value={value} delay={delay} />
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}
