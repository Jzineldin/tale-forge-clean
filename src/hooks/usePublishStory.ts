
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

const publishStory = async (storyId: string) => {
    console.log('📤 Publishing story:', storyId);
    
    const { data, error } = await supabase
        .from('stories')
        .update({ is_public: true, published_at: new Date().toISOString() })
        .eq('id', storyId)
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to publish story:', error);
        throw new Error(error.message);
    }
    
    console.log('✅ Story published successfully:', data);
    return data;
};

export const usePublishStory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: publishStory,
        onSuccess: (data) => {
            if (!data) return;
            toast.success("🎉 Story published to Discover!", {
                description: "Your story is now visible in the public Discover library for everyone to enjoy.",
                action: {
                    label: "View in Discover",
                    onClick: () => {
                        window.open('/discover', '_blank');
                    },
                },
            });
            queryClient.invalidateQueries({ queryKey: ['story', data.id] });
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            queryClient.invalidateQueries({ queryKey: ['public-stories'] });
            queryClient.invalidateQueries({ queryKey: ['public-stories-with-images'] });
        },
        onError: (error) => {
            toast.error("Failed to publish story. Please try again.");
            console.error("Failed to publish story:", error);
        }
    });
};
