import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

const SubscriptionDebug: React.FC = () => {
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const { user } = useAuth();
  const subscription = useSubscription();

  const addDebugResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugResults(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const debugSubscriptionData = async () => {
    if (!user?.id) {
      toast.error('No authenticated user');
      return;
    }

    setIsDebugging(true);
    setDebugResults([]);
    addDebugResult('🔍 Starting subscription debug...');
    addDebugResult(`👤 User ID: ${user.id}`);
    addDebugResult(`📧 User Email: ${user.email}`);

    try {
      // Check subscribers table
      addDebugResult('📊 Checking subscribers table...');
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id);

      if (subscribersError) {
        addDebugResult(`❌ Subscribers table error: ${subscribersError.message}`);
      } else {
        addDebugResult(`✅ Subscribers table data: ${JSON.stringify(subscribersData, null, 2)}`);
      }

      // Check user_subscriptions table
      addDebugResult('📊 Checking user_subscriptions table...');
      const { data: userSubsData, error: userSubsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id);

      if (userSubsError) {
        addDebugResult(`❌ User subscriptions table error: ${userSubsError.message}`);
      } else {
        addDebugResult(`✅ User subscriptions table data: ${JSON.stringify(userSubsData, null, 2)}`);
      }

      // Test get_user_tier function
      addDebugResult('🔧 Testing get_user_tier function...');
      const { data: tierData, error: tierError } = await supabase
        .rpc('get_user_tier', { user_uuid: user.id });

      if (tierError) {
        addDebugResult(`❌ get_user_tier error: ${tierError.message}`);
      } else {
        addDebugResult(`✅ get_user_tier result: ${tierData}`);
      }

      // Test get_effective_tier function
      addDebugResult('🔧 Testing get_effective_tier function...');
      const { data: effectiveTierData, error: effectiveTierError } = await supabase
        .rpc('get_effective_tier', { p_user_id: user.id });

      if (effectiveTierError) {
        addDebugResult(`❌ get_effective_tier error: ${effectiveTierError.message}`);
      } else {
        addDebugResult(`✅ get_effective_tier result: ${JSON.stringify(effectiveTierData, null, 2)}`);
      }

      // Check current subscription hook data
      addDebugResult('🎯 Current subscription hook data:');
      addDebugResult(`- effectiveTier: ${subscription.effectiveTier}`);
      addDebugResult(`- isSubscribed: ${subscription.isSubscribed}`);
      addDebugResult(`- isPremium: ${subscription.isPremium}`);
      addDebugResult(`- subscription_tier: ${subscription.subscription_tier}`);
      addDebugResult(`- subscription_end: ${subscription.subscription_end}`);

      // Check usage data
      addDebugResult('📈 Usage data:');
      const { data: usageData, error: usageError } = await supabase
        .rpc('get_current_month_usage', { user_uuid: user.id });

      if (usageError) {
        addDebugResult(`❌ Usage data error: ${usageError.message}`);
      } else {
        addDebugResult(`✅ Usage data: ${JSON.stringify(usageData, null, 2)}`);
      }

      // Check tier limits
      addDebugResult('📋 Checking tier limits...');
      const { data: tierLimits, error: tierLimitsError } = await supabase
        .from('tier_limits')
        .select('*');

      if (tierLimitsError) {
        addDebugResult(`❌ Tier limits error: ${tierLimitsError.message}`);
      } else {
        addDebugResult(`✅ Available tiers: ${JSON.stringify(tierLimits, null, 2)}`);
      }

    } catch (error) {
      addDebugResult(`❌ Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDebugging(false);
    }
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-amber-300">🔧 Subscription Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={debugSubscriptionData}
              disabled={isDebugging || !user}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isDebugging ? 'Debugging...' : 'Debug Subscription Data'}
            </Button>
            
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-green-300">📋 Debug Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 p-4 rounded-lg max-h-96 overflow-y-auto">
            {debugResults.length === 0 ? (
              <p className="text-gray-400">No debug results yet. Run the debug tool to see output.</p>
            ) : (
              <div className="space-y-1 font-mono text-xs">
                {debugResults.map((result, index) => (
                  <div key={index} className="text-gray-300 whitespace-pre-wrap">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionDebug;
