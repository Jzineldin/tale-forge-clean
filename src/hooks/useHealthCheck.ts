
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const checkHealth = async () => {
  const { data, error } = await supabase.functions.invoke('health-check');

  if (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }

  return data;
};

export const useHealthCheck = () => {
  return useMutation({
    mutationFn: checkHealth,
    onSuccess: (data) => {
      if (data.status === 'healthy') {
        toast.success("All systems are operational!");
        console.log("Health check passed:", data);
      } else {
        toast.warning("System health check returned warnings");
        console.warn("Health check warnings:", data);
      }
    },
    onError: (error: Error) => {
      toast.error(`System health check failed: ${error.message}`);
      console.error("Health check error:", error);
    },
  });
};
