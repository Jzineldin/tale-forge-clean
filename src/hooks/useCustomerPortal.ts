import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const openCustomerPortal = async () => {
  console.log('🔗 Opening customer portal...');

  try {
    const { data, error } = await supabase.functions.invoke('customer-portal');

    if (error) {
      console.error('❌ Customer portal error:', error);

      // If the function is not deployed, provide a fallback
      if (error.message?.includes('Failed to send a request') || error.message?.includes('FunctionsFetchError')) {
        console.log('🔄 Function not available, using fallback...');
        // Return a fallback URL or handle gracefully
        throw new Error('Customer portal is temporarily unavailable. Please contact support at support@tale-forge.io');
      }

      throw new Error(error.message || 'Failed to open customer portal');
    }

    console.log('✅ Customer portal response:', data);
    return data;
  } catch (error) {
    console.error('❌ Customer portal error:', error);
    throw error;
  }
};

export const useCustomerPortal = () => {
  return useMutation({
    mutationFn: openCustomerPortal,
    onSuccess: (data) => {
      console.log('🎉 Customer portal success:', data);
      if (data?.url) {
        // Open customer portal in a new tab
        window.open(data.url, '_blank');
        toast.success('Opening billing portal...');
      } else {
        console.error('❌ No URL in response:', data);
        toast.error('No portal URL received. Please try again.');
      }
    },
    onError: (error: Error) => {
      console.error('❌ Customer portal error:', error);

      if (error.message?.includes('temporarily unavailable')) {
        toast.error('Billing portal temporarily unavailable', {
          description: 'Please contact support@tale-forge.io for billing assistance.',
          duration: 5000
        });
      } else {
        toast.error(`Failed to open billing portal: ${error.message}`);
      }
    },
  });
};