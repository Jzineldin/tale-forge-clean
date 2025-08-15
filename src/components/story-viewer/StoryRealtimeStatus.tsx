
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, Wifi, WifiOff, Clock } from 'lucide-react';

interface StoryRealtimeStatusProps {
    realtimeStatus: string | null;
    connectionHealth?: 'healthy' | 'degraded' | 'failed';
    refetchStory: () => void;
    onManualRefresh?: () => void;
    isLoading: boolean;
}

const StoryRealtimeStatus: React.FC<StoryRealtimeStatusProps> = ({ 
    realtimeStatus, 
    connectionHealth = 'healthy',
    refetchStory, 
    onManualRefresh,
    isLoading 
}) => {
    const getStatusInfo = () => {
        // Show connection health issues first
        if (connectionHealth === 'failed') {
            return {
                icon: AlertCircle,
                title: 'Connection Failed',
                description: 'Live updates are unavailable. Using manual refresh only.',
                variant: 'destructive' as const,
                showRefresh: true,
                color: 'text-red-600'
            };
        }
        
        if (connectionHealth === 'degraded') {
            return {
                icon: Clock,
                title: 'Degraded Connection',
                description: 'Using backup polling for updates. Images may take longer to appear.',
                variant: 'default' as const,
                showRefresh: true,
                color: 'text-white'
            };
        }

        // Then show realtime status
        switch (realtimeStatus) {
            case 'SUBSCRIBED':
                return {
                    icon: CheckCircle,
                    title: 'Live Updates Active',
                    description: 'Your story will update automatically as content is generated.',
                    variant: 'default' as const,
                    showRefresh: false,
                    color: 'text-green-600'
                };
            case 'CHANNEL_ERROR':
            case 'TIMED_OUT':
                return {
                    icon: AlertCircle,
                    title: 'Connection Issue',
                    description: 'Live updates are unavailable. Use refresh to check for new content.',
                    variant: 'destructive' as const,
                    showRefresh: true,
                    color: 'text-red-600'
                };
            case 'CONNECTING':
                return {
                    icon: Wifi,
                    title: 'Connecting...',
                    description: 'Establishing live connection for automatic updates.',
                    variant: 'default' as const,
                    showRefresh: false,
                    color: 'text-blue-600'
                };
            case 'CLOSED':
                return {
                    icon: WifiOff,
                    title: 'Connection Closed',
                    description: 'Live updates are paused. Click refresh to check for updates.',
                    variant: 'default' as const,
                    showRefresh: true,
                    color: 'text-gray-600'
                };
            default:
                return null;
        }
    };

    const statusInfo = getStatusInfo();
    
    // Show status for all non-healthy states
    if (!statusInfo || (realtimeStatus === 'SUBSCRIBED' && connectionHealth === 'healthy')) {
        return null;
    }

    const IconComponent = statusInfo.icon;

    return (
        <Alert className="mb-6" variant={statusInfo.variant}>
            <IconComponent className={`h-4 w-4 ${statusInfo.color}`} />
            <AlertTitle>{statusInfo.title}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
                <span>{statusInfo.description}</span>
                {statusInfo.showRefresh && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onManualRefresh || refetchStory} 
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Now
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
};

export default StoryRealtimeStatus;
