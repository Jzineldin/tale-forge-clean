import React from 'react';
import { cn } from '@/lib/utils';

interface SkipNavigationProps {
  className?: string;
}

/**
 * Skip Navigation Component
 * Provides keyboard users with the ability to skip directly to main content
 * WCAG 2.1 AA Compliance: Success Criterion 2.4.1 (Bypass Blocks)
 */
export const SkipNavigation: React.FC<SkipNavigationProps> = ({ className }) => {
  return (
    <div className={cn("skip-navigation", className)}>
      <a
        href="#main-content"
        className="skip-link"
        onFocus={(e) => {
          // Ensure the link is visible when focused
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onBlur={(e) => {
          // Hide the link when focus is lost
          e.currentTarget.style.transform = 'translateY(-100%)';
        }}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="skip-link"
        onFocus={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.transform = 'translateY(-100%)';
        }}
      >
        Skip to navigation
      </a>
    </div>
  );
};

export default SkipNavigation;