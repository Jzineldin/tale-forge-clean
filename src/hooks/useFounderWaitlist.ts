import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FounderWaitlistStatus {
  isOnWaitlist: boolean;
  signupOrder: number | null;
  founderTier: string | null;
  benefits: string[];
  spotsRemaining: number;
  loading: boolean;
}

interface JoinWaitlistResult {
  success: boolean;
  signupOrder?: number;
  founderTier?: string;
  benefits?: string[];
  message?: string;
}

export const useFounderWaitlist = () => {
  const [status, setStatus] = useState<FounderWaitlistStatus>({
    isOnWaitlist: false,
    signupOrder: null,
    founderTier: null,
    benefits: [],
    spotsRemaining: 200,
    loading: true,
  });

  const checkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      // Check if user is on founder waitlist
      const { data: founderData } = await supabase
        .from('founder_waitlist')
        .select('signup_order, founder_tier, benefits')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get total spots taken
      const { count } = await supabase
        .from('founder_waitlist')
        .select('*', { count: 'exact', head: true });

      const spotsRemaining = Math.max(0, 200 - (count || 0));

      setStatus({
        isOnWaitlist: !!founderData,
        signupOrder: founderData?.signup_order || null,
        founderTier: founderData?.founder_tier || null,
        benefits: Array.isArray(founderData?.benefits) 
          ? (founderData.benefits as string[]).filter(b => typeof b === 'string')
          : [],
        spotsRemaining,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking founder waitlist status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const joinWaitlist = async (): Promise<JoinWaitlistResult> => {
    try {
      const { data, error } = await supabase.rpc('join_founder_waitlist');

      if (error) {
        toast.error('Failed to join founder waitlist');
        return { success: false, message: error.message };
      }

      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          toast.success(`Welcome to the founder program! You're #${result.signup_order}`);
          await checkStatus(); // Refresh status
          return {
            success: true,
            signupOrder: result.signup_order,
            founderTier: result.founder_tier,
            benefits: Array.isArray(result.benefits) 
              ? (result.benefits as string[]).filter(b => typeof b === 'string')
              : [],
            message: result.message,
          };
        } else {
          toast.error(result.message || 'Failed to join waitlist');
          return { success: false, message: result.message };
        }
      }

      return { success: false, message: 'Unexpected response' };
    } catch (error: any) {
      const message = error?.message || 'Failed to join founder waitlist';
      toast.error(message);
      return { success: false, message };
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    ...status,
    joinWaitlist,
    refreshStatus: checkStatus,
  };
};