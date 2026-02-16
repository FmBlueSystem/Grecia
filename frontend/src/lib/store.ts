import { create } from 'zustand';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    sapSalesPersonCode?: number | null;
    scopeLevel?: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })(),
    isAuthenticated: !!localStorage.getItem('token'),
    login: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
    },
}));

// ── Theme Store ──
export type ThemeSkin = 'blue' | 'green' | 'purple';

export const THEME_META: Record<ThemeSkin, { label: string; color: string }> = {
    blue:   { label: 'Azul STIA',  color: '#0067B2' },
    green:  { label: 'Verde',      color: '#059669' },
    purple: { label: 'Violeta',    color: '#7C3AED' },
};

interface ThemeState {
    theme: ThemeSkin;
    setTheme: (theme: ThemeSkin) => void;
}

// Apply theme on load
const savedTheme = (localStorage.getItem('theme') as ThemeSkin) || 'blue';
if (savedTheme !== 'blue') {
    document.documentElement.setAttribute('data-theme', savedTheme);
} else {
    document.documentElement.removeAttribute('data-theme');
}

export const useThemeStore = create<ThemeState>((set) => ({
    theme: savedTheme,
    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        if (theme === 'blue') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
    },
}));
