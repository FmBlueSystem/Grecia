import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './lib/store';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Contacts from './pages/Contacts';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Activities from './pages/Activities';
import Products from './pages/Products';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import LostDeals from './pages/LostDeals';
import Traceability from './pages/Traceability';
import Reports from './pages/Reports';
import CalendarView from './pages/CalendarView';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import LogisticsDashboard from './pages/dashboards/LogisticsDashboard';
import ServiceDashboard from './pages/dashboards/ServiceDashboard';
import SalesManager from './pages/SalesManager';
import AgingReport from './pages/AgingReport';
import UsagePage from './pages/UsagePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton expand={false} duration={4000} />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected routes with AppShell layout */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          {/* PRINCIPAL */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          <Route path="/contacts" element={<Contacts />} />
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

          {/* GESTIÓN */}
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
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
