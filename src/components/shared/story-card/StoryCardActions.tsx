import React from 'react';
import { StoryCardActionsProps } from './types';
import { Eye, Edit, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * StoryCardActions - Contains primary and secondary action buttons
 * 
 * This component handles the action buttons for the story card,
 * including view, edit, delete, and continue actions.
 */
const StoryCardActions: React.FC<StoryCardActionsProps> = ({
  story,
  onView,
  onEdit,
  onDelete,
  onContinue,
  primaryAction = 'view',
  showSecondaryActions = true,
  customActions,
  className = '',
}) => {
  // Handle primary action click
  const handlePrimaryAction = () => {
    switch (primaryAction) {
      case 'view':
        onView?.(story);
        break;
      case 'edit':
        onEdit?.(story);
        break;
      case 'continue':
        onContinue?.(story);
        break;
      default:
        onView?.(story);
    }
  };

  // Get primary action text
  const getPrimaryActionText = () => {
    if (story.is_completed && primaryAction === 'continue') {
      return 'Read Story';
    }

    switch (primaryAction) {
      case 'view':
        return 'View Story';
      case 'edit':
        return 'Edit Story';
      case 'continue':
        return 'Continue';
      default:
        return 'View Story';
    }
  };

  // Get primary action icon
  const getPrimaryActionIcon = () => {
    switch (primaryAction) {
      case 'view':
        return <Eye className="h-4 w-4 mr-2" />;
      case 'edit':
        return <Edit className="h-4 w-4 mr-2" />;
      case 'continue':
        return <Play className="h-4 w-4 mr-2" />;
      default:
        return <Eye className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className={`story-card-actions ${className}`}>
      {/* Primary action button */}
      <Button
        variant="orange-amber"
        size="sm"
        className="w-full mb-2 font-bold"
        onClick={handlePrimaryAction}
        aria-label={getPrimaryActionText()}
      >
        {getPrimaryActionIcon()}
        <span className="ml-2">{getPrimaryActionText()}</span>
      </Button>

      {/* Secondary actions */}
      {showSecondaryActions && (
        <div className="flex gap-2">
          {/* View action (if not primary) */}
          {primaryAction !== 'view' && onView && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onView(story)}
              aria-label="View Story"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}

          {/* Edit action (if not primary) */}
          {primaryAction !== 'edit' && onEdit && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(story)}
              aria-label="Edit Story"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {/* Continue action (if not primary) */}
          {primaryAction !== 'continue' && onContinue && !story.is_completed && (
            <Button
              variant="yellow-orange"
              size="sm"
              className="flex-1"
              onClick={() => onContinue(story)}
              aria-label="Continue Story"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          {/* Delete action */}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => onDelete(story)}
              aria-label="Delete Story"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Custom actions */}
      {customActions}
    </div>
  );
};

export default StoryCardActions;
