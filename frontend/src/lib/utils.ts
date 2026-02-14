
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
        'OPPORTUNITY': 'bg-blue-100 text-blue-700',
        'PROPOSAL': 'bg-indigo-100 text-indigo-700',
        'FOLLOW_UP': 'bg-amber-100 text-amber-700',
        'NEGOTIATION': 'bg-orange-100 text-orange-700',
        'CLOSED_WON': 'bg-emerald-100 text-emerald-700',
        'CLOSED_LOST': 'bg-rose-100 text-rose-700',
    };
    return colors[stage] || 'bg-slate-100 text-slate-700';
};
