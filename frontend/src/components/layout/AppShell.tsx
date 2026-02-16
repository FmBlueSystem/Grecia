import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import HelpPanel from '../shared/HelpPanel';
import { getHelpContent } from '../../lib/helpContent';

export default function AppShell() {
  const { pathname } = useLocation();
  const helpContent = getHelpContent(pathname);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="ml-[260px] flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-7 overflow-auto">
          <Outlet />
        </main>
      </div>
      <HelpPanel content={helpContent} />
    </div>
  );
}
