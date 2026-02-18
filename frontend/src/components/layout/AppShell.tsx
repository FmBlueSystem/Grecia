import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import HelpPanel from '../shared/HelpPanel';
import { getHelpContent } from '../../lib/helpContent';
import { useNotificationSSE } from '../../lib/hooks';

export default function AppShell() {
  const { pathname } = useLocation();
  const helpContent = getHelpContent(pathname);
  const notificationCount = useNotificationSSE();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="ml-[260px] flex flex-col min-h-screen">
        <TopBar notificationCount={notificationCount} />
        <main className="flex-1 p-7 overflow-auto">
          <Outlet />
        </main>
      </div>
      <HelpPanel content={helpContent} />
    </div>
  );
}
