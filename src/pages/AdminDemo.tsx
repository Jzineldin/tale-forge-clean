import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/core/AdminLayout';

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

// Import lazy admin components for better performance
import LazyAdminComponents from '@/components/admin/LazyAdminComponents';

const AdminDemo: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="waitlist" element={<LazyAdminComponents.AdminWaitlistViewer />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="system" element={<System />} />
        <Route path="system/optimization/voice" element={<LazyAdminComponents.VoiceOptimizerView />} />
        <Route path="system/optimization/image" element={<LazyAdminComponents.ImageOptimizerView />} />
        <Route path="system/optimization/database" element={<LazyAdminComponents.DatabaseOptimizerView />} />
        <Route path="system/optimization/performance" element={<LazyAdminComponents.PerformanceMonitorView />} />
        <Route path="config" element={<Config />} />
        <Route path="content" element={<Content />} />
        <Route path="security" element={<Security />} />
        <Route path="backup" element={<Backup />} />
        <Route path="logs" element={<Logs />} />
        <Route path="*" element={<Navigate to="/admin-demo" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDemo;