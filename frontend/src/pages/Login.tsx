import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, scaleIn } from '../lib/animations';
import { useAuthStore } from '../lib/store';
import api from '../lib/api';

const DEMO_ACCOUNTS = [
  { label: 'Administrador', email: 'freddy@bluesystem.com', password: 'password123', initials: 'FM', color: 'from-slate-700 to-slate-900' },
  { label: 'Gerente', email: 'mariana.solis@stia.com', password: 'password123', initials: 'MS', color: 'from-blue-600 to-blue-800' },
  { label: 'Vendedor', email: 'mario.marin@stia.com', password: 'password123', initials: 'MM', color: 'from-emerald-600 to-emerald-800' },
];

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fillCredentials = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -z-20" />

      {/* Abstract Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.div
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          variants={fadeIn}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-6 shadow-xl shadow-slate-900/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">STIA CRM</h1>
          <p className="text-slate-500 mt-2 font-medium">Portal de Acceso Empresarial</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Quick Access Roles */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Acceso Rápido</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillCredentials(acc)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  email === acc.email
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${acc.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {acc.initials}
                </div>
                <span className="text-xs font-semibold text-slate-700">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Correo Institucional
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="nombre@empresa.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Contraseña
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Autenticando...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            POWERED BY <span className="text-slate-600 font-bold">BLUESYSTEM</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

