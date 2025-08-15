
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

const testVoice = async ({ voiceId, text }: { voiceId: string, text?: string }) => {
  const { data, error } = await supabase.functions.invoke('test-voice', {
    body: { voiceId, text },
  });

  if (error) {
    const errorBody = await (error as any).context.json();
    throw new Error(errorBody.error || error.message);
  }

  return data;
};

export const useTestVoice = () => {
    return useMutation({
        mutationFn: testVoice,
        onSuccess: (data) => {
            if (data.audioContent) {
                const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
                audio.play();
            }
        },
        onError: (error: Error) => {
            toast.error(`Failed to generate voice sample: ${error.message}`);
            console.error("Voice test failed:", error);
        },
    });
}
