import React, { useEffect } from 'react';
import Header from './Header';
import { FeedbackWidget } from './FeedbackWidget';
import { useLocation } from 'react-router-dom';
import { useHeaderVisibility } from '@/context/HeaderVisibilityContext';
import { useSlideshow } from '@/context/SlideshowContext';
// UI/UX improvements
import { useResponsiveBreakpoint, useAccessibility, useTheme } from '@/utils/uiUxImprovements';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isHeaderVisible, showHeader, hideHeader } = useHeaderVisibility();
  const { isSlideshowOpen } = useSlideshow();
  // UI/UX hooks
  const breakpoint = useResponsiveBreakpoint();
  const { prefersReducedMotion, prefersDarkMode } = useAccessibility();
  const { theme, changeTheme } = useTheme();

  useEffect(() => {
    // Show header for all routes including the landing page
    showHeader();
  }, [location, showHeader, hideHeader]);

  useEffect(() => {
    // Optionally auto-switch theme based on user preference
    if (prefersDarkMode && theme !== 'dark') {
      changeTheme('dark');
    } else if (!prefersDarkMode && theme !== 'light') {
      changeTheme('light');
    }
  }, [prefersDarkMode, theme, changeTheme]);

  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      {/* Header with smooth transition - positioned absolutely when hidden */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isHeaderVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <Header isSlideshowOpen={isSlideshowOpen} />
      </div>
      {/* Main content - full height when header is hidden */}
      <main 
        className={`relative z-10 transition-all duration-500 ease-in-out ${
          isHeaderVisible ? 'pt-16' : 'pt-0'
        }`} 
        style={{ background: 'transparent' }}
        data-breakpoint={breakpoint}
        data-reduced-motion={prefersReducedMotion}
        data-theme={theme}
      >
        {children}
      </main>
      
      {/* Feedback Widget - Available on all pages */}
      <FeedbackWidget />
    </div>
  );
};

export default Layout;