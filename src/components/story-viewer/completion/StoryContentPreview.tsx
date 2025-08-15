import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { StorySegmentRow } from '@/types/stories';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface StoryContentPreviewProps {
  segments: StorySegmentRow[];
  isGeneratingMissingImage: boolean;
}

const StoryContentPreview: React.FC<StoryContentPreviewProps> = ({
  segments,
  isGeneratingMissingImage
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set());

  const toggleSegmentExpansion = (index: number) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSegments(newExpanded);
  };

  const toggleAllText = () => {
    if (showFullText) {
      setExpandedSegments(new Set());
    } else {
      setExpandedSegments(new Set(segments.map((_, index) => index)));
    }
    setShowFullText(!showFullText);
  };

  return (
    <Card className="bg-slate-800/90 border-amber-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          Step 1: Your Complete Story
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Toggle All Text Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-300">
              {segments.length} chapter{segments.length !== 1 ? 's' : ''} • {segments.reduce((acc, seg) => acc + (seg.segment_text?.length || 0), 0)} characters
            </p>
            <Button
              onClick={toggleAllText}
              variant="outline"
              size="sm"
              className="text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black"
            >
              {showFullText ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Expand All
                </>
              )}
            </Button>
          </div>

          {/* Preview Grid */}
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {segments.map((segment, index) => (
              <div key={segment.id} className="flex gap-4 p-4 bg-slate-900/50 rounded-lg border border-amber-500/30">
                {/* Image */}
                <div className="flex-shrink-0 w-24 h-24">
                  {segment.image_url && segment.image_url !== '/placeholder.svg' ? (
                    <img 
                      src={segment.image_url} 
                      alt={`Chapter ${index + 1}`}
                      className="w-full h-full object-cover rounded border border-amber-300/50"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 rounded flex items-center justify-center border border-amber-500/30">
                      {index === segments.length - 1 && isGeneratingMissingImage ? (
                        <LoadingSpinner size="sm" className="h-4 w-4  text-amber-600" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-200">Chapter {index + 1}</h4>
                    <Button
                      onClick={() => toggleSegmentExpansion(index)}
                      variant="ghost"
                      size="sm"
                      className="text-amber-400 hover:text-amber-300 p-1 h-6 w-6"
                    >
                      {expandedSegments.has(index) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-slate-300 text-sm">
                    {expandedSegments.has(index) ? (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {segment.segment_text}
                      </div>
                    ) : (
                      <div className="line-clamp-3 leading-relaxed">
                        {segment.segment_text}
                      </div>
                    )}
                  </div>
                  
                  {/* Choice indicator */}
                  {segment.triggering_choice_text && (
                    <div className="mt-2 bg-slate-600/50 border-l-2 border-amber-500 pl-2 py-1 rounded-r">
                      <div className="flex items-start gap-1">
                        <span className="text-amber-400 text-xs font-semibold">Choice:</span>
                        <span className="text-amber-300 text-xs italic">
                          "{segment.triggering_choice_text}"
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Story Statistics */}
          <div className="bg-slate-900/30 rounded-lg p-3 border border-amber-500/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-amber-400">{segments.length}</p>
                <p className="text-xs text-slate-400">Chapters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {segments.reduce((acc, seg) => acc + (seg.segment_text?.split(/\s+/).length || 0), 0)}
                </p>
                <p className="text-xs text-slate-400">Words</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {segments.filter(s => s.image_url && s.image_url !== '/placeholder.svg').length}
                </p>
                <p className="text-xs text-slate-400">Images</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {Math.ceil(segments.reduce((acc, seg) => acc + (seg.segment_text?.split(/\s+/).length || 0), 0) / 200)}
                </p>
                <p className="text-xs text-slate-400">Min Read</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryContentPreview;