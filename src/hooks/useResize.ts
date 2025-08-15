import { useEffect, useState } from 'react';

export const useMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  
  return mobile;
}; 