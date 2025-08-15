import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Focus Management Utilities
 * Provides consistent focus handling across the application
 * WCAG 2.1 AA Compliance: Success Criteria 2.4.3, 2.4.7, 3.2.1
 */

interface FocusManagerProps {
  children: React.ReactNode;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  className?: string;
}

/**
 * Focus Manager Component
 * Manages focus within a container, with optional focus trapping
 */
export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  restoreFocus = false,
  trapFocus = false,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!trapFocus || event.key !== 'Tab') return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, [trapFocus]);

  return (
    <div
      ref={containerRef}
      className={cn("focus-manager", className)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

/**
 * Focus Trap Hook
 * Traps focus within a specific element
 */
export const useFocusTrap = (isActive: boolean = true) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;
    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus the first focusable element
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isActive]);

  return elementRef;
};

/**
 * Focus Restoration Hook
 * Restores focus to the previously focused element
 */
export const useFocusRestore = () => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, []);

  return { saveFocus, restoreFocus };
};

/**
 * Enhanced Focus Indicator Component
 * Provides consistent focus styling across the application
 */
interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'prominent' | 'subtle';
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className,
  variant = 'default'
}) => {
  const focusClasses = {
    default: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
    prominent: 'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:shadow-lg',
    subtle: 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:ring-offset-1'
  };

  return (
    <div className={cn(focusClasses[variant], className)}>
      {children}
    </div>
  );
};

/**
 * Skip Link Component
 * Provides keyboard navigation shortcuts
 */
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className
}) => {
  return (
    <a
      href={href}
      className={cn(
        "skip-link",
        "absolute -top-10 left-4 z-50 bg-amber-400 text-slate-900 px-4 py-2 rounded-md font-semibold",
        "focus:top-4 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  );
};

export default FocusManager;