import type { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    BarChart3, Users, Building2, TrendingUp,
    Search, Bell, LogOut, Package, ShoppingCart,
    FileText, LifeBuoy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../lib/store';
import { LanguageSwitcher } from './LanguageSwitcher';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: BarChart3, path: '/' },
        { id: 'leads', label: t('nav.leads', 'Leads'), icon: UserPlus, path: '/leads' },
        { id: 'opportunities', label: t('nav.opportunities', 'Oportunidades'), icon: TrendingUp, path: '/opportunities' },
        { id: 'contacts', label: t('nav.contacts', 'Contactos'), icon: Users, path: '/contacts' },
        { id: 'accounts', label: t('nav.accounts', 'Cuentas'), icon: Building2, path: '/accounts' },
        { id: 'products', label: t('nav.products', 'Productos'), icon: Package, path: '/products' },
        { id: 'quotes', label: t('nav.quotes', 'Ofertas'), icon: FileText, path: '/quotes' },
        { id: 'orders', label: t('nav.orders', 'Pedidos'), icon: ShoppingCart, path: '/orders' },
        { id: 'cases', label: t('nav.cases', 'Casos'), icon: LifeBuoy, path: '/cases' },
    ];

    function UserPlus(props: any) {
        return (
            <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
            {/* Dynamic Background Mesh */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/3 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            {/* Floating Header */}
            <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mb-8">
                <nav className="glass rounded-2xl shadow-lg shadow-slate-200/50 px-4 py-3 flex items-center justify-between border-white/50 bg-white/60 backdrop-blur-xl relative z-50">
                    <div className="flex items-center gap-6 md:gap-8 flex-1 min-w-0">
                        <Link to="/" className="flex items-center gap-3 shrink-0">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-xl tracking-tighter">S</span>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600 leading-tight">STIA</h1>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Enterprise</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0 mask-image-scroll pr-2 scroll-smooth">
                            <style>{`
                                .mask-image-scroll {
                                    mask-image: linear-gradient(to right, transparent, black 10px, black 90%, transparent);
                                    -webkit-mask-image: linear-gradient(to right, transparent, black 10px, black 90%, transparent);
                                }
                            `}</style>
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center relative whitespace-nowrap shrink-0 group ${isActive
                                            ? 'text-white shadow-md bg-gradient-to-r from-indigo-600 to-blue-600'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 ${isActive ? '' : 'mr-0 group-hover:mr-2 transition-all'}`} />
                                        <span className={`ml-2 ${isActive ? 'block' : 'hidden 2xl:block'}`}>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 pl-4 border-l border-slate-200/50 shrink-0">
                        <LanguageSwitcher />

                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white/50 rounded-lg hover:bg-white border border-transparent hover:border-indigo-100 hidden sm:block">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative bg-white/50 rounded-lg hover:bg-white border border-transparent hover:border-indigo-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        </button>

                        <div className="flex items-center gap-3 relative group ml-2">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-indigo-500 mt-1 font-medium">Admin</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer border-2 border-white ring-2 ring-indigo-100">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="mt-12 py-8 border-t border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-slate-400 font-medium tracking-wide">
                        POWERED BY <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600 font-bold">BLUESYSTEM</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
