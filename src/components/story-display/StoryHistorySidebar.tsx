
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, BarChart3 } from 'lucide-react';
import StoryImage from '@/components/story-viewer/StoryImage';

interface StorySegment {
  id: string;
  segment_text: string;
  image_url?: string;
  triggering_choice_text?: string;
  created_at: string;
}

interface StoryHistorySidebarProps {
  storySegments: StorySegment[];
  currentSegmentId?: string;
  onSegmentClick?: (segmentId: string) => void;
  storyTitle?: string;
}

const StoryHistorySidebar: React.FC<StoryHistorySidebarProps> = ({
  storySegments,
  currentSegmentId,
  onSegmentClick
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="story-sidebar-collapsed w-16 flex items-center justify-center">
        <Button
          onClick={() => setIsCollapsed(false)}
          variant="outline"
          size="sm"
          className="writing-mode-vertical bg-slate-800/80 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 p-2 h-32"
        >
          <span className="text-xs">Show Story History</span>
        </Button>
      </div>
    );
  }

  const totalWords = storySegments.reduce((sum, segment) => 
    sum + segment.segment_text.split(' ').length, 0
  );

  return (
    <div className="story-history-sidebar w-80 bg-slate-800/80 border border-amber-500/20 rounded-lg p-4 max-h-[calc(100vh-2rem)] overflow-y-auto sticky top-4">
      <div className="sidebar-header flex justify-between items-center mb-4 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <h3 className="text-amber-300 font-serif text-lg">Story History</h3>
        </div>
        <Button
          onClick={() => setIsCollapsed(true)}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-amber-400 p-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="story-segments-list space-y-3 mb-4">
        {storySegments.map((segment, index) => (
          <Card 
            key={segment.id}
            className={`story-segment-card cursor-pointer transition-all duration-300 border ${
              segment.id === currentSegmentId 
                ? 'border-amber-500 bg-amber-500/10' 
                : 'border-amber-500/20 bg-slate-700/50 hover:border-amber-500/40 hover:bg-amber-500/5'
            }`}
            onClick={() => onSegmentClick?.(segment.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-amber-300 text-sm font-serif">
                  Chapter {index + 1}
                </CardTitle>
                {segment.id === currentSegmentId && (
                  <span className="bg-amber-500 text-slate-900 px-2 py-1 rounded text-xs font-semibold">
                    Current
                  </span>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <StoryImage
                    imageUrl={segment.image_url || null}
                    altText={`Chapter ${index + 1}`}
                    className="w-16 h-16 rounded border border-amber-500/30"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-100 text-sm line-clamp-3 leading-relaxed mb-2">
                    {segment.segment_text.substring(0, 120)}...
                  </p>
                  
                  {segment.triggering_choice_text && (
                    <div className="bg-slate-600/50 border-l-2 border-amber-500 pl-2 py-1 rounded-r">
                      <div className="flex items-start gap-1">
                        <span className="text-amber-400 text-xs font-semibold">Choice:</span>
                        <span className="text-amber-300 text-xs italic line-clamp-2">
                          "{segment.triggering_choice_text}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sidebar-footer pt-3 border-t border-amber-500/20">
        <div className="story-stats space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-semibold">Story Statistics</span>
          </div>
          <div className="text-gray-300 text-sm space-y-1">
            <p>📚 {storySegments.length} Chapter{storySegments.length !== 1 ? 's' : ''}</p>
            <p>📝 ~{totalWords} Words</p>
            <p>⏱️ ~{Math.ceil(totalWords / 200)} min read</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryHistorySidebar;
