
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Download, PlusCircle, Home, FileText, FileImage, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StoryExporter } from '@/utils/storyExporter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface StoryActionButtonsProps {
  storyId: string;
  storyTitle: string;
  onShare?: () => void;
  onDownload?: () => void;
}

const StoryActionButtons: React.FC<StoryActionButtonsProps> = React.memo(({
  storyId,
  storyTitle,
  onShare
}) => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      const shareUrl = `${window.location.origin}/story/${storyId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Story link copied to clipboard!');
    }
  }, [onShare, storyId]);

  const handleExport = useCallback(async (format: 'text' | 'html' | 'json' | 'images') => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'text':
          await StoryExporter.exportAsText(storyId, storyTitle);
          toast.success('Story exported as text file!');
          break;
        case 'html':
          await StoryExporter.exportAsHTML(storyId, storyTitle);
          toast.success('Story exported as HTML file!');
          break;
        case 'json':
          await StoryExporter.exportAsJSON(storyId, storyTitle);
          toast.success('Story exported as JSON file!');
          break;
        case 'images':
          await StoryExporter.downloadImages(storyId, storyTitle);
          toast.success('Story images downloaded!');
          break;
        default:
          toast.error('Unknown export format');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export story. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [storyId, storyTitle]);


  const createNewStory = () => {
    navigate('/create/genre');
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t border-amber-500/20">
      <Button
        onClick={handleShare}
        variant="outline"
        className="border-amber-500/40 text-amber-400 hover:bg-amber-500/20"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share Story
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/20"
            disabled={isExporting}
          >
            {isExporting ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Download'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleExport('text')} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            Text File (.txt)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('html')} disabled={isExporting}>
            <FileDown className="mr-2 h-4 w-4" />
            HTML File (.html)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            JSON Data (.json)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('images')} disabled={isExporting}>
            <FileImage className="mr-2 h-4 w-4" />
            Download Images
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={createNewStory}
        className="btn-primary"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Story
      </Button>

      <Button
        onClick={goHome}
        variant="outline"
        className="btn-ghost"
      >
        <Home className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
    </div>
  );
});

// Display name for debugging
StoryActionButtons.displayName = 'StoryActionButtons';

export default StoryActionButtons;
