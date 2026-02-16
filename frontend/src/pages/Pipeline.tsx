import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, DollarSign, Calendar, MoreHorizontal, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../lib/store';
// Stage colors handled via COLUMNS config

interface Opportunity {
    id: string;
    name: string;
    amount: number;
    stage: string;
    accountName: string;
    closeDate: string;
    probability: number;
}

const COLUMNS = [
    { id: 'OPPORTUNITY', title: 'Oportunidad', color: 'bg-blue-500' },
    { id: 'PROPOSAL', title: 'Propuesta', color: 'bg-indigo-500' },
    { id: 'FOLLOW_UP', title: 'Seguimiento', color: 'bg-amber-500' },
    { id: 'NEGOTIATION', title: 'Negociación', color: 'bg-orange-500' },
    { id: 'CLOSED_WON', title: 'Cierre Ganado', color: 'bg-emerald-500' },
    { id: 'CLOSED_LOST', title: 'Cierre Perdido', color: 'bg-red-500' },
];

// Sortable Item Component
function SortableItem({ opp }: { id: string, opp: Opportunity }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: opp.id, data: { ...opp } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3 group ${
                (Date.now() - new Date(opp.closeDate).getTime()) / 86400000 > 14 && opp.stage !== 'CLOSED_WON' && opp.stage !== 'CLOSED_LOST'
                    ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
            }`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-full">{opp.accountName}</span>
                <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
            <h4 className="font-bold text-slate-900 leading-tight mb-2">{opp.name}</h4>
            {(Date.now() - new Date(opp.closeDate).getTime()) / 86400000 > 14 && opp.stage !== 'CLOSED_WON' && opp.stage !== 'CLOSED_LOST' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded mb-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Estancada
                </span>
            )}
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(opp.amount)}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(opp.closeDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {opp.probability}% Prob.
                </div>
            </div>
        </div>
    );
}

export default function Pipeline() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sellerFilter, setSellerFilter] = useState<string>('ALL');
    const { user } = useAuthStore();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drag on click
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        api.get('/opportunities')
            .then(res => {
                if (res.data?.data) setOpportunities(res.data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeOpp = opportunities.find(o => o.id === active.id);
        const overContainerId = over.id as string; // This will be the column status ID (e.g., 'PROPOSAL')

        // If dropped over a column container (which we will set up as droppable zones)
        // Check if dropped into a different column
        if (activeOpp && activeOpp.stage !== overContainerId && COLUMNS.some(c => c.id === overContainerId)) {
            // Optimistic Update
            setOpportunities(prev => prev.map(o =>
                o.id === active.id ? { ...o, stage: overContainerId } : o
            ));

            // API Call
            try {
                await api.put(`/opportunities/${active.id}`, { stage: overContainerId });
            } catch (err) {
                console.error("Error al actualizar estado", err);
            }
        }

        setActiveId(null);
    };

    // Unique sellers for filter
    const sellers = [...new Set(opportunities.map(o => o.accountName))].sort();

    // Filter by seller
    const filteredOpps = sellerFilter === 'ALL'
        ? opportunities
        : opportunities.filter(o => o.accountName === sellerFilter);

    // Stale deals: no change in 14+ days
    const isStale = (opp: Opportunity) => {
        const updated = new Date(opp.closeDate);
        const diff = (Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 14 && opp.stage !== 'CLOSED_WON' && opp.stage !== 'CLOSED_LOST';
    };

    if (loading) return <div>Cargando Pipeline...</div>;

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Embudo de Ventas</h2>
                    <p className="text-slate-500">Gestión visual del flujo de oportunidades</p>
                </div>
                <div className="flex items-center gap-3">
                    {(user?.role === 'Admin' || user?.role === 'Gerente') && (
                        <select
                            value={sellerFilter}
                            onChange={(e) => setSellerFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">Todas las cuentas</option>
                            {sellers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    )}
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                        <Plus className="w-4 h-4" /> Nueva Oportunidad
                    </button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-[1200px] h-full">
                        {COLUMNS.map(col => {
                            const items = filteredOpps.filter(o => o.stage === col.id);
                            const totalValue = items.reduce((acc, curr) => acc + curr.amount, 0);

                            return (
                                <div key={col.id} className="flex-1 flex flex-col min-w-[280px] bg-slate-50/50 rounded-2xl border border-slate-200/50 backdrop-blur-sm">
                                    {/* Column Header */}
                                    <div className="p-4 border-b border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-slate-700">{col.title}</h3>
                                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalValue)}</span>
                                        </div>
                                    </div>

                                    {/* Droppable Area */}
                                    <SortableContext
                                        id={col.id}
                                        items={items.map(i => i.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <DroppableColumn id={col.id}>
                                            {items.map(opp => (
                                                <SortableItem key={opp.id} id={opp.id} opp={opp} />
                                            ))}
                                        </DroppableColumn>
                                    </SortableContext>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="bg-white p-4 rounded-xl border-2 border-indigo-500 shadow-xl opacity-90 rotate-2">
                            {/* Simplified Preview */}
                            <div className="font-bold text-slate-900">Moviendo Oportunidad...</div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

// Helper for Droppable Zone
import { useDroppable } from '@dnd-kit/core';

function DroppableColumn({ id, children }: { id: string, children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto">
            {children}
        </div>
    );
}
