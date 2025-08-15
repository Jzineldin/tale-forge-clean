import React from 'react';
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

/**
 * Security dashboard component for monitoring security status and metrics
 */
export const SecurityDashboard: React.FC = () => {
  const { metrics } = useSecurityMonitor();

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'low':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Security Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Security Level</p>
              <div className="flex items-center space-x-2">
                {getSecurityIcon(metrics.securityLevel)}
                <Badge className={getSecurityLevelColor(metrics.securityLevel)}>
                  {metrics.securityLevel.toUpperCase()}
                </Badge>
              </div>
            </div>
            {metrics.lastSecurityCheck && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="text-sm font-medium">
                  {metrics.lastSecurityCheck.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Login Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLoginAttempts}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.failedLoginAttempts === 0 ? 'No failed attempts' : 'Recent failed attempts'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.suspiciousActivity === 0 ? 'No suspicious activity' : 'Events flagged'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Features Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security Features</CardTitle>
          <CardDescription>
            Current status of implemented security measures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Encrypted Storage</span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Input Validation</span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Content Sanitization</span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Security Monitoring</span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Audit Logging</span>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              <Clock className="h-3 w-3 mr-1" />
              Console Only
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendations</CardTitle>
          <CardDescription>
            Suggested security improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Security audit database table is not yet implemented. Audit events are currently 
              logged to console only. Apply the security migration to enable full audit trail functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};