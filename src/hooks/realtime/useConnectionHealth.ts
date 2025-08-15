
import { useState, useRef, useCallback } from 'react';

export const useConnectionHealth = () => {
    const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'failed'>('healthy');
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5; // Increased from 3
    const lastConnectionTime = useRef<number>(Date.now());

    const setHealthy = useCallback(() => {
        setConnectionHealth('healthy');
        reconnectAttempts.current = 0;
        lastConnectionTime.current = Date.now();
    }, []);

    const setDegraded = useCallback(() => {
        setConnectionHealth('degraded');
    }, []);

    const setFailed = useCallback(() => {
        setConnectionHealth('failed');
    }, []);

    const incrementReconnectAttempts = useCallback(() => {
        reconnectAttempts.current++;
        return reconnectAttempts.current;
    }, []);

    const hasMaxReconnectAttemptsReached = useCallback(() => {
        return reconnectAttempts.current >= maxReconnectAttempts;
    }, [maxReconnectAttempts]);

    const getReconnectDelay = useCallback(() => {
        // Exponential backoff with jitter: base delay * 2^attempts + random(0-1000ms)
        const baseDelay = 1000;
        const exponentialDelay = baseDelay * Math.pow(2, reconnectAttempts.current);
        const jitter = Math.random() * 1000;
        return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
    }, []);

    const updateConnectionTime = useCallback(() => {
        lastConnectionTime.current = Date.now();
    }, []);

    const getTimeSinceLastConnection = useCallback(() => {
        return Date.now() - lastConnectionTime.current;
    }, []);

    return {
        connectionHealth,
        setHealthy,
        setDegraded,
        setFailed,
        incrementReconnectAttempts,
        hasMaxReconnectAttemptsReached,
        getReconnectDelay,
        updateConnectionTime,
        getTimeSinceLastConnection,
        maxReconnectAttempts
    };
};
