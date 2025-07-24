'use client';

import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../lib/auth';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900">AgentPad</h1>
          <span className="text-sm text-gray-500">AI Agent Builder</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-500">Not signed in</span>
          )}
        </div>
      </div>
    </header>
  );
} 