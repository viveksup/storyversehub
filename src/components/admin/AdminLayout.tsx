import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, BarChart3, Users, BookOpen, Settings, 
  Shield, DollarSign, Bell, LogOut, Menu, X 
} from 'lucide-react';
import Button from '../ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navigationItems = [
    { name: 'Overview', path: '/admin', icon: Home },
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Content', path: '/admin/content', icon: BookOpen },
    { name: 'Payments', path: '/admin/payments', icon: DollarSign },
    { name: 'Security', path: '/admin/security', icon: Shield },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-space-dark">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-space-base border-r border-space-light/20 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-space-light/20">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="rounded-lg bg-secondary-600 p-1.5">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">Admin</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                        ${isActive 
                          ? 'bg-primary-600 text-white shadow-neon' 
                          : 'text-gray-300 hover:bg-space-light/20 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={20} className="mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-space-light/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-400 hover:text-white"
              leftIcon={<LogOut size={16} />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-space-base border-b border-space-light/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-display font-semibold text-white">
              Admin Panel
            </h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;