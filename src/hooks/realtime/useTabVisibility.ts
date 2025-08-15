
import { useEffect, useRef } from 'react';

export const useTabVisibility = (onVisibilityChange: (isActive: boolean) => void) => {
    const isActiveTab = useRef<boolean>(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            isActiveTab.current = !document.hidden;
            onVisibilityChange(isActiveTab.current);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [onVisibilityChange]);

    return { isActiveTab };
};
