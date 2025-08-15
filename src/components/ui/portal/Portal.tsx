import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create portal container
    portalRef.current = document.createElement('div');
    portalRef.current.id = 'tour-portal';
    document.body.appendChild(portalRef.current);
    setMounted(true);

    // Cleanup
    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
      }
      setMounted(false);
    };
  }, []);

  if (!mounted || !portalRef.current) return null;

  return createPortal(children, portalRef.current);
};

export default Portal;