import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const AdminAccessDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDebugCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const debugData: any = {};
      
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      debugData.user = user;
      debugData.userError = userError;
      
      if (user) {
        // Check user_roles table
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);
        
        debugData.userRoles = userRoles;
        debugData.rolesError = rolesError;
        
        // Check has_role function
        const { data: hasRoleResult, error: hasRoleError } = await supabase
          .rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });
        
        debugData.hasRoleResult = hasRoleResult;
        debugData.hasRoleError = hasRoleError;
        
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        debugData.session = session;
        debugData.sessionError = sessionError;
      }
      
      setDebugInfo(debugData);
    } catch (err: any) {
      setError(err.message || 'Debug check failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDebugCheck();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Admin Access Debugger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Running diagnostic checks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Admin Access Debugger
          <Button onClick={runDebugCheck} size="sm" variant="outline">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {debugInfo && (
          <div className="space-y-4">
            {/* User Authentication */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Authentication Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>User Logged In:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(!!debugInfo.user)}
                    {getStatusBadge(!!debugInfo.user, "Yes", "No")}
                  </div>
                </div>
                
                {debugInfo.user && (
                  <>
                    <div className="text-sm text-gray-600">
                      User ID: {debugInfo.user.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      Email: {debugInfo.user.email}
                    </div>
                  </>
                )}
                
                {debugInfo.userError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      User Error: {debugInfo.userError.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Session Status */}
            {debugInfo.session && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Session Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Active Session:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(!!debugInfo.session)}
                      {getStatusBadge(!!debugInfo.session, "Active", "None")}
                    </div>
                  </div>
                  
                  {debugInfo.sessionError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Session Error: {debugInfo.sessionError.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {/* User Roles */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">User Roles</h3>
              <div className="space-y-2">
                {debugInfo.rolesError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Roles Error: {debugInfo.rolesError.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Admin Role:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(debugInfo.userRoles?.some((r: any) => r.role === 'admin'))}
                        {getStatusBadge(
                          debugInfo.userRoles?.some((r: any) => r.role === 'admin'),
                          "Has Admin Role",
                          "No Admin Role"
                        )}
                      </div>
                    </div>
                    
                    {debugInfo.userRoles && debugInfo.userRoles.length > 0 && (
                      <div className="text-sm">
                        <strong>All Roles:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {debugInfo.userRoles.map((role: any, index: number) => (
                            <li key={index}>{role.role}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* has_role Function */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">has_role Function</h3>
              <div className="space-y-2">
                {debugInfo.hasRoleError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Function Error: {debugInfo.hasRoleError.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>Admin Access via Function:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(debugInfo.hasRoleResult)}
                      {getStatusBadge(debugInfo.hasRoleResult, "Access Granted", "Access Denied")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-2 text-blue-800">Recommendations</h3>
              <div className="space-y-2 text-sm text-blue-700">
                {!debugInfo.user && (
                  <p>• You need to be logged in to access admin features</p>
                )}
                
                {debugInfo.user && !debugInfo.userRoles?.some((r: any) => r.role === 'admin') && (
                  <p>• Your account doesn't have admin role. Run the admin setup SQL script</p>
                )}
                
                {debugInfo.hasRoleError && (
                  <p>• The has_role function is not working. Check database setup</p>
                )}
                
                {debugInfo.user && debugInfo.userRoles?.some((r: any) => r.role === 'admin') && !debugInfo.hasRoleResult && (
                  <p>• You have admin role but function returns false. Check RLS policies</p>
                )}
                
                {debugInfo.user && debugInfo.hasRoleResult && (
                  <p>• All checks passed! Admin access should work</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAccessDebugger; 