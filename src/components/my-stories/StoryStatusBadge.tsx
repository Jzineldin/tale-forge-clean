
import React from 'react';
import { Story } from '@/types/stories';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Hourglass, Loader2, AlertTriangle } from 'lucide-react';

interface StoryStatusBadgeProps {
  story: Story;
}

export const StoryStatusBadge: React.FC<StoryStatusBadgeProps> = ({ story }) => {
    if (story.shotstack_status && ['submitted', 'queued', 'rendering', 'saving'].includes(story.shotstack_status)) {
       return (
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Creating Video
        </Badge>
      );
    }
    if (story.shotstack_status === 'failed') {
       return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" /> Video Failed
        </Badge>
      );
    }
    if (story.audio_generation_status === 'in_progress') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Audio Gen
        </Badge>
      );
    }
    if (story.audio_generation_status === 'failed') {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" /> Audio Failed
        </Badge>
      );
    }
    if (story.is_completed) {
      if (story.shotstack_status === 'done' && story.shotstack_video_url) {
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
            <CheckCircle className="mr-1 h-3 w-3" /> Video Ready
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
          <CheckCircle className="mr-1 h-3 w-3" /> Completed
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Hourglass className="mr-1 h-3 w-3" /> In Progress
      </Badge>
    );
};
