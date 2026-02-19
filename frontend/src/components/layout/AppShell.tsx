import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import HelpPanel from '../shared/HelpPanel';
import { getHelpContent } from '../../lib/helpContent';
import { useNotificationSSE } from '../../lib/hooks';

export default function AppShell() {
  const { pathname } = useLocation();
  const helpContent = getHelpContent(pathname);
  const notificationCount = useNotificationSSE();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — hidden on mobile by default, visible on lg+ */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-slate-200 bg-white shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-bold text-slate-900 text-sm">STIA CRM</span>
        </div>

        <TopBar notificationCount={notificationCount} />
        <main className="flex-1 p-4 lg:p-7 overflow-auto">
          <Outlet />
        </main>
      </div>
      <HelpPanel content={helpContent} />
    </div>
  );
}
