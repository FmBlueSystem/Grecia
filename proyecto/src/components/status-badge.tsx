import { memo } from "react";
import { STATUS_COLORS, PRIORITY_COLORS } from "@/lib/ui";

export const StatusBadge = memo(function StatusBadge({ status, label }: { status: number; label: string }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
});

export const PriorityBadge = memo(function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-600"}`}>
      {priority}
    </span>
  );
});
