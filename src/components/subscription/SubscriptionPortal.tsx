import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SubscriptionPortal = () => {
  const [loading, setLoading] = useState(true);
  const [portalUrl, setPortalUrl] = useState('');
  const [error, setError] = useState('');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchPortalUrl = async () => {
      try {
        setLoading(true);
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Get effective tier first
        const { data: tierData, error: tierError } = await supabase.rpc('get_effective_tier', {
          user_id: userData.user?.id
        });
        
        if (tierError) throw tierError;
        console.log('User tier:', tierData.tier);

        // Get the user's session token for authentication
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) throw new Error('No active session');

        const { data, error: portalError } = await supabase.functions.invoke('customer-portal', {
          headers: {
            Authorization: Bearer ,
          },
          body: {},
        });

        if (portalError) throw portalError;
        if (!data.url) throw new Error('No portal URL returned');

        setPortalUrl(data.url);
      } catch (err: any) {
        console.error('Subscription portal error:', err);
        setError(err.message || 'Failed to load portal');
        // Fallback to free tier
      } finally {
        setLoading(false);
      }
    };

    fetchPortalUrl();
  }, []);

  if (loading) {
    return <div>Loading subscription portal...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Subscription Management</h2>
      <div className="mb-6">
        <p className="mb-4">
          Manage your subscription, update payment methods, and view invoices through our secure Stripe portal.
        </p>
        <a
          href={portalUrl}
          className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Customer Portal
        </a>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Cancel Subscription</h3>
        <p className="mb-4 text-sm text-gray-600">
          Canceling your subscription will downgrade you to the Free tier at the end of your current billing period.
          You'll retain access to premium features until then.
        </p>
        <button
          className="text-red-600 hover:text-red-800 font-medium"
          onClick={() => {
            if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
              window.open(portalUrl, '_blank');
            }
          }}
        >
          Cancel Subscription
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPortal;
