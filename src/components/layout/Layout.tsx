'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if current path is an auth page
  const isAuthPage = pathname?.startsWith('/auth');

  // For auth pages, render without ProtectedRoute and without header/sidebar
  if (isAuthPage) {
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
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout; 