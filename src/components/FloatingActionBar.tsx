import React from 'react';

interface FloatingActionBarProps {
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({ 
  buttonText, 
  onClick, 
  disabled = false,
  loading = false,
  icon
}) => {
  return (
    // This container is only visible on screens smaller than 'md' (768px)
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-t border-yellow-500/20 p-4 shadow-2xl">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="btn-primary w-full py-4 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent"></div>
            Loading...
          </>
        ) : (
          <>
            {icon}
            {buttonText}
          </>
        )}
      </button>
    </div>
  );
};

export default FloatingActionBar; 