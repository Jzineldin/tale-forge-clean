import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StorySegmentEditor } from '@/components/story-editing/StorySegmentEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useAuth } from '@/context/AuthProvider';

interface StorySegment {
  id: string;
  story_id: string;
  segment_text: string;
  image_url?: string | null;
  choices?: string[] | null;
  created_at: string;
  segment_number?: number;
}

interface Story {
  id: string;
  title: string;
  description?: string | null;
  user_id?: string | null;
  is_completed: boolean;
  story_mode?: string | null;
}

const StoryEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStoryData();
    }
  }, [id]);

  const fetchStoryData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);

      // Fetch story details
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single();

      if (storyError) throw storyError;

      // Check if user owns the story
      if (storyData.user_id && storyData.user_id !== user?.id) {
        toast.error('You do not have permission to edit this story');
        navigate('/my-stories');
        return;
      }

      const storyInfo: Story = {
        id: storyData.id,
        title: storyData.title || 'Untitled Story',
        description: storyData.description,
        user_id: storyData.user_id,
        is_completed: storyData.is_completed || false,
        story_mode: storyData.story_mode
      };

      setStory(storyInfo);
      setEditedTitle(storyInfo.title);

      // Fetch story segments
      const { data: segmentsData, error: segmentsError } = await supabase
        .from('story_segments')
        .select('*')
        .eq('story_id', id)
        .order('created_at', { ascending: true });

      if (segmentsError) throw segmentsError;

      // Add segment numbers and handle nullable fields
      const numberedSegments: StorySegment[] = segmentsData.map((segment, index) => ({
        id: segment.id,
        story_id: segment.story_id,
        segment_text: segment.segment_text,
        image_url: segment.image_url,
        choices: segment.choices,
        created_at: segment.created_at,
        segment_number: index + 1
      }));

      setSegments(numberedSegments);
    } catch (error) {
      console.error('Error fetching story data:', error);
      toast.error('Failed to load story');
      navigate('/my-stories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSegment = async (segmentId: string, newText: string) => {
    try {
      const { error } = await supabase
        .from('story_segments')
        .update({ segment_text: newText })
        .eq('id', segmentId);

      if (error) throw error;

      // Update local state
      setSegments(segments.map(seg => 
        seg.id === segmentId ? { ...seg, segment_text: newText } : seg
      ));
      
      setHasChanges(true);
      toast.success('Segment updated successfully');
    } catch (error) {
      console.error('Error updating segment:', error);
      toast.error('Failed to update segment');
      throw error;
    }
  };

  const handleSaveTitle = async () => {
    if (!story || editedTitle === story.title) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('stories')
        .update({ title: editedTitle })
        .eq('id', story.id);

      if (error) throw error;

      setStory({ ...story, title: editedTitle });
      setHasChanges(false);
      toast.success('Story title updated successfully');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/my-stories');
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading story..." />;
  }

  if (!story) {
    return (
      <div className="min-h-screen w-full relative">
        {/* Same beautiful background as landing page */}
        <div className="scene-bg"></div>

        <div className="relative z-10 container mx-auto p-6 text-center">
          <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl p-8">
            <p className="text-white/90 mb-4" style={{textShadow: '0 1px 2px rgba(0,0,0,0.6)'}}>Story not found</p>
            <Button onClick={() => navigate('/my-stories')} variant="orange-amber" className="font-bold">
              Back to My Stories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Same beautiful background as landing page */}
      <div className="scene-bg"></div>

      <div className="relative z-10 container mx-auto p-4 md:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Stories
        </Button>

        <div className="glass-enhanced backdrop-blur-lg bg-black/40 border border-white/20 rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.6)'}}>Edit Story</h1>
          
          {/* Title Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Story Title
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => {
                    setEditedTitle(e.target.value);
                    setHasChanges(true);
                  }}
                  className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/60 focus:border-white/30 focus:outline-none transition-all duration-300"
                  placeholder="Enter story title..."
                />
                <Button
                  onClick={handleSaveTitle}
                  disabled={isSaving || editedTitle === story.title}
                  variant="orange-amber"
                  className="min-w-[100px] font-bold"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Title
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Story Info */}
            <div className="grid grid-cols-2 gap-4 text-sm text-text-muted">
              <div>
                <span className="font-medium">Status:</span>{' '}
                {story.is_completed ? 'Completed' : 'In Progress'}
              </div>
              <div>
                <span className="font-medium">Segments:</span> {segments.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segments Editor */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Story Segments</h2>
        
        {segments.length === 0 ? (
          <div className="text-center py-12 bg-bg-card backdrop-blur-md border border-border-primary rounded-lg">
            <p className="text-text-muted">No segments found for this story</p>
          </div>
        ) : (
          <div className="space-y-4">
            {segments.map((segment) => (
              <StorySegmentEditor
                key={segment.id}
                segment={{
                  id: segment.id,
                  segment_text: segment.segment_text,
                  segment_number: segment.segment_number || 1,
                  image_url: segment.image_url || undefined,
                  choices: segment.choices || undefined
                } as any}
                onUpdate={handleUpdateSegment}
                isEditable={true}
                className="shadow-sm hover:shadow-md transition-shadow"
              />
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-bg-card/50 backdrop-blur-md rounded-lg border border-border-secondary">
        <h3 className="font-medium text-text-primary mb-2">Editing Instructions</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• Click the edit icon on any segment to modify its content</li>
          <li>• Changes are saved automatically when you finish editing a segment</li>
          <li>• You can edit the story title at the top of the page</li>
          <li>• Press Ctrl+Enter to save or Escape to cancel while editing</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default StoryEditor;