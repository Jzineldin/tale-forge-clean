import React, { useState } from 'react';
import { Story } from '@/types/stories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { StoryCard } from '@/components/shared/story-card';
import { Check, X } from 'lucide-react';
import '@/styles/magical-story-card.css';

export interface MagicalStoryCardProps {
  story: Story;
  onSetStoryToDelete: (storyId: string) => void;
  viewMode: 'grid' | 'list';
}

const MagicalStoryCard: React.FC<MagicalStoryCardProps> = ({
  story,
  onSetStoryToDelete,
  viewMode
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title || '');
  
  // Handle viewing a story
  const handleView = () => {
    window.location.href = `/story/${story.id}`;
  };

  // Handle editing a story title
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle saving a story title
  const handleSaveTitle = async () => {
    try {
      const { error } = await supabase
        .from('stories')
        .update({ title: editTitle })
        .eq('id', story.id);

      if (error) throw error;
      
      setIsEditing(false);
      toast.success('Story title updated');
    } catch (error) {
      toast.error('Failed to update title');
      console.error('Error updating title:', error);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditTitle(story.title || '');
    setIsEditing(false);
  };

  // Handle deleting a story
  const handleDelete = () => {
    onSetStoryToDelete(story.id);
  };

  // Handle continuing a story
  const handleContinue = () => {
    // Navigate to story creation with resume state
    navigate('/create', { 
      state: { 
        resumeStoryId: story.id,
        resumeStoryTitle: story.title 
      } 
    });
  };

  // If we're in editing mode, render the editing UI
  if (isEditing) {
    return (
      <div className="magical-story-card bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-amber-500/30 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 bg-slate-700/50 border border-amber-500/30 rounded px-2 py-1 text-amber-200 focus:outline-none focus:border-amber-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            autoFocus
          />
          <button
            onClick={handleSaveTitle}
            className="p-1 text-green-400 hover:text-green-300"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Determine the primary action based on story completion status
  const primaryAction = story.is_completed ? 'view' : 'continue';

  // Use the shared StoryCard component
  return (
    <StoryCard
      story={story}
      variant={viewMode === 'grid' ? 'portrait' : 'landscape'}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onContinue={handleContinue}
      primaryAction={primaryAction}
      className="magical-story-card"
    />
  );
};

export default MagicalStoryCard;
