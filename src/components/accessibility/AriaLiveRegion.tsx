import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AriaLiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  clearAfter?: number; // Clear message after X milliseconds
  className?: string;
}

/**
 * ARIA Live Region Component
 * Announces dynamic content changes to screen readers
 * WCAG 2.1 AA Compliance: Success Criterion 4.1.3 (Status Messages)
 */
export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message,
  politeness = 'polite',
  clearAfter = 5000,
  className
}) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (message && clearAfter > 0) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout to clear message
      timeoutRef.current = setTimeout(() => {
        // Message will be cleared by parent component
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className={cn(
        "sr-only", // Screen reader only - visually hidden
        className
      )}
      role="status"
    >
      {message}
    </div>
  );
};

/**
 * Global Live Region Manager Hook
 * Manages multiple live region announcements
 */
export const useLiveRegion = () => {
  const [announcements, setAnnouncements] = React.useState<{
    id: string;
    message: string;
    politeness: 'polite' | 'assertive';
  }[]>([]);

  const announce = React.useCallback((
    message: string, 
    politeness: 'polite' | 'assertive' = 'polite'
  ) => {
    const id = Date.now().toString();
    setAnnouncements(prev => [...prev, { id, message, politeness }]);
    
    // Auto-clear after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 5000);
  }, []);

  const clear = React.useCallback(() => {
    setAnnouncements([]);
  }, []);

  return {
    announcements,
    announce,
    clear
  };
};

/**
 * Global Live Region Provider
 * Renders all active announcements
 */
export const LiveRegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { announcements } = useLiveRegion();

  return (
    <>
      {children}
      <div className="live-region-container">
        {announcements.map(({ id, message, politeness }) => (
          <AriaLiveRegion
            key={id}
            message={message}
            politeness={politeness}
          />
        ))}
      </div>
    </>
  );
};

export default AriaLiveRegion;