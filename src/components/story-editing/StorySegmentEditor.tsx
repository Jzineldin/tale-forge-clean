import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface StorySegment {
  id: string;
  segment_text: string;
  segment_number: number;
  image_url?: string;
  choices?: string[];
}

interface StorySegmentEditorProps {
  segment: StorySegment;
  onUpdate: (segmentId: string, newText: string) => Promise<void>;
  onRegenerate?: (segmentId: string, prompt?: string) => Promise<void>;
  isEditable?: boolean;
  className?: string;
}

export const StorySegmentEditor: React.FC<StorySegmentEditorProps> = ({
  segment,
  onUpdate,
  onRegenerate,
  isEditable = true,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(segment.segment_text);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditText(segment.segment_text);
  }, [segment.segment_text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!isEditable) {
      toast.error('This segment cannot be edited');
      return;
    }
    setIsEditing(true);
    setEditText(segment.segment_text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      toast.error('Story segment cannot be empty');
      return;
    }

    if (editText.trim() === segment.segment_text.trim()) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(segment.id, editText.trim());
      setIsEditing(false);
      toast.success('Story segment updated successfully');
    } catch (error) {
      console.error('Failed to update segment:', error);
      toast.error('Failed to update story segment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(segment.segment_text);
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) {
      toast.error('Regeneration not available for this segment');
      return;
    }

    setIsRegenerating(true);
    try {
      await onRegenerate(segment.id);
      toast.success('Story segment regenerated');
    } catch (error) {
      console.error('Failed to regenerate segment:', error);
      toast.error('Failed to regenerate story segment');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <Card className={`group relative bg-bg-card backdrop-blur-md border border-border-primary ${className}`}>
      <CardContent className="p-6">
        {/* Segment Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-bg-secondary text-text-primary border-border-primary">
              Segment {segment.segment_number}
            </Badge>
            {isEditing && (
              <Badge variant="outline" className="text-xs text-primary border-border-secondary">
                Editing
              </Badge>
            )}
          </div>
          
          {isEditable && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStartEdit}
                    className="text-text-muted hover:text-primary"
                    title="Edit segment"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  {onRegenerate && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                      className="text-text-muted hover:text-purple"
                      title="Regenerate segment with AI"
                    >
                      {isRegenerating ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple border-t-transparent" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="text-green hover:text-green/80"
                    title="Save changes (Ctrl+Enter)"
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-green border-t-transparent" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="text-text-muted hover:text-destructive"
                    title="Cancel editing (Escape)"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Story Content */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                className="w-full p-3 bg-bg-secondary border border-border-primary rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent resize-none min-h-[120px] font-serif text-text-primary leading-relaxed placeholder-text-subtle"
                placeholder="Edit your story segment..."
              />
              <div className="flex items-center justify-between text-sm text-text-muted">
                <span>{editText.length} characters</span>
                <span className="text-xs">
                  💡 Press Ctrl+Enter to save, Esc to cancel
                </span>
              </div>
            </div>
          ) : (
            <div className="prose prose-gray max-w-none">
              <p className="text-text-primary leading-relaxed font-serif whitespace-pre-wrap">
                {segment.segment_text}
              </p>
            </div>
          )}

          {/* Choices Display */}
          {segment.choices && segment.choices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-primary">
              <h4 className="text-sm font-medium text-text-secondary mb-2">Story Choices:</h4>
              <div className="space-y-2">
                {segment.choices.map((choice, index) => (
                  <div
                    key={index}
                    className="p-2 bg-bg-secondary/50 backdrop-blur-sm rounded-lg border border-border-secondary text-sm text-text-primary"
                  >
                    {choice}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Instructions */}
        {isEditing && (
          <div className="mt-4 p-3 bg-bg-secondary/50 backdrop-blur-sm rounded-lg border border-border-secondary">
            <p className="text-sm text-text-primary">
              <strong>Editing Tips:</strong>
            </p>
            <ul className="text-xs text-text-secondary mt-1 space-y-1">
              <li>• Keep the story flowing naturally with the previous segments</li>
              <li>• Maintain character consistency and story tone</li>
              <li>• Use proper paragraph breaks for readability</li>
              <li>• Save frequently to avoid losing changes</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};