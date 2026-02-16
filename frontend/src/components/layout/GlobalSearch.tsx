import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, User, Target, FileText, ShoppingCart, X, Command } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../lib/api';

interface SearchResult {
    id: string;
    name?: string;
    number?: string;
    client?: string;
    email?: string;
    account?: string;
    amount?: number;
    total?: number;
    stage?: string;
    industry?: string;
    type: 'account' | 'contact' | 'opportunity' | 'quote' | 'order';
}

interface SearchResults {
    accounts: SearchResult[];
    contacts: SearchResult[];
    opportunities: SearchResult[];
    quotes: SearchResult[];
    orders: SearchResult[];
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Building2; color: string; path: string }> = {
    account: { label: 'Cuentas', icon: Building2, color: 'text-blue-600 bg-blue-50', path: '/accounts' },
    contact: { label: 'Contactos', icon: User, color: 'text-emerald-600 bg-emerald-50', path: '/contacts' },
    opportunity: { label: 'Oportunidades', icon: Target, color: 'text-indigo-600 bg-indigo-50', path: '/pipeline' },
    quote: { label: 'Cotizaciones', icon: FileText, color: 'text-amber-600 bg-amber-50', path: '/quotes' },
    order: { label: 'Pedidos', icon: ShoppingCart, color: 'text-fuchsia-600 bg-fuchsia-50', path: '/orders' },
};

function fmt(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Flatten results into a single list for keyboard nav
    const flatResults: SearchResult[] = results
        ? [...results.accounts, ...results.contacts, ...results.opportunities, ...results.quotes, ...results.orders]
        : [];

    // Focus input when modal opens
    useEffect(() => {
        if (open) {
            setQuery('');
            setResults(null);
            setSelectedIdx(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Search with debounce
    const doSearch = useCallback((q: string) => {
        if (q.length < 2) {
            setResults(null);
            return;
        }
        setLoading(true);
        api.get(`/search?q=${encodeURIComponent(q)}&limit=5`)
            .then(res => {
                setResults(res.data);
                setSelectedIdx(0);
            })
            .catch(() => setResults(null))
            .finally(() => setLoading(false));
    }, []);

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(value), 300);
    };

    // Navigate to result
    const goToResult = useCallback((item: SearchResult) => {
        const cfg = CATEGORY_CONFIG[item.type];
        if (!cfg) return;
        // For accounts and detail-based, navigate to detail page
        if (item.type === 'account') navigate(`/accounts/${item.id}`);
        else if (item.type === 'quote') navigate(`/quotes/${item.id}`);
        else if (item.type === 'order') navigate(`/orders/${item.id}`);
        else if (item.type === 'opportunity') navigate('/pipeline');
        else if (item.type === 'contact') navigate('/contacts');
        onClose();
    }, [navigate, onClose]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx(prev => Math.min(prev + 1, flatResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && flatResults[selectedIdx]) {
            e.preventDefault();
            goToResult(flatResults[selectedIdx]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    // Global Cmd+K listener
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (open) onClose();
                // Opening is handled by parent
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const getSubtitle = (item: SearchResult): string => {
        if (item.type === 'account') return item.industry || 'Cuenta';
        if (item.type === 'contact') return item.email || item.account || 'Contacto';
        if (item.type === 'opportunity') return `${item.stage} - ${fmt(item.amount || 0)}`;
        if (item.type === 'quote') return `${item.number} - ${fmt(item.total || 0)}`;
        if (item.type === 'order') return `${item.number} - ${fmt(item.total || 0)}`;
        return '';
    };

    const getTitle = (item: SearchResult): string => {
        if (item.type === 'quote' || item.type === 'order') return item.client || item.number || '';
        return item.name || '';
    };

    // Group results by type for display
    const groups = results
        ? (['accounts', 'contacts', 'opportunities', 'quotes', 'orders'] as const)
            .filter(key => results[key].length > 0)
            .map(key => ({
                key,
                type: results[key][0]?.type || key.slice(0, -1),
                items: results[key],
            }))
        : [];

    let runningIdx = 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -20 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                        <Search className="w-5 h-5 text-slate-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Buscar clientes, contactos, cotizaciones..."
                            className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                        {query && (
                            <button onClick={() => handleInputChange('')} className="p-1 hover:bg-slate-100 rounded-md">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-[50vh] overflow-y-auto">
                        {loading && (
                            <div className="px-4 py-8 text-center">
                                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-slate-400 mt-2">Buscando...</p>
                            </div>
                        )}

                        {!loading && query.length >= 2 && flatResults.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-slate-500">No se encontraron resultados</p>
                                <p className="text-xs text-slate-400 mt-1">Intenta con otro termino de busqueda</p>
                            </div>
                        )}

                        {!loading && groups.map(group => {
                            const cfg = CATEGORY_CONFIG[group.type];
                            if (!cfg) return null;
                            const Icon = cfg.icon;
                            const startIdx = runningIdx;

                            return (
                                <div key={group.key}>
                                    <div className="px-4 pt-3 pb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {cfg.label}
                                        </span>
                                    </div>
                                    {group.items.map((item, i) => {
                                        const globalIdx = startIdx + i;
                                        runningIdx = startIdx + i + 1;
                                        const isSelected = globalIdx === selectedIdx;
                                        return (
                                            <button
                                                key={`${item.type}-${item.id}`}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                                    isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                                                }`}
                                                onClick={() => goToResult(item)}
                                                onMouseEnter={() => setSelectedIdx(globalIdx)}
                                            >
                                                <div className={`p-2 rounded-lg ${cfg.color} shrink-0`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 truncate">{getTitle(item)}</p>
                                                    <p className="text-xs text-slate-400 truncate">{getSubtitle(item)}</p>
                                                </div>
                                                {isSelected && (
                                                    <kbd className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                        Enter
                                                    </kbd>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    {!loading && query.length < 2 && (
                        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1"><Command className="w-3 h-3" /> K para abrir</span>
                                <span>Flechas para navegar</span>
                                <span>Enter para seleccionar</span>
                                <span>Esc para cerrar</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
