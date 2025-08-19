'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import ProtectedRoute from '../auth/ProtectedRoute';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if current path is public (landing or auth)
  const isAuthPage = pathname?.startsWith('/auth');
  const isHomePage = pathname === '/';

  // For public pages, render without ProtectedRoute or app chrome
  if (isAuthPage || isHomePage) {
    return <>{children}</>;
  }

  // For protected pages, render with ProtectedRoute and full layout
  return (
    <ProtectedRoute>
      <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

          {/* Page content */}
          <main className={`flex-1 overflow-y-auto transition-all duration-300 ${!isSidebarOpen ? 'ml-0' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout; 