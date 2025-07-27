'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  GitBranch, 
  Users, 
  Settings, 
  BarChart3, 
  BookOpen,
  Plus,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  LogOut
} from 'lucide-react';
import { useAuthContext } from '../../../components/auth/AuthProvider';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();

  const { user, signOut } = useAuthContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    // Use user_metadata from Supabase Auth
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.email || 'User';
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
    },
    {
      name: 'Flow Builder',
      href: '/flow-builder',
      icon: GitBranch,
      current: pathname === '/flow-builder',
    },
    {
      name: 'My Flows',
      href: '/flows',
      icon: FolderOpen,
      current: pathname === '/flows',
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: BookOpen,
      current: pathname === '/templates',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: pathname === '/analytics',
    },
    {
      name: 'Team',
      href: '/team',
      icon: Users,
      current: pathname === '/team',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: pathname === '/settings',
    },
  ];

  const recentFlows = [
    { name: 'Trading Bot v2', status: 'running', lastRun: '2 min ago' },
    { name: 'Price Monitor', status: 'completed', lastRun: '1 hour ago' },
    { name: 'News Aggregator', status: 'error', lastRun: '3 hours ago' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={`bg-gray-800/50 border-r border-gray-700 flex flex-col transition-all duration-300 backdrop-blur-sm ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = item.current;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      {isOpen && (
        <div className="border-t border-gray-700 px-3 py-4">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center space-x-3 p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.email || 'No email'}
                </p>
              </div>
            </button>

            {/* User dropdown */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800/90 border border-gray-700 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <hr className="my-1 border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 