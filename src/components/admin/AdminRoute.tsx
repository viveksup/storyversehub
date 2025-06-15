import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // Check if user has admin role
      // In a real application, you would check against a roles table or user metadata
      // For demo purposes, we'll check if the user email contains 'admin'
      const isUserAdmin = user.email?.includes('admin') || 
                         user.user_metadata?.role === 'admin' ||
                         user.app_metadata?.role === 'admin';

      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-space-base/50 backdrop-blur-sm rounded-xl p-8 border border-space-light/20">
            <div className="w-16 h-16 bg-error-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-400 mb-6">
              You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;