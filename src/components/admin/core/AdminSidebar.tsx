
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  Settings, 
  Shield, 
  Database, 
  FileText, 
  Archive,
  Activity,
  UserCheck,
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: UserCheck, label: 'Waitlist', path: '/admin/waitlist' },
    { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' },
    { icon: Sparkles, label: 'Latest Features', path: '/admin/latest-features' },
    { icon: Activity, label: 'Analytics', path: '/admin/analytics' },
    { icon: Database, label: 'System', path: '/admin/system' },
    { icon: Settings, label: 'Config', path: '/admin/config' },
    { icon: Eye, label: 'Header Controls', path: '/admin/header-controls' },
    { icon: FileText, label: 'Content', path: '/admin/content' },
    { icon: Shield, label: 'Security', path: '/admin/security' },
    { icon: Archive, label: 'Backup', path: '/admin/backup' },
    { icon: FileText, label: 'Logs', path: '/admin/logs' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={cn(
      "bg-slate-800 text-white transition-all duration-300 flex flex-col",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {isOpen && (
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-slate-700 transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm transition-colors",
                  "hover:bg-slate-700",
                  isActive(item.path) && "bg-purple-600 text-white"
                )}
                title={!isOpen ? item.label : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {isOpen && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
