'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const isBrowser = typeof window !== 'undefined';
  const isPublicLanding = isBrowser && window.location.pathname === '/';

  useEffect(() => {
    // Do not force login on the public landing page ('/')
    if (!loading && !user && !isPublicLanding) {
      router.push('/auth/login');
    }
  }, [user, loading, router, isPublicLanding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isPublicLanding) {
    return null;
  }

  return <>{children}</>;
} 