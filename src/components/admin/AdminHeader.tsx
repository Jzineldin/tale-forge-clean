import React from 'react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <button 
          onClick={onToggleSidebar}
          className="mr-4 p-2 rounded-md hover:bg-purple-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-4xl font-bold text-white mb-2 font-serif">
          ✨ Tale Forge Admin Panel
        </h1>
      </div>
      <p className="text-purple-200 text-lg">
        Comprehensive AI system management, monitoring, and diagnostics
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
          API Monitoring
        </span>
        <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
          Model Management
        </span>
        <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
          System Logs
        </span>
        <span className="px-3 py-1 bg-brand-indigo text-white text-sm rounded-full">
          Cost Tracking
        </span>
        <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full">
          Health Monitoring
        </span>
      </div>
    </div>
  );
};