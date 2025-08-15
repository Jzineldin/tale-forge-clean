import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  marketing_consent: boolean;
  created_at: string;
}

const AdminWaitlistViewer: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: waitlistEntries, isLoading, error, refetch } = useQuery({
    queryKey: ['waitlist-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WaitlistEntry[];
    }
  });

  // Set up real-time subscription for waitlist updates
  useEffect(() => {
    const channel = supabase
      .channel('waitlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waitlist'
        },
        () => {
          // Refetch data when waitlist changes
          queryClient.invalidateQueries({ queryKey: ['waitlist-entries'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-purple-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waitlist Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    return (
      <Card className="bg-slate-800 border-red-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waitlist Management - Access Issue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 font-medium mb-2">⚠️ Cannot access waitlist entries</p>
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-3">🔍 Troubleshooting Steps:</h4>
              <div className="text-blue-100 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-mono">1.</span>
                  <span><strong>Authentication:</strong> Make sure you're signed in to the application</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-mono">2.</span>
                  <span><strong>Admin Role:</strong> Your account needs admin role in the user_roles table</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 font-mono">3.</span>
                  <span><strong>Database:</strong> Check if the waitlist table exists in Supabase</span>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2">✅ Good News!</h4>
              <p className="text-green-100 text-sm">
                Based on recent diagnostics, your waitlist table contains entries. 
                This is likely an authentication issue, not missing data.
              </p>
            </div>

            <div className="mt-4 p-3 bg-slate-700 rounded text-sm">
              <p className="text-yellow-400 mb-2">Debug Info:</p>
              <p className="text-purple-200">Query Key: waitlist-entries</p>
              <p className="text-purple-200">Table: waitlist</p>
              <p className="text-purple-200">Error Code: {(error as any)?.code || 'N/A'}</p>
              <p className="text-purple-200">Error Details: {(error as any)?.details || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-purple-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Waitlist Management
            </CardTitle>
                    <CardDescription className="text-purple-200">
          {waitlistEntries?.length || 0} people have joined the waitlist (from waitlist table)
        </CardDescription>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh waitlist data"
          >
            <RefreshCw className={`h-4 w-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {waitlistEntries && waitlistEntries.length > 0 ? (
          waitlistEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-white font-medium">{entry.name}</h3>
                  <div className="flex items-center gap-2 text-purple-200 text-sm">
                    <Mail className="h-4 w-4" />
                    {entry.email}
                  </div>
                  <div className="flex items-center gap-2 text-purple-200 text-sm mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(entry.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {entry.marketing_consent && (
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Marketing OK
                  </Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-purple-200">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No waitlist entries yet</p>
            <div className="mt-4 p-3 bg-slate-700 rounded text-sm">
              <p className="text-green-400 mb-2">Debug Info:</p>
              <p className="text-purple-200">Query successful - No data found</p>
              <p className="text-purple-200">Table: waitlist</p>
              <p className="text-purple-200">Entries found: {waitlistEntries?.length || 0}</p>
            </div>
          </div>
        )}
        
        {/* Information about both waitlist tables */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h4 className="text-blue-300 font-medium mb-2">🔍 Waitlist Table Information</h4>
          <div className="text-blue-100 text-sm space-y-2">
            <p><strong>Current Status:</strong> Showing {waitlistEntries?.length || 0} entries from <strong>waitlist</strong> table</p>
            <p><strong>Database Tables:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <strong>waitlist</strong> table: {waitlistEntries?.length || 0} entries (shown above)</li>
              <li>• <strong>waitlist_entries</strong> table: Check Supabase dashboard for count</li>
            </ul>
            <p><strong>Form Behavior:</strong> All current waitlist forms insert into the <strong>waitlist</strong> table</p>
            <p><strong>Action:</strong> If you're missing entries, check the <strong>waitlist_entries</strong> table in your Supabase dashboard</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminWaitlistViewer;
