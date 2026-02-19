import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Suspense, lazy } from 'react';
import { useAuthStore } from './lib/store';
import AppShell from './components/layout/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Lazy-loaded pages for code-splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Accounts = lazy(() => import('./pages/Accounts'));
const AccountDetail = lazy(() => import('./pages/AccountDetail'));
const Contacts = lazy(() => import('./pages/Contacts'));
const ContactDetail = lazy(() => import('./pages/ContactDetail'));
const Leads = lazy(() => import('./pages/Leads'));
const Pipeline = lazy(() => import('./pages/Pipeline'));
const Quotes = lazy(() => import('./pages/Quotes'));
const QuoteDetail = lazy(() => import('./pages/QuoteDetail'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Invoices = lazy(() => import('./pages/Invoices'));
const InvoiceDetail = lazy(() => import('./pages/InvoiceDetail'));
const Activities = lazy(() => import('./pages/Activities'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cases = lazy(() => import('./pages/Cases'));
const CaseDetail = lazy(() => import('./pages/CaseDetail'));
const LostDeals = lazy(() => import('./pages/LostDeals'));
const Traceability = lazy(() => import('./pages/Traceability'));
const Reports = lazy(() => import('./pages/Reports'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const LogisticsDashboard = lazy(() => import('./pages/dashboards/LogisticsDashboard'));
const ServiceDashboard = lazy(() => import('./pages/dashboards/ServiceDashboard'));
const SalesManager = lazy(() => import('./pages/SalesManager'));
const AgingReport = lazy(() => import('./pages/AgingReport'));
const UsagePage = lazy(() => import('./pages/UsagePage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
      <span className="ml-3 text-slate-500">Cargando...</span>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton expand={false} duration={4000} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected routes with AppShell layout */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            {/* PRINCIPAL */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:id" element={<AccountDetail />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/pipeline" element={<Pipeline />} />

            {/* COMERCIAL */}
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quotes/:id" element={<QuoteDetail />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* GESTION */}
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/traceability" element={<Traceability />} />
            <Route path="/logistics" element={<LogisticsDashboard />} />
            <Route path="/service" element={<ServiceDashboard />} />
            <Route path="/lost-deals" element={<LostDeals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/aging" element={<AgingReport />} />
            <Route path="/calendar" element={<CalendarView />} />

            {/* GERENTE DE VENTAS */}
            <Route path="/sales-manager" element={<SalesManager />} />

            {/* SYSTEM */}
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
