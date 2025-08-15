
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
// useAuth imported by child components
import { AdminLayout } from '@/components/admin/core/AdminLayout';
// Icons used in admin components are imported within their respective components
import AdminAccessDebugger from '@/components/debug/AdminAccessDebugger';

// Import admin section components
import Dashboard from '@/components/admin/sections/Dashboard';
import Users from '@/components/admin/sections/Users';
import Analytics from '@/components/admin/sections/Analytics';
import System from '@/components/admin/sections/System';
import Config from '@/components/admin/sections/Config';
import Content from '@/components/admin/sections/Content';
import Security from '@/components/admin/sections/Security';
import Backup from '@/components/admin/sections/Backup';
import Logs from '@/components/admin/sections/Logs';
import HeaderControls from '@/components/admin/sections/HeaderControls';
import SimpleFeedbackViewer from '@/components/admin/SimpleFeedbackViewer';
import LatestFeaturesManager from '@/components/admin/LatestFeaturesManager';

// Import lazy admin components for better performance
import LazyAdminComponents from '@/components/admin/LazyAdminComponents';

const Admin: React.FC = () => {
  const { isAdmin, loading: accessLoading, error } = useAdmin();
  // useAuth hook used by child components

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-400 mb-4">You don't have permission to access the admin area.</p>
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm font-medium mb-2">Database Setup Issue:</p>
                <p className="text-red-300 text-sm">{error}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Run fix_admin_access_complete.sql in your Supabase SQL Editor to fix this.
                </p>
              </div>
            )}
          </div>
          
          {/* Debug Component */}
          <AdminAccessDebugger />
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="waitlist" element={<LazyAdminComponents.AdminWaitlistViewer />} />
        <Route path="feedback" element={<SimpleFeedbackViewer />} />
        <Route path="latest-features" element={<LatestFeaturesManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="system" element={<System />} />
        <Route path="system/optimization/voice" element={<LazyAdminComponents.VoiceOptimizerView />} />
        <Route path="system/optimization/image" element={<LazyAdminComponents.ImageOptimizerView />} />
        <Route path="system/optimization/database" element={<LazyAdminComponents.DatabaseOptimizerView />} />
        <Route path="system/optimization/performance" element={<LazyAdminComponents.PerformanceMonitorView />} />
        <Route path="config" element={<Config />} />
        <Route path="header-controls" element={<HeaderControls />} />
        <Route path="content" element={<Content />} />
        <Route path="security" element={<Security />} />
        <Route path="backup" element={<Backup />} />
        <Route path="logs" element={<Logs />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;
