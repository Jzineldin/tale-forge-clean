
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StorySegmentRow } from '@/types/stories';
import { Skeleton } from '@/components/ui/skeleton';

interface StoryPreviewProps {
    storyId: string;
    storyTitle: string;
}

const fetchStorySegments = async (storyId: string): Promise<StorySegmentRow[]> => {
    const { data, error } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });
    
    if (error) {
        throw new Error(error.message);
    }

    return data as StorySegmentRow[];
};

const StoryPreview: React.FC<StoryPreviewProps> = ({ storyId, storyTitle }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { data: segments, isLoading } = useQuery({
        queryKey: ['story-segments', storyId],
        queryFn: () => fetchStorySegments(storyId),
        enabled: isOpen,
    });

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {storyTitle}
                    </DialogTitle>
                    <DialogDescription>
                        Complete story narrative
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="max-h-[60vh] pr-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ) : segments && segments.length > 0 ? (
                        <div className="space-y-6">
                            {segments.map((segment, index) => (
                                <Card key={segment.id} className="border-l-4 border-l-primary/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Chapter {index + 1}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed mb-2">
                                            {segment.segment_text}
                                        </p>
                                        {segment.triggering_choice_text && index > 0 && (
                                            <div className="text-xs italic text-muted-foreground border-l-2 border-muted pl-3 mt-3">
                                                Choice made: "{segment.triggering_choice_text}"
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No story content found.</p>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default StoryPreview;
